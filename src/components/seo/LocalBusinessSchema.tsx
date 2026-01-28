import React from 'react';
import { Helmet } from 'react-helmet-async';

export const LocalBusinessSchema: React.FC = () => {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Marketplace România",
    "alternateName": ["C Market", "MarketplaceRomania", "Marketplace RO"],
    "description": "Prima platformă 100% românească de cumpărături și vânzări online cu licitații integrate. Comision doar 8%.",
    "url": "https://marketplaceromania.lovable.app",
    "logo": "https://marketplaceromania.lovable.app/icons/icon-512x512.png",
    "image": "https://marketplaceromania.lovable.app/og-image.png",
    "telephone": "+40-XXX-XXX-XXX",
    "email": "contact@marketplaceromania.com",
    "foundingDate": "2024",
    "founder": {
      "@type": "Organization",
      "name": "Marketplace România SRL"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RO",
      "addressLocality": "București",
      "addressRegion": "București"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "44.4268",
      "longitude": "26.1025"
    },
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "România"
    },
    "priceRange": "RON",
    "currenciesAccepted": "RON, EUR",
    "paymentAccepted": ["Card de credit", "Transfer bancar", "Ramburs", "Plată la livrare"],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/marketplaceromania",
      "https://www.instagram.com/marketplaceromania",
      "https://www.tiktok.com/@marketplaceromania",
      "https://twitter.com/marketplacero"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Produse Marketplace România",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Electronice & IT",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Telefoane mobile" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Laptopuri" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Tablete" } }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Modă",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Îmbrăcăminte" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Încălțăminte" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Accesorii" } }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Auto & Moto",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Piese auto" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Accesorii auto" } }
          ]
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Maria D."
        },
        "reviewBody": "Cel mai bun marketplace din România! Comisioane mici și livrare rapidă."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Andrei P."
        },
        "reviewBody": "Vând pe această platformă de 6 luni. Recomand pentru comisioanele mici!"
      }
    ],
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "1",
      "highPrice": "100000",
      "priceCurrency": "RON",
      "offerCount": "10000+"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://marketplaceromania.lovable.app/browse?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "BuyAction",
        "target": "https://marketplaceromania.lovable.app/browse"
      }
    ],
    "slogan": "Cumpără și vinde online în România - Comision doar 8%",
    "keywords": "marketplace romania, olx alternativa, ebay romania, cumparaturi online, vanzari online, licitatii online, second hand romania"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
};
