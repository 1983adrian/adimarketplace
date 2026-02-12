-- Revoke all access to webhook_logs from public API (anon/authenticated)
-- Table stays in DB but is invisible to the API/client
REVOKE ALL ON public.webhook_logs FROM anon, authenticated;