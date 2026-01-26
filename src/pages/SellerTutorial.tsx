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
  Users,
  TrendingUp,
  CircleDollarSign,
  Eye,
  Store,
  CreditCard,
  Package,
  Settings,
  Banknote
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SellerTutorial: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Activează Modul Vânzător",
      description: "Accesează Mod Vânzător din Meniu pentru a activa contul de vânzări",
      icon: Store,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      details: [
        "Din Dashboard, apasă pe 'Mod Vânzător'",
        "Activează toggle-ul 'Permite listarea produselor'",
        "Completează numele magazinului tău",
        "Alege tipul de vânzător: Persoană Fizică sau Firmă",
        "Limită: maxim 10 produse active simultan"
      ]
    },
    {
      number: 2,
      title: "Configurează Încasările",
      description: "Setează metoda de plată pentru a primi banii din vânzări",
      icon: CreditCard,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      details: [
        "În Mod Vânzător, alege țara contului bancar",
        "Selectează metoda: Transfer Bancar (IBAN) sau Card de Debit",
        "Introdu IBAN-ul complet fără spații",
        "Completează numele titularului de cont",
        "Apasă 'Salvează Setările de Plată'"
      ]
    },
    {
      number: 3,
      title: "Verificare Identitate (KYC)",
      description: "Verifică-ți identitatea pentru a putea încasa banii",
      icon: BadgeCheck,
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      details: [
        "Verificarea este procesată de MangoPay",
        "Încarcă un act de identitate valid (CI/Pașaport)",
        "Adaugă o poză selfie pentru confirmare",
        "Procesul durează 1-3 zile lucrătoare",
        "Primești notificare când ești aprobat"
      ]
    },
    {
      number: 4,
      title: "Adaugă Produse de Vânzare",
      description: "Fotografiază și listează produsele tale",
      icon: Camera,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      details: [
        "Din Meniu, apasă pe 'Adaugă Produs'",
        "Încarcă fotografii clare (minim 3 poze)",
        "Adaugă titlu descriptiv și descriere detaliată",
        "Setează prețul și categoria potrivită",
        "Alege curierul și costul de transport"
      ]
    },
    {
      number: 5,
      title: "Gestionează Comenzile",
      description: "Primești notificare când cineva cumpără",
      icon: ShoppingBag,
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      details: [
        "Vei primi notificare pe email și în aplicație",
        "Din Meniu → Comenzi, vezi secțiunea 'Vânzări'",
        "Contactează cumpărătorul prin Mesaje dacă ai întrebări",
        "Pregătește coletul pentru expediere"
      ]
    },
    {
      number: 6,
      title: "Expediază și Adaugă Tracking",
      description: "Trimite coletul și introdu numărul AWB",
      icon: Truck,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      details: [
        "Împachetează produsul în siguranță",
        "Trimite prin curierul ales (FAN, Sameday, etc.)",
        "În Comenzi → Vânzări, apasă 'Adaugă Tracking'",
        "Introdu numărul AWB și selectează curierul",
        "Cumpărătorul primește actualizări automat"
      ]
    },
    {
      number: 7,
      title: "Retrage Banii din Portofel",
      description: "După confirmarea livrării, banii sunt disponibili",
      icon: Wallet,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      details: [
        "Din Meniu, accesează 'Portofel'",
        "Vezi Sold Disponibil (gata pentru transfer)",
        "Vezi În Așteptare (se procesează)",
        "Apasă 'Retrage' pentru a solicita transferul",
        "Banii ajung în cont în 1-3 zile lucrătoare"
      ]
    }
  ];

  const tips = [
    {
      icon: Camera,
      title: "Fotografii de Calitate",
      description: "Folosește lumină naturală și fundal simplu pentru fotografii clare care atrag cumpărători.",
      color: "text-pink-500",
      bgColor: "bg-pink-100"
    },
    {
      icon: Tag,
      title: "Prețuri Competitive",
      description: "Verifică prețurile produselor similare și setează un preț atractiv pentru vânzare rapidă.",
      color: "text-amber-500",
      bgColor: "bg-amber-100"
    },
    {
      icon: MessageCircle,
      title: "Răspunde Rapid",
      description: "Clienții apreciază răspunsurile rapide. Încearcă să răspunzi în maxim 2 ore.",
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      icon: Star,
      title: "Colectează Recenzii",
      description: "Recenziile pozitive cresc vânzările. Oferă servicii excelente pentru feedback bun!",
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    }
  ];

  const menuLocations = [
    { icon: Store, title: "Mod Vânzător", description: "Activare, KYC, setări cont bancar", color: "from-amber-400 to-orange-500" },
    { icon: Package, title: "Produsele Mele", description: "Vezi produsele tale active", color: "from-violet-500 to-purple-600" },
    { icon: Wallet, title: "Portofel", description: "Sold disponibil și retrageri", color: "from-green-500 to-emerald-600" },
    { icon: ShoppingBag, title: "Comenzi", description: "Cumpărături și vânzări", color: "from-rose-400 to-pink-600" },
    { icon: Settings, title: "Setări Profil", description: "Avatar, nume, contact", color: "from-blue-400 to-indigo-500" },
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
                Ghid Complet pentru Vânzători
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Învață să Vinzi pe Marketplace România
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Urmează pașii simpli de mai jos și începe să câștigi bani din produsele tale!
              </p>
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to="/dashboard">
                  <Eye className="h-5 w-5" />
                  Începe Acum
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Menu Reference */}
        <section className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Unde Găsești Totul în Meniu</h2>
              <p className="text-sm text-muted-foreground">Toate funcțiile sunt centralizate în Dashboard</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {menuLocations.map((item, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-card rounded-xl border text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{item.description}</span>
                </div>
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
                    Listarea produselor este 100% GRATUITĂ! Plătești doar când vinzi.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-primary mb-1">0 Lei</div>
                      <div className="text-sm text-muted-foreground">Listare Produs</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 border">
                      <div className="text-3xl font-bold text-primary mb-1">10%</div>
                      <div className="text-sm text-muted-foreground">Comision la Vânzare</div>
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

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ești Gata să Începi?</h2>
            <p className="text-muted-foreground mb-6">
              Mii de cumpărători așteaptă să descopere produsele tale. Începe astăzi!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to="/seller-mode">
                  <Store className="h-5 w-5" />
                  Activează Mod Vânzător
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/dashboard">
                  <Eye className="h-5 w-5" />
                  Mergi la Meniu
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
