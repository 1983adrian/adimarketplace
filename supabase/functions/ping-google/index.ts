import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Indexing API endpoint
const GOOGLE_INDEXING_API = "https://indexing.googleapis.com/v3/urlNotifications:publish";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleServiceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { url, type = "URL_UPDATED" } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log the ping request
    await supabase.from("platform_activity").insert({
      activity_type: "google_ping",
      entity_type: "url",
      entity_id: url,
      metadata: { type, timestamp: new Date().toISOString() },
      is_public: false
    });

    // If Google Service Account is configured, use Indexing API
    if (googleServiceAccountJson) {
      try {
        const serviceAccount = JSON.parse(googleServiceAccountJson);
        
        // Get access token using JWT
        const jwt = await createGoogleJWT(serviceAccount);
        const accessToken = await getGoogleAccessToken(jwt);
        
        const response = await fetch(GOOGLE_INDEXING_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            url: url,
            type: type
          })
        });

        const result = await response.json();
        
        console.log("Google Indexing API response:", result);
        
        return new Response(
          JSON.stringify({ success: true, method: "indexing_api", result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (apiError) {
        console.error("Google Indexing API error:", apiError);
        // Fall through to ping method
      }
    }

    // Fallback: Use Google ping URL (works for sitemaps)
    const sitemapUrl = "https://marketplaceromania.lovable.app/sitemap.xml";
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    const pingResponse = await fetch(pingUrl);
    console.log("Google ping response status:", pingResponse.status);

    // Also ping Bing
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await fetch(bingPingUrl).catch(() => {});

    return new Response(
      JSON.stringify({ 
        success: true, 
        method: "sitemap_ping",
        message: "Sitemap ping sent to Google and Bing" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Ping error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to create JWT for Google API
async function createGoogleJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Sign with private key
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${unsignedToken}.${signatureB64}`;
}

// Helper to convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Get access token from Google
async function getGoogleAccessToken(jwt: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const data = await response.json();
  return data.access_token;
}
