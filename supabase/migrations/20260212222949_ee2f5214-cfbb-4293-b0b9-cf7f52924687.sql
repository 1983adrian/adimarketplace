
-- Drop and recreate disputes_safe view with admin_notes protection
DROP VIEW IF EXISTS public.disputes_safe;

CREATE VIEW public.disputes_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  order_id,
  reporter_id,
  reported_user_id,
  reason,
  description,
  status,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_notes
    ELSE NULL
  END AS admin_notes,
  CASE 
    WHEN status = 'resolved' OR has_role(auth.uid(), 'admin'::app_role) THEN resolution
    ELSE NULL
  END AS resolution,
  created_at,
  updated_at
FROM disputes;

GRANT SELECT ON public.disputes_safe TO authenticated;
