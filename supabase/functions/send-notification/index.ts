import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "sms" | "email";
  to: string;
  message: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, message, subject }: NotificationRequest = await req.json();

    if (type === "sms") {
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        console.error("Twilio credentials not configured");
        return new Response(
          JSON.stringify({ error: "SMS service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Format phone number - ensure it starts with +
      const formattedPhone = to.startsWith("+") ? to : `+${to}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      
      const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
      
      const smsResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: twilioPhoneNumber,
          Body: message,
        }),
      });

      const smsResult = await smsResponse.json();

      if (!smsResponse.ok) {
        console.error("Twilio error:", smsResult);
        return new Response(
          JSON.stringify({ error: smsResult.message || "Failed to send SMS" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("SMS sent successfully:", smsResult.sid);
      return new Response(
        JSON.stringify({ success: true, messageId: smsResult.sid }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "email") {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (!resendApiKey) {
        console.error("Resend API key not configured");
        return new Response(
          JSON.stringify({ error: "Email service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MarketPlace <noreply@marketplace.com>",
          to: [to],
          subject: subject || "Notification from MarketPlace",
          html: message,
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

      console.log("Email sent successfully:", emailResult.id);
      return new Response(
        JSON.stringify({ success: true, messageId: emailResult.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid notification type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
