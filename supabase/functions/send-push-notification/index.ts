import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface FCMMessage {
  message: {
    token: string;
    notification: {
      title: string;
      body: string;
    };
    data?: Record<string, string>;
    android?: {
      priority: string;
      notification: {
        sound: string;
        click_action: string;
      };
    };
    apns?: {
      payload: {
        aps: {
          sound: string;
          badge: number;
        };
      };
    };
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { user_id, title, body, data }: PushNotificationRequest = await req.json();
    
    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, title, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all push tokens for this user
    const { data: tokens, error: tokenError } = await supabase
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", user_id);

    if (tokenError) {
      console.error("Error fetching push tokens:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch push tokens" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log("No push tokens found for user:", user_id);
      return new Response(
        JSON.stringify({ message: "No push tokens registered for user", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If FCM server key is not configured, log and return demo mode
    if (!fcmServerKey) {
      console.log("FCM_SERVER_KEY not configured - Push notifications in demo mode");
      console.log("Would send notification to", tokens.length, "devices:");
      console.log("Title:", title);
      console.log("Body:", body);
      console.log("Data:", data);
      
      return new Response(
        JSON.stringify({ 
          message: "Demo mode - FCM_SERVER_KEY not configured",
          tokens_found: tokens.length,
          demo: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send push notification to each device via FCM
    const results = await Promise.allSettled(
      tokens.map(async ({ token, platform }) => {
        const fcmMessage: FCMMessage = {
          message: {
            token: token,
            notification: {
              title: title,
              body: body,
            },
            data: data ? Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            ) : undefined,
            android: {
              priority: "high",
              notification: {
                sound: "default",
                click_action: "FLUTTER_NOTIFICATION_CLICK",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  badge: 1,
                },
              },
            },
          },
        };

        const response = await fetch(
          "https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${fcmServerKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fcmMessage),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`FCM error for token ${token}:`, errorText);
          
          // If token is invalid, remove it from database
          if (response.status === 404 || errorText.includes("UNREGISTERED")) {
            await supabase
              .from("push_tokens")
              .delete()
              .eq("token", token);
            console.log("Removed invalid token:", token);
          }
          
          throw new Error(`FCM error: ${response.status}`);
        }

        return { token, platform, success: true };
      })
    );

    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Push notifications processed",
        sent: successful,
        failed: failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-push-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
