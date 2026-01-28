import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SECURITY: Minimum response time to prevent timing attacks
const MIN_RESPONSE_TIME_MS = 2000;
const MAX_ATTEMPTS_PER_HOUR = 3;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const logStep = (step: string) => {
  // SECURITY: Don't log sensitive details like email or errors
  console.log(`[SEND-PASSWORD-RESET] ${step}`);
};

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Generic response for all cases to prevent enumeration
  const genericResponse = () => new Response(
    JSON.stringify({ 
      success: true, 
      message: "Dacă adresa de email există în sistem, vei primi un link de resetare." 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );

  // SECURITY: Ensure constant response time
  const respondWithDelay = async (response: Response) => {
    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_RESPONSE_TIME_MS) {
      await delay(MIN_RESPONSE_TIME_MS - elapsed);
    }
    return response;
  };

  try {
    logStep("Request received");
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logStep("Configuration error");
      return respondWithDelay(genericResponse());
    }
    
    const resend = new Resend(resendApiKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, resetUrl } = await req.json();
    
    // SECURITY: Basic validation without revealing details
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      logStep("Invalid input");
      return respondWithDelay(genericResponse());
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // SECURITY: Rate limiting - check recent attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseClient
      .from('password_reset_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', sanitizedEmail)
      .gte('created_at', oneHourAgo);

    if (count !== null && count >= MAX_ATTEMPTS_PER_HOUR) {
      logStep("Rate limit exceeded");
      return respondWithDelay(genericResponse());
    }

    // Log this attempt (for rate limiting)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    await supabaseClient
      .from('password_reset_attempts')
      .insert({ email: sanitizedEmail, ip_address: clientIP });

    logStep("Processing request");

    // Generate password reset link
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: sanitizedEmail,
      options: {
        redirectTo: resetUrl || 'https://marketplaceromania.lovable.app/reset-password'
      }
    });

    // SECURITY: If error (user doesn't exist), still send a generic email
    if (linkError || !linkData?.properties?.action_link) {
      logStep("Link generation issue - sending generic email");
      
      // Send a generic "we received your request" email even if user doesn't exist
      try {
        await resend.emails.send({
          from: "Marketplace România <onboarding@resend.dev>",
          to: [sanitizedEmail],
          subject: "🔐 Cerere de Resetare Parolă - Marketplace România",
          html: `
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #1a1a2e; text-align: center;">Cerere de Resetare Parolă</h1>
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Am primit o cerere de resetare a parolei pentru această adresă de email.
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Dacă nu ai un cont pe Marketplace România cu această adresă, poți ignora acest email în siguranță.
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Dacă ai un cont și vrei să resetezi parola, încearcă să folosești adresa de email exactă cu care te-ai înregistrat.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                  © ${new Date().getFullYear()} Marketplace România
                </p>
              </div>
            </body>
            </html>
          `,
        });
      } catch {
        // Ignore email sending errors
      }
      
      return respondWithDelay(genericResponse());
    }

    const resetLink = linkData.properties.action_link;
    logStep("Sending reset email");

    // Send the actual reset email
    await resend.emails.send({
      from: "Marketplace România <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "🔐 Resetează-ți Parola - Marketplace România",
      html: `
        <!DOCTYPE html>
        <html lang="ro">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
              
              <div style="text-align: center; padding: 40px 20px 30px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                  Resetează-ți Parola
                </h1>
                <p style="color: #94a3b8; font-size: 16px; margin-top: 8px;">
                  Marketplace România
                </p>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border-radius: 16px 16px 0 0; margin-top: -1px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Bună,
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Am primit o cerere de resetare a parolei pentru contul tău. Apasă butonul de mai jos pentru a seta o parolă nouă:
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" 
                     style="display: inline-block; background: linear-gradient(135deg, #4A90D9 0%, #5BA3EC 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(74, 144, 217, 0.4);">
                    🔒 Resetează Parola
                  </a>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                  <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                    ⚠️ Link-ul expiră în 24 de ore
                  </p>
                  <p style="color: #a16207; font-size: 14px; margin: 8px 0 0;">
                    Dacă nu ai solicitat această resetare, ignoră acest email.
                  </p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                  Dacă butonul nu funcționează, copiază acest link:
                </p>
                <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #4A90D9; margin: 12px 0 0;">
                  ${resetLink}
                </p>
              </div>
              
              <div style="background: #f8fafc; padding: 24px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Marketplace România
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully");
    return respondWithDelay(genericResponse());

  } catch (error) {
    logStep("Error occurred");
    return respondWithDelay(genericResponse());
  }
});
