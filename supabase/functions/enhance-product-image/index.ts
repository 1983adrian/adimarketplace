const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  return btoa(chunks.join(''));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Enhancing product image:', imageUrl.substring(0, 80));

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not download original image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Check size - max 4MB for AI processing
    if (imageBuffer.byteLength > 4 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'Imaginea este prea mare. Maxim 4MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const base64Image = arrayBufferToBase64(imageBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const dataUri = `data:${contentType};base64,${base64Image}`;

    console.log('Image size:', imageBuffer.byteLength, 'bytes, sending to AI...');

    // Use supported Gemini image generation model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Remove the background from this product image and place the product on a clean, pure white background. Keep the product exactly as it is - same size, same angle, same colors. Make it look professional like an e-commerce product photo. The background must be completely white (#FFFFFF). Do not add shadows, reflections, or any other effects. Just the product on white.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUri
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Image enhancement failed (${response.status})` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response structure:', JSON.stringify(Object.keys(data)));
    
    // Try multiple response formats to extract the generated image
    let enhancedImageBase64: string | null = null;
    
    // Format 1: choices[0].message.images[0].image_url.url
    enhancedImageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // Format 2: choices[0].message.content with base64 image string
    if (!enhancedImageBase64) {
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.startsWith('data:image')) {
        enhancedImageBase64 = content;
      } else if (Array.isArray(content)) {
        for (const part of content) {
          // Check image_url type
          if (part.type === 'image_url' && part.image_url?.url) {
            enhancedImageBase64 = part.image_url.url;
            break;
          }
          // Check inline_data
          if (part.inline_data?.data) {
            enhancedImageBase64 = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
            break;
          }
          // Check type image with url
          if (part.type === 'image' && (part.url || part.data)) {
            enhancedImageBase64 = part.url || `data:image/png;base64,${part.data}`;
            break;
          }
        }
      }
    }

    if (!enhancedImageBase64) {
      console.error('No image in AI response. Full response:', JSON.stringify(data).substring(0, 1000));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Modelul AI nu a putut genera imaginea. Încearcă cu o altă fotografie.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload enhanced image to storage
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Convert base64 to binary - using chunked approach to avoid stack overflow
    const base64Data = enhancedImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }
    
    const fileName = `enhanced/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(fileName, binaryData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save enhanced image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(fileName);

    console.log('Enhanced image saved:', publicUrl);

    return new Response(
      JSON.stringify({ success: true, enhancedUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Enhancement error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});