import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Gavel, Star, Rocket, TrendingUp, ShieldCheck, Zap, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'LICITATOR',
    price: 11,
    type: 'licitatii',
    icon: '🔨',
    listings: 10,
    tagline: 'Cel mai ieftin plan din Europa',
    description: 'Perfect pentru cumpărătorii care vor să liciteze la produse. Include 10 listări proprii.',
    benefits: [
      '0% comision la vânzare',
      'Licitează la orice produs',
      'Max 10 listări active',
      'Notificări în timp real',
      'PayPal Personal suficient',
      'Suport prin chat & email',
    ],
    color: 'border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20',
  },
  {
    name: 'START',
    price: 29,
    type: 'start',
    icon: '🚀',
    listings: 10,
    tagline: 'Ideal pentru începători',
    description: 'Începe să vinzi online fără experiență. Planul perfect pentru vânzători ocazionali care vor să testeze piața.',
    benefits: [
      '0% comision la vânzare',
      'Max 10 produse active',
      'Tot profitul rămâne al tău',
      'Vizibilitate în căutări',
      'PayPal Personal suficient',
      'Suport prin chat & email',
      'Max 3 poze per produs',
    ],
    color: 'border-green-500/50 bg-green-50/30 dark:bg-green-950/20',
  },
  {
    name: 'SILVER',
    price: 50,
    type: 'silver',
    icon: '🥈',
    listings: 50,
    tagline: 'Pentru reselleri activi',
    description: 'Planul ideal pentru reselleri și vânzători care vor să crească. 50 de produse cu vizibilitate crescută.',
    benefits: [
      '0% comision la vânzare',
      'Max 50 produse active',
      'Statistici de bază',
      'Vizibilitate crescută',
      'PayPal Business obligatoriu',
      'Suport prioritar',
      'Max 3 poze per produs',
    ],
    color: 'border-gray-400/50 bg-gray-50/30 dark:bg-gray-950/20',
  },
  {
    name: 'GOLD',
    price: 150,
    type: 'gold',
    icon: '🥇',
    listings: 150,
    tagline: 'Magazine online mici-medii',
    description: 'Transformă-ți pasiunea în afacere. 150 de produse, statistici avansate și prioritate în căutări.',
    benefits: [
      '0% comision la vânzare',
      'Max 150 produse active',
      'Statistici avansate',
      'Prioritate în căutări',
      'PayPal Business obligatoriu',
      'Suport prioritar',
      'Max 3 poze per produs',
    ],
    color: 'border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-950/20',
    popular: true,
  },
  {
    name: 'PLATINUM',
    price: 499,
    type: 'platinum',
    icon: '💎',
    listings: 500,
    tagline: 'Afaceri serioase',
    description: 'Pentru magazine medii-mari cu volum mare de produse. Promovare preferențială și statistici complete.',
    benefits: [
      '0% comision la vânzare',
      'Max 500 produse active',
      'Statistici complete',
      'Prioritate maximă în căutări',
      'Promovare preferențială',
      'PayPal Business obligatoriu',
      'Suport dedicat',
    ],
    color: 'border-purple-500/50 bg-purple-50/30 dark:bg-purple-950/20',
  },
  {
    name: 'VIP',
    price: 999,
    type: 'vip',
    icon: '👑',
    listings: null,
    tagline: 'Produse NELIMITATE',
    description: 'Planul suprem pentru branduri și afaceri mari. Produse nelimitate, promovare premium și suport VIP dedicat.',
    benefits: [
      '0% comision la vânzare',
      'Produse NELIMITATE',
      'Dashboard complet statistici',
      'TOP prioritate în căutări',
      'Promovare premium pe platformă',
      'PayPal Business obligatoriu',
      'Suport VIP dedicat 24/7',
    ],
    color: 'border-amber-500 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
  },
];

const romanianCities = [
  "București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov",
  "Galați", "Ploiești", "Oradea", "Sibiu", "Bacău", "Arad", "Pitești", "Brăila",
  "Târgu Mureș", "Baia Mare", "Buzău", "Botoșani", "Suceava", "Satu Mare",
  "Râmnicu Vâlcea", "Drobeta-Turnu Severin", "Piatra Neamț", "Târgoviște", "Focșani",
  "Bistrița", "Reșița", "Tulcea", "Slatina", "Călărași", "Giurgiu", "Deva",
  "Hunedoara", "Zalău", "Sfântu Gheorghe", "Alba Iulia", "Vaslui", "Mediaș",
  "Turda", "Petroșani", "Alexandria",
];

