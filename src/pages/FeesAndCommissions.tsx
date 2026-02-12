import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Info,
  HelpCircle,
  CreditCard,
  Crown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FeesAndCommissions() {

  const includedFeatures = [
    "Mesagerie integrată între vânzători și cumpărători",
    "Protecție cumpărător prin sistem de dispute",
    "Suport clienți în limba română",
    "Sistem de licitații online",
    "Promovare pe pagina principală (opțional, contra cost)",
  ];

  const plans = [
    { name: "START", price: "11 LEI/lună", listings: "Maxim 10 produse" },
    { name: "LICITAȚII", price: "11 LEI/lună", listings: "Maxim 10 licitații" },
    { name: "SILVER", price: "50 LEI/lună", listings: "Maxim 50 produse" },
    { name: "GOLD", price: "150 LEI/lună", listings: "Maxim 150 produse" },
    { name: "PLATINUM", price: "499 LEI/lună", listings: "Maxim 500 produse" },
    { name: "VIP", price: "999 LEI/lună", listings: "Produse nelimitate", highlight: true },
  ];

  const faqs = [
    {
      question: "Cum funcționează abonamentele pe Market Place România?",
      answer: "Alegi planul potrivit nevoilor tale, efectuezi plata prin transfer bancar, iar echipa confirmă plata. Abonamentul se activează automat după confirmare și este valabil 30 de zile."
    },
    {
      question: "Există comisioane pe vânzări?",
      answer: "Nu! Market Place România funcționează cu 0% comision pe vânzări. Plătești doar abonamentul lunar fix, iar tot ce vinzi rămâne 100% al tău."
    },
    {
      question: "Există taxe pentru cumpărători?",
      answer: "Nu! Cumpărătorii nu plătesc nicio taxă suplimentară pe Market Place România. Singurele costuri sunt prețul produsului și livrarea."
    },
    {
      question: "Pot testa platforma gratuit?",
      answer: "Da! Toți vânzătorii noi primesc 30 de zile gratuite cu posibilitatea de a lista până la 10 produse, fără obligații."
    },
    {
      question: "Cum îmi primesc banii din vânzări?",
      answer: "Banii sunt transferați direct în contul tău. Tot ce vinzi pe Market Place România rămâne 100% al tău — 0% comision, fără taxe ascunse."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Taxe și Abonamente | Market Place România — 0% Comision"
        description="Market Place România — 0% comision pe vânzări! Abonamente fixe de la 11 LEI/lună. Fără taxe ascunse. Vânzătorii noi primesc 30 de zile gratuite."
        url="https://marketplaceromania.lovable.app/taxe-si-comisioane"
        type="article"
      />
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                0% comision pe vânzări!
              </Badge>
              <h1 className="text-4xl font-bold mb-4">Taxe și Abonamente</h1>
              <p className="text-xl text-muted-foreground">
                Simplu și transparent. Plătești doar abonamentul fix — fără comisioane pe vânzări!
              </p>
            </div>

            {/* Main Card */}
            <Card className="mb-12 border-2 border-primary overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditCard className="h-10 w-10" />
                  <span className="text-4xl font-bold">0%</span>
                </div>
                <p className="text-xl opacity-90">Comision pe vânzări</p>
                <p className="text-sm opacity-75 mt-2">Plătești doar abonamentul lunar fix</p>
              </div>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Ce este inclus
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
                      NU plătești
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Comisioane pe vânzări (0%)
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe pentru cumpărători
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe ascunse de niciun fel
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        Taxe de înscriere pe platformă
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plans Overview */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                Planuri Disponibile
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={plan.highlight ? "border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : ""}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {plan.highlight && <Crown className="h-4 w-4 text-amber-500" />}
                        <p className="font-semibold">{plan.name}</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">{plan.price}</p>
                      <p className="text-sm text-muted-foreground mt-1">{plan.listings}</p>
                      {plan.highlight && (
                        <Badge className="mt-2 bg-amber-500">Recomandat</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild>
                  <Link to="/seller-plans">Vezi Toate Planurile →</Link>
                </Button>
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
                      <li>• Vânzătorii noi primesc 30 de zile gratuite cu maxim 10 produse</li>
                      <li>• Abonamentul se plătește prin transfer bancar</li>
                      <li>• Toate veniturile din vânzări rămân 100% ale tale — 0% comision</li>
                      <li>• Cumpărătorii nu au taxe suplimentare</li>
                      <li>• Prețurile includ TVA acolo unde este cazul</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center bg-muted/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Începe să Vinzi pe Market Place România</h2>
              <p className="text-muted-foreground mb-6">
                30 de zile gratuite. 0% comision. Abonamente fixe. Alege planul potrivit și începe acum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/seller-plans">Vezi Planurile</Link>
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
