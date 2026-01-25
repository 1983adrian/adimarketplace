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
        q: 'Cum pot cumpăra un produs?',
        a: 'Pentru a cumpăra un produs, navighează la pagina produsului dorit și apasă butonul "Cumpără acum" sau contactează vânzătorul prin chat pentru a negocia.',
      },
      {
        q: 'Pot negocia prețul?',
        a: 'Da, poți contacta vânzătorul prin sistemul de mesagerie al platformei pentru a discuta despre preț sau alte detalii.',
      },
    ],
  },
  {
    category: 'Vânzare',
    icon: CreditCard,
    questions: [
      {
        q: 'Cum pot lista un produs spre vânzare?',
        a: 'Creează un cont, apasă pe "Vinde" și completează formularul cu detaliile produsului, inclusiv fotografii și preț.',
      },
      {
        q: 'Câte produse pot lista?',
        a: 'În mod implicit, fiecare utilizator poate lista până la 10 produse. Vânzările sunt nelimitate.',
      },
    ],
  },
  {
    category: 'Livrare',
    icon: Truck,
    questions: [
      {
        q: 'Cum se face livrarea?',
        a: 'Metoda de livrare este convenită între vânzător și cumpărător. Platforma oferă posibilitatea de a urmări comenzile.',
      },
      {
        q: 'Care sunt costurile de livrare?',
        a: 'Costurile de livrare sunt stabilite de vânzător și sunt afișate în detaliile produsului.',
      },
    ],
  },
  {
    category: 'Siguranță',
    icon: Shield,
    questions: [
      {
        q: 'Este sigur să cumpăr de pe platformă?',
        a: 'Platforma oferă un sistem de review-uri și verificări. Recomandăm să verifici profilul vânzătorului și review-urile înainte de a face o achiziție.',
      },
      {
        q: 'Ce fac dacă am o problemă cu o comandă?',
        a: 'Poți deschide o dispută din pagina comenzii sau contacta suportul nostru pentru asistență.',
      },
    ],
  },
  {
    category: 'Cont și Plăți',
    icon: MessageCircle,
    questions: [
      {
        q: 'Cum îmi creez un cont?',
        a: 'Apasă pe "Înregistrare" și completează formularul cu adresa de email și o parolă. Vei primi un email de confirmare.',
      },
      {
        q: 'Ce metode de plată sunt acceptate?',
        a: 'Platforma acceptă plăți prin card (procesate securizat prin MangoPay) și plată la livrare (ramburs) acolo unde vânzătorul o permite.',
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
              Găsește răspunsuri la cele mai comune întrebări
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
