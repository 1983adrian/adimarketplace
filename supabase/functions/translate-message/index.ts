import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, targetLanguage, sourceLanguage } = await req.json() as TranslateRequest;

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text and targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip translation if text is too short or same language
    if (text.length < 3) {
      return new Response(
        JSON.stringify({ translatedText: text, detectedLanguage: targetLanguage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI for translation via the internal API
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ translatedText: text, error: 'Translation service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const languageNames: Record<string, string> = {
      'ro': 'Romanian',
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'hu': 'Hungarian',
      'bg': 'Bulgarian',
      'pl': 'Polish',
      'uk': 'Ukrainian',
      'ru': 'Russian',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'pt': 'Portuguese',
      'cs': 'Czech',
      'sk': 'Slovak',
      'el': 'Greek',
      'sr': 'Serbian',
      'hr': 'Croatian',
      'sl': 'Slovenian',
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] || sourceLanguage : 'auto-detect';

    const prompt = `Translate the following message to ${targetLangName}. 
${sourceLanguage ? `Source language: ${sourceLangName}` : 'Detect the source language automatically.'}

IMPORTANT RULES:
- Return ONLY the translated text, nothing else
- Preserve emojis and special characters
- Keep product names, brand names, and proper nouns unchanged
- Maintain the original tone and formality level
- If the text is already in ${targetLangName}, return it unchanged
- Do not add any explanations or notes

Message to translate:
${text}`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      return new Response(
        JSON.stringify({ translatedText: text, error: 'Translation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const translatedText = aiResponse.choices?.[0]?.message?.content?.trim() || text;

    // Detect source language (simple heuristic)
    let detectedLanguage = sourceLanguage || 'unknown';
    if (!sourceLanguage) {
      if (/[ăâîșțĂÂÎȘȚ]/.test(text) || /\b(și|sau|pentru|este|sunt|care|acest|această)\b/i.test(text)) {
        detectedLanguage = 'ro';
      } else if (/\b(the|is|are|this|that|with|for|and|you|have)\b/i.test(text)) {
        detectedLanguage = 'en';
      } else if (/[äöüßÄÖÜ]/.test(text) || /\b(und|ist|das|die|der|für|mit|nicht)\b/i.test(text)) {
        detectedLanguage = 'de';
      } else if (/[àâçéèêëîïôùûüÿœæ]/i.test(text) || /\b(le|la|les|un|une|des|et|est|pour)\b/i.test(text)) {
        detectedLanguage = 'fr';
      }
    }

    return new Response(
      JSON.stringify({ 
        translatedText, 
        detectedLanguage,
        originalText: text 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
