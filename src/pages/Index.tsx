import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';
import { SEOHead } from '@/components/seo/SEOHead';
import { LiveActivityFeed } from '@/components/seo/LiveActivityFeed';
import { TrustSignals } from '@/components/seo/TrustSignals';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { MarketplaceSchema } from '@/components/seo/MarketplaceSchema';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Marketplace România | Market România - Cumpără și Vinde Online"
        description="Marketplace România - cel mai mare market online din România. Place România pentru licitații, produse noi și second-hand. Livrare rapidă în toată România. Comision doar 8% - cel mai mic din România!"
        url="https://www.marketplaceromania.com"
        type="website"
      />
      {/* Schema.org JSON-LD pentru Google Knowledge Panel */}
      <OrganizationSchema />
      <MarketplaceSchema />
      <Layout>
        <HeroSection />
        <LiveActivityFeed />
        <FeaturedListings />
        <TrustSignals />
        <PromotedListings />
        <CategorySection />
        <FAQSchema showUI={true} />
      </Layout>
    </>
  );
};

export default Index;
