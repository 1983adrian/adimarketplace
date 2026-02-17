import React from 'react';
import { Helmet } from 'react-helmet-async';

const brandImages = [
  {
    url: "https://www.marketplaceromania.com/images/brand/marketplace-romania-logo-dark.png",
    name: "Logo Marketplace România® pe fundal închis - Marketplace Online România",
    description: "Logo oficial Marketplace România® - Primul marketplace din România construit cu AI. Platformă de vânzări online, licitații și cumpărături sigure cu 0% comision.",
    alt: "Marketplace România® Logo Oficial - Marketplace Online România | Vinde Cumpără Licitează",
    width: 1500,
    height: 1000
  },
  {
    url: "https://www.marketplaceromania.com/images/brand/marketplace-romania-logo-light.png",
    name: "Logo Marketplace România® pe fundal deschis - Marketplace România Vinde Cumpără Licitează",
    description: "Logo oficial Marketplace România® varianta pe fundal alb. Marketplace online românesc pentru vânzări, cumpărături și licitații online cu 0% comision.",
    alt: "Marketplace România® Logo - Marketplace Online România pe Fundal Alb | Vinde Cumpără Licitează",
    width: 1440,
    height: 900
  },
  {
    url: "https://www.marketplaceromania.com/images/brand/marketplace-romania-logo-banner-light.jpeg",
    name: "Banner Marketplace România® - Marketplace Online România cu 0% Comision",
    description: "Banner oficial Marketplace România® pe fundal deschis. Primul market place din România construit cu inteligență artificială. Abonamente de la 11 LEI/lună.",
    alt: "Marketplace România® Banner Oficial - Market Place România Online | 0% Comision | AI Marketplace",
    width: 1200,
    height: 400
  },
  {
    url: "https://www.marketplaceromania.com/images/brand/marketplace-romania-logo-banner-dark.jpeg",
    name: "Banner Marketplace România® pe fundal închis - Marketplace Online România",
    description: "Banner oficial Marketplace România® varianta dark. Platformă de e-commerce românească pentru vânzări online, licitații și cumpărături sigure.",
    alt: "Marketplace România® Banner Dark - Market Place România | Vinde Cumpără Licitează Online",
    width: 1200,
    height: 400
  }
];

export const BrandImagesSchema: React.FC = () => {
  const schemas = brandImages.map((img) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": img.url,
    "url": img.url,
    "name": img.name,
    "description": img.description,
    "alternateName": img.alt,
    "width": { "@type": "QuantitativeValue", "value": img.width, "unitCode": "E37" },
    "height": { "@type": "QuantitativeValue", "value": img.height, "unitCode": "E37" },
    "encodingFormat": img.url.endsWith('.png') ? "image/png" : "image/jpeg",
    "author": {
      "@type": "Organization",
      "name": "Marketplace România®",
      "url": "https://www.marketplaceromania.com"
    },
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Marketplace România®",
      "url": "https://www.marketplaceromania.com"
    },
    "copyrightYear": 2025,
    "copyrightNotice": "© 2025 Marketplace România®. Toate drepturile rezervate.",
    "creditText": "Marketplace România® - www.marketplaceromania.com",
    "license": "https://www.marketplaceromania.com/terms",
    "acquireLicensePage": "https://www.marketplaceromania.com/contact",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Marketplace România®",
      "url": "https://www.marketplaceromania.com"
    }
  }));

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={`brand-img-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
