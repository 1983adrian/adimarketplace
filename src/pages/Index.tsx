import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';
import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { MarketplaceSchema } from '@/components/seo/MarketplaceSchema';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Marketplace România® | Market România - Cumpără și Vinde Online | Primul Market Place construit cu AI"
        description="Marketplace România® - Primul Market Place din România construit cu AI. Cel mai mare market online pentru vânzări România, licitații online, cumpără online și vânzare online. Comision doar 8% - cel mai mic din România! Vreau să vând online? Aici este locul! Marcă Înregistrată."
        url="https://www.marketplaceromania.com"
        type="website"
      />
      {/* Schema.org JSON-LD pentru Google Knowledge Panel */}
      <OrganizationSchema />
      <MarketplaceSchema />
      <Layout>
        <HeroSection />
        <FeaturedListings />
        <PromotedListings />
        <CategorySection />
        <FAQSchema showUI={true} />
      </Layout>
    </>
  );
};

export default Index;
