-- 1. Add last_activity_at column to profiles for tracking inactivity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Create index for efficient querying of inactive users
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles (last_activity_at);

-- 3. Create index for efficient querying of old messages
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);

-- 4. Update max_listings default to NULL (unlimited)
ALTER TABLE public.profiles 
ALTER COLUMN max_listings DROP DEFAULT;

-- 5. Update existing users to have unlimited listings (NULL = unlimited)
UPDATE public.profiles SET max_listings = NULL WHERE max_listings = 10;

-- 6. Create function to update last activity
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_activity_at = now() 
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Add columns for top seller badge (tracked via sales count and rating)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- 8. Create function to get top 10 sellers by sales
CREATE OR REPLACE FUNCTION public.get_top_sellers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  store_name TEXT,
  is_verified BOOLEAN,
  total_sales INTEGER,
  avg_rating NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.store_name,
    p.is_verified,
    COALESCE(p.total_sales_count, 0) as total_sales,
    COALESCE(p.average_rating, 0) as avg_rating
  FROM profiles p
  WHERE p.is_seller = true 
    AND p.total_sales_count > 0
  ORDER BY p.total_sales_count DESC, p.average_rating DESC
  LIMIT limit_count;
$$;

-- 9. Create function to check if user is in top 10 sellers
CREATE OR REPLACE FUNCTION public.is_top_seller(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM (
      SELECT user_id FROM profiles 
      WHERE is_seller = true AND total_sales_count > 0
      ORDER BY total_sales_count DESC, average_rating DESC
      LIMIT 10
    ) top_sellers
    WHERE top_sellers.user_id = check_user_id
  );
$$;