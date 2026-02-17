const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, condition } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title is required' }),
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

    const conditionMap: Record<string, string> = {
      new: 'nou, sigilat',
      like_new: 'ca nou, folosit foarte puțin',
      good: 'stare bună, funcțional',
      fair: 'stare acceptabilă, semne de uzură',
      poor: 'uzat, dar funcțional',
    };

    const conditionText = conditionMap[condition] || condition || 'nespecificată';

    const prompt = `Generează o descriere de vânzare în limba română pentru un produs listat pe un marketplace online.

Produs: ${title}
Categorie: ${category || 'Generală'}
Stare: ${conditionText}

Reguli:
- Scrie 3-5 propoziții descriptive, atractive pentru cumpărători
- Menționează starea produsului natural
- Folosește un ton profesional dar prietenos
- Nu inventa specificații tehnice pe care nu le cunoști
- Nu pune titlul produsului la început
- Nu folosi emoji-uri excesive (maxim 1-2)
- Scrie direct descrierea, fără prefixe gen "Descriere:" sau "Iată descrierea:"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Prea multe cereri. Încearcă din nou în câteva secunde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Serviciul AI nu este disponibil momentan.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nu s-a putut genera descrierea.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Description generation error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
