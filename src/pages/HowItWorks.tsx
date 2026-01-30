import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  UserPlus, 
  Camera, 
  Tag, 
  Wallet,
  Shield,
  Gavel,
  Truck,
  Star
} from 'lucide-react';

export default function HowItWorks() {
  const buyerSteps = [
    {
      icon: Search,
      title: "1. Caută produse",
      description: "Explorează mii de produse în categorii diverse. Folosește filtrele pentru a găsi exact ce cauți."
    },
    {
      icon: ShoppingCart,
      title: "2. Adaugă în coș",
      description: "Selectează produsele dorite și adaugă-le în coșul de cumpărături. Poți cumpăra de la mai mulți vânzători."
    },
    {
      icon: CreditCard,
      title: "3. Finalizează comanda",
      description: "Alege metoda de plată preferată: card, transfer bancar sau ramburs (plată la livrare)."
    },
    {
      icon: Package,
      title: "4. Primește coletul",
      description: "Vânzătorul expediază produsul. Urmărești coletul și confirmi primirea când ajunge."
    }
  ];

  const sellerSteps = [
    {
      icon: UserPlus,
      title: "1. Creează cont gratuit",
      description: "Înregistrează-te gratuit și activează modul vânzător. Nu există taxe de abonament."
    },
    {
      icon: Camera,
      title: "2. Listează produse",
      description: "Adaugă fotografii, descriere și preț. Poți lista produse la preț fix sau la licitație."
    },
    {
      icon: Tag,
      title: "3. Primești comenzi",
      description: "Când un cumpărător plasează o comandă, primești notificare instant. Pregătește coletul pentru expediere."
    },
    {
      icon: Wallet,
      title: "4. Primești banii",
      description: "După confirmarea livrării, banii sunt transferați în portofelul tău. Comision doar 8%!"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Protecție Cumpărător",
      description: "Banii sunt ținuți în siguranță până confirmi că ai primit produsul în stare bună."
    },
    {
      icon: Gavel,
      title: "Licitații Online",
      description: "Participă la licitații pentru produse unice. Licitează și câștigă la cel mai bun preț!"
    },
    {
      icon: Truck,
      title: "Livrare Flexibilă",
      description: "Alege între curier la adresă sau ridicare din EasyBox/locker. Plată la livrare disponibilă."
    },
    {
      icon: Star,
      title: "Sistem de Review-uri",
      description: "Evaluează tranzacțiile și citește review-urile altor utilizatori pentru alegeri sigure."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Cum Funcționează | Marketplace România"
        description="Află cum funcționează Marketplace România. Ghid complet pentru cumpărători și vânzători. Listare gratuită, comision doar 8%, plată sigură."
        url="https://www.marketplaceromania.com/cum-functioneaza"
        type="article"
      />
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Cum Funcționează Marketplace România</h1>
              <p className="text-xl text-muted-foreground">
                Ghid complet pentru a cumpăra și vinde pe cea mai mare platformă online din România
              </p>
            </div>

            {/* Pentru Cumpărători */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                Pentru Cumpărători
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {buyerSteps.map((step, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <step.icon className="h-5 w-5 text-primary" />
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button asChild size="lg">
                  <Link to="/browse">Începe să Cumperi</Link>
                </Button>
              </div>
            </section>

            {/* Pentru Vânzători */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" />
                Pentru Vânzători
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sellerSteps.map((step, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <step.icon className="h-5 w-5 text-green-500" />
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link to="/sell">Începe să Vinzi</Link>
                </Button>
              </div>
            </section>

            {/* Funcționalități */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Ce Oferim</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Comisioane Quick Info */}
            <section className="mb-12">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">Comision Doar 8%</h2>
                  <p className="text-muted-foreground mb-4">
                    Cel mai mic comision din România! Listarea produselor este gratuită. 
                    Plătești doar când vinzi.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/taxe-si-comisioane">Vezi Detalii Complete</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* CTA Final */}
            <div className="text-center bg-muted/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Gata să Începi?</h2>
              <p className="text-muted-foreground mb-6">
                Înregistrează-te gratuit și alătură-te comunității de peste 10.000 utilizatori activi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/signup">Creează Cont Gratuit</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/browse">Explorează Produse</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
