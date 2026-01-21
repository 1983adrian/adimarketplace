import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustBadges } from '@/components/home/TrustBadges';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedListings />
      <PromotedListings />
      <TrustBadges />
      <CategorySection />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
