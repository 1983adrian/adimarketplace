import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Marketplace Schema - Definește CE găzduiește platforma
 * Acest schema descrie serviciul de marketplace pentru Google
 */
export const MarketplaceSchema: React.FC = () => {
  // OnlineStore / Marketplace Schema
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": "https://www.marketplaceromania.com/#store",
    "name": "Marketplace România",
    "alternateName": ["Market România", "Place România", "Market Place România"],
    "description": "Marketplace România - cel mai mare market online 100% românesc. Platformă pentru cumpărături și vânzări online cu licitații integrate și comision de doar 8%.",
    "url": "https://www.marketplaceromania.com",
    "logo": "https://www.marketplaceromania.com/logo-oficial.png",
    "image": "https://www.marketplaceromania.com/logo-oficial.png",
    "telephone": "+40 7949 421640",
    "email": "Adrianchirita01@gmail.com",
    "priceRange": "RON",
    "currenciesAccepted": "RON, EUR",
    "paymentAccepted": [
      "Card de credit",
      "Card de debit",
      "Transfer bancar",
      "Ramburs (Plată la livrare)"
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RO",
      "addressLocality": "București"
    },
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "sameAs": [
      "https://www.tiktok.com/@MarketPlaceRomania",
      "https://www.instagram.com/MarketPlaceRomania"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Categorii de Produse Marketplace România",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Electronice & IT",
          "description": "Telefoane mobile, Laptopuri, Tablete, Console gaming"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Modă & Accesorii",
          "description": "Îmbrăcăminte, Încălțăminte, Accesorii, Ceasuri"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Casa & Grădină",
          "description": "Mobilă, Electrocasnice, Decorațiuni"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Auto & Moto",
          "description": "Piese auto, Accesorii auto"
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
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "1",
      "highPrice": "100000",
      "priceCurrency": "RON",
      "offerCount": "10000",
      "description": "Comision de doar 8% pentru vânzători - cel mai mic din România"
    }
  };

  // Service Schema - Descrierea serviciului de marketplace
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://www.marketplaceromania.com/#service",
    "name": "Serviciu Marketplace România",
    "alternateName": "Market România - Platformă de Vânzări Online",
    "description": "Serviciu de marketplace online pentru cumpărarea și vânzarea de produse în România. Include licitații online, plată la livrare, protecție cumpărător și comision de doar 8%.",
    "provider": {
      "@id": "https://www.marketplaceromania.com/#organization"
    },
    "serviceType": "Online Marketplace",
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "offers": {
      "@type": "Offer",
      "name": "Comision Vânzător",
      "description": "Comision de doar 8% din fiecare vânzare - cel mai mic din România",
      "price": "8",
      "priceCurrency": "RON",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "8",
        "priceCurrency": "RON",
        "unitText": "procent din valoarea vânzării"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicii disponibile",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Listare gratuită produse"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Licitații online"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Plată la livrare (Ramburs)"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Protecție cumpărător"
          }
        }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(marketplaceSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
    </Helmet>
  );
};
