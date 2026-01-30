import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Brand Schema for "Marketplace România"
 * This component adds official Brand structured data to help Google
 * recognize "Marketplace România" as a distinct Romanian brand.
 * 
 * SEO Keywords: Marketplace România, Market România, Place România, Market Place România
 */
export const BrandSchema: React.FC = () => {
  // Official Brand Schema - tells Google this is a registered brand
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "Marketplace România",
    "alternateName": [
      "Market România",
      "Place România", 
      "Market Place România",
      "MarketplaceRomania",
      "Marketplace RO",
      "Market RO",
      "Market Place RO",
      "Market Place",
      "www.marketplaceromania.com"
    ],
    "description": "Marketplace România este brandul oficial al celui mai mare market online 100% românesc. Cunoscut și ca Market România sau Place România, oferim o platformă sigură pentru cumpărături și vânzări online cu cel mai mic comision din România (8%).",
    "url": "https://www.marketplaceromania.com",
    "logo": "https://www.marketplaceromania.com/logo-oficial.png",
    "image": "https://www.marketplaceromania.com/og-image.png",
    "slogan": "Marketplace România - Cumpără, Vinde, Licitează!",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "București, România",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "RO",
        "addressLocality": "București"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "sameAs": [
      "https://www.tiktok.com/@MarketPlaceRomania",
      "https://www.instagram.com/MarketPlaceRomania"
    ]
  };

  // Corporation Schema - establishes business identity
  const corporationSchema = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    "name": "Marketplace România",
    "legalName": "Marketplace România SRL",
    "alternateName": [
      "Market România",
      "Place România",
      "Market Place România",
      "MarketplaceRomania"
    ],
    "brand": {
      "@type": "Brand",
      "name": "Marketplace România"
    },
    "url": "https://www.marketplaceromania.com",
    "logo": "https://www.marketplaceromania.com/logo-oficial.png",
    "description": "Marketplace România - Cel mai mare market online din România cu cel mai mic comision (8%). Alternativă românească la Facebook Marketplace, OLX și eBay.",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "România"
    },
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "knowsAbout": [
      "e-commerce",
      "marketplace",
      "online shopping Romania",
      "vanzari online",
      "licitatii online",
      "second hand Romania"
    ],
    "slogan": "Market România pentru cumpărături și vânzări sigure"
  };

  // Service Schema - defines the marketplace service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Marketplace România - Platformă de Vânzări Online",
    "alternateName": "Market România Online",
    "description": "Serviciu de marketplace online pentru cumpărarea și vânzarea de produse în România. Market România oferă licitații online, plată la livrare și protecție cumpărător.",
    "provider": {
      "@type": "Organization",
      "name": "Marketplace România",
      "url": "https://www.marketplaceromania.com"
    },
    "serviceType": "Online Marketplace",
    "areaServed": {
      "@type": "Country",
      "name": "România"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Produse Marketplace România",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Electronică și IT"
        },
        {
          "@type": "OfferCatalog",
          "name": "Modă și Accesorii"
        },
        {
          "@type": "OfferCatalog",
          "name": "Casa și Grădină"
        },
        {
          "@type": "OfferCatalog",
          "name": "Auto și Moto"
        }
      ]
    },
    "offers": {
      "@type": "Offer",
      "description": "Comision de doar 8% - cel mai mic din România",
      "price": "8",
      "priceCurrency": "RON",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "8",
        "priceCurrency": "RON",
        "unitText": "procent din vânzare"
      }
    }
  };

  // WebApplication Schema - for PWA/App recognition
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Marketplace România",
    "alternateName": ["Market România App", "Place România App"],
    "applicationCategory": "ShoppingApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.marketplaceromania.com",
    "description": "Aplicația oficială Marketplace România pentru cumpărături și vânzări online în România.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON"
    },
    "author": {
      "@type": "Organization",
      "name": "Marketplace România"
    },
    "screenshot": "https://www.marketplaceromania.com/screenshots/home-mobile.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(brandSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(corporationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </script>
    </Helmet>
  );
};
