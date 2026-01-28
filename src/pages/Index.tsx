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
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Marketplace România - Cumpără și Vinde Online | Alternativă OLX & eBay"
        description="Marketplace românesc pentru cumpărături și vânzări online. Licitații, produse noi și second-hand. Livrare rapidă în toată România. Comision doar 8%. Cel mai mic comision din România!"
        url="https://www.marketplaceromania.com"
        type="website"
      />
      <LocalBusinessSchema />
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
