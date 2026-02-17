
-- OPTIMIZE FOR 1M+ PRODUCTS

-- 1. Set file size limit on listings bucket (5MB max per image)
UPDATE storage.buckets 
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
WHERE id = 'listings';

-- 2. Description text search index
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm 
ON listings USING gin (description gin_trgm_ops);

-- 3. Cursor-based pagination index
CREATE INDEX IF NOT EXISTS idx_listings_browse_cursor 
ON listings (created_at DESC, id DESC) WHERE is_active = true AND is_sold = false;

-- 4. Category + price range combo
CREATE INDEX IF NOT EXISTS idx_listings_category_price_range 
ON listings (category_id, price) WHERE is_active = true AND is_sold = false;

-- 5. Sold items archive
CREATE INDEX IF NOT EXISTS idx_listings_sold 
ON listings (seller_id, updated_at DESC) WHERE is_sold = true;

-- 6. Category counts function
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE(category_id uuid, listing_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT category_id, COUNT(*) as listing_count
  FROM listings
  WHERE is_active = true AND is_sold = false AND category_id IS NOT NULL
  GROUP BY category_id;
$$;
