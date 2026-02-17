import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, ShoppingBag, Shirt, TrendingUp, Shield, Zap, 
  CreditCard, BarChart3, Globe, CheckCircle2, ArrowRight,
  Package, Users, Star, Percent
} from 'lucide-react';

const sellerTypes = [
  {
    icon: Store,
    title: 'Afaceri & Magazine Online',
    subtitle: 'Pentru antreprenori și companii',
    description: 'Extindeți-vă afacerea pe cel mai mare marketplace românesc. Zero comisioane, mii de clienți potențiali.',
    benefits: [
      'Canal nou de vânzare fără investiție inițială',
      '0% comision pe toate vânzările',
      'Analitice avansate și rapoarte de vânzări',
      'Promovare integrată pe platformă',
      'Gestionare stoc și variante de produs',
    ],
    cta: 'Începe Acum',
    ctaLink: '/profile-settings',
    highlight: true,
  },
  {
    icon: ShoppingBag,
    title: 'Vânzători Ocazionali',
    subtitle: 'Vinzi ce nu mai folosești',
    description: 'Ai lucruri acasă pe care nu le mai folosești? Transformă-le în bani! Electronice, mobilă, jucării — orice.',
    benefits: [
      'Listare gratuită în câteva minute',
      'Fără taxe ascunse — 0% comision',
      'Plata rapidă prin PayPal',
      'Protecție cumpărător și vânzător',
      'Suport în limba română',
    ],
    cta: 'Postează Primul Anunț',
    ctaLink: '/sell',
    highlight: false,
  },
  {
    icon: Shirt,
    title: 'Haine & Modă Second-Hand',
    subtitle: 'Dă o nouă viață hainelor tale',
    description: 'Garderoba ta veche poate deveni garderoba nouă a altcuiva. Vinde haine, pantofi, accesorii second-hand.',
    benefits: [
      'Categorie dedicată de modă',
      'Galerie foto cu până la 10 poze per produs',
      'Filtrare după mărime, brand, stare',
      'Comunitate activă de cumpărători',
      'Sustenabilitate și economie circulară',
    ],
    cta: 'Vinde Haine Acum',
    ctaLink: '/sell',
    highlight: false,
  },
];

const stats = [
  { icon: Percent, value: '0%', label: 'Comision pe vânzări' },
  { icon: Package, value: '11 LEI', label: 'Abonament de la / lună' },
  { icon: Users, value: '1000+', label: 'Utilizatori activi' },
  { icon: Globe, value: '42', label: 'Orașe acoperite' },
];

const steps = [
  { step: '1', title: 'Creează cont gratuit', description: 'Înregistrează-te în 30 de secunde cu email-ul tău.' },
  { step: '2', title: 'Conectează PayPal', description: 'Configurează metoda de plată pentru a primi banii din vânzări.' },
  { step: '3', title: 'Postează anunțul', description: 'Adaugă poze, descriere și preț. Publicarea durează 2 minute.' },
  { step: '4', title: 'Primești comenzi', description: 'Clienții cumpără, tu expediezi. Banii ajung direct la tine.' },
];

const comparisons = [
  { platform: 'eMAG Marketplace', commission: '~25% comision', fee: 'Taxe ascunse' },
  { platform: 'OLX', commission: 'Fără protecție', fee: 'Risc de țepe' },
  { platform: 'eBay', commission: '~13% comision', fee: 'Taxe internaționale' },
  { platform: 'Marketplace România®', commission: '0% comision', fee: 'Abonament fix 11 LEI', highlight: true },
];

const SellOnMarketplace = () => {
  return (
    <>
      <SEOHead
        title="Vinde pe Marketplace România® | 0% Comision | Cel Mai Mare Marketplace Românesc"
        description="Vinde online pe Marketplace România® cu 0% comision. Ideal pentru afaceri, vânzători ocazionali și modă second-hand. Abonamente de la 11 LEI/lună. Înregistrare gratuită!"
        url="https://www.marketplaceromania.com/vinde-pe-marketplace"
        type="website"
      />
      <Layout>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              0% Comision — Primul Marketplace din România construit cu AI
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Vinde pe <span className="text-primary">Marketplace România®</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Fie că ai o afacere, vinzi ocazional sau vrei să dai o nouă viață hainelor tale — 
              aici ajungi la mii de cumpărători din toată România, <strong>fără comisioane</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/signup">
                  Înregistrează-te Gratuit <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/abonamente-vanzatori">
                  Vezi Abonamentele
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seller Types */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Pentru Cine Este Marketplace România?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Indiferent de ce vinzi sau cât de des, platforma noastră este creată pentru tine.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {sellerTypes.map((type) => (
                <Card key={type.title} className={`relative overflow-hidden transition-shadow hover:shadow-lg ${type.highlight ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                  {type.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1">
                      ⭐ CEL MAI POPULAR
                    </div>
                  )}
                  <CardContent className={`p-6 ${type.highlight ? 'pt-10' : ''}`}>
                    <type.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-1">{type.title}</h3>
                    <p className="text-sm text-primary font-medium mb-3">{type.subtitle}</p>
                    <p className="text-muted-foreground text-sm mb-5">{type.description}</p>
                    <ul className="space-y-2 mb-6">
                      {type.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full" variant={type.highlight ? 'default' : 'outline'}>
                      <Link to={type.ctaLink}>
                        {type.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Cum Începi să Vinzi?
              </h2>
              <p className="text-muted-foreground">4 pași simpli — ești gata în mai puțin de 5 minute</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {steps.map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                De Ce Marketplace România?
              </h2>
              <p className="text-muted-foreground">Compară și vezi diferența</p>
            </div>
            <div className="space-y-3">
              {comparisons.map((c) => (
                <div key={c.platform} className={`flex items-center justify-between p-4 rounded-lg border ${c.highlight ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'}`}>
                  <span className={`font-semibold ${c.highlight ? 'text-primary' : 'text-foreground'}`}>{c.platform}</span>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${c.highlight ? 'text-primary' : 'text-destructive'}`}>{c.commission}</p>
                    <p className="text-xs text-muted-foreground">{c.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Plăți Securizate</h3>
                <p className="text-sm text-muted-foreground">Tranzacții protejate prin PayPal. Banii tăi sunt în siguranță.</p>
              </div>
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Analitice Detaliate</h3>
                <p className="text-sm text-muted-foreground">Vezi câți oameni îți vizualizează produsele și optimizează-ți vânzările.</p>
              </div>
              <div className="text-center">
                <CreditCard className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Fără Costuri Ascunse</h3>
                <p className="text-sm text-muted-foreground">Abonament fix de la 11 LEI/lună. Fără comisioane, fără surprize.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ești Gata să Începi să Vinzi?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Alătură-te miilor de vânzători din România care au ales platforma cu 0% comision.
              Creează cont gratuit și postează primul tău anunț în mai puțin de 5 minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/signup">
                  Creează Cont Gratuit <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/cum-functioneaza">
                  Află Mai Multe
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default SellOnMarketplace;
