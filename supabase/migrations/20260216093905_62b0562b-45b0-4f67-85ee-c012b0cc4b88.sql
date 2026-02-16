
-- Allow admins to delete listings
CREATE POLICY "Admins can delete any listing"
ON public.listings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage listing_images (currently only seller can)
CREATE POLICY "Admins can manage all listing images"
ON public.listing_images FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete favorites for any listing
CREATE POLICY "Admins can delete any favorites"
ON public.favorites FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete bids
CREATE POLICY "Admins can delete bids"
ON public.bids FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete price_history
CREATE POLICY "Admins can delete price history"
ON public.price_history FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Set listing_id to NULL in orders when listing is deleted (avoid FK block)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_listing_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;

-- Set listing_id CASCADE for conversations
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_listing_id_fkey;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

-- Allow admins to manage seo_indexing_queue
CREATE POLICY "Admins can delete seo indexing queue"
ON public.seo_indexing_queue FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete fraud_alerts related to listings
CREATE POLICY "Admins can delete fraud alerts"
ON public.fraud_alerts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
