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
import { BrandImagesSchema } from '@/components/seo/BrandImagesSchema';
import CityLandingSection from '@/components/seo/CityLandingSection';
import { SellCTASection } from '@/components/home/SellCTASection';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Marketplace România® | Cheapest Marketplace in Europe — 0% Commission | Cumpără și Vinde Online"
        description="Marketplace România® - The cheapest marketplace in Europe with 0% sales commission. Primul Marketplace din România construit cu AI. Buy & sell online, auctions, secure payments. Subscriptions from €2/month. Ship across all EU countries! Marcă Înregistrată."
        url="https://www.marketplaceromania.com"
        type="website"
      />
      {/* Schema.org JSON-LD pentru Google Knowledge Panel */}
      <OrganizationSchema />
      <MarketplaceSchema />
      <BrandImagesSchema />
      <Layout>
        <HeroSection />
        <FeaturedListings />
        <PromotedListings />
        <CategorySection />
        <SellCTASection />
        <CityLandingSection />
        <FAQSchema showUI={true} />
      </Layout>
    </>
  );
};

export default Index;
