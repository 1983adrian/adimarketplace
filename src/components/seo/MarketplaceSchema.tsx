import React from 'react';
import { Helmet } from 'react-helmet-async';

export const MarketplaceSchema: React.FC = () => {
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": "https://www.marketplaceromania.com/#store",
    "name": "Marketplace România®",
    "alternateName": [
      "Marketplace România",
      "Market Place România",
      "Market România",
      "Place România",
      "Marketplace Romania",
      "Market Place Romania",
      "Market Romania",
      "Marketplace",
      "Marketplace Online",
      "Marketplace Online România",
      "Vânzări România",
      "Cumpără Online România",
      "Licitații Online România"
    ],
    "description": "Marketplace România® - The cheapest marketplace in all of Europe with 0% sales commission. First AI-powered marketplace from Romania. Buy & sell online with auctions, secure payments, shipping across Europe. Subscriptions from only €2/month. Registered Trademark.",
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
    "paymentAccepted": ["Card de credit", "Card de debit", "Transfer bancar", "Ramburs (Plată la livrare)"],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "address": { "@type": "PostalAddress", "addressCountry": "RO", "addressLocality": "București" },
    "areaServed": [
      { "@type": "Continent", "name": "Europe" },
      { "@type": "Country", "name": "Romania" },
      { "@type": "Country", "name": "Germany" }, { "@type": "Country", "name": "France" },
      { "@type": "Country", "name": "Italy" }, { "@type": "Country", "name": "Spain" },
      { "@type": "Country", "name": "Netherlands" }, { "@type": "Country", "name": "Poland" },
      { "@type": "Country", "name": "Austria" }, { "@type": "Country", "name": "Belgium" },
      { "@type": "Country", "name": "Portugal" }, { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Switzerland" }, { "@type": "Country", "name": "Sweden" },
      { "@type": "Country", "name": "Norway" }, { "@type": "Country", "name": "Denmark" },
      { "@type": "Country", "name": "Finland" }, { "@type": "Country", "name": "Ireland" },
      { "@type": "Country", "name": "Greece" }, { "@type": "Country", "name": "Czech Republic" },
      { "@type": "Country", "name": "Hungary" }, { "@type": "Country", "name": "Bulgaria" },
      { "@type": "Country", "name": "Croatia" }, { "@type": "Country", "name": "Slovakia" },
      { "@type": "Country", "name": "Slovenia" }, { "@type": "Country", "name": "Lithuania" },
      { "@type": "Country", "name": "Latvia" }, { "@type": "Country", "name": "Estonia" }
    ],
    "sameAs": ["https://www.tiktok.com/@MarketPlaceRomania", "https://www.instagram.com/@MarketPlaceRomania"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.marketplaceromania.com/browse?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "1250", "bestRating": "5", "worstRating": "1" },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "1", "highPrice": "100000", "priceCurrency": "RON", "offerCount": "10000",
      "description": "Marketplace România - 0% comision pe vânzări. Abonamente de la 11 LEI/lună"
    },
    "keywords": [
      "Marketplace România", "Market Place România", "Marketplace Romania", "Market Place Romania",
      "Marketplace", "Market România", "Marketplace online", "Marketplace online România",
      "cheapest marketplace Europe", "0% commission marketplace", "zero commission marketplace Europe",
      "best marketplace Europe", "sell online Europe 0 commission", "European marketplace no fees",
      "marketplace Germany", "marketplace France", "marketplace Italy", "marketplace Spain",
      "marketplace Poland", "marketplace Netherlands", "marketplace UK", "marketplace Austria",
      "marketplace Belgium", "marketplace Portugal", "marketplace Greece", "marketplace Hungary",
      "marketplace Czech Republic", "marketplace Bulgaria", "marketplace Sweden", "marketplace Denmark",
      "free marketplace Europe", "no fees marketplace", "sell without commission Europe",
      "Vânzări România", "Cumpără online", "Vânzare online", "Cum vând online",
      "Licitație online", "Licitații", "Primul Marketplace construit cu AI",
      "marketplace românesc", "cel mai mare marketplace din România"
    ],
    "brand": { "@type": "Brand", "name": "Marketplace România®", "logo": "https://www.marketplaceromania.com/logo-oficial.png" }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://www.marketplaceromania.com/#service",
    "name": "Serviciu Marketplace România",
    "alternateName": "Marketplace România - Platformă de Vânzări Online",
    "description": "Marketplace România - serviciu de marketplace online pentru cumpărarea și vânzarea de produse în România. Include licitații online, plată la livrare, protecție cumpărător. 0% comision!",
    "provider": { "@id": "https://www.marketplaceromania.com/#organization" },
    "serviceType": "Online Marketplace",
    "areaServed": { "@type": "Continent", "name": "Europe" },
    "offers": {
      "@type": "Offer",
      "name": "Abonament Marketplace România",
      "description": "Marketplace România - 0% comision pe vânzări. Abonamente de la 11 LEI/lună",
      "price": "11", "priceCurrency": "RON",
      "priceSpecification": { "@type": "UnitPriceSpecification", "price": "11", "priceCurrency": "RON", "unitText": "lună" }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog", "name": "Servicii disponibile",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Listare gratuită produse" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Licitații online" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Plată la livrare (Ramburs)" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Protecție cumpărător" } }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(marketplaceSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
    </Helmet>
  );
};
