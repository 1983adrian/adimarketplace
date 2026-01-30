import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Percent, 
  Check, 
  X, 
  Info,
  Calculator,
  HelpCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FeesAndCommissions() {
  const includedFeatures = [
    "Listare nelimitată de produse",
    "Promovare pe homepage (opțional, plătit)",
    "Licitații online",
    "Mesagerie integrată",
    "Protecție cumpărător",
    "Suport clienți",
    "Wallet pentru plăți"
  ];

  const competitors = [
    { name: "Marketplace România", fee: "8%", highlight: true },
    { name: "eBay", fee: "12-15%", highlight: false },
    { name: "eMAG Marketplace", fee: "10-25%", highlight: false },
    { name: "OLX (promovări)", fee: "Abonament + taxe", highlight: false },
  ];

  const examples = [
    { price: 100, commission: 8, netAmount: 92 },
    { price: 500, commission: 40, netAmount: 460 },
    { price: 1000, commission: 80, netAmount: 920 },
    { price: 5000, commission: 400, netAmount: 4600 },
  ];

  const faqs = [
    {
      question: "Când se aplică comisionul de 8%?",
      answer: "Comisionul se aplică doar la finalizarea unei vânzări. Când cumpărătorul confirmă primirea produsului, comisionul de 8% este dedus automat, iar restul de 92% îți este transferat în wallet."
    },
    {
      question: "Există taxe de listare?",
      answer: "Nu! Listarea produselor este complet gratuită. Poți lista oricâte produse dorești fără nicio taxă inițială."
    },
    {
      question: "Ce include comisionul de 8%?",
      answer: "Comisionul acoperă: procesarea plăților, protecția cumpărătorului, suport clienți, infrastructura platformei și sistemul de mesagerie."
    },
    {
      question: "Cum funcționează promovările plătite?",
      answer: "Promovările sunt opționale și îți cresc vizibilitatea. Produsele promovate apar pe homepage și în topul căutărilor. Prețurile încep de la 5 RON/zi."
    },
    {
      question: "Când îmi primesc banii?",
      answer: "Banii sunt disponibili în wallet-ul tău imediat după ce cumpărătorul confirmă primirea produsului. Poți retrage oricând în contul bancar."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Taxe și Comisioane | Marketplace România - Comision Doar 8%"
        description="Comision de doar 8% pe Marketplace România - cel mai mic din industrie! Listare gratuită, fără abonamente. Află toate detaliile despre taxe și comisioane."
        url="https://www.marketplaceromania.com/taxe-si-comisioane"
        type="article"
      />
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                Cel mai mic comision din România
              </Badge>
              <h1 className="text-4xl font-bold mb-4">Taxe și Comisioane</h1>
              <p className="text-xl text-muted-foreground">
                Simplu și transparent. Plătești doar când vinzi.
              </p>
            </div>

            {/* Main Commission Card */}
            <Card className="mb-12 border-2 border-primary overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Percent className="h-10 w-10" />
                  <span className="text-6xl font-bold">8</span>
                  <span className="text-3xl">%</span>
                </div>
                <p className="text-xl opacity-90">Comision per vânzare</p>
              </div>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Ce este inclus GRATUIT
                    </h3>
                    <ul className="space-y-2">
                      {includedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      NU plătești pentru
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe de listare
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Abonamente lunare
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe de înscriere
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe ascunse
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculator */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Calculator Câștiguri
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>Cât primești pentru fiecare vânzare</CardTitle>
                  <CardDescription>
                    Exemple de calcul al comisionului de 8%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Preț vânzare</th>
                          <th className="text-left py-3 px-4">Comision (8%)</th>
                          <th className="text-left py-3 px-4 font-bold text-green-600">Tu primești</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examples.map((example, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-4">{example.price} RON</td>
                            <td className="py-3 px-4 text-muted-foreground">-{example.commission} RON</td>
                            <td className="py-3 px-4 font-bold text-green-600">{example.netAmount} RON</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Comparație */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Comparație Comisioane</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitors.map((competitor, index) => (
                  <Card 
                    key={index} 
                    className={competitor.highlight ? "border-2 border-primary bg-primary/5" : ""}
                  >
                    <CardContent className="pt-6 text-center">
                      <p className="font-semibold mb-2">{competitor.name}</p>
                      <p className={`text-2xl font-bold ${competitor.highlight ? "text-primary" : "text-muted-foreground"}`}>
                        {competitor.fee}
                      </p>
                      {competitor.highlight && (
                        <Badge className="mt-2 bg-green-500">Cel mai mic!</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Întrebări Frecvente
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Info Box */}
            <Card className="mb-12 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Informații importante</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Comisionul se aplică la prețul produsului, nu la costul de livrare</li>
                      <li>• Pentru licitații, comisionul se aplică la prețul final de adjudecare</li>
                      <li>• Plata la livrare (ramburs) nu implică taxe suplimentare</li>
                      <li>• Prețurile afișate includ TVA unde este cazul</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center bg-muted/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Începe să Vinzi Acum</h2>
              <p className="text-muted-foreground mb-6">
                Fără taxe de start. Listează primul tău produs gratuit și plătești doar când vinzi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/sell">Listează Gratuit</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/cum-functioneaza">Cum Funcționează</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