const faqItems = [
  {
    q: "Cum încep să vând pe MarketPlaceRomania.com?",
    a: "Creezi un cont gratuit, alegi un plan de abonament (de la 11 LEI/lună), plătești prin Revolut, iar adminul activează contul. Poți lista produse imediat după activare."
  },
  {
    q: "Chiar nu plătesc comision la vânzare?",
    a: "Corect! 0% comision. Tot ce vinzi rămâne al tău. Plătești doar abonamentul lunar fix, fără taxe ascunse."
  },
  {
    q: "Când primesc banii din vânzări?",
    a: "Plata se procesează prin PayPal. Banii ajung în contul tău PayPal imediat după confirmarea livrării — în maxim 1 zi lucrătoare."
  },
  {
    q: "Ce se întâmplă după cele 30 de zile gratuite?",
    a: "După trial, alegi un plan plătit pentru a continua. Dacă nu plătești, contul se blochează temporar, dar produsele rămân salvate."
  },
  {
    q: "Pot vinde din orice oraș din România?",
    a: "Da! Platforma este disponibilă în toate cele 42 de orașe mari și în toată România. Livrarea se face prin FAN Courier, Sameday și Cargus."
  },
  {
    q: "Este MarketPlaceRomania.com o alternativă la eMAG sau OLX?",
    a: "Da! Spre deosebire de eMAG (comision 25%) sau OLX (fără protecție), pe MarketPlaceRomania.com ai 0% comision, plată securizată PayPal și protecție cumpărător."
  },
];

