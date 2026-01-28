CREATE OR REPLACE FUNCTION public.queue_listing_for_indexing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.seo_indexing_queue (url, action, listing_id, priority)
    VALUES (
      'https://www.marketplaceromania.com/listing/' || NEW.id,
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
      'https://www.marketplaceromania.com/listing/' || OLD.id,
      'URL_DELETED',
      10
    )
    ON CONFLICT DO NOTHING;
    RETURN OLD;
  END IF;
END;
$function$;