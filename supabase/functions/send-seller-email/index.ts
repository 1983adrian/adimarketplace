import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { type, seller_id, order_id, listing_title, buyer_name, amount, tracking_reminder_sellers } = await req.json();

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Marketplace România <onboarding@resend.dev>';

    // Helper to send email
    const sendEmail = async (to: string, subject: string, html: string) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
      });
      return res.json();
    };

    // Get seller email from auth
    const getSellerEmail = async (userId: string) => {
      const { data } = await supabase.auth.admin.getUserById(userId);
      return data?.user?.email;
    };

    if (type === 'new_order') {
      const email = await getSellerEmail(seller_id);
      if (!email) {
        return new Response(JSON.stringify({ error: 'Seller email not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Comandă Nouă!</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Ai primit o comandă nouă pe <strong>Marketplace România</strong>!</p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>📦 Produs:</strong> ${listing_title || 'Produs'}</p>
              <p style="margin: 4px 0;"><strong>👤 Cumpărător:</strong> ${buyer_name || 'Client'}</p>
              <p style="margin: 4px 0;"><strong>💰 Sumă:</strong> ${amount || '0'} LEI</p>
              <p style="margin: 4px 0;"><strong>🔗 Comanda:</strong> #${(order_id || '').substring(0, 8)}</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 16px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⚠️ <strong>Important:</strong> Expediază comanda și adaugă numărul de urmărire (AWB) cât mai curând. 
                Tracking-ul se sincronizează automat cu PayPal pentru eliberarea fondurilor.
              </p>
            </div>
            
            <a href="https://marketplaceromania.lovable.app/orders" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Vezi Comanda →
            </a>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
              Acest email a fost trimis automat de Marketplace România. Nu răspunde la acest email.
            </p>
          </div>
        </div>
      `;

      const result = await sendEmail(email, `🎉 Comandă Nouă: ${listing_title || 'Produs'}`, html);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'tracking_reminder') {
      const email = await getSellerEmail(seller_id);
      if (!email) {
        return new Response(JSON.stringify({ error: 'Seller email not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ AWB Lipsă</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Ai comenzi care așteaptă numărul de urmărire (AWB)!</p>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Fără AWB, PayPal nu poate elibera fondurile.</strong> Adaugă tracking-ul pentru fiecare comandă expediată.
              </p>
            </div>
            
            <a href="https://marketplaceromania.lovable.app/orders" 
               style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Adaugă AWB Acum →
            </a>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
              Acest email a fost trimis automat de Marketplace România.
            </p>
          </div>
        </div>
      `;

      const result = await sendEmail(email, '⚠️ Comenzi fără AWB - Adaugă tracking-ul acum', html);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'welcome_seller') {
      const email = await getSellerEmail(seller_id);
      if (!email) {
        return new Response(JSON.stringify({ error: 'Seller email not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { store_name } = await req.json().catch(() => ({}));

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Bine ai venit ca Vânzător!</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Felicitări! Contul tău de vânzător pe <strong>Marketplace România</strong> a fost activat cu succes.</p>
            
            <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">Primii pași:</h3>
              <p style="margin: 4px 0; color: #374151;">1️⃣ Configurează contul PayPal pentru plăți</p>
              <p style="margin: 4px 0; color: #374151;">2️⃣ Adaugă primul tău produs</p>
              <p style="margin: 4px 0; color: #374151;">3️⃣ Alege un plan de vânzare</p>
              <p style="margin: 4px 0; color: #374151;">4️⃣ Începe să vinzi!</p>
            </div>
            
            <a href="https://marketplaceromania.lovable.app/sell" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Adaugă Primul Produs →
            </a>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
              Acest email a fost trimis automat de Marketplace România.
            </p>
          </div>
        </div>
      `;

      const result = await sendEmail(email, '🎉 Bine ai venit pe Marketplace România!', html);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown email type' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
