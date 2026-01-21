import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  items: { listingId: string; price: number }[];
  shippingAddress: string;
  shippingMethod: string;
  shippingCost: number;
  buyerFee: number;
  guestEmail?: string;
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
    const { items, shippingAddress, shippingMethod, shippingCost, buyerFee, guestEmail } = body;

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + shippingCost + buyerFee;

    // Get platform fees
    const { data: fees } = await supabase
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const sellerCommissionFee = fees?.find(f => f.fee_type === "seller_commission");
    const commissionPercent = sellerCommissionFee?.amount || 10;

    // Process each item - create orders
    const orders = [];
    for (const item of items) {
      // Get listing details
      const { data: listing } = await supabase
        .from("listings")
        .select("id, seller_id, title, price")
        .eq("id", item.listingId)
        .single();

      if (!listing) {
        throw new Error(`Listing ${item.listingId} not found`);
      }

      // Calculate seller payout
      const sellerCommission = (listing.price * commissionPercent) / 100;
      const payoutAmount = listing.price - sellerCommission;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          listing_id: listing.id,
          buyer_id: userId || "00000000-0000-0000-0000-000000000000", // Guest placeholder
          seller_id: listing.seller_id,
          amount: listing.price + shippingCost / items.length + buyerFee / items.length,
          status: "pending",
          shipping_address: shippingAddress,
          payment_processor: "mangopay",
          processor_status: "pending",
          buyer_fee: buyerFee / items.length,
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
        .eq("id", listing.id);

      // Create seller payout record
      await supabase
        .from("seller_payouts")
        .insert({
          seller_id: listing.seller_id,
          order_id: order.id,
          gross_amount: listing.price,
          platform_commission: sellerCommission,
          net_amount: payoutAmount,
          status: "pending",
          payout_method: "iban", // Will be fetched from profile
        });

      // Update seller pending balance
      await supabase.rpc("increment_pending_balance", {
        p_user_id: listing.seller_id,
        p_amount: payoutAmount,
      });

      // Create notification for seller
      await supabase.from("notifications").insert({
        user_id: listing.seller_id,
        type: "new_order",
        title: "Comandă Nouă!",
        message: `Ai o comandă nouă pentru "${listing.title}". Vei primi £${payoutAmount.toFixed(2)} după livrare.`,
        data: { order_id: order.id, listing_id: listing.id },
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

    // Return success with redirect URL (simulating payment gateway)
    // In production, this would redirect to MangoPay hosted payment page
    const successUrl = `${req.headers.get("origin") || "https://adimarketplace.lovable.app"}/checkout/success?order_ids=${orders.map(o => o.id).join(",")}&total=${total}`;

    return new Response(
      JSON.stringify({
        success: true,
        orders: orders.map(o => ({ id: o.id, amount: o.amount })),
        total,
        invoiceNumber,
        redirectUrl: successUrl,
        message: "Comenzile au fost create. Plata va fi procesată prin MangoPay.",
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
