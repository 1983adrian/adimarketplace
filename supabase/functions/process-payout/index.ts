import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYOUT] ${step}${detailsStr}`);
};

// PayPal API helpers
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    logStep("PayPal auth error", { status: response.status, error });
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

async function sendPayPalPayout(accessToken: string, payout: {
  recipientEmail: string;
  amount: number;
  currency: string;
  payoutId: string;
  note: string;
}): Promise<{ payoutBatchId: string }> {
  const response = await fetch("https://api-m.paypal.com/v1/payments/payouts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: payout.payoutId,
        email_subject: "AdiMarket - Your payment has arrived!",
        email_message: "You have received a payment from AdiMarket for your sale.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: payout.amount.toFixed(2),
            currency: payout.currency,
          },
          receiver: payout.recipientEmail,
          note: payout.note,
          sender_item_id: payout.payoutId,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logStep("PayPal payout error", { status: response.status, error });
    throw new Error(`PayPal payout failed: ${error}`);
  }

  const data = await response.json();
  return { payoutBatchId: data.batch_header.payout_batch_id };
}

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

    const { order_id, auto_payout = false } = await req.json();
    if (!order_id) throw new Error("Order ID is required");
    logStep("Processing order", { orderId: order_id, autoPayout: auto_payout });

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, listings(title, price)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }
    logStep("Order fetched", { order });

    // Verify user is the buyer confirming delivery
    if (order.buyer_id !== user.id) {
      throw new Error("Only the buyer can confirm delivery");
    }

    // Verify order status
    if (order.status !== "shipped") {
      throw new Error("Order must be shipped before confirming delivery");
    }

    // Fetch platform fees
    const { data: fees, error: feesError } = await supabaseClient
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    if (feesError) {
      throw new Error("Error fetching platform fees");
    }
    logStep("Fees fetched", { fees });

    // Calculate fees
    const grossAmount = Number(order.amount);
    let buyerFee = 0;
    let sellerCommission = 0;

    for (const fee of fees || []) {
      if (fee.fee_type === "buyer_fee" || fee.fee_type === "buyer_service_fee") {
        buyerFee = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      } else if (fee.fee_type === "seller_commission") {
        sellerCommission = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      }
    }

    // Net amount to seller = gross - seller commission
    const netAmount = grossAmount - sellerCommission;
    logStep("Fees calculated", { grossAmount, buyerFee, sellerCommission, netAmount });

    // Update order status to delivered
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({
        status: "delivered",
        delivery_confirmed_at: new Date().toISOString(),
        payout_amount: netAmount,
        payout_status: "pending",
        buyer_fee: buyerFee,
        seller_commission: sellerCommission,
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Error updating order: ${updateError.message}`);
    }
    logStep("Order updated to delivered");

    // Get seller's PayPal email from profile (preferred) or auth email
    const { data: sellerProfile } = await supabaseClient
      .from('profiles')
      .select('paypal_email')
      .eq('user_id', order.seller_id)
      .single();
    
    const { data: sellerAuth } = await supabaseClient.auth.admin.getUserById(order.seller_id);
    const sellerEmail = sellerProfile?.paypal_email || sellerAuth?.user?.email;
    logStep("Seller payout email", { paypalEmail: sellerProfile?.paypal_email, authEmail: sellerAuth?.user?.email, using: sellerEmail });

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from("payouts")
      .insert({
        order_id: order_id,
        seller_id: order.seller_id,
        gross_amount: grossAmount,
        buyer_fee: buyerFee,
        seller_commission: sellerCommission,
        net_amount: netAmount,
        status: "pending",
      })
      .select()
      .single();

    if (payoutError) {
      throw new Error(`Error creating payout: ${payoutError.message}`);
    }
    logStep("Payout record created", { payoutId: payout.id });

    // Attempt automatic PayPal payout if seller email exists
    let paypalPayoutId: string | null = null;
    let payoutStatus = "pending";

    if (sellerEmail) {
      try {
        logStep("Attempting automatic PayPal payout", { sellerEmail, amount: netAmount });
        
        const accessToken = await getPayPalAccessToken();
        const paypalResult = await sendPayPalPayout(accessToken, {
          recipientEmail: sellerEmail,
          amount: netAmount,
          currency: "GBP",
          payoutId: payout.id,
          note: `Payment for order ${order_id.slice(0, 8)} - ${order.listings?.title || 'Item'}`,
        });

        paypalPayoutId = paypalResult.payoutBatchId;
        payoutStatus = "processing";
        logStep("PayPal payout initiated", { paypalPayoutId });

        // Update payout record with PayPal batch ID
        await supabaseClient
          .from("payouts")
          .update({
            paypal_payout_id: paypalPayoutId,
            status: "processing",
          })
          .eq("id", payout.id);

        // Update order payout status
        await supabaseClient
          .from("orders")
          .update({
            payout_status: "processing",
          })
          .eq("id", order_id);

      } catch (paypalError) {
        logStep("PayPal payout failed, will retry manually", { 
          error: paypalError instanceof Error ? paypalError.message : String(paypalError) 
        });
        // Don't throw - payout will be processed manually
      }
    } else {
      logStep("No seller email found, payout will be processed manually");
    }

    // Create notification for seller
    await supabaseClient.from("notifications").insert({
      user_id: order.seller_id,
      type: "payout",
      title: payoutStatus === "processing" ? "Payment Processing" : "Delivery Confirmed",
      message: payoutStatus === "processing" 
        ? `Your payment of £${netAmount.toFixed(2)} is being processed and will arrive shortly.`
        : `Delivery confirmed! Your payment of £${netAmount.toFixed(2)} is pending processing.`,
      data: { orderId: order_id, payoutId: payout.id, amount: netAmount },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: payoutStatus === "processing" 
          ? "Delivery confirmed, PayPal payout initiated"
          : "Delivery confirmed, payout pending",
        payout: {
          id: payout.id,
          gross_amount: grossAmount,
          buyer_fee: buyerFee,
          seller_commission: sellerCommission,
          net_amount: netAmount,
          status: payoutStatus,
          paypal_payout_id: paypalPayoutId,
        },
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
