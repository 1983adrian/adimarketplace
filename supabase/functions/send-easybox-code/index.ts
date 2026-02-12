import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EasyboxCodeRequest {
  orderId: string;
  buyerEmail: string;
  buyerName: string;
  lockerName: string;
  lockerAddress: string;
  awbNumber: string;
  pickupCode: string;
  courier: string;
  productTitle: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      buyerEmail,
      buyerName,
      lockerName,
      lockerAddress,
      awbNumber,
      pickupCode,
      courier,
      productTitle,
    }: EasyboxCodeRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Marketplace România <onboarding@resend.dev>";
    
    // Get courier display name
    const courierNames: Record<string, string> = {
      fan_courier: "FANbox",
      sameday: "Easybox Sameday",
      cargus: "Ship & Go Cargus",
      dpd: "DPD Pickup",
      gls: "GLS Pickup",
    };
    
    const courierDisplayName = courierNames[courier] || courier;

    // HTML Email template with pickup code
    const htmlContent = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codul tău de ridicare ${courierDisplayName}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <img src="https://marketplaceromania.lovable.app/logo-oficial.png" alt="Marketplace România" style="max-width: 180px; height: auto; margin-bottom: 12px;" />
      <h1 style="color: white; margin: 0; font-size: 24px;">📦 Comanda ta este gata de ridicare!</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Dragă <strong>${buyerName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
        Coletul tău cu produsul <strong>"${productTitle}"</strong> a fost livrat la locker și te așteaptă să îl ridici.
      </p>
      
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
        <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Codul tău de ridicare</p>
        <div style="background: white; border-radius: 8px; padding: 15px 30px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 4px; font-family: 'Courier New', monospace;">${pickupCode}</span>
        </div>
      </div>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📍 Locația ${courierDisplayName}:</h3>
        <p style="font-size: 15px; color: #6b7280; margin: 0;">
          <strong>${lockerName}</strong><br>
          ${lockerAddress}
        </p>
      </div>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <p style="font-size: 14px; color: #92400e; margin: 0;">
          <strong>⏰ Important:</strong> Ai la dispoziție 48 de ore pentru a ridica coletul. După expirarea acestui termen, acesta va fi returnat expeditorului.
        </p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Număr AWB:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: bold;">${awbNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Curier:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: bold;">${courierDisplayName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; color: #6b7280;">Nr. Comandă:</td>
          <td style="padding: 10px; color: #374151; font-weight: bold;">#${orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 14px; color: #9ca3af; margin: 0;">
          Mulțumim că ai ales C.Market! 💜
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [buyerEmail],
        subject: `📦 Cod ridicare ${courierDisplayName}: ${pickupCode} - Comanda #${orderId.slice(0, 8).toUpperCase()}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailResult);
      return new Response(
        JSON.stringify({ error: emailResult.message || "Failed to send email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the notification
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find buyer ID from order
    const { data: order } = await supabase
      .from("orders")
      .select("buyer_id")
      .eq("id", orderId)
      .single();

    if (order?.buyer_id) {
      await supabase.from("notifications").insert({
        user_id: order.buyer_id,
        type: "easybox_code",
        title: `Cod ${courierDisplayName}: ${pickupCode}`,
        message: `Coletul tău este gata de ridicare la ${lockerName}. Cod: ${pickupCode}`,
        data: { orderId, awbNumber, pickupCode, lockerName, lockerAddress },
      });
    }

    console.log("Easybox code email sent successfully:", emailResult.id);
    return new Response(
      JSON.stringify({ success: true, messageId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-easybox-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
