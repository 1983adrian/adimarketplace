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
  title = 'Market Place România® | Marketplace România - Cumpără și Vinde Online',
  description = 'Market Place România® - Primul Market Place din România construit cu AI. Marketplace România pentru vânzări online, licitații și cumpărături sigure. 0% comision!',
  image = 'https://www.marketplaceromania.com/og-image.png',
  url,
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
  // Always append "MarketPlace Romania" to titles
  const fullTitle = title.includes('Marketplace') || title.includes('Market') 
    ? title 
    : `${title} | MarketPlace Romania`;
  
  // Generate canonical URL - always use www.marketplaceromania.com
  const canonicalUrl = url 
    ? url.replace(/https?:\/\/[^/]+/, 'https://www.marketplaceromania.com')
    : `https://www.marketplaceromania.com${typeof window !== 'undefined' ? window.location.pathname : '/'}`;

  // Generate JSON-LD structured data
  const generateSchemaMarkup = () => {
    const schemas: any[] = [];

    // Organization Schema with brand keywords - Marcă Înregistrată
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Market Place România®",
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
        "www.marketplaceromania.com"
      ],
      "url": "https://www.marketplaceromania.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.marketplaceromania.com/logo-oficial.png",
        "width": "512",
        "height": "512",
        "caption": "Marketplace România® - Logo Oficial Marcă Înregistrată"
      },
      "description": "Market Place România® - Primul Market Place din România construit cu AI. Cel mai mare market place online românesc. 0% comision, abonamente de la 11 LEI/lună. Marcă Înregistrată.",
      "slogan": "Market Place România® - Primul Market Place construit cu AI! Cumpără și Vinde Online cu 0% Comision",
      "sameAs": [
        "https://www.facebook.com/marketplaceromania",
        "https://www.instagram.com/marketplaceromania",
        "https://www.tiktok.com/@marketplaceromania"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "availableLanguage": ["Romanian", "English"]
      },
      "knowsAbout": [
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
        "Primul Market Place construit cu AI"
      ],
      "brand": {
        "@type": "Brand",
        "name": "Market Place România®",
        "logo": "https://www.marketplaceromania.com/logo-oficial.png"
      }
    });

    // WebSite Schema with SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Marketplace România",
      "url": "https://www.marketplaceromania.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.marketplaceromania.com/browse?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });

    // Product Schema (when applicable) - Google Search Console compliant
    if (type === 'product') {
      // Ensure price is a valid number for Schema.org
      const validPrice = price !== undefined && price !== null ? Number(price) : 0;
      const formattedPrice = validPrice.toFixed(2);
      
      // Map availability to full Schema.org URLs (required by Google)
      const availabilityMap: Record<string, string> = {
        'InStock': 'https://schema.org/InStock',
        'OutOfStock': 'https://schema.org/OutOfStock',
        'PreOrder': 'https://schema.org/PreOrder',
        'Discontinued': 'https://schema.org/Discontinued',
        'SoldOut': 'https://schema.org/SoldOut'
      };
      const schemaAvailability = availabilityMap[availability] || 'https://schema.org/InStock';
      
      // Validate currency (must be 3-letter ISO 4217 code)
      const validCurrency = ['RON', 'EUR', 'GBP', 'USD'].includes(currency) ? currency : 'RON';

      const productSchema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title,
        "description": description,
        "image": image,
        "url": url,
        "sku": url.split('/').pop() || 'unknown', // Use listing ID as SKU
        "brand": {
          "@type": "Brand",
          "name": "Marketplace România"
        },
        "offers": {
          "@type": "Offer",
          "url": url,
          "price": formattedPrice,
          "priceCurrency": validCurrency,
          "availability": schemaAvailability,
          "itemCondition": "https://schema.org/UsedCondition",
          "seller": {
            "@type": "Organization",
            "name": "Marketplace România",
            "url": "https://www.marketplaceromania.com"
          }
        }
      };

      // Add auction-specific data
      if (isAuction && auctionEndDate) {
        productSchema.offers.priceValidUntil = auctionEndDate;
        productSchema.offers.availabilityEnds = auctionEndDate;
        
        // Add Auction schema as Event
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
            "url": url,
            "price": (startingBid || validPrice).toFixed(2),
            "priceCurrency": validCurrency,
            "availability": "https://schema.org/InStock"
          },
          "organizer": {
            "@type": "Organization",
            "name": "Marketplace România",
            "url": "https://www.marketplaceromania.com"
          }
        });
      }

      // Add reviews if available
      if (rating && reviewCount && reviewCount > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": Number(rating).toFixed(1),
          "reviewCount": reviewCount,
          "bestRating": "5",
          "worstRating": "1"
        };
      }

      schemas.push(productSchema);
    }

    // Breadcrumb Schema
    if (url !== 'https://www.marketplaceromania.com') {
      const pathParts = url.replace('https://www.marketplaceromania.com', '').split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const breadcrumbItems = [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Acasă",
            "item": "https://www.marketplaceromania.com"
          }
        ];
        
        let currentPath = 'https://www.marketplaceromania.com';
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
      
      {/* Self-referencing Canonical URL - Critical for SEO */}
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MarketPlace Romania" />
      <meta property="og:locale" content="ro_RO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
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
