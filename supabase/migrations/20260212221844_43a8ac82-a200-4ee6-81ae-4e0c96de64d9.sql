-- Remove the policy that exposes seller addresses to buyers
DROP POLICY IF EXISTS "saved_addresses_return_buyer_view" ON public.saved_addresses;

-- Drop the view that exposed return address info
DROP VIEW IF EXISTS public.saved_addresses_return_info;