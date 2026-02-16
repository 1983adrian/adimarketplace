
-- Fix SEO indexing trigger to use correct domain
CREATE OR REPLACE FUNCTION public.track_listing_for_indexing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.seo_indexing_queue (url, action, listing_id, priority)
    VALUES (
      'https://www.marketplaceromania.com/listing/' || NEW.id,
      'URL_UPDATED',
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 10 ELSE 5 END
    )
    ON CONFLICT (url) DO UPDATE SET
      action = 'URL_UPDATED',
      priority = EXCLUDED.priority,
      created_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.seo_indexing_queue (url, action, priority)
    VALUES (
      'https://www.marketplaceromania.com/listing/' || OLD.id,
      'URL_DELETED',
      10
    )
    ON CONFLICT (url) DO UPDATE SET
      action = 'URL_DELETED',
      priority = 10,
      created_at = now();
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
