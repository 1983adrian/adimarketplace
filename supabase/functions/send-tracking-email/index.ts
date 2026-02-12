import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CARRIER_LABELS: Record<string, string> = {
  fan_courier: "FAN Courier",
  sameday: "Sameday (Easybox)",
  cargus: "Cargus",
  dpd_ro: "DPD România",
  gls: "GLS",
  royal_mail: "Royal Mail",
  dhl: "DHL",
  ups: "UPS",
  fedex: "FedEx",
  hermes: "Evri (Hermes)",
  dpd: "DPD",
  yodel: "Yodel",
  other: "Curier",
};

const CARRIER_TRACKING_URLS: Record<string, string> = {
  fan_courier: "https://www.fancourier.ro/awb-tracking/?awb=",
  sameday: "https://www.sameday.ro/tracking-awb?awb=",
  cargus: "https://app.urgentcargus.ro/Private/Tracking.aspx?id=",
  dpd_ro: "https://tracking.dpd.ro/",
  gls: "https://gls-group.com/RO/ro/urmarire-colete?match=",
  royal_mail: "https://www.royalmail.com/track-your-item#/tracking-results/",
  dhl: "https://www.dhl.com/ro-ro/home/tracking.html?tracking-id=",
  ups: "https://www.ups.com/track?tracknum=",
  fedex: "https://www.fedex.com/fedextrack/?trknbr=",
  hermes: "https://www.evri.com/track-a-parcel/",
  dpd: "https://www.dpd.co.uk/tracking/",
  yodel: "https://www.yodel.co.uk/track/",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { order_id, tracking_number, carrier } = await req.json();

    if (!order_id || !tracking_number || !carrier) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: order_id, tracking_number, carrier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[TRACKING-EMAIL] Processing:", { order_id, tracking_number, carrier });

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, listings(title)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("[TRACKING-EMAIL] Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get buyer email
    const { data: buyerAuth } = await supabase.auth.admin.getUserById(order.buyer_id);
    const buyerEmail = buyerAuth?.user?.email;

    if (!buyerEmail) {
      console.log("[TRACKING-EMAIL] No buyer email found");
      return new Response(
        JSON.stringify({ error: "Buyer email not found", sent: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const carrierLabel = CARRIER_LABELS[carrier] || carrier;
    const trackingBaseUrl = CARRIER_TRACKING_URLS[carrier] || "";
    const trackingUrl = trackingBaseUrl 
      ? `${trackingBaseUrl}${encodeURIComponent(tracking_number)}`
      : `https://www.google.com/search?q=${encodeURIComponent(carrierLabel)}+tracking+${encodeURIComponent(tracking_number)}`;
    const listingTitle = order.listings?.title || "Comandă";

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Marketplace România <onboarding@resend.dev>";

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📦 Coletul tău este pe drum!</h1>
          <p style="color: #a0aec0; margin: 8px 0 0 0; font-size: 14px;">Marketplace România</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Vânzătorul a expediat comanda ta. Iată detaliile de livrare:
          </p>
          
          <div style="background: #f7f8fc; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #FF6B35;">
            <h3 style="margin: 0 0 16px 0; color: #1a1a2e;">Detalii Expediere</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Produs:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-size: 14px;">${listingTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Firma de curierat:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-size: 14px;">${carrierLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Număr AWB:</td>
                <td style="padding: 8px 0;">
                  <code style="background: #e8ecf4; padding: 6px 12px; border-radius: 6px; font-size: 16px; font-weight: bold; color: #1a1a2e; letter-spacing: 1px;">${tracking_number}</code>
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${trackingUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #FF6B35, #ff8c5a); color: #ffffff; 
                      padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;
                      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
              🔍 Urmărește Coletul
            </a>
          </div>

          <div style="background: #fff8f0; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffe0c4;">
            <h4 style="margin: 0 0 8px 0; color: #c05621;">⚠️ Important</h4>
            <p style="margin: 0; color: #7b341e; font-size: 13px; line-height: 1.5;">
              Când primești coletul, te rugăm să confirmi livrarea în contul tău pe platformă. 
              Acest lucru permite eliberarea plății către vânzător și protejează ambele părți.
            </p>
          </div>

          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            Dacă ai întrebări, poți contacta vânzătorul direct din secțiunea 
            <a href="https://marketplaceromania.lovable.app/messages" style="color: #FF6B35;">Mesaje</a>.
          </p>
        </div>

        <div style="padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">© 2025 Marketplace România. Toate drepturile rezervate.</p>
          <p style="margin: 4px 0 0 0;">Acest email a fost trimis automat.</p>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [buyerEmail],
        subject: `📦 Coletul tău a fost expediat - AWB: ${tracking_number} | ${carrierLabel}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[TRACKING-EMAIL] Resend error:", emailResult);
      return new Response(
        JSON.stringify({ error: emailResult.message || "Failed to send email", sent: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[TRACKING-EMAIL] Email sent to buyer:", buyerEmail, "ID:", emailResult.id);

    // Also send email notifications to seller and admins about order status changes
    // Get seller email for confirmation
    const { data: sellerAuth } = await supabase.auth.admin.getUserById(order.seller_id);
    if (sellerAuth?.user?.email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [sellerAuth.user.email],
            subject: `✅ Tracking confirmat - AWB: ${tracking_number}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center;">
                  <h1 style="color: #fff; margin: 0; font-size: 20px;">✅ Tracking Confirmat</h1>
                </div>
                <div style="padding: 24px;">
                  <p>Numărul de urmărire <strong>${tracking_number}</strong> (${carrierLabel}) a fost înregistrat pentru <strong>"${listingTitle}"</strong>.</p>
                  <p>Cumpărătorul a fost notificat automat prin email.</p>
                  <p style="color: #666; font-size: 13px;">Plata va fi eliberată după confirmarea livrării de către cumpărător.</p>
                </div>
              </div>
            `,
          }),
        });
        console.log("[TRACKING-EMAIL] Seller confirmation email sent");
      } catch (e) {
        console.error("[TRACKING-EMAIL] Seller email failed (non-blocking):", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[TRACKING-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
