
-- Fix fraud_alerts FK to SET NULL on delete
ALTER TABLE public.fraud_alerts DROP CONSTRAINT IF EXISTS fraud_alerts_listing_id_fkey;
ALTER TABLE public.fraud_alerts ADD CONSTRAINT fraud_alerts_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;