const SellerPlansPublic = () => {
  const pageTitle = "Abonamente Vânzători 2026 | De la 11 LEI/lună — 0% Comision | MarketPlace România®";
  const pageDescription = "Cea mai ieftină platformă de vânzare online din România și Europa în 2026-2027. Abonamente de la 11 LEI/lună cu 0% comision. Alternativă la eMAG, OLX, eBay. Începe gratuit 30 zile!";

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": "https://www.marketplaceromania.com/abonamente-vanzatori",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Abonamente MarketPlace România 2026",
      "itemListElement": plans.map((plan, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Offer",
          "name": `Plan ${plan.name} — MarketPlace România`,
          "description": plan.description,
          "price": plan.price,
          "priceCurrency": "RON",
          "url": "https://www.marketplaceromania.com/abonamente-vanzatori",
          "seller": {
            "@type": "Organization",
            "name": "Market Place România®"
          }
        }
      }))
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": "https://www.marketplaceromania.com" },
      { "@type": "ListItem", "position": 2, "name": "Abonamente Vânzători", "item": "https://www.marketplaceromania.com/abonamente-vanzatori" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="abonamente vanzatori, pret vanzare online, marketplace romania, alternativa emag, alternativa olx, 0 comision, cum sa vinzi online 2026, cea mai ieftina platforma vanzare, marketplace bucuresti, marketplace cluj, marketplace timisoara, licitatii online romania" />
        <link rel="canonical" href="https://www.marketplaceromania.com/abonamente-vanzatori" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content="https://www.marketplaceromania.com/abonamente-vanzatori" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(pricingSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              Cea mai ieftină platformă din România & Europa — 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Abonamente Vânzători — De la <span className="text-primary">11 LEI/lună</span> cu <span className="text-primary">0% Comision</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Pe <strong>eMAG</strong> plătești <strong>25% comision</strong>. Pe <strong>eBay</strong> plătești comisioane + taxe PayPal. 
              Pe <strong>OLX</strong> riști țepe. Pe <strong className="text-primary">MarketPlaceRomania.com</strong> vinzi 
              cu <strong>0% comision</strong> — tot profitul rămâne al tău!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 gap-2">
                  <Zap className="h-5 w-5" /> Începe Gratuit — 30 Zile Trial
                </Button>
              </Link>
              <a href="#planuri">
                <Button size="lg" variant="outline" className="text-lg px-8 gap-2">
                  Vezi Planurile <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Why MarketPlace România */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              De Ce Să Vinzi pe MarketPlace România® în 2026-2027?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <ShieldCheck className="h-8 w-8 text-primary" />, title: "0% Comision pe Vânzări", desc: "Spre deosebire de eMAG (25%), Amazon (15%) sau eBay (12%), pe MarketPlaceRomania.com nu plătești niciun comision. Abonament fix de la 11 LEI." },
                { icon: <Zap className="h-8 w-8 text-primary" />, title: "Bani în Maxim 1 Zi", desc: "Plata prin PayPal — banii ajung în contul tău imediat după confirmarea livrării. Nu mai aștepți 14-30 de zile ca pe alte platforme." },
                { icon: <TrendingUp className="h-8 w-8 text-primary" />, title: "Alternativă Reală la eMAG & OLX", desc: "Magazin propriu, licitații online, protecție cumpărător, facturi automate, tracking comenzi. Tot ce ai nevoie într-un singur loc." },
              ].map((item, i) => (
                <div key={i} className="bg-background rounded-xl border border-border p-6 text-center space-y-3">
                  <div className="mx-auto w-fit">{item.icon}</div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section id="planuri" className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Alege Planul Potrivit Pentru Afacerea Ta
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                De la vânzători ocazionali la branduri mari — avem planul perfect. 
                Toate planurile includ <strong>0% comision</strong> și <strong>30 de zile gratuite</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.type} className={`relative transition-all hover:shadow-xl ${plan.color} ${plan.popular ? 'ring-2 ring-primary scale-[1.02]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                        ⭐ CEL MAI POPULAR
                      </span>
                    </div>
                  )}
                  {plan.type === 'vip' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" /> PREMIUM
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-6">
                    <div className="text-center">
                      <span className="text-3xl">{plan.icon}</span>
                      <CardTitle className="text-xl mt-2">{plan.name}</CardTitle>
                      <p className="text-xs text-primary font-semibold mt-1">{plan.tagline}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-3 bg-background/50 rounded-lg">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-lg ml-1">LEI</span>
                      <p className="text-xs text-muted-foreground">/lună • plată prin Revolut</p>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">{plan.description}</p>
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {plan.listings ? `Max ${plan.listings} produse` : '♾️ Produse NELIMITATE'}
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/seller-plans" className="block">
                      <Button className="w-full" size="lg">
                        Începe cu {plan.name}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Comparație: MarketPlace România vs Competiția
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 text-left">Caracteristică</th>
                    <th className="p-3 text-center font-bold">MarketPlace România®</th>
                    <th className="p-3 text-center">eMAG</th>
                    <th className="p-3 text-center">OLX</th>
                    <th className="p-3 text-center">eBay</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Comision vânzare", "0%", "până la 25%", "variabil", "12-15%"],
                    ["Cost lunar minim", "11 LEI", "gratuit*", "gratuit*", "gratuit*"],
                    ["Plată securizată", "✅ PayPal", "✅ Card", "❌ Risc", "✅ PayPal"],
                    ["Protecție cumpărător", "✅ 14 zile", "✅ Da", "❌ Nu", "✅ Da"],
                    ["Licitații online", "✅ Da", "❌ Nu", "❌ Nu", "✅ Da"],
                    ["Magazin propriu", "✅ Da", "✅ Da", "❌ Nu", "✅ Da"],
                    ["Bani în cont", "Max 1 zi", "14-30 zile", "Numerar/risc", "3-5 zile"],
                    ["Construit cu AI", "✅ Da", "❌ Nu", "❌ Nu", "❌ Nu"],
                  ].map(([feature, mp, emag, olx, ebay], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-3 font-medium">{feature}</td>
                      <td className="p-3 text-center font-bold text-primary">{mp}</td>
                      <td className="p-3 text-center text-muted-foreground">{emag}</td>
                      <td className="p-3 text-center text-muted-foreground">{olx}</td>
                      <td className="p-3 text-center text-muted-foreground">{ebay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2 text-center">* Gratuit cu comisioane mari pe fiecare vânzare</p>
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Cum Să Începi Să Faci Bani Online în 2026-2027
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Creează Cont Gratuit", desc: "Înregistrare în 30 secunde. Fără card, fără obligații." },
                { step: "2", title: "Alege un Plan", desc: "De la 11 LEI/lună. 30 de zile gratuite pentru toți." },
                { step: "3", title: "Listează Produse", desc: "Adaugă poze, descriere, preț. Publicare instant." },
                { step: "4", title: "Primești Bani", desc: "Plata prin PayPal. Bani în cont în maxim 1 zi." },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-10 gap-2">
                  <Rocket className="h-5 w-5" /> Începe Acum — E Gratuit!
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Target Audiences */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Pentru Cine Este MarketPlace România®?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "🏠 Vânzători Ocazionali",
                  subtitle: "Plan START — 29 LEI/lună",
                  points: ["Vinzi haine, electronice, jucării din casă", "Nu ai nevoie de firmă sau PFA", "PayPal Personal suficient", "Alternativă sigură la OLX și Facebook Marketplace"],
                },
                {
                  title: "🛒 Reselleri & Magazine Mici",
                  subtitle: "Plan SILVER/GOLD — 50-150 LEI/lună",
                  points: ["Vinzi produse noi sau second-hand", "Statistici de vânzări incluse", "Vizibilitate crescută în căutări", "Cost de 10x mai mic decât pe eMAG"],
                },
                {
                  title: "🏢 Firme & Branduri",
                  subtitle: "Plan PLATINUM/VIP — 499-999 LEI/lună",
                  points: ["Produse nelimitate (VIP)", "Promovare premium pe platformă", "Suport VIP dedicat", "Alternativă la eMAG Marketplace pentru firme"],
                },
              ].map((item, i) => (
                <div key={i} className="bg-background rounded-xl border border-border p-6 space-y-4">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-sm text-primary font-semibold">{item.subtitle}</p>
                  <ul className="space-y-2 text-sm">
                    {item.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Întrebări Frecvente — Abonamente & Vânzare Online
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-5">
                  <h3 className="font-bold mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* City SEO Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold text-center mb-6">
              Disponibil în Toate Orașele din România
            </h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {romanianCities.map((city) => (
                <span key={city} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-medium">
                  <MapPin className="h-3 w-3 text-primary" />
                  {city}
                </span>
              ))}
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed space-y-3 max-w-4xl mx-auto">
              <p>
                <strong>Cum să vinzi online în 2026-2027</strong> — MarketPlaceRomania.com este cea mai ieftină platformă de vânzare online 
                din România și Europa. Cu abonamente de la doar 11 LEI/lună și 0% comision, poți începe o afacere online fără investiție mare. 
                Alternativă reală la eMAG Marketplace, OLX, eBay, Amazon, Vinted și Facebook Marketplace.
              </p>
              <p>
                <strong>Abonamente vânzători</strong> disponibile în marketplace București, marketplace Cluj-Napoca, marketplace Timișoara, 
                marketplace Iași, marketplace Constanța, marketplace Craiova, marketplace Brașov, marketplace Oradea, marketplace Sibiu, 
                marketplace Bacău și toate cele 42 de orașe mari din România.
              </p>
              <p>
                <strong>Afacere online cu 0% comision</strong> — Pe eMAG plătești până la 25% comision din fiecare vânzare. Pe eBay 12-15%. 
                Pe Amazon 15%. Pe MarketPlaceRomania.com plătești doar un abonament fix lunar, fără niciun procent din vânzări. 
                Licitații online, plată securizată PayPal, protecție cumpărător 14 zile, livrare prin FAN Courier, Sameday și Cargus.
              </p>
              <p>
                <strong>Market Place România®</strong> — Primul market place din România construit cu inteligență artificială. 
                Cea mai bună alternativă românească la eMAG, OLX, eBay, Amazon și Facebook Marketplace în 2026-2027. 
                Marcă Înregistrată. Abonamente de la 11 LEI. Produse nelimitate cu planul VIP (999 LEI). 
                30 de zile gratuite pentru toți vânzătorii noi.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Începe Să Vinzi Astăzi — 30 Zile Gratuit!
            </h2>
            <p className="text-muted-foreground mb-8">
              Fără card, fără obligații, fără comisioane. Creează cont și listează primele tale produse în mai puțin de 5 minute.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-lg px-10 gap-2">
                <Star className="h-5 w-5" /> Creează Cont Gratuit
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default SellerPlansPublic;
