
CREATE OR REPLACE VIEW public.saved_addresses_return_info
WITH (security_invoker = on) AS
SELECT
  id, user_id,
  city, state, postal_code, country,
  CASE WHEN first_name IS NOT NULL THEN LEFT(first_name, 1) || '***' ELSE NULL END as first_name_masked,
  CASE WHEN last_name IS NOT NULL THEN LEFT(last_name, 1) || '***' ELSE NULL END as last_name_masked,
  CASE WHEN phone IS NOT NULL THEN '****' || RIGHT(phone, 3) ELSE NULL END as phone_masked
FROM public.saved_addresses;
