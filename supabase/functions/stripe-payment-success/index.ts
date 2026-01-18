import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId, listingId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    logStep("Processing payment success", { sessionId, listingId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    logStep("Payment verified", { paymentStatus: session.payment_status });

    const metadata = session.metadata || {};
    const buyerId = metadata.buyer_id;
    const sellerId = metadata.seller_id;
    const listingIdFromMeta = metadata.listing_id || listingId;

    // Check if order already exists for this session
    const { data: existingOrder } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .single();

    if (existingOrder) {
      logStep("Order already exists", { orderId: existingOrder.id });
      return new Response(JSON.stringify({ 
        success: true, 
        orderId: existingOrder.id,
        message: "Order already processed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        listing_id: listingIdFromMeta,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: parseFloat(metadata.total_amount || "0"),
        buyer_fee: parseFloat(metadata.buyer_fee || "2"),
        seller_commission: parseFloat(metadata.seller_commission || "0"),
        payout_amount: parseFloat(metadata.payout_amount || "0"),
        shipping_address: metadata.shipping_address || "",
        status: "paid",
        payout_status: "pending",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Order creation error", orderError);
      throw new Error("Failed to create order");
    }

    logStep("Order created", { orderId: order.id });

    // Mark listing as sold
    await supabaseClient
      .from("listings")
      .update({ is_sold: true, is_active: false })
      .eq("id", listingIdFromMeta);

    logStep("Listing marked as sold");

    // Create notification for seller
    await supabaseClient.from("notifications").insert({
      user_id: sellerId,
      type: "new_order",
      title: "Comandă Nouă! 🎉",
      message: `Ai primit o comandă nouă în valoare de £${metadata.total_amount}. Verifică dashboard-ul pentru detalii.`,
      data: { orderId: order.id, listingId: listingIdFromMeta },
    });

    // Create notification for buyer
    await supabaseClient.from("notifications").insert({
      user_id: buyerId,
      type: "order_confirmed",
      title: "Comandă Confirmată! 🎉",
      message: `Comanda ta în valoare de £${metadata.total_amount} a fost plasată cu succes. Vânzătorul va expedia în curând.`,
      data: { orderId: order.id, listingId: listingIdFromMeta },
    });

    // Get listing details for email
    const { data: listing } = await supabaseClient
      .from("listings")
      .select("title")
      .eq("id", listingIdFromMeta)
      .single();

    // Get buyer email from auth
    const { data: buyerAuth } = await supabaseClient.auth.admin.getUserById(buyerId);
    const buyerEmail = buyerAuth?.user?.email;

    // Get seller profile for SMS/Email notifications
    const { data: sellerProfile } = await supabaseClient
      .from("profiles")
      .select("phone, paypal_email, display_name")
      .eq("user_id", sellerId)
      .single();

    // Send SMS to seller if phone exists
    if (sellerProfile?.phone) {
      try {
        await supabaseClient.functions.invoke("send-notification", {
          body: {
            type: "sms",
            to: sellerProfile.phone,
            message: `🎉 Comandă nouă AdiMarket! Valoare: £${metadata.total_amount}. Verifică dashboard-ul!`,
          },
        });
        logStep("SMS sent to seller");
      } catch (smsError) {
        logStep("SMS failed", smsError);
      }
    }

    // Send email to seller
    if (sellerProfile?.paypal_email) {
      try {
        await supabaseClient.functions.invoke("send-notification", {
          body: {
            type: "email",
            to: sellerProfile.paypal_email,
            subject: "🎉 Comandă nouă pe AdiMarket!",
            message: `
              <h1>🎉 Ai o comandă nouă!</h1>
              <p>Felicitări! Ai primit o nouă comandă.</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Produs:</strong> ${listing?.title || 'Item'}</p>
                <p><strong>Total:</strong> £${metadata.total_amount}</p>
                <p><strong>Comision platforma:</strong> £${metadata.seller_commission}</p>
                <p><strong>Vei primi:</strong> £${metadata.payout_amount}</p>
                <p><strong>Adresa livrare:</strong> ${metadata.shipping_address}</p>
              </div>
              <p>Accesează dashboard-ul pentru a procesa și expedia comanda.</p>
            `,
          },
        });
        logStep("Email sent to seller");
      } catch (emailError) {
        logStep("Email failed", emailError);
      }
    }

    // ✅ NEW: Send email to buyer with order confirmation
    if (buyerEmail) {
      try {
        await supabaseClient.functions.invoke("send-notification", {
          body: {
            type: "email",
            to: buyerEmail,
            subject: "🎉 Comanda ta a fost confirmată - AdiMarket",
            message: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #16a34a;">🎉 Mulțumim pentru comandă!</h1>
                <p>Comanda ta a fost procesată cu succes și vânzătorul a fost notificat.</p>
                
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin-top: 0;">Detalii Comandă</h3>
                  <p><strong>Produs:</strong> ${listing?.title || 'Item'}</p>
                  <p><strong>Preț produs:</strong> £${metadata.item_price || '0'}</p>
                  <p><strong>Taxă platformă:</strong> £${metadata.buyer_fee || '2'}</p>
                  <p><strong>Livrare:</strong> £${metadata.shipping_cost || '0'}</p>
                  <p><strong>Total plătit:</strong> £${metadata.total_amount}</p>
                </div>

                <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin-top: 0;">Adresa de Livrare</h3>
                  <p>${metadata.shipping_address}</p>
                </div>

                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin-top: 0;">📦 Ce urmează?</h3>
                  <ol style="margin: 0; padding-left: 20px;">
                    <li>Vânzătorul va împacheta și expedia produsul</li>
                    <li>Vei primi un email cu numărul de tracking</li>
                    <li>Când primești coletul, confirmă livrarea în cont</li>
                  </ol>
                </div>

                <p><strong>Număr comandă:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
                
                <p style="color: #666; font-size: 14px;">
                  Poți urmări statusul comenzii oricând în secțiunea "My Orders" din contul tău.
                </p>
              </div>
            `,
          },
        });
        logStep("Email sent to buyer");
      } catch (emailError) {
        logStep("Buyer email failed", emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id,
      message: "Payment processed successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
