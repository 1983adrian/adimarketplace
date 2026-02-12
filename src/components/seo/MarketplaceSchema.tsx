import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Marketplace Schema - Definește CE găzduiește platforma
 * Acest schema descrie serviciul de marketplace pentru Google
 */
export const MarketplaceSchema: React.FC = () => {
  // OnlineStore / Marketplace Schema - Marcă Înregistrată
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": "https://www.marketplaceromania.com/#store",
    "name": "Market Place România®",
    "alternateName": [
      "Market Place România",
      "Marketplace România",
      "Market România",
      "Place România", 
      "Market Place Romania",
      "Marketplace Romania",
      "Market Romania",
      "Market Place",
      "Market Place Online",
      "Market Place Online România",
      "Vânzări România",
      "Cumpără Online România",
      "Licitații Online România"
    ],
    "description": "Market Place România® - Primul Market Place din România construit cu AI. Cel mai mare market place online 100% românesc. Marketplace România pentru cumpărături și vânzări online cu licitații integrate. 0% comision! Marcă Înregistrată.",
    "url": "https://www.marketplaceromania.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.marketplaceromania.com/logo-oficial.png",
      "width": "512",
      "height": "512",
      "caption": "Marketplace România® - Logo Oficial Marcă Înregistrată"
    },
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
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.marketplaceromania.com/browse?q={search_term_string}",
      "query-input": "required name=search_term_string"
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
      "description": "Market Place România - 0% comision pe vânzări. Abonamente de la 11 LEI/lună"
    },
    "keywords": [
      "Market Place România",
      "Market Place Romania",
      "Market Place",
      "Marketplace România",
      "Market România", 
      "Market Place online",
      "Market Place online România",
      "Vânzări România",
      "Cumpără online",
      "Vânzare online",
      "Cum vând online",
      "Licitație online",
      "Licitații",
      "Vinde la licitații",
      "Vreau să vând online",
      "Unde să vând pe net",
      "Primul Market Place construit cu AI",
      "market place românesc",
      "cel mai mare market place din România"
    ],
    "brand": {
      "@type": "Brand",
      "name": "Market Place România®",
      "logo": "https://www.marketplaceromania.com/logo-oficial.png"
    }
  };

  // Service Schema - Descrierea serviciului de marketplace
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://www.marketplaceromania.com/#service",
    "name": "Serviciu Market Place România",
    "alternateName": "Market Place România - Platformă de Vânzări Online",
    "description": "Market Place România - serviciu de marketplace online pentru cumpărarea și vânzarea de produse în România. Include licitații online, plată la livrare, protecție cumpărător. 0% comision!",
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
      "name": "Abonament Market Place România",
      "description": "Market Place România - 0% comision pe vânzări. Abonamente de la 11 LEI/lună",
      "price": "11",
      "priceCurrency": "RON",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "11",
        "priceCurrency": "RON",
        "unitText": "lună"
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
