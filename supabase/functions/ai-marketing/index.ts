import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MarketingRequest {
  action: "generate_content" | "send_campaign" | "get_stats" | "generate_social";
  campaignId?: string;
  productData?: {
    title: string;
    description: string;
    price: number;
    category: string;
  };
  targetAudience?: string;
  platform?: "email" | "facebook" | "instagram" | "twitter" | "tiktok";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, campaignId, productData, targetAudience, platform }: MarketingRequest = await req.json();

    // Generate promotional content using AI
    if (action === "generate_content") {
      if (!lovableApiKey) {
        return new Response(
          JSON.stringify({ error: "AI service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get some featured listings for promotion
      const { data: listings } = await supabase
        .from("listings")
        .select("title, description, price, category_id")
        .eq("is_active", true)
        .eq("is_sold", false)
        .order("views_count", { ascending: false })
        .limit(5);

      const listingsContext = listings?.map(l => 
        `- ${l.title}: £${l.price}`
      ).join("\n") || "No listings available";

      const prompt = `Ești un expert în marketing pentru un marketplace online numit "ADI Marketplace". 
Generează conținut promotional captivant în limba română pentru o campanie de email marketing.

Produse populare de promovat:
${listingsContext}

${productData ? `Produs specific de promovat: ${productData.title} - ${productData.description} - £${productData.price}` : ""}

Generează:
1. Un subiect de email captivant (max 60 caractere)
2. Conținut HTML pentru email (promotional, cu call-to-action)
3. Un text scurt pentru social media (max 280 caractere)

Răspunde în format JSON:
{
  "subject": "...",
  "emailContent": "...",
  "socialContent": "..."
}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Ești un expert în marketing digital și copywriting. RESTRICȚIE ABSOLUTĂ: NU ai voie să ștergi, blochezi sau suspendezi utilizatori sau date. Poți DOAR să generezi conținut - administratorul decide ce se publică." },
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to generate content" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();
      const contentText = aiData.choices?.[0]?.message?.content || "";
      
      // Parse JSON from AI response
      let generatedContent;
      try {
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedContent = JSON.parse(jsonMatch[0]);
        } else {
          generatedContent = {
            subject: "🔥 Oferte exclusive pe ADI Marketplace!",
            emailContent: contentText,
            socialContent: "Descoperă cele mai bune oferte pe ADI Marketplace! 🛍️"
          };
        }
      } catch {
        generatedContent = {
          subject: "🔥 Oferte exclusive pe ADI Marketplace!",
          emailContent: contentText,
          socialContent: "Descoperă cele mai bune oferte pe ADI Marketplace! 🛍️"
        };
      }

      return new Response(
        JSON.stringify({ success: true, content: generatedContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate platform-specific social media content
    if (action === "generate_social") {
      if (!lovableApiKey) {
        return new Response(
          JSON.stringify({ error: "AI service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const platformInstructions: Record<string, string> = {
        facebook: "Generează un post pentru Facebook: poate fi mai lung, folosește emoji-uri, include un call-to-action și hashtag-uri relevante. Max 500 caractere.",
        instagram: "Generează o descriere pentru Instagram: captivantă, cu multe emoji-uri, hashtag-uri populare (#marketplace #deals #shopping). Max 2200 caractere dar concentrează-te pe primele 125 vizibile.",
        twitter: "Generează un tweet: scurt, impactant, max 280 caractere, 2-3 hashtag-uri.",
        tiktok: "Generează o descriere pentru TikTok: trendy, cu emoji-uri, hashtag-uri virale (#fyp #viral #shopping). Max 300 caractere."
      };

      const { data: listings } = await supabase
        .from("listings")
        .select("title, price")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      const prompt = `Ești un social media manager expert.
${platformInstructions[platform || "facebook"]}

Produse noi pe ADI Marketplace:
${listings?.map(l => `- ${l.title}: £${l.price}`).join("\n") || "Produse diverse"}

Link: https://adimarketplace.lovable.app

Generează doar textul, fără explicații.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to generate social content" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();
      const socialContent = aiData.choices?.[0]?.message?.content || "";

      return new Response(
        JSON.stringify({ success: true, content: socialContent, platform }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send campaign emails
    if (action === "send_campaign" && campaignId) {
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ error: "Email service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get campaign details
      const { data: campaign } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (!campaign) {
        return new Response(
          JSON.stringify({ error: "Campaign not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get target emails based on audience
      let emails: string[] = [];

      if (campaign.target_audience === "all" || campaign.target_audience === "subscribers") {
        const { data: subscribers } = await supabase
          .from("newsletter_subscribers")
          .select("email")
          .eq("is_active", true);
        emails = [...emails, ...(subscribers?.map(s => s.email) || [])];
      }

      if (campaign.target_audience === "all" || campaign.target_audience === "users") {
        // Get user emails from profiles (we need to get from auth.users via service role)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id");
        
        // For each profile, we'd need the email - simplified approach
        // In production, you'd store emails in profiles or use a different approach
      }

      // Remove duplicates
      emails = [...new Set(emails)];

      if (emails.length === 0) {
        return new Response(
          JSON.stringify({ error: "No recipients found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send emails in batches
      let sentCount = 0;
      const batchSize = 50;

      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        for (const email of batch) {
          try {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "ADI Marketplace <noreply@resend.dev>",
                to: [email],
                subject: campaign.subject,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    ${campaign.content}
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                      Primești acest email deoarece te-ai abonat la newsletter-ul ADI Marketplace.
                      <br>
                      <a href="https://adimarketplace.lovable.app/unsubscribe?email=${encodeURIComponent(email)}">Dezabonare</a>
                    </p>
                  </div>
                `,
              }),
            });

            if (emailResponse.ok) {
              sentCount++;
              
              // Log the send
              await supabase.from("campaign_sends").insert({
                campaign_id: campaignId,
                email: email,
                status: "sent"
              });
            }
          } catch (error) {
            console.error(`Failed to send to ${email}:`, error);
          }
        }
      }

      // Update campaign stats
      await supabase
        .from("marketing_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          emails_sent: sentCount
        })
        .eq("id", campaignId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Campaign sent to ${sentCount} recipients`,
          sentCount 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get marketing stats
    if (action === "get_stats") {
      const { data: subscribers } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("is_active", true);

      const { data: campaigns } = await supabase
        .from("marketing_campaigns")
        .select("id, emails_sent, emails_opened, emails_clicked")
        .eq("status", "sent");

      const totalSent = campaigns?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0;
      const totalOpened = campaigns?.reduce((sum, c) => sum + (c.emails_opened || 0), 0) || 0;

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            totalSubscribers: subscribers?.length || 0,
            totalCampaigns: campaigns?.length || 0,
            totalEmailsSent: totalSent,
            openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("AI Marketing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
