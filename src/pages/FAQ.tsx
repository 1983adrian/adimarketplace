import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePoliciesContent } from '@/hooks/useAdminSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, ShoppingCart, CreditCard, Truck, Shield, MessageCircle } from 'lucide-react';

const defaultFAQs = [
  {
    category: 'Cumpărare',
    icon: ShoppingCart,
    questions: [
      {
        q: 'Cum pot cumpăra un produs pe Market Place România?',
        a: 'Navighează la pagina produsului dorit și apasă butonul „Cumpără acum" sau contactează vânzătorul prin mesageria integrată pentru a discuta detalii.',
      },
      {
        q: 'Pot negocia prețul cu vânzătorul?',
        a: 'Da, poți contacta vânzătorul prin sistemul de mesagerie al platformei pentru a discuta despre preț sau alte condiții ale tranzacției.',
      },
      {
        q: 'Există taxe suplimentare pentru cumpărători?',
        a: 'Nu! Pe Market Place România cumpărătorii nu plătesc nicio taxă suplimentară. Singurele costuri sunt prețul produsului și livrarea.',
      },
    ],
  },
  {
    category: 'Vânzare',
    icon: CreditCard,
    questions: [
      {
        q: 'Cum pot lista un produs spre vânzare?',
        a: 'Creează un cont, activează modul vânzător, apoi apasă pe „Vinde" și completează formularul cu detaliile produsului, inclusiv fotografii și preț.',
      },
      {
        q: 'Câte produse pot lista?',
        a: 'Numărul de produse depinde de abonamentul ales: START (10 produse), SILVER (50), GOLD (150), PLATINUM (500) sau VIP (nelimitat). Vânzătorii noi primesc 30 de zile gratuite.',
      },
      {
        q: 'Care sunt comisioanele pe vânzări?',
        a: 'Market Place România funcționează cu 0% comision pe vânzări! Plătești doar abonamentul lunar fix, iar tot ce vinzi rămâne 100% al tău.',
      },
    ],
  },
  {
    category: 'Livrare',
    icon: Truck,
    questions: [
      {
        q: 'Cum se face livrarea produselor?',
        a: 'Vânzătorul selectează curierul preferat (Fan Courier, Sameday, DPD, Cargus etc.) la listarea produsului. Cumpărătorul vede costul livrării înainte de a finaliza comanda.',
      },
      {
        q: 'Care sunt costurile de livrare?',
        a: 'Costurile de livrare sunt stabilite de vânzător și afișate transparent în detaliile produsului. Unii vânzători oferă livrare gratuită.',
      },
    ],
  },
  {
    category: 'Siguranță',
    icon: Shield,
    questions: [
      {
        q: 'Este sigur să cumpăr de pe Market Place România?',
        a: 'Platforma oferă un sistem de recenzii, verificare a vânzătorilor și protecție prin dispute. Recomandăm să verifici profilul și recenziile vânzătorului înainte de achiziție.',
      },
      {
        q: 'Ce fac dacă am o problemă cu o comandă?',
        a: 'Poți deschide o dispută din pagina comenzii sau contacta echipa de suport pentru asistență. Vom media între părți pentru a găsi o soluție.',
      },
    ],
  },
  {
    category: 'Cont și Plăți',
    icon: MessageCircle,
    questions: [
      {
        q: 'Cum îmi creez un cont?',
        a: 'Apasă pe „Înregistrare" și completează formularul cu adresa de email și o parolă. Vei primi un email de confirmare pentru verificarea contului.',
      },
      {
        q: 'Ce metode de plată sunt acceptate?',
        a: 'Market Place România acceptă plăți prin card bancar (procesate securizat), plată la livrare (ramburs) și transfer bancar, în funcție de preferințele vânzătorului.',
      },
      {
        q: 'Cum funcționează abonamentele pentru vânzători?',
        a: 'Alegi planul potrivit (de la 11 LEI/lună), efectuezi plata, iar abonamentul se activează automat. 0% comision pe vânzări — tot ce vinzi rămâne al tău.',
      },
    ],
  },
];

export default function FAQ() {
  const { data: policies, isLoading } = usePoliciesContent();
  const faqPolicy = policies?.find(p => p.policy_key === 'faq' && p.is_published);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Întrebări Frecvente</h1>
            <p className="text-xl text-muted-foreground">
              Găsește răspunsuri la cele mai comune întrebări despre Market Place România
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {defaultFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Nu ai găsit răspunsul pe care îl cauți?
              </p>
              <a 
                href="/contact" 
                className="text-primary hover:underline font-medium"
              >
                Contactează-ne pentru asistență →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
