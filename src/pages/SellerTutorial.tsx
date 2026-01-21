import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Tag, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ShoppingBag, 
  MessageCircle, 
  Package, 
  Truck, 
  BadgeCheck, 
  IdCard, 
  Shield, 
  Wallet, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Users,
  TrendingUp,
  CircleDollarSign,
  Plus,
  Eye,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SellerTutorial: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Creează Cont de Vânzător",
      description: "Înregistrează-te gratuit și activează opțiunea de vânzător din setări",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      details: [
        "Apasă pe 'Înregistrare' în colțul din dreapta sus",
        "Completează datele tale: email, parolă, nume",
        "Confirmă emailul primit în inbox",
        "Mergi la Setări → Magazin pentru a activa vânzarea"
      ]
    },
    {
      number: 2,
      title: "Adaugă Primul Produs",
      description: "Fotografiază produsul și completează detaliile pentru a-l lista",
      icon: Camera,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      details: [
        "Apasă butonul '+ Adaugă Produs' din Dashboard",
        "Încarcă fotografii clare ale produsului (minim 3)",
        "Adaugă titlu descriptiv și descriere detaliată",
        "Setează prețul și categoria potrivită",
        "Alege metoda de livrare și costul transportului"
      ]
    },
    {
      number: 3,
      title: "Gestionează Comenzile",
      description: "Primești notificare când cineva cumpără - răspunde rapid!",
      icon: ShoppingBag,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      details: [
        "Vei primi notificare pe email și în aplicație",
        "Accesează 'Comenzi' pentru a vedea detaliile",
        "Contactează cumpărătorul prin chat dacă ai întrebări",
        "Confirmă disponibilitatea și pregătește coletul"
      ]
    },
    {
      number: 4,
      title: "Expediază Coletul",
      description: "Împachetează frumos și trimite prin curierul ales",
      icon: Truck,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      details: [
        "Împachetează produsul în siguranță",
        "Alege curierul (FAN Courier, Sameday, etc.)",
        "Generează AWB-ul din secțiunea comenzi",
        "Introdu numărul de tracking pentru cumpărător",
        "Cumpărătorul primește actualizări automat"
      ]
    },
    {
      number: 5,
      title: "Verifică-ți Contul",
      description: "Conturile verificate primesc mai multă încredere și vânzări",
      icon: BadgeCheck,
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      details: [
        "Mergi la Setări → Verificare",
        "Încarcă un act de identitate valid (CI/Pașaport)",
        "Adaugă o poză selfie pentru confirmare",
        "Așteaptă aprobarea (24-48 ore)",
        "Primești badge-ul ✓ Verificat pe profil"
      ]
    },
    {
      number: 6,
      title: "Retrage Banii",
      description: "După livrare, banii sunt disponibili pentru retragere",
      icon: Wallet,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      details: [
        "Banii ajung în portofelul tău după confirmarea livrării",
        "Mergi la Setări → Bani & Plăți",
        "Adaugă contul bancar (IBAN) sau PayPal",
        "Solicită retragerea sumei dorite",
        "Transferul durează 1-3 zile lucrătoare"
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
                Învață să Vinzi pe C Market
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Urmează pașii simpli de mai jos și începe să câștigi bani din produsele tale!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link to="/create-listing">
                    <Plus className="h-5 w-5" />
                    Începe Acum - Adaugă Produs
                  </Link>
                </Button>
              </div>
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
                    <div className={`relative flex-shrink-0`}>
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
                <Link to="/create-listing">
                  <Plus className="h-5 w-5" />
                  Adaugă Primul Produs
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/dashboard">
                  <Eye className="h-5 w-5" />
                  Mergi la Dashboard
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
