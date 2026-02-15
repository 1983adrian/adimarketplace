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
import CityLandingSection from '@/components/seo/CityLandingSection';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Market Place România® | Marketplace România - Cumpără și Vinde Online | Primul Market Place construit cu AI"
        description="Market Place România® - Primul Market Place din România construit cu AI. Marketplace România pentru vânzări online, licitații online, cumpără online. 0% comision! Market Place România - cel mai mare market place online românesc. Abonamente de la 11 LEI/lună. Marcă Înregistrată."
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
        <CityLandingSection />
        <FAQSchema showUI={true} />
      </Layout>
    </>
  );
};

export default Index;
