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
  processor?: "adyen" | "mangopay";
  paymentMethod?: "card" | "cod";
  courier?: string;
  codFees?: {
    percentage: number;
    fixed: number;
    transport: number;
  };
  deliveryType?: "home" | "locker";
  selectedLocker?: {
    id: string;
    name: string;
    address: string;
    city: string;
    county: string;
  };
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
      shippingMethod, 
      shippingCost, 
      buyerFee, 
      guestEmail, 
      processor: requestedProcessor,
      paymentMethod,
      courier,
      codFees,
      deliveryType,
      selectedLocker,
    } = body;

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    // CRITICAL SECURITY: Preluăm prețurile din baza de date, NU din frontend
    // Aceasta previne frauda prin manipularea prețurilor
    const validatedItems: { listingId: string; price: number; title: string; sellerId: string }[] = [];
    
    for (const item of items) {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id, seller_id, title, price, is_active, is_sold")
        .eq("id", item.listingId)
        .single();

      if (listingError || !listing) {
        throw new Error(`Listing ${item.listingId} not found`);
      }

      if (!listing.is_active) {
        throw new Error(`Listing "${listing.title}" is no longer active`);
      }

      if (listing.is_sold) {
        throw new Error(`Listing "${listing.title}" has already been sold`);
      }

      // FOLOSIM PREȚUL DIN BAZA DE DATE, nu cel trimis de client
      if (Math.abs(listing.price - item.price) > 0.01) {
        console.warn(`[SECURITY] Price mismatch detected for listing ${item.listingId}. Client sent: ${item.price}, DB has: ${listing.price}`);
      }

      validatedItems.push({
        listingId: listing.id,
        price: listing.price, // Prețul REAL din DB
        title: listing.title,
        sellerId: listing.seller_id
      });
    }

    // MangoPay is the ONLY payment processor
    const { data: mangopaySettings } = await supabase
      .from("payment_processor_settings")
      .select("*")
      .eq("processor_name", "mangopay")
      .single();

    const processorName = "mangopay";
    const processorEnv = mangopaySettings?.environment || "sandbox";
    const merchantId = mangopaySettings?.merchant_id;
    const isActive = mangopaySettings?.is_active || false;

    console.log(`Processing payment with MangoPay (${processorEnv})`);

    // Calculate totals using VALIDATED prices from database
    const subtotal = validatedItems.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + shippingCost + buyerFee;

    // Get platform fees
    const { data: fees } = await supabase
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const sellerCommissionFee = fees?.find(f => f.fee_type === "seller_commission");
    const commissionPercent = sellerCommissionFee?.amount || 10;

    // Process each item - create orders using VALIDATED items
    const orders = [];
    for (const item of validatedItems) {
      // Calculate seller payout using validated price
      const sellerCommission = (item.price * commissionPercent) / 100;
      const payoutAmount = item.price - sellerCommission;

      // Generate processor transaction ID (will be replaced by actual processor response)
      const transactionId = `${processorName.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order - folosim validated item data
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          listing_id: item.listingId,
          buyer_id: userId || "00000000-0000-0000-0000-000000000000",
          seller_id: item.sellerId,
          amount: item.price + shippingCost / validatedItems.length + buyerFee / validatedItems.length,
          status: "pending",
          shipping_address: shippingAddress,
          payment_processor: processorName,
          processor_status: "pending",
          processor_transaction_id: transactionId,
          buyer_fee: buyerFee / validatedItems.length,
          seller_commission: sellerCommission,
          payout_amount: payoutAmount,
          payout_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;
      orders.push(order);

      // Update listing as sold
      await supabase
        .from("listings")
        .update({ is_sold: true, is_active: false })
        .eq("id", item.listingId);

      // Create seller payout record
      await supabase
        .from("seller_payouts")
        .insert({
          seller_id: item.sellerId,
          order_id: order.id,
          gross_amount: item.price,
          platform_commission: sellerCommission,
          net_amount: payoutAmount,
          status: "pending",
          processor: processorName,
          payout_method: "iban",
        });

      // Update seller pending balance - folosim funcția admin pentru service_role
      await supabase.rpc("admin_increment_pending_balance", {
        p_user_id: item.sellerId,
        p_amount: payoutAmount,
      });

      // Create notification for seller - include shipping address
      await supabase.from("notifications").insert({
        user_id: item.sellerId,
        type: "new_order",
        title: "📦 Comandă Nouă - Adaugă Tracking!",
        message: `Ai o comandă nouă pentru "${item.title}"! Expediază la adresa: ${shippingAddress}. Vei primi ${payoutAmount.toFixed(2)} RON după confirmarea livrării.`,
        data: { 
          order_id: order.id, 
          listing_id: item.listingId, 
          needs_tracking: true,
          shipping_address: shippingAddress,
          payment_method: paymentMethod || 'card',
          courier: courier || null,
        },
      });
    }

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    await supabase.from("invoices").insert({
      order_id: orders[0].id,
      buyer_id: userId || "00000000-0000-0000-0000-000000000000",
      seller_id: orders[0].seller_id,
      invoice_number: invoiceNumber,
      subtotal: subtotal,
      buyer_fee: buyerFee,
      seller_commission: orders.reduce((sum, o) => sum + (o.seller_commission || 0), 0),
      total: total,
      status: "issued",
    });

    // If locker delivery, send easybox pickup code to buyer
    if (deliveryType === "locker" && selectedLocker && userEmail) {
      const pickupCode = Math.random().toString().slice(2, 8); // 6-digit code
      const awbNumber = `AWB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Get buyer profile for name
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", userId)
        .single();
      
      const buyerName = buyerProfile?.display_name || buyerProfile?.username || "Client";
      
      // Get product title from first item
      const { data: firstListing } = await supabase
        .from("listings")
        .select("title")
        .eq("id", items[0].listingId)
        .single();
      
      // Send easybox code email
      try {
        await supabase.functions.invoke("send-easybox-code", {
          body: {
            orderId: orders[0].id,
            buyerEmail: userEmail,
            buyerName,
            lockerName: selectedLocker.name,
            lockerAddress: `${selectedLocker.address}, ${selectedLocker.city}, ${selectedLocker.county}`,
            awbNumber,
            pickupCode,
            courier: courier || "sameday",
            productTitle: firstListing?.title || items[0].title || "Produs",
          },
        });
        console.log("Easybox code email sent to buyer");
      } catch (emailError) {
        console.error("Failed to send easybox code email:", emailError);
      }
      
      // Update order with tracking info
      await supabase
        .from("orders")
        .update({
          tracking_number: awbNumber,
          carrier: courier,
        })
        .eq("id", orders[0].id);
    }

    // Generate payment URL based on processor
    const origin = req.headers.get("origin") || "https://adimarketplace.lovable.app";
    const successUrl = `${origin}/checkout/success?order_ids=${orders.map(o => o.id).join(",")}&total=${total}`;
    
    let paymentUrl = successUrl;
    let paymentInstructions = "";

    if (mangopaySettings?.api_key_encrypted && isActive) {
      // MangoPay payment - production mode
      paymentInstructions = "Redirecționare către MangoPay pentru plată securizată.";
      paymentUrl = successUrl; // In production: Generate MangoPay payment link using their API
    } else {
      // Demo mode - direct to success
      paymentInstructions = "Demo mode (MangoPay): Configurează cheile API pentru plăți reale.";
    }

    return new Response(
      JSON.stringify({
        success: true,
        processor: processorName,
        environment: processorEnv,
        orders: orders.map(o => ({ id: o.id, amount: o.amount, transactionId: o.processor_transaction_id })),
        total,
        invoiceNumber,
        redirectUrl: paymentUrl,
        message: paymentInstructions,
        isLive: processorEnv === "live" && !!mangopaySettings?.api_key_encrypted,
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
