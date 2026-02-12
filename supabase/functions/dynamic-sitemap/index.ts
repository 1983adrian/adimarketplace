import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600" // Cache for 1 hour
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const baseUrl = "https://www.marketplaceromania.com";
    const today = new Date().toISOString().split('T')[0];

    // Fetch active listings with their images
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, updated_at, created_at, listing_images(image_url, is_primary, sort_order)')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .limit(1000);

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, name');

    // Fetch seller profiles (public stores)
    const { data: sellers } = await supabase
      .from('profiles')
      .select('user_id, store_name, updated_at')
      .eq('is_seller', true)
      .not('store_name', 'is', null)
      .limit(500);

    // Build sitemap - ALL routes must match App.tsx router exactly
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage - Highest Priority -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Browse - Core Functionality -->
  <url>
    <loc>${baseUrl}/browse</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- Sell -->
  <url>
    <loc>${baseUrl}/sell</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- Auth pages -->
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/signup</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Informational pages - MUST match App.tsx routes -->
  <url>
    <loc>${baseUrl}/seller-tutorial</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/cum-functioneaza</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
  <url>
    <loc>${baseUrl}/taxe-si-comisioane</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/help</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/safety</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/seller-rules</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/cookies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/install</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add categories
    if (categories) {
      for (const category of categories) {
        sitemap += `
  <url>
    <loc>${baseUrl}/browse?category=${encodeURIComponent(category.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Add listings with product images for Google Image indexing
    if (listings) {
      for (const listing of listings) {
        const lastmod = listing.updated_at?.split('T')[0] || listing.created_at?.split('T')[0] || today;
        const images = (listing as any).listing_images || [];
        // Sort: primary first, then by sort_order
        const sortedImages = [...images].sort((a: any, b: any) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        });
        
        const escapedTitle = (listing.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        
        let imagesTags = '';
        for (const img of sortedImages) {
          if (img.image_url) {
            imagesTags += `
      <image:image>
        <image:loc>${img.image_url.replace(/&/g, '&amp;')}</image:loc>
        <image:title>${escapedTitle}</image:title>
        <image:caption>${escapedTitle} - MarketPlace Romania</image:caption>
      </image:image>`;
          }
        }
        
        sitemap += `
  <url>
    <loc>${baseUrl}/listing/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>${imagesTags}
  </url>`;
      }
    }

    // Add seller stores
    if (sellers) {
      for (const seller of sellers) {
        const lastmod = seller.updated_at?.split('T')[0] || today;
        sitemap += `
  <url>
    <loc>${baseUrl}/seller/${seller.user_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    console.log(`Dynamic sitemap generated: ${listings?.length || 0} listings, ${categories?.length || 0} categories, ${sellers?.length || 0} sellers`);

    return new Response(sitemap, { headers: corsHeaders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
