import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PASSWORD-RESET] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    
    const resend = new Resend(resendApiKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, resetUrl } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    logStep("Processing reset request", { email });

    // Generate a password reset link using Supabase Admin API
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: resetUrl || `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/reset-password`
      }
    });

    if (linkError) {
      logStep("Error generating reset link", { error: linkError.message });
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If the email exists, a reset link has been sent." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const resetLink = linkData?.properties?.action_link;
    
    if (!resetLink) {
      throw new Error("Could not generate reset link");
    }

    logStep("Reset link generated, sending email");

    // Send the email via Resend
    const emailResponse = await resend.emails.send({
      from: "Marketplace România <noreply@marketplaceromania.lovable.app>",
      to: [email],
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
              
              <!-- Header -->
              <div style="text-align: center; padding: 40px 20px 30px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                  Resetează-ți Parola
                </h1>
                <p style="color: #94a3b8; font-size: 16px; margin-top: 8px;">
                  Marketplace România
                </p>
              </div>
              
              <!-- Content -->
              <div style="background: #ffffff; padding: 40px; border-radius: 16px 16px 0 0; margin-top: -1px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Bună,
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Am primit o cerere de resetare a parolei pentru contul tău. Apasă butonul de mai jos pentru a seta o parolă nouă:
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" 
                     style="display: inline-block; background: linear-gradient(135deg, #4A90D9 0%, #5BA3EC 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(74, 144, 217, 0.4);">
                    🔒 Resetează Parola
                  </a>
                </div>
                
                <!-- Security Warning -->
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                  <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                    ⚠️ Link-ul expiră în 24 de ore
                  </p>
                  <p style="color: #a16207; font-size: 14px; margin: 8px 0 0;">
                    Dacă nu ai solicitat această resetare, ignoră acest email. Contul tău este în siguranță.
                  </p>
                </div>
                
                <!-- Alternative Link -->
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                  Dacă butonul nu funcționează, copiază și lipește acest link în browser:
                </p>
                <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #4A90D9; margin: 12px 0 0;">
                  ${resetLink}
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #f8fafc; padding: 24px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Marketplace România. Toate drepturile rezervate.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Password reset email sent successfully", { emailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully"
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
