
-- Allow admins to delete watchlist entries
CREATE POLICY "Admins can delete watchlist entries"
ON public.watchlist FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
