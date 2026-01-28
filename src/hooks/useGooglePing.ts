import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGooglePing = () => {
  const pingNewListing = useCallback(async (listingId: string) => {
    try {
      const url = `https://marketplaceromania.com/listing/${listingId}`;
      
      await supabase.functions.invoke('ping-google', {
        body: { url, type: 'URL_UPDATED' }
      });
      
      console.log('Google ping sent for:', url);
    } catch (error) {
      // Silent fail - don't break user flow for SEO ping
      console.warn('Google ping failed:', error);
    }
  }, []);

  const pingSitemap = useCallback(async () => {
    try {
      await supabase.functions.invoke('ping-google', {
        body: { url: 'https://marketplaceromania.com/sitemap.xml', type: 'URL_UPDATED' }
      });
      
      console.log('Sitemap ping sent to Google');
    } catch (error) {
      console.warn('Sitemap ping failed:', error);
    }
  }, []);

  return { pingNewListing, pingSitemap };
};
