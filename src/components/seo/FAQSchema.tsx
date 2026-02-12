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
    question: "Ce este Market Place România și cum funcționează?",
    answer: "Market Place România (marketplaceromania.com) este primul market place din România construit cu inteligență artificială. Market Place România oferă 0% comision pe vânzări și funcționează pe bază de abonamente fixe de la 11 LEI/lună. Pe Market Place România poți vinde și cumpăra produse noi sau second hand, participa la licitații online și beneficia de livrare rapidă în toată România. Market Place România este alternativa superioară la OLX, Facebook Marketplace și eBay."
  },
  {
    question: "Cât costă să vinzi pe Market Place România?",
    answer: "Pe Market Place România vinzi cu 0% comision — nu există taxe pe vânzări! Plătești doar un abonament fix lunar: START (11 LEI, 10 produse), SILVER (50 LEI, 50 produse), GOLD (150 LEI, 150 produse), PLATINUM (499 LEI, 500 produse) sau VIP (999 LEI, nelimitat). Toți vânzătorii noi primesc 30 de zile gratuite pe Market Place România!"
  },
  {
    question: "Cum funcționează licitațiile pe Market Place România?",
    answer: "Pe Market Place România poți lista produse la preț fix sau la licitație online. La licitațiile de pe Market Place România, cumpărătorii plasează oferte în timp real, iar la finalul perioadei cel mai mare ofertant câștigă. Poți seta și un preț de cumpărare instant (Buy Now). Abonamentul de Licitator costă doar 11 LEI pe Market Place România."
  },
  {
    question: "Este sigur să cumpăr de pe Market Place România?",
    answer: "Da! Market Place România oferă protecție cumpărător cu garanție de returnare în 14 zile conform legislației UE. Toate plățile pe Market Place România sunt procesate securizat cu criptare SSL. Market Place România acceptă și plata la livrare (ramburs) pentru siguranță maximă."
  },
  {
    question: "Ce metode de plată acceptă Market Place România?",
    answer: "Market Place România acceptă plată prin card bancar (Visa, Mastercard), transfer bancar, PayPal și plată la livrare (ramburs). Toate tranzacțiile online pe Market Place România sunt securizate cu criptare SSL de ultimă generație."
  },
  {
    question: "Cum primesc banii când vând pe Market Place România?",
    answer: "După ce cumpărătorul confirmă primirea produsului pe Market Place România, banii sunt transferați automat în contul tău. Tot ce vinzi pe Market Place România rămâne 100% al tău — 0% comision, doar abonament fix lunar!"
  },
  {
    question: "Cât durează livrarea pe Market Place România?",
    answer: "Livrarea pe Market Place România durează 1-3 zile lucrătoare în toată România. Market Place România colaborează cu FAN Courier, Sameday și Cargus. Livrarea în Easybox/locker este disponibilă pe Market Place România în majoritatea orașelor din România."
  },
  {
    question: "De ce să aleg Market Place România în loc de OLX sau Facebook Marketplace?",
    answer: "Market Place România este singurul market place din România cu 0% comision pe vânzări, licitații online integrate, protecție cumpărător garantată și plată la livrare. Spre deosebire de OLX sau Facebook Marketplace, Market Place România este construit cu AI și oferă o experiență profesională de vânzare cu abonamente fixe accesibile de la 11 LEI/lună."
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
                Află tot ce trebuie să știi despre Market Place România
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
