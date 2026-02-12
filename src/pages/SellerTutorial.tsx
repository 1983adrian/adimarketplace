import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Tag, 
  CheckCircle2, 
  ShoppingBag, 
  MessageCircle, 
  Truck, 
  BadgeCheck, 
  Wallet, 
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  CircleDollarSign,
  Eye,
  Store,
  CreditCard,
  Package,
  Settings,
  Globe,
  Receipt,
  ExternalLink,
  Gavel
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SellerTutorial: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Activează Modul Vânzător",
      description: "Primul pas este să îți activezi contul de vânzări din Meniu",
      icon: Store,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      buttonLabel: "Mergi la Mod Vânzător →",
      buttonLink: "/seller-mode",
      details: [
        "Din Meniu (☰), apasă pe 'Mod Vânzător'",
        "Activează toggle-ul 'Activează Modul Vânzător'",
        "Completează Numele Magazinului tău",
        "Alege tipul: Vânzător Ocazional sau Comercial",
        "Acceptă Termenii Vânzătorului și salvează"
      ]
    },
    {
      number: 2,
      title: "Alege un Plan de Abonament",
      description: "Selectează planul potrivit pentru volumul tău de vânzări",
      icon: Receipt,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      buttonLabel: "Vezi Planurile →",
      buttonLink: "/seller-plans",
      details: [
        "Accesează 'Planuri Vânzători' din Meniu",
        "Alege planul potrivit: START (11 LEI), SILVER (50 LEI), GOLD (150 LEI), etc.",
        "Plătește prin link-ul Revolut (instant & sigur)",
        "La referința plății scrie email-ul tău + numele planului",
        "Adminul confirmă plata → Planul se activează automat"
      ]
    },
    {
      number: 3,
      title: "Conectează Contul PayPal",
      description: "PayPal este necesar pentru a primi banii din vânzări",
      icon: Globe,
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      buttonLabel: "Configurează PayPal →",
      buttonLink: "/seller-mode",
      details: [
        "Din 'Mod Vânzător', secțiunea PayPal",
        "Ocazional? → PayPal Personal e suficient",
        "Comercial? → PayPal Business obligatoriu (gratuit)",
        "Introdu email-ul PayPal și salvează",
        "Tracking-ul comenzilor se sincronizează automat cu PayPal"
      ]
    },
    {
      number: 4,
      title: "Adaugă Produse de Vânzare",
      description: "Fotografiază și listează produsele tale pe platformă",
      icon: Camera,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      buttonLabel: "Adaugă Produs →",
      buttonLink: "/create-listing",
      details: [
        "Din Meniu, apasă pe 'Adaugă Produs'",
        "Încarcă fotografii clare (maxim 3 poze per produs)",
        "Adaugă titlu descriptiv și descriere detaliată",
        "Setează prețul și categoria potrivită",
        "Alege curierul și costul de transport"
      ]
    },
    {
      number: 5,
      title: "Gestionează Comenzile",
      description: "Primești notificare când cineva cumpără produsul tău",
      icon: ShoppingBag,
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      buttonLabel: "Vezi Comenzile →",
      buttonLink: "/orders",
      details: [
        "Vei primi notificare pe email (cu logo-ul platformei) și în aplicație",
        "Din Meniu → Comenzi, vezi secțiunea 'Vânzări'",
        "Contactează cumpărătorul prin Mesaje dacă ai întrebări",
        "Pregătește coletul pentru expediere"
      ]
    },
    {
      number: 6,
      title: "Expediază și Adaugă Tracking (AWB)",
      description: "Trimite coletul și introdu numărul AWB pentru protecție PayPal",
      icon: Truck,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      details: [
        "Împachetează produsul în siguranță",
        "Trimite prin curierul ales (FAN, Sameday, GLS, etc.)",
        "În Comenzi → Vânzări, apasă 'Adaugă Tracking'",
        "Introdu numărul AWB → se sincronizează automat cu PayPal",
        "⚡ Tracking-ul protejează banii tăi în contul PayPal"
      ]
    },
    {
      number: 7,
      title: "Retrage Banii din Portofel",
      description: "După confirmarea livrării, banii sunt disponibili pentru retragere",
      icon: Wallet,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      buttonLabel: "Mergi la Portofel →",
      buttonLink: "/wallet",
      details: [
        "Din Meniu, accesează 'Portofel'",
        "Vezi Sold Disponibil (gata pentru retragere)",
        "Vezi În Așteptare (se procesează)",
        "Apasă 'Retrage' pentru a solicita transferul",
        "Banii ajung în contul tău bancar în 1-3 zile lucrătoare"
      ]
    }
  ];

  const tips = [
    {
      icon: Camera,
      title: "Fotografii de Calitate",
      description: "Folosește lumină naturală și fundal simplu. Fotografiază din mai multe unghiuri — maxim 3 poze per produs.",
      color: "text-pink-500",
      bgColor: "bg-pink-100"
    },
    {
      icon: Tag,
      title: "Prețuri Competitive",
      description: "Verifică prețurile produselor similare. Un preț atractiv = vânzare rapidă. 0% comision la vânzare!",
      color: "text-amber-500",
      bgColor: "bg-amber-100"
    },
    {
      icon: MessageCircle,
      title: "Răspunde Rapid",
      description: "Clienții apreciază răspunsurile rapide. Încearcă să răspunzi în maxim 2 ore prin chat.",
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      icon: Star,
      title: "Colectează Recenzii",
      description: "Recenziile pozitive cresc vânzările. TOP 10 vânzători primesc Bifa Albastră ✓ automat!",
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    }
  ];

  const menuLocations = [
    { icon: Store, title: "Mod Vânzător", description: "Activare, PayPal, tip cont", color: "from-amber-400 to-orange-500", link: "/seller-mode" },
    { icon: Receipt, title: "Planuri", description: "Abonamente & plată Revolut", color: "from-blue-400 to-indigo-500", link: "/seller-plans" },
    { icon: Package, title: "Produsele Mele", description: "Produse active & gestiune", color: "from-violet-500 to-purple-600", link: "/my-products" },
    { icon: Wallet, title: "Portofel", description: "Sold & retrageri", color: "from-green-500 to-emerald-600", link: "/wallet" },
    { icon: ShoppingBag, title: "Comenzi", description: "Cumpărături & vânzări", color: "from-rose-400 to-pink-600", link: "/orders" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Ghid Complet & Actualizat 2025
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Cum Să Vinzi pe Marketplace România
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Urmează cei 7 pași simpli de mai jos și începe să câștigi bani din produsele tale!
              </p>
              <Alert className="max-w-lg mx-auto border-green-500/30 bg-green-50/50 dark:bg-green-950/20 text-left mb-6">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                  <strong>0% comision la vânzare</strong> — Plătești doar abonamentul lunar de la 11 LEI.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link to="/seller-mode">
                    <Store className="h-5 w-5" />
                    Începe Acum
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/seller-plans">
                    <Receipt className="h-5 w-5" />
                    Vezi Planurile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Menu Reference */}
        <section className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">📍 Unde Găsești Totul</h2>
              <p className="text-sm text-muted-foreground">Apasă pe orice secțiune pentru a ajunge direct acolo</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {menuLocations.map((item, index) => (
                <Link key={index} to={item.link} className="flex flex-col items-center p-4 bg-card rounded-xl border text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 shadow-md`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto space-y-6">
            {steps.map((step, index) => (
              <Card 
                key={step.number} 
                className={`relative overflow-hidden border-2 ${step.borderColor} transition-all hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Decorative gradient */}
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${step.color}`} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-primary">
                        <span className="text-sm font-bold text-primary">{step.number}</span>
                      </div>
                    </div>
                    
                    {/* Title & Description */}
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-2xl mb-1">{step.title}</CardTitle>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className={`${step.bgColor} rounded-xl p-4 mt-2`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Pași de urmat:
                    </h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className="text-xs font-bold text-white">{i + 1}</span>
                          </div>
                          <span className="text-sm md:text-base">{detail}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Action button for the step */}
                    {step.buttonLink && (
                      <div className="mt-4 pt-3 border-t border-black/10">
                        <Button asChild variant="outline" size="sm" className="gap-2 font-semibold">
                          <Link to={step.buttonLink}>
                            <ExternalLink className="h-4 w-4" />
                            {step.buttonLabel}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Arrow to next step */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-primary-foreground rotate-90" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Sfaturi Pro
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Secretele Vânzătorilor de Succes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${tip.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <tip.icon className={`h-6 w-6 ${tip.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Info */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CircleDollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Cât Costă să Vinzi?</h3>
                  <p className="text-muted-foreground mb-6">
                    0% comision la vânzare! Plătești doar abonamentul lunar.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-green-600 mb-1">0%</div>
                      <div className="text-sm text-muted-foreground">Comision Vânzare</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-primary mb-1">11 LEI</div>
                      <div className="text-sm text-muted-foreground">Plan de la</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-primary mb-1">30 Zile</div>
                      <div className="text-sm text-muted-foreground">Trial Gratuit</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-primary mb-1">1-3 Zile</div>
                      <div className="text-sm text-muted-foreground">Transfer în Cont</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Auction Info */}
        <section className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Vrei să Licitezi?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pentru a participa la licitații ca și cumpărător, ai nevoie de <strong>Abonament Licitator</strong> (11 LEI). 
                      Ca vânzător, alege <strong>Plan LICITAȚII</strong> pentru a lista produse la licitație.
                    </p>
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link to="/seller-plans">
                        <Gavel className="h-4 w-4" />
                        Vezi Planurile de Licitații →
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ești Gata să Începi?</h2>
            <p className="text-muted-foreground mb-6">
              Mii de cumpărători așteaptă să descopere produsele tale. Începe astăzi — primele 30 de zile sunt GRATUITE!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to="/seller-mode">
                  <Store className="h-5 w-5" />
                  Activează Mod Vânzător
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/seller-plans">
                  <Receipt className="h-5 w-5" />
                  Vezi Planurile
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SellerTutorial;
