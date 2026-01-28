import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';
import { SEOHead } from '@/components/seo/SEOHead';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Marketplace România - Cumpără și Vinde Online | Alternativă OLX & eBay"
        description="Marketplace românesc pentru cumpărături și vânzări online. Licitații, produse noi și second-hand. Livrare rapidă în toată România. Comision doar 8%."
        url="https://marketplaceromania.lovable.app"
        type="website"
      />
      <Layout>
        <HeroSection />
        <FeaturedListings />
        <PromotedListings />
        <CategorySection />
      </Layout>
    </>
  );
};

export default Index;
