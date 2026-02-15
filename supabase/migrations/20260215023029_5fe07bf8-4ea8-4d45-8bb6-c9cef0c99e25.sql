-- Drop the duplicate function with character varying parameters (keeping the text version)
DROP FUNCTION IF EXISTS public.process_order_transaction(uuid, uuid, uuid, numeric, text, character varying, character varying, numeric, numeric, numeric);
