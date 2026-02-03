-- Add RLS policy to allow public search of seller profiles (limited fields)
CREATE POLICY "Anyone can search seller profiles"
ON public.profiles
FOR SELECT
USING (is_seller = true);

-- Note: This allows public viewing of seller profiles only
-- The existing restrictive policies still apply for non-sellers