import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-TRACKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { order_id, tracking_number, carrier } = await req.json();
    if (!order_id || !tracking_number || !carrier) {
      throw new Error("Order ID, tracking number, and carrier are required");
    }
    logStep("Request data", { orderId: order_id, trackingNumber: tracking_number, carrier });

    // Fetch order to verify ownership
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Verify user is the seller
    if (order.seller_id !== user.id) {
      throw new Error("Only the seller can update tracking information");
    }

    // Verify order is paid
    if (order.status !== "paid") {
      throw new Error("Order must be paid before adding tracking");
    }

    // Update order with tracking info and mark as shipped
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({
        tracking_number,
        carrier,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Error updating order: ${updateError.message}`);
    }
    logStep("Order updated to shipped with tracking");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tracking information added, order marked as shipped",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
