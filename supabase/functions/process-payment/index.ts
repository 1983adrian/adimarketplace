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
  processor?: "mangopay";
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

    // Get MangoPay settings
    const { data: mangopaySettings } = await supabase
      .from("payment_processor_settings")
      .select("*")
      .eq("processor_name", "mangopay")
      .maybeSingle();

    const processorName = "mangopay";
    const processorEnv = mangopaySettings?.environment || "sandbox";
    const hasLiveKeys = !!mangopaySettings?.api_key_encrypted;

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
          p_payment_processor: processorName,
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

    // Create notification for seller(s) - CRITICAL: must be server-side so offline sellers get it
    const sellerIds = [...new Set(orders.map(o => o.sellerId))];
    for (const sellerId of sellerIds) {
      const sellerOrders = orders.filter(o => o.sellerId === sellerId);
      const sellerTotal = sellerOrders.reduce((sum, o) => sum + o.amount, 0);
      const itemTitles = sellerOrders.map(o => o.listingTitle).join(", ");

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
      status: "pending", // Invoice is pending until payment confirmed
    });

    const origin = req.headers.get("origin") || "https://www.marketplaceromania.com";
    const orderIds = orders.map(o => o.id).join(",");

    // Handle COD (Cash on Delivery) - confirm immediately since payment is at delivery
    if (paymentMethod === "cod") {
      // For COD, confirm orders immediately as payment will be collected at delivery
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
          processor: processorName,
          environment: processorEnv,
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

    // For CARD payments - redirect to payment processor
    // The orders are in PAYMENT_PENDING status
    // Payment confirmation will happen via webhook or return URL

    // Build payment URL for MangoPay (or demo mode)
    const successUrl = `${origin}/checkout/success?order_ids=${orderIds}&invoice=${invoiceNumber}&verify=true`;
    const cancelUrl = `${origin}/checkout/cancel?order_ids=${orderIds}&restore=true`;

    // If live MangoPay keys are configured, create actual payment session
    let paymentUrl = successUrl; // Default to success for demo mode
    let requiresExternalPayment = false;

    if (hasLiveKeys && processorEnv === "live") {
      // TODO: Integrate actual MangoPay payment creation here
      // For now, we'll use demo mode which goes directly to success
      // In production, this would create a MangoPay PayIn and return the redirect URL
      requiresExternalPayment = true;
      paymentUrl = successUrl; // Replace with actual MangoPay redirect
    }

    return new Response(
      JSON.stringify({
        success: true,
        processor: processorName,
        environment: processorEnv,
        orders: orders.map(o => ({ id: o.id, amount: o.amount, transactionId: o.transactionId })),
        total: totalAmount,
        invoiceNumber,
        paymentMethod: "card",
        // CRITICAL: Tell frontend that payment verification is needed
        requiresPayment: true,
        requiresExternalPayment,
        paymentUrl,
        successUrl,
        cancelUrl,
        message: hasLiveKeys 
          ? "Redirecționare către procesatorul de plăți..." 
          : "Demo mode - configurează cheile MangoPay pentru plăți reale",
        isLive: processorEnv === "live" && hasLiveKeys,
        // Include order IDs for verification on success page
        pendingOrderIds: orderIds,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
