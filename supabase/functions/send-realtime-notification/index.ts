import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  type: 'order' | 'message' | 'review' | 'payout' | 'shipping' | 'bid';
  title: string;
  message: string;
  data?: Record<string, any>;
  send_push?: boolean;
  send_email?: boolean;
  send_sms?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing or invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate the user token
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for database operations
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      user_id, 
      type, 
      title, 
      message, 
      data = {}, 
      send_push = true,
      send_email = false,
      send_sms = false 
    }: NotificationRequest = await req.json();
    
    if (!user_id || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, type, title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      database: false,
      push: false,
      email: false,
      sms: false,
    };

    // 1. Insert into database (triggers real-time subscription)
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        is_read: false,
      });

    if (!dbError) {
      results.database = true;
      console.log("✅ Database notification created");
    } else {
      console.error("❌ Database notification failed:", dbError);
    }

    // 2. Send Push Notification (if enabled and tokens exist)
    if (send_push) {
      const { data: tokens } = await supabase
        .from("push_tokens")
        .select("token, platform")
        .eq("user_id", user_id);

      if (tokens && tokens.length > 0) {
        // In production, call FCM or APNS here
        console.log(`📱 Push: Would send to ${tokens.length} devices`);
        results.push = true;
      }
    }

    // 3. Send Email (if enabled and Resend is configured)
    if (send_email && resendApiKey) {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(user_id);
      const userEmail = userData?.user?.email;

      if (userEmail) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Marketplace România <notifications@marketplace-romania.ro>",
              to: userEmail,
              subject: title,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0;">Marketplace România</h1>
                  </div>
                  <div style="padding: 30px; background: #fff;">
                    <h2 style="color: #1a1a2e;">${title}</h2>
                    <p style="color: #666; line-height: 1.6;">${message}</p>
                    <a href="https://adimarketplace.lovable.app" 
                       style="display: inline-block; background: #FF6B35; color: #fff; 
                              padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                      Vezi Detalii
                    </a>
                  </div>
                  <div style="padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #999;">
                    © 2025 C Market. Toate drepturile rezervate.
                  </div>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            results.email = true;
            console.log("✉️ Email sent successfully");
          }
        } catch (emailError) {
          console.error("❌ Email failed:", emailError);
        }
      }
    }

    // 4. Send SMS (if enabled and Twilio is configured)
    if (send_sms && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Get user phone from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user_id)
        .single();

      if (profile?.phone) {
        try {
          const smsResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                From: twilioPhoneNumber,
                To: profile.phone,
                Body: `${title}: ${message}`,
              }),
            }
          );

          if (smsResponse.ok) {
            results.sms = true;
            console.log("📲 SMS sent successfully");
          }
        } catch (smsError) {
          console.error("❌ SMS failed:", smsError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        message: "Notification processed"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-realtime-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
