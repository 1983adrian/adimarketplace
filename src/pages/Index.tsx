import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { PromotedListings } from '@/components/home/PromotedListings';
import { HowItWorks } from '@/components/home/HowItWorks';
import { NewsletterPopup } from '@/components/marketing/NewsletterPopup';

const Index = () => {
  return (
    <Layout>
      <NewsletterPopup />
      <HeroSection />
      <FeaturedListings />
      <PromotedListings />
      <CategorySection />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
