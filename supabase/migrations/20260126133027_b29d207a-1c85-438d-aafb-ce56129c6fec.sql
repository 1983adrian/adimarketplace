
-- =============================================
-- PLATFORM UPGRADE v2.0 - Database Enhancement
-- =============================================

-- 1. SEO Indexing Queue - tracks content for Google indexing
CREATE TABLE IF NOT EXISTS public.seo_indexing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'URL_UPDATED', -- URL_UPDATED, URL_DELETED
  status TEXT NOT NULL DEFAULT 'pending', -- pending, submitted, indexed, failed
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  indexed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Platform Activity Log - tracks all platform activity for SEO freshness signals
CREATE TABLE IF NOT EXISTS public.platform_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- listing_created, listing_updated, user_registered, order_completed, review_added
  entity_type TEXT NOT NULL, -- listing, user, order, review
  entity_id UUID,
  user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true, -- can be shown in activity feed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. SEO Keywords Tracking - monitor keyword performance
CREATE TABLE IF NOT EXISTS public.seo_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  search_volume INTEGER DEFAULT 0,
  current_rank INTEGER,
  target_rank INTEGER DEFAULT 10,
  category TEXT, -- marketplace, auction, buy, sell
  is_primary BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Dynamic Sitemap Entries - for real-time sitemap generation
CREATE TABLE IF NOT EXISTS public.sitemap_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  changefreq TEXT DEFAULT 'daily', -- always, hourly, daily, weekly, monthly, yearly, never
  priority NUMERIC(2,1) DEFAULT 0.5,
  lastmod TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entry_type TEXT NOT NULL, -- static, listing, category, seller
  entity_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Platform Statistics Cache - for faster dashboard loading
CREATE TABLE IF NOT EXISTS public.platform_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Content Freshness Signals - helps Google detect fresh content
CREATE TABLE IF NOT EXISTS public.content_freshness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- homepage, browse, category
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  update_frequency TEXT DEFAULT 'hourly',
  items_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all new tables
ALTER TABLE public.seo_indexing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitemap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_freshness ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- SEO Indexing Queue - Admin only
CREATE POLICY "Admins can manage SEO indexing queue"
  ON public.seo_indexing_queue FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Platform Activity - Public read, admin write
CREATE POLICY "Anyone can view public activity"
  ON public.platform_activity FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage all activity"
  ON public.platform_activity FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- SEO Keywords - Admin only
CREATE POLICY "Admins can manage SEO keywords"
  ON public.seo_keywords FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Sitemap Entries - Public read, admin write
CREATE POLICY "Anyone can view active sitemap entries"
  ON public.sitemap_entries FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage sitemap entries"
  ON public.sitemap_entries FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Platform Statistics - Public read, admin write
CREATE POLICY "Anyone can view statistics"
  ON public.platform_statistics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage statistics"
  ON public.platform_statistics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Content Freshness - Public read, admin write
CREATE POLICY "Anyone can view content freshness"
  ON public.content_freshness FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage content freshness"
  ON public.content_freshness FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_indexing_queue_status ON public.seo_indexing_queue(status);
CREATE INDEX IF NOT EXISTS idx_seo_indexing_queue_priority ON public.seo_indexing_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_platform_activity_type ON public.platform_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_platform_activity_created ON public.platform_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_type ON public.sitemap_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_keyword ON public.seo_keywords(keyword);

-- Insert initial SEO keywords for Romanian marketplace
INSERT INTO public.seo_keywords (keyword, category, is_primary, target_rank) VALUES
  ('marketplace romania', 'marketplace', true, 1),
  ('marketplace', 'marketplace', true, 3),
  ('licitatii online', 'auction', true, 1),
  ('licitatii', 'auction', true, 3),
  ('cumpar online', 'buy', true, 5),
  ('vand online', 'sell', true, 5),
  ('platforma vanzari', 'marketplace', false, 10),
  ('anunturi romania', 'marketplace', false, 10),
  ('cumparaturi online romania', 'buy', false, 10),
  ('vanzari online romania', 'sell', false, 10)
ON CONFLICT (keyword) DO NOTHING;

-- Insert initial content freshness tracking
INSERT INTO public.content_freshness (content_type, update_frequency, items_count) VALUES
  ('homepage', 'hourly', 0),
  ('browse', 'hourly', 0),
  ('categories', 'daily', 0),
  ('sellers', 'daily', 0)
ON CONFLICT DO NOTHING;

-- Function to auto-queue listings for indexing
CREATE OR REPLACE FUNCTION public.queue_listing_for_indexing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.seo_indexing_queue (url, action, listing_id, priority)
    VALUES (
      'https://marketplaceromania.lovable.app/listing/' || NEW.id,
      'URL_UPDATED',
      NEW.id,
      CASE WHEN NEW.is_active THEN 8 ELSE 3 END
    )
    ON CONFLICT DO NOTHING;
    
    -- Log activity
    INSERT INTO public.platform_activity (activity_type, entity_type, entity_id, user_id, metadata)
    VALUES (
      CASE WHEN TG_OP = 'INSERT' THEN 'listing_created' ELSE 'listing_updated' END,
      'listing',
      NEW.id,
      NEW.seller_id,
      jsonb_build_object('title', NEW.title, 'price', NEW.price)
    );
    
    -- Update content freshness
    UPDATE public.content_freshness 
    SET last_updated_at = now(), 
        items_count = items_count + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END
    WHERE content_type = 'browse';
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.seo_indexing_queue (url, action, priority)
    VALUES (
      'https://marketplaceromania.lovable.app/listing/' || OLD.id,
      'URL_DELETED',
      10
    )
    ON CONFLICT DO NOTHING;
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger for auto-indexing
DROP TRIGGER IF EXISTS trigger_queue_listing_indexing ON public.listings;
CREATE TRIGGER trigger_queue_listing_indexing
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_listing_for_indexing();

-- Function to update platform statistics
CREATE OR REPLACE FUNCTION public.refresh_platform_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_listings', (SELECT COUNT(*) FROM listings WHERE is_active = true),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_sellers', (SELECT COUNT(*) FROM profiles WHERE is_seller = true),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'active_auctions', (SELECT COUNT(*) FROM listings WHERE listing_type = 'auction' AND is_active = true AND auction_end_date > now()),
    'updated_at', now()
  ) INTO stats;
  
  INSERT INTO public.platform_statistics (stat_key, stat_value, calculated_at, expires_at)
  VALUES ('dashboard_stats', stats, now(), now() + interval '1 hour')
  ON CONFLICT (stat_key) DO UPDATE SET 
    stat_value = EXCLUDED.stat_value,
    calculated_at = EXCLUDED.calculated_at,
    expires_at = EXCLUDED.expires_at;
END;
$$;
