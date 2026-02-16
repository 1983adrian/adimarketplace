
-- Allow admins to update any listing (for hide/show toggle)
CREATE POLICY "Admins can update any listing"
ON public.listings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all listings including inactive
CREATE POLICY "Admins can view all listings"
ON public.listings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
