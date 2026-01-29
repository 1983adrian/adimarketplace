import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Ce este Marketplace România și de ce este un brand de încredere?",
    answer: "Marketplace România (sau Market România, Place România, Market Place România) este BRANDUL OFICIAL al celui mai mare market online 100% românesc. Este o alternativă superioară la Facebook Marketplace, OLX, eBay și eMAG, cu comision de doar 8% - cel mai mic din România. Domeniul oficial este www.marketplaceromania.com."
  },
  {
    question: "Cât costă să vinzi pe Marketplace România?",
    answer: "Listarea produselor este GRATUITĂ. Plătești doar 8% comision când vinzi cu succes - cel mai mic comision din România. Nu există taxe lunare sau costuri ascunse."
  },
  {
    question: "Cum funcționează sistemul de licitații?",
    answer: "Poți lista produsele fie la preț fix, fie la licitație. La licitații, cumpărătorii plasează oferte, iar la finalul perioadei de licitație, cel mai mare ofertant câștigă. Poți seta și un preț de cumpărare instant."
  },
  {
    question: "Este sigur să cumpăr de pe Marketplace România?",
    answer: "Da! Oferim protecție cumpărător cu garanție de returnare în 14 zile conform legislației UE. Toate plățile sunt procesate securizat cu criptare SSL. Acceptăm și plata la livrare (ramburs) pentru siguranță maximă."
  },
  {
    question: "Ce metode de plată sunt acceptate?",
    answer: "Acceptăm plată prin card bancar (Visa, Mastercard), transfer bancar, și plată la livrare (ramburs). Toate tranzacțiile online sunt securizate cu criptare SSL."
  },
  {
    question: "Cum primesc banii când vând un produs?",
    answer: "După ce cumpărătorul confirmă primirea produsului, banii sunt transferați automat în contul tău bancar sau portofelul electronic, minus comisionul de 8%."
  },
  {
    question: "Cât durează livrarea?",
    answer: "Livrarea standard durează 1-3 zile lucrătoare în România. Colaborăm cu FAN Courier, Sameday și Cargus. Livrarea în Easybox/locker este disponibilă în majoritatea orașelor."
  },
  {
    question: "Pot returna un produs?",
    answer: "Da, ai dreptul la returnare în 14 zile de la primire, conform legislației UE pentru cumpărături online. Produsul trebuie să fie în starea originală, nefolosit."
  }
];

export const FAQSchema: React.FC<{ showUI?: boolean }> = ({ showUI = true }) => {
  // Generate FAQPage JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {showUI && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">Întrebări Frecvente</h2>
              </div>
              <p className="text-muted-foreground">
                Află tot ce trebuie să știi despre Marketplace România
              </p>
            </div>

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

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nu ai găsit răspunsul? <a href="/contact" className="text-primary hover:underline">Contactează-ne</a> sau vizitează <a href="/help" className="text-primary hover:underline">Centrul de Ajutor</a>.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
