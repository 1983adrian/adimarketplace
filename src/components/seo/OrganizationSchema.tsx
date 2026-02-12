import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Organization Schema - Definește identitatea oficială a platformei pentru Google
 * Acest schema este CRITIC pentru Knowledge Panel și recunoașterea brandului
 */
export const OrganizationSchema: React.FC = () => {
  // Organization Schema - Cine suntem
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.marketplaceromania.com/#organization",
    "name": "Market Place România",
    "legalName": "Market Place România SRL",
    "alternateName": [
      "Market Place România",
      "Marketplace România",
      "Market România",
      "Place România",
      "Market Place Romania",
      "Marketplace Romania",
      "Market Romania",
      "MarketPlaceRomania",
      "MarketplaceRomania",
      "Market Place RO",
      "Marketplace RO",
      "Market RO",
      "Market Place",
      "Market Place Online România"
    ],
    "url": "https://www.marketplaceromania.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.marketplaceromania.com/logo-oficial.png",
      "width": "512",
      "height": "512",
      "caption": "Marketplace România® - Logo Oficial Marcă Înregistrată",
      "copyrightHolder": {
        "@type": "Organization",
        "name": "Marketplace România"
      },
      "license": "https://www.marketplaceromania.com/terms-of-service"
    },
    "image": "https://www.marketplaceromania.com/logo-oficial.png",
    "description": "Market Place România® - Primul Market Place din România construit cu AI. Market Place România - cel mai mare market place online românesc. 0% comision, abonamente de la 11 LEI/lună. Marcă Înregistrată.",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "București, România"
    },
    "slogan": "Market Place România® - Primul Market Place construit cu AI! Cumpără, Vinde, Licitează!",
    "email": "Adrianchirita01@gmail.com",
    "telephone": "+40 7949 421640",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+40 7949 421640",
      "email": "Adrianchirita01@gmail.com",
      "contactType": "customer service",
      "areaServed": "RO",
      "availableLanguage": ["Romanian", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RO",
      "addressLocality": "București",
      "addressRegion": "București"
    },
    "areaServed": {
      "@type": "Country",
      "name": "România",
      "sameAs": "https://en.wikipedia.org/wiki/Romania"
    },
    "sameAs": [
      "https://www.tiktok.com/@MarketPlaceRomania",
      "https://www.instagram.com/MarketPlaceRomania"
    ],
    "knowsAbout": [
      "Market Place România",
      "Market Place Romania",
      "Market Place",
      "Market Place online",
      "Market Place online România",
      "Marketplace România",
      "Market România",
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
      "cel mai mare market place din România",
      "market place românesc",
      "e-commerce România",
      "marketplace online România",
      "cumpărături online România",
      "vânzări online România",
      "licitații online România",
      "second hand România",
      "marketplace AI",
      "vând cumpăr online"
    ],
    "brand": {
      "@type": "Brand",
      "name": "Market Place România®",
      "logo": "https://www.marketplaceromania.com/logo-oficial.png",
      "slogan": "Primul Market Place din România construit cu AI",
      "description": "Market Place România® este marca înregistrată oficială pentru cel mai mare market place online din România."
    }
  };

  // WebSite Schema - Ce oferim și cum să cauți
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.marketplaceromania.com/#website",
    "name": "Market Place România",
    "alternateName": ["Market Place România", "Marketplace România", "Market România", "Place România"],
    "url": "https://www.marketplaceromania.com",
    "description": "Market Place România - primul market place online din România construit cu AI. 0% comision, abonamente accesibile.",
    "publisher": {
      "@id": "https://www.marketplaceromania.com/#organization"
    },
    "inLanguage": "ro-RO",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.marketplaceromania.com/browse?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // WebPage Schema - Pagina principală
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.marketplaceromania.com/#webpage",
    "url": "https://www.marketplaceromania.com",
    "name": "Market Place România® | Marketplace România - Cumpără și Vinde Online",
    "description": "Market Place România - cel mai mare market place online din România. Marketplace România pentru licitații, produse noi și second-hand. 0% comision pe vânzări!",
    "isPartOf": {
      "@id": "https://www.marketplaceromania.com/#website"
    },
    "about": {
      "@id": "https://www.marketplaceromania.com/#organization"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://www.marketplaceromania.com/logo-oficial.png"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Acasă",
          "item": "https://www.marketplaceromania.com"
        }
      ]
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".hero-description"]
    },
    "inLanguage": "ro-RO"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
    </Helmet>
  );
};
