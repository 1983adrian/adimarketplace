import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedListings />
      <PromotedListings />
      <CategorySection />
    </Layout>
  );
};

export default Index;
