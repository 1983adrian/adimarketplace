import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  items: { listingId: string; price: number; title?: string }[];
  shippingAddress: string;
  shippingMethod: string;
  shippingCost: number;
  buyerFee: number;
  guestEmail?: string;
  paymentMethod?: "card" | "cod";
  courier?: string;
  deliveryType?: "home" | "locker";
  selectedLocker?: {
    id: string;
    name: string;
    address: string;
    city: string;
    county: string;
  };
}

interface OrderResult {
  id: string;
  amount: number;
  transactionId: string;
  listingTitle: string;
  sellerId: string;
  sellerCommission: number;
  paymentStatus: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    const body: PaymentRequest = await req.json();
    const { 
      items, 
      shippingAddress, 
      shippingCost, 
      buyerFee, 
      courier,
      deliveryType,
      selectedLocker,
      paymentMethod,
    } = body;

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!userId) {
      throw new Error("Authentication required");
    }

    // No platform fees - revenue from subscriptions only
    const commissionPercent = 0;

    // Process each item - create PENDING orders
    const orders: OrderResult[] = [];
    let totalAmount = 0;

    for (const item of items) {
      // CRITICAL: Validate listing exists, check stock, and get real price from DB
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id, seller_id, title, price, is_active, is_sold, quantity")
        .eq("id", item.listingId)
        .single();

      if (listingError || !listing) {
        throw new Error(`Listing ${item.listingId} not found`);
      }

      if (!listing.is_active) {
        throw new Error(`Produsul "${listing.title}" nu mai este disponibil`);
      }

      if (listing.is_sold) {
        throw new Error(`Produsul "${listing.title}" a fost deja vândut`);
      }

      // Check stock quantity
      const currentQuantity = listing.quantity ?? 1;
      if (currentQuantity < 1) {
        throw new Error(`Produsul "${listing.title}" nu mai este în stoc`);
      }

      // Prevent self-purchase
      if (listing.seller_id === userId) {
        throw new Error("Nu poți cumpăra propriul produs");
      }

      // Calculate amounts using DB price (not client price)
      const itemPrice = listing.price;
      const itemBuyerFee = buyerFee / items.length;
      const itemShippingCost = shippingCost / items.length;
      const itemTotal = itemPrice + itemBuyerFee + itemShippingCost;
      const sellerCommission = (itemPrice * commissionPercent) / 100;
      const payoutAmount = itemPrice - sellerCommission;

      // Generate transaction ID
      const transactionId = `PENDING-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Use TRANSACTIONAL function for atomic order creation (PENDING status)
      const { data: orderResult, error: orderError } = await supabase.rpc(
        "process_order_transaction",
        {
          p_listing_id: item.listingId,
          p_buyer_id: userId,
          p_seller_id: listing.seller_id,
          p_amount: itemTotal,
          p_shipping_address: shippingAddress,
          p_payment_processor: "platform",
          p_transaction_id: transactionId,
          p_buyer_fee: itemBuyerFee,
          p_seller_commission: sellerCommission,
          p_payout_amount: payoutAmount,
        }
      );

      if (orderError) {
        console.error("Transaction error:", orderError);
        throw new Error(orderError.message || "Failed to create order");
      }

      orders.push({
        id: orderResult.order_id,
        amount: itemTotal,
        transactionId,
        listingTitle: orderResult.listing_title,
        sellerId: listing.seller_id,
        sellerCommission,
        paymentStatus: "pending",
      });

      totalAmount += itemTotal;
    }

    // Create notification for seller(s)
    const sellerIds = [...new Set(orders.map(o => o.sellerId))];
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Marketplace România <onboarding@resend.dev>";

    for (const sellerId of sellerIds) {
      const sellerOrders = orders.filter(o => o.sellerId === sellerId);
      const sellerTotal = sellerOrders.reduce((sum, o) => sum + o.amount, 0);
      const itemTitles = sellerOrders.map(o => o.listingTitle).join(", ");

      // In-app notification
      await supabase.from("notifications").insert({
        user_id: sellerId,
        type: "order",
        title: "🎉 Comandă nouă primită!",
        message: `Ai vândut "${itemTitles}" pentru ${sellerTotal.toFixed(2)} RON. Adaugă numărul de tracking!`,
        data: { 
          order_ids: sellerOrders.map(o => o.id),
          amount: sellerTotal,
          buyer_id: userId,
        },
      });

      // EMAIL to seller
      if (resendApiKey) {
        try {
          const { data: sellerAuth } = await supabase.auth.admin.getUserById(sellerId);
          if (sellerAuth?.user?.email) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [sellerAuth.user.email],
                subject: `🎉 Comandă nouă: ${itemTitles}`,
                html: `
                  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                      <img src="https://marketplaceromania.lovable.app/logo-oficial.png" alt="Marketplace România" style="max-width: 180px; height: auto; margin-bottom: 12px;" />
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">🎉 Comandă Nouă!</h1>
                      <p style="color: #a0aec0; margin: 8px 0 0 0;">Marketplace România</p>
                    </div>
                    <div style="padding: 30px;">
                      <p style="font-size: 16px; color: #333;">Ai primit o comandă nouă!</p>
                      <div style="background: #f7f8fc; padding: 20px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #48bb78;">
                        <p style="margin: 0 0 8px 0;"><strong>Produs:</strong> ${itemTitles}</p>
                        <p style="margin: 0 0 8px 0;"><strong>Sumă:</strong> ${sellerTotal.toFixed(2)} RON</p>
                        <p style="margin: 0;"><strong>Adresă livrare:</strong> ${shippingAddress}</p>
                      </div>
                      <div style="background: #fff8f0; padding: 16px; border-radius: 8px; border: 1px solid #ffe0c4; margin: 16px 0;">
                        <p style="margin: 0; color: #c05621; font-size: 14px;">
                          ⚠️ <strong>Important:</strong> Adaugă numărul de urmărire (AWB) cât mai curând pentru a proteja tranzacția.
                        </p>
                      </div>
                      <div style="text-align: center; margin: 24px 0;">
                        <a href="https://marketplaceromania.lovable.app/orders" 
                           style="display: inline-block; background: #FF6B35; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                          📦 Vezi Comanda & Adaugă AWB
                        </a>
                      </div>
                    </div>
                    <div style="padding: 16px; background: #f5f5f5; text-align: center; font-size: 12px; color: #999;">
                      © 2025 Marketplace România
                    </div>
                  </div>
                `,
              }),
            });
            console.log("Seller email notification sent to:", sellerAuth.user.email);
          }
        } catch (emailErr) {
          console.error("Seller email failed (non-blocking):", emailErr);
        }
      }
    }

    // Create invoice with PENDING status
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    await supabase.from("invoices").insert({
      order_id: orders[0].id,
      buyer_id: userId,
      seller_id: orders[0].sellerId,
      invoice_number: invoiceNumber,
      subtotal: totalAmount - buyerFee,
      buyer_fee: buyerFee,
      seller_commission: orders.reduce((sum, o) => sum + o.sellerCommission, 0),
      total: totalAmount,
      status: "pending",
    });

    const origin = req.headers.get("origin") || "https://www.marketplaceromania.com";
    const orderIds = orders.map(o => o.id).join(",");

    // Handle COD (Cash on Delivery) - confirm immediately since payment is at delivery
    if (paymentMethod === "cod") {
      for (const order of orders) {
        await supabase.rpc("confirm_order_payment", {
          p_order_id: order.id,
          p_transaction_id: `COD-${order.transactionId}`,
          p_processor_status: "cod_pending_delivery",
        });
      }

      // Update invoice to issued
      await supabase
        .from("invoices")
        .update({ status: "issued" })
        .eq("invoice_number", invoiceNumber);

      // Handle locker delivery
      if (deliveryType === "locker" && selectedLocker && userEmail) {
        const pickupCode = Math.random().toString().slice(2, 8);
        const awbNumber = `AWB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        try {
          await supabase.functions.invoke("send-easybox-code", {
            body: {
              orderId: orders[0].id,
              buyerEmail: userEmail,
              lockerName: selectedLocker.name,
              lockerAddress: `${selectedLocker.address}, ${selectedLocker.city}, ${selectedLocker.county}`,
              awbNumber,
              pickupCode,
              courier: courier || "sameday",
              productTitle: orders[0].listingTitle || "Produs",
            },
          });
        } catch (emailError) {
          console.error("Failed to send easybox code email:", emailError);
        }
        
        await supabase
          .from("orders")
          .update({ tracking_number: awbNumber, carrier: courier })
          .eq("id", orders[0].id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          processor: "platform",
          orders: orders.map(o => ({ id: o.id, amount: o.amount, transactionId: o.transactionId })),
          total: totalAmount,
          invoiceNumber,
          paymentMethod: "cod",
          message: "Comandă plasată! Plătești la livrare.",
          requiresPayment: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For CARD payments - NOT YET IMPLEMENTED
    // Orders are in PAYMENT_PENDING status until a real payment processor is integrated
    // Currently NO card payment processor is configured
    const successUrl = `${origin}/checkout/success?order_ids=${orderIds}&invoice=${invoiceNumber}&verify=true`;
    const cancelUrl = `${origin}/checkout/cancel?order_ids=${orderIds}&restore=true`;

    return new Response(
      JSON.stringify({
        success: false,
        error: "Plata cu cardul nu este încă disponibilă. Folosește Ramburs (COD) pentru a plasa comanda.",
        requiresPayment: true,
        paymentMethod: "card",
        message: "Plata cu cardul nu este disponibilă momentan. Selectează Ramburs (COD) ca metodă de plată.",
        cancelUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
