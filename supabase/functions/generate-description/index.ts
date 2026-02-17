const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template-based description generator — NO AI, zero cost, unlimited usage
const categoryTemplates: Record<string, string[]> = {
  'Electronice': [
    'Dispozitiv electronic în {condition}, perfect funcțional și gata de utilizare.',
    'Oferă performanță excelentă și fiabilitate dovedită.',
    'Ideal pentru cei care caută tehnologie de calitate la un preț accesibil.',
    'Toate funcționalitățile originale sunt intacte.',
  ],
  'Îmbrăcăminte': [
    'Articol vestimentar în {condition}, cu un design modern și atractiv.',
    'Material de calitate, confortabil și rezistent la purtare zilnică.',
    'Se potrivește perfect pentru diverse ocazii și stiluri.',
    'Culorile sunt vibrante și țesătura este în stare impecabilă.',
  ],
  'Casă & Grădină': [
    'Produs pentru casă în {condition}, util și practic pentru orice locuință.',
    'Adaugă funcționalitate și stil spațiului tău de locuit.',
    'Fabricat din materiale durabile, construit să reziste în timp.',
    'O alegere inteligentă pentru îmbunătățirea confortului de acasă.',
  ],
  'Sport & Fitness': [
    'Echipament sportiv în {condition}, ideal pentru antrenamente eficiente.',
    'Te ajută să-ți atingi obiectivele de fitness mai rapid.',
    'Design ergonomic pentru confort maxim în timpul exercițiilor.',
    'Perfect atât pentru începători cât și pentru sportivi experimentați.',
  ],
  'Auto & Moto': [
    'Accesoriu auto în {condition}, compatibil și ușor de instalat.',
    'Îmbunătățește performanța și aspectul vehiculului tău.',
    'Fabricat conform standardelor de calitate pentru durabilitate maximă.',
    'Investiție inteligentă pentru întreținerea mașinii tale.',
  ],
  'Cărți & Educație': [
    'Material educativ în {condition}, o sursă valoroasă de cunoștințe.',
    'Perfect pentru studiu, dezvoltare personală sau lectură de plăcere.',
    'Conținut captivant și informativ, potrivit pentru diverse vârste.',
    'O achiziție care își merită fiecare leu investit.',
  ],
  'Jucării & Copii': [
    'Jucărie în {condition}, sigură și distractivă pentru cei mici.',
    'Stimulează creativitatea și imaginația copiilor prin joc.',
    'Fabricată din materiale non-toxice, conform standardelor de siguranță.',
    'Un cadou perfect care va aduce bucurie și zâmbete.',
  ],
  'Animale de Companie': [
    'Produs pentru animale de companie în {condition}, practic și util.',
    'Ajută la confortul și bunăstarea animalului tău de suflet.',
    'Materiale sigure și durabile, ușor de curățat și întreținut.',
    'O alegere excelentă pentru orice iubitor de animale.',
  ],
};

const defaultTemplates = [
  'Produs în {condition}, gata de utilizare și în stare excelentă.',
  'Oferă calitate și funcționalitate la un preț avantajos.',
  'O oportunitate de neratat pentru cine caută un produs de încredere.',
  'Ambalat cu grijă și pregătit pentru livrare rapidă.',
];

const conditionPhrases: Record<string, string> = {
  new: 'stare nouă, sigilat',
  like_new: 'stare ca nou, abia utilizat',
  good: 'stare bună, complet funcțional',
  fair: 'stare acceptabilă, cu mici semne de utilizare',
  poor: 'stare uzată, dar funcțional',
};

const openingPhrases = [
  'Disponibil acum pe Marketplace România!',
  'Nu rata această ofertă!',
  'Profită de prețul avantajos!',
  'Oportunitate excelentă!',
  'La un preț imbatabil!',
];

const closingPhrases = [
  'Livrare disponibilă în toată România. Contactează-mă pentru orice întrebare! 📦',
  'Trimite un mesaj pentru detalii suplimentare sau negociere. 🤝',
  'Disponibil pentru ridicare personală sau livrare prin curier. 🚚',
  'Stoc limitat — comandă acum! ⚡',
  'Nu ezita să mă contactezi pentru mai multe fotografii sau informații. 📸',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTemplateDescription(title: string, category?: string, condition?: string): string {
  const condText = conditionPhrases[condition || ''] || 'stare bună';
  const templates = categoryTemplates[category || ''] || defaultTemplates;
  
  // Pick 2-3 random template lines
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
  
  // Build description
  const parts: string[] = [];
  
  // Opening with product name
  parts.push(`${title} — ${pickRandom(openingPhrases)}`);
  
  // Template sentences with condition injected
  for (const tpl of selected) {
    parts.push(tpl.replace('{condition}', condText));
  }
  
  // Closing
  parts.push(pickRandom(closingPhrases));
  
  return parts.join(' ');
}

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

    const description = generateTemplateDescription(title, category, condition);

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