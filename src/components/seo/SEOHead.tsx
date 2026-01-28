import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
  isAuction?: boolean;
  auctionEndDate?: string;
  startingBid?: number;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Marketplace România - Cumpără și Vinde Online',
  description = 'Platformă de licitații și vânzări directe cu taxe mici (8%). Cumpără și vinde produse la cel mai bun preț în România.',
  image = 'https://marketplaceromania.com/og-image.png',
  url = 'https://marketplaceromania.com',
  type = 'website',
  price,
  currency = 'RON',
  availability = 'InStock',
  rating,
  reviewCount,
  isAuction = false,
  auctionEndDate,
  startingBid,
  noindex = false
}) => {
  const fullTitle = title.includes('Marketplace') ? title : `${title} | Marketplace România`;

  // Generate JSON-LD structured data
  const generateSchemaMarkup = () => {
    const schemas: any[] = [];

    // Organization Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Marketplace România",
      "alternateName": "C Market România",
      "url": "https://marketplaceromania.com",
      "logo": "https://marketplaceromania.com/icons/icon-512x512.png",
      "sameAs": [
        "https://www.facebook.com/marketplaceromania",
        "https://www.instagram.com/marketplaceromania",
        "https://www.tiktok.com/@marketplaceromania"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "availableLanguage": ["Romanian", "English"]
      }
    });

    // WebSite Schema with SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Marketplace România",
      "url": "https://marketplaceromania.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://marketplaceromania.com/browse?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });

    // Product Schema (when applicable)
    if (type === 'product' && price) {
      const productSchema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title,
        "description": description,
        "image": image,
        "url": url,
        "offers": {
          "@type": isAuction ? "AggregateOffer" : "Offer",
          "price": price,
          "priceCurrency": currency,
          "availability": `https://schema.org/${availability}`,
          "seller": {
            "@type": "Organization",
            "name": "Marketplace România"
          }
        }
      };

      // Add auction-specific data
      if (isAuction && auctionEndDate) {
        productSchema.offers["@type"] = "Offer";
        productSchema.offers.priceValidUntil = auctionEndDate;
        productSchema.offers.availabilityEnds = auctionEndDate;
        
        // Add Auction schema
        schemas.push({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": `Licitație: ${title}`,
          "description": description,
          "image": image,
          "url": url,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
          "endDate": auctionEndDate,
          "offers": {
            "@type": "Offer",
            "price": startingBid || price,
            "priceCurrency": currency,
            "availability": "https://schema.org/InStock"
          },
          "organizer": {
            "@type": "Organization",
            "name": "Marketplace România",
            "url": "https://marketplaceromania.com"
          }
        });
      }

      // Add reviews if available
      if (rating && reviewCount && reviewCount > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": rating,
          "reviewCount": reviewCount,
          "bestRating": 5,
          "worstRating": 1
        };
      }

      schemas.push(productSchema);
    }

    // Breadcrumb Schema
    if (url !== 'https://marketplaceromania.com') {
      const pathParts = url.replace('https://marketplaceromania.com', '').split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const breadcrumbItems = [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Acasă",
            "item": "https://marketplaceromania.com"
          }
        ];
        
        let currentPath = 'https://marketplaceromania.lovable.app';
        pathParts.forEach((part, index) => {
          currentPath += `/${part}`;
          breadcrumbItems.push({
            "@type": "ListItem",
            "position": index + 2,
            "name": part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
            "item": currentPath
          });
        });

        schemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbItems
        });
      }
    }

    return schemas;
  };

  const schemas = generateSchemaMarkup();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Marketplace România" />
      <meta property="og:locale" content="ro_RO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Product-specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={String(price)} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability.toLowerCase()} />
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
