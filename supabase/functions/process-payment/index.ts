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
      .single();

    const processorName = "mangopay";
    const processorEnv = mangopaySettings?.environment || "sandbox";

    // Get platform fees
    const { data: fees } = await supabase
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const sellerCommissionFee = fees?.find(f => f.fee_type === "seller_commission");
    const commissionPercent = sellerCommissionFee?.amount || 10;

    // Process each item using TRANSACTIONAL function
    const orders: OrderResult[] = [];
    let totalAmount = 0;

    for (const item of items) {
      // CRITICAL: Validate listing exists and get real price from DB
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

      // Prevent self-purchase
      if (listing.seller_id === userId) {
        throw new Error("Cannot purchase your own listing");
      }

      // Calculate amounts using DB price (not client price)
      const itemPrice = listing.price;
      const itemBuyerFee = buyerFee / items.length;
      const itemShippingCost = shippingCost / items.length;
      const itemTotal = itemPrice + itemBuyerFee + itemShippingCost;
      const sellerCommission = (itemPrice * commissionPercent) / 100;
      const payoutAmount = itemPrice - sellerCommission;

      // Generate transaction ID
      const transactionId = `MANGOPAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Use TRANSACTIONAL function for atomic order creation
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
      });

      totalAmount += itemTotal;
    }

    // Create invoice for first order
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
      status: "issued",
    });

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

    // Generate payment URL
    const origin = req.headers.get("origin") || "https://www.marketplaceromania.com";
    const successUrl = `${origin}/checkout/success?order_ids=${orders.map(o => o.id).join(",")}&total=${totalAmount}`;

    return new Response(
      JSON.stringify({
        success: true,
        processor: processorName,
        environment: processorEnv,
        orders: orders.map(o => ({ id: o.id, amount: o.amount, transactionId: o.transactionId })),
        total: totalAmount,
        invoiceNumber,
        redirectUrl: successUrl,
        message: mangopaySettings?.api_key_encrypted 
          ? "Redirecționare către MangoPay" 
          : "Demo mode - configurează cheile API pentru plăți reale",
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
