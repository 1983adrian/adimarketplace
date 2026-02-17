import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://www.marketplaceromania.com";
const MAX_URLS_PER_SITEMAP = 45000; // Google limit is 50k, stay under

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "index";
    const page = parseInt(url.searchParams.get("page") || "0", 10);

    // SITEMAP INDEX — returns links to all sub-sitemaps
    if (type === "index") {
      // Count total active listings
      const { count: listingCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_sold", false);

      const totalListings = listingCount || 0;
      const listingPages = Math.ceil(totalListings / MAX_URLS_PER_SITEMAP);
      const today = new Date().toISOString().split("T")[0];

      // Build function URL base for sub-sitemaps
      const fnBase = `${supabaseUrl}/functions/v1/dynamic-sitemap`;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${fnBase}?type=static</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${fnBase}?type=categories</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${fnBase}?type=sellers</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

      for (let i = 0; i < Math.max(1, listingPages); i++) {
        xml += `
  <sitemap>
    <loc>${fnBase}?type=listings&amp;page=${i}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      xml += `
</sitemapindex>`;

      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    // STATIC PAGES SITEMAP
    if (type === "static") {
      const today = new Date().toISOString().split("T")[0];
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "hourly" },
        { url: "/browse", priority: "0.95", changefreq: "hourly" },
        { url: "/sell", priority: "0.85", changefreq: "weekly" },
        { url: "/login", priority: "0.7", changefreq: "monthly" },
        { url: "/signup", priority: "0.7", changefreq: "monthly" },
        { url: "/seller-tutorial", priority: "0.8", changefreq: "weekly" },
        { url: "/cum-functioneaza", priority: "0.75", changefreq: "monthly" },
        { url: "/taxe-si-comisioane", priority: "0.7", changefreq: "monthly" },
        { url: "/about", priority: "0.6", changefreq: "monthly" },
        { url: "/help", priority: "0.6", changefreq: "monthly" },
        { url: "/faq", priority: "0.7", changefreq: "weekly" },
        { url: "/contact", priority: "0.5", changefreq: "monthly" },
        { url: "/safety", priority: "0.5", changefreq: "monthly" },
        { url: "/seller-rules", priority: "0.5", changefreq: "monthly" },
        { url: "/privacy", priority: "0.4", changefreq: "yearly" },
        { url: "/terms", priority: "0.4", changefreq: "yearly" },
        { url: "/cookies", priority: "0.3", changefreq: "yearly" },
        { url: "/install", priority: "0.5", changefreq: "monthly" },
      ];

      // Brand images
      const brandImages = [
        { loc: `${BASE_URL}/images/brand/marketplace-romania-logo-dark.png`, title: "Logo Marketplace România® pe Fundal Închis" },
        { loc: `${BASE_URL}/images/brand/marketplace-romania-logo-light.png`, title: "Logo Marketplace România® pe Fundal Deschis" },
        { loc: `${BASE_URL}/images/brand/marketplace-romania-logo-banner-light.jpeg`, title: "Banner Marketplace România® Light" },
        { loc: `${BASE_URL}/images/brand/marketplace-romania-logo-banner-dark.jpeg`, title: "Banner Marketplace România® Dark" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

      for (const p of staticPages) {
        xml += `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
      }

      // Brand images on homepage
      for (const img of brandImages) {
        xml += `
  <url>
    <loc>${BASE_URL}/</loc>
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
    </image:image>
  </url>`;
      }

      xml += `
</urlset>`;

      return respond(xml);
    }

    // CATEGORIES SITEMAP
    if (type === "categories") {
      const today = new Date().toISOString().split("T")[0];
      const { data: categories } = await supabase
        .from("categories")
        .select("slug, name");

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      if (categories) {
        for (const cat of categories) {
          xml += `
  <url>
    <loc>${BASE_URL}/browse?category=${encodeURIComponent(cat.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      }

      xml += `
</urlset>`;
      return respond(xml);
    }

    // SELLERS SITEMAP
    if (type === "sellers") {
      const today = new Date().toISOString().split("T")[0];
      const { data: sellers } = await supabase
        .from("profiles")
        .select("user_id, store_name, updated_at")
        .eq("is_seller", true)
        .not("store_name", "is", null)
        .limit(45000);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      if (sellers) {
        for (const s of sellers) {
          const lastmod = s.updated_at?.split("T")[0] || today;
          xml += `
  <url>
    <loc>${BASE_URL}/seller/${s.user_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
      }

      xml += `
</urlset>`;
      return respond(xml);
    }

    // LISTINGS SITEMAP (paginated — up to 45k per page)
    if (type === "listings") {
      const from = page * MAX_URLS_PER_SITEMAP;
      const to = from + MAX_URLS_PER_SITEMAP - 1;

      const { data: listings } = await supabase
        .from("listings")
        .select("id, title, updated_at, created_at, listing_images(image_url, is_primary, sort_order)")
        .eq("is_active", true)
        .eq("is_sold", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

      if (listings) {
        for (const listing of listings) {
          const lastmod = listing.updated_at?.split("T")[0] || listing.created_at?.split("T")[0];
          const images = (listing as any).listing_images || [];
          const sortedImages = [...images].sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          });

          const escapedTitle = escapeXml(listing.title || "");

          let imagesTags = "";
          for (const img of sortedImages) {
            if (img.image_url) {
              imagesTags += `
      <image:image>
        <image:loc>${escapeXml(img.image_url)}</image:loc>
        <image:title>${escapedTitle}</image:title>
        <image:caption>${escapedTitle} - MarketPlace Romania</image:caption>
      </image:image>`;
            }
          }

          xml += `
  <url>
    <loc>${BASE_URL}/listing/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>${imagesTags}
  </url>`;
        }
      }

      xml += `
</urlset>`;

      console.log(`Sitemap listings page ${page}: ${listings?.length || 0} entries`);
      return respond(xml);
    }

    return new Response("Invalid type", { status: 400, headers: corsHeaders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Sitemap error:", msg);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" }, status: 500 }
    );
  }
});

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function respond(xml: string) {
  return new Response(xml, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
