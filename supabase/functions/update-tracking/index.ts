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

    // Check if seller has PayPal and send tracking
    const { data: sellerProfile } = await supabaseClient
      .from("profiles")
      .select("paypal_email")
      .eq("user_id", order.seller_id)
      .single();

    if (sellerProfile?.paypal_email) {
      try {
        logStep("Seller has PayPal, sending tracking", { email: sellerProfile.paypal_email });
        await supabaseClient.functions.invoke("paypal-add-tracking", {
          body: {
            order_id,
            tracking_number,
            carrier,
            transaction_id: order.processor_transaction_id,
          },
        });
        logStep("PayPal tracking sent successfully");
      } catch (paypalError) {
        logStep("PayPal tracking failed (non-blocking)", paypalError);
      }
    }

    // Get listing details
    const { data: listing } = await supabaseClient
      .from("listings")
      .select("title")
      .eq("id", order.listing_id)
      .single();

    // Get carrier label
    const carrierLabels: Record<string, string> = {
      royal_mail: "Royal Mail",
      dhl: "DHL",
      ups: "UPS",
      fedex: "FedEx",
      hermes: "Evri (Hermes)",
      dpd: "DPD",
      yodel: "Yodel",
      other: "Curier",
    };
    const carrierLabel = carrierLabels[carrier] || carrier;

    // Create notification for buyer
    await supabaseClient.from("notifications").insert({
      user_id: order.buyer_id,
      type: "order_shipped",
      title: "Comanda ta a fost expediată! 📦",
      message: `Produsul "${listing?.title || 'Comandă'}" a fost expediat. Număr tracking: ${tracking_number}`,
      data: { orderId: order_id, trackingNumber: tracking_number, carrier },
    });
    logStep("Buyer notification created");

    // Get buyer email
    const { data: buyerAuth } = await supabaseClient.auth.admin.getUserById(order.buyer_id);
    const buyerEmail = buyerAuth?.user?.email;

    // Send email to buyer with tracking
    if (buyerEmail) {
      try {
        const trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(carrierLabel)}+tracking+${encodeURIComponent(tracking_number)}`;
        
        await supabaseClient.functions.invoke("send-notification", {
          body: {
            type: "email",
            to: buyerEmail,
            subject: `📦 Comanda ta a fost expediată - ${tracking_number}`,
            message: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">📦 Comanda ta este pe drum!</h1>
                <p>Vânzătorul a expediat comanda ta. Iată detaliile de tracking:</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin-top: 0;">Informații Expediere</h3>
                  <p><strong>Produs:</strong> ${listing?.title || 'Item'}</p>
                  <p><strong>Curier:</strong> ${carrierLabel}</p>
                  <p style="font-size: 18px;"><strong>Număr Tracking:</strong> <code style="background: #e0e0e0; padding: 4px 8px; border-radius: 4px;">${tracking_number}</code></p>
                </div>

                <div style="text-align: center; margin: 24px 0;">
                  <a href="${trackingUrl}" 
                     style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    🔍 Urmărește Coletul
                  </a>
                </div>

                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin-top: 0;">⚠️ Important</h3>
                  <p style="margin-bottom: 0;">Când primești coletul, confirmă livrarea în contul tău pentru a finaliza tranzacția. Acest lucru permite eliberarea plății către vânzător.</p>
                </div>

                <p style="color: #666; font-size: 14px;">
                  Dacă ai întrebări, poți contacta vânzătorul direct din secțiunea Mesaje.
                </p>
              </div>
            `,
          },
        });
        logStep("Tracking email sent to buyer");
      } catch (emailError) {
        logStep("Buyer tracking email failed", emailError);
      }
    }

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
