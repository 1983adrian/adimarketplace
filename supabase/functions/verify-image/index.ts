import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[VERIFY-IMAGE] ${step}`, details ? JSON.stringify(details) : "");
};

interface VerificationResult {
  isReal: boolean;
  confidence: number;
  issues: string[];
  action: "keep" | "flag" | "delete";
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { imageUrl, listingId, action } = await req.json();
    logStep("Request received", { imageUrl, listingId, action });

    // Action: scan_all - verifică toate imaginile din marketplace
    if (action === "scan_all") {
      logStep("Starting full image scan");
      
      const { data: images, error: imagesError } = await supabase
        .from("listing_images")
        .select("*, listings(title, seller_id)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (imagesError) throw imagesError;

      const results: Array<{
        imageId: string;
        imageUrl: string;
        listingId: string;
        listingTitle: string;
        sellerId: string;
        verification: VerificationResult;
      }> = [];

      for (const image of images || []) {
        const verification = await verifyImage(image.image_url);
        results.push({
          imageId: image.id,
          imageUrl: image.image_url,
          listingId: image.listing_id,
          listingTitle: image.listings?.title || "Unknown",
          sellerId: image.listings?.seller_id || "",
          verification
        });
      }

      // Imagini pentru ștergere
      const toDelete = results.filter(r => r.verification.action === "delete");
      const toFlag = results.filter(r => r.verification.action === "flag");

      logStep("Scan complete", {
        total: results.length,
        toDelete: toDelete.length,
        toFlag: toFlag.length
      });

      return new Response(JSON.stringify({
        success: true,
        scannedCount: results.length,
        deleteCount: toDelete.length,
        flagCount: toFlag.length,
        toDelete,
        toFlag,
        allResults: results
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: delete_fake - șterge imaginile marcate ca fake
    if (action === "delete_fake") {
      const { imageIds } = await req.json();
      logStep("Deleting fake images", { count: imageIds?.length });

      if (!imageIds || imageIds.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: "No images to delete"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get image URLs first
      const { data: images } = await supabase
        .from("listing_images")
        .select("id, image_url")
        .in("id", imageIds);

      // Delete from storage
      for (const image of images || []) {
        try {
          const url = new URL(image.image_url);
          const pathParts = url.pathname.split("/storage/v1/object/public/listings/");
          if (pathParts.length >= 2) {
            const filePath = pathParts[1];
            await supabase.storage.from("listings").remove([filePath]);
            logStep("Deleted from storage", { filePath });
          }
        } catch (e) {
          logStep("Storage delete error", { error: e });
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("listing_images")
        .delete()
        .in("id", imageIds);

      if (deleteError) throw deleteError;

      // Create audit log
      await supabase.from("audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id || "system",
        action: "delete_fake_images",
        entity_type: "listing_images",
        new_values: { deletedCount: imageIds.length, imageIds }
      });

      return new Response(JSON.stringify({
        success: true,
        deletedCount: imageIds.length,
        message: `${imageIds.length} imagini false au fost șterse`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: verify_single - verifică o singură imagine
    if (!imageUrl) {
      throw new Error("imageUrl is required");
    }

    const verification = await verifyImage(imageUrl);

    // Dacă imaginea trebuie ștearsă automat
    if (verification.action === "delete" && listingId) {
      const { data: imageData } = await supabase
        .from("listing_images")
        .select("id")
        .eq("image_url", imageUrl)
        .single();

      if (imageData) {
        // Delete from storage
        try {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/storage/v1/object/public/listings/");
          if (pathParts.length >= 2) {
            await supabase.storage.from("listings").remove([pathParts[1]]);
          }
        } catch (e) {
          logStep("Storage delete error", e);
        }

        // Delete from database
        await supabase
          .from("listing_images")
          .delete()
          .eq("id", imageData.id);

        logStep("Auto-deleted fake image", { imageUrl, listingId });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      verification,
      autoDeleted: verification.action === "delete"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    logStep("Error", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function verifyImage(imageUrl: string): Promise<VerificationResult> {
  const logStep = (step: string, details?: unknown) => {
    console.log(`[VERIFY-IMAGE] ${step}`, details ? JSON.stringify(details) : "");
  };

  try {
    logStep("Verifying image with AI", { imageUrl });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI image verification expert for a marketplace. Analyze product images and determine if they are:
1. REAL product photos (actual photos taken of real products)
2. FAKE/SUSPICIOUS (stock photos with watermarks, AI-generated, screenshots, memes, inappropriate content, text-only images, obvious placeholders)

Respond ONLY with valid JSON in this exact format:
{
  "isReal": true/false,
  "confidence": 0-100,
  "issues": ["list of issues if any"],
  "action": "keep" | "flag" | "delete",
  "reason": "brief explanation"
}

Action guidelines:
- "keep": Real product photo, no issues
- "flag": Minor concerns, needs review (low quality, unclear)
- "delete": Obviously fake, AI-generated, watermarked stock photos, inappropriate, or not a product image`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this product image and determine if it's a real product photo or fake/suspicious. Check for: AI generation artifacts, stock photo watermarks, screenshot indicators, non-product content, text-only images."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      logStep("AI API error", { status: response.status });
      // Default to keeping if AI fails
      return {
        isReal: true,
        confidence: 50,
        issues: ["AI verification unavailable"],
        action: "keep",
        reason: "Could not verify - keeping by default"
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    logStep("AI response", { content: content.substring(0, 200) });

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isReal: result.isReal ?? true,
        confidence: result.confidence ?? 50,
        issues: result.issues ?? [],
        action: result.action ?? "keep",
        reason: result.reason ?? "Verification complete"
      };
    }

    return {
      isReal: true,
      confidence: 50,
      issues: ["Could not parse AI response"],
      action: "keep",
      reason: "Verification incomplete - keeping by default"
    };

  } catch (error) {
    logStep("Verification error", error);
    return {
      isReal: true,
      confidence: 0,
      issues: ["Verification failed"],
      action: "keep",
      reason: "Error during verification - keeping by default"
    };
  }
}
