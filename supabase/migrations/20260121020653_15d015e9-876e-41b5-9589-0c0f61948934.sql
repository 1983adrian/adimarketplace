-- Create RPC function for incrementing pending balance atomically
CREATE OR REPLACE FUNCTION public.increment_pending_balance(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET pending_balance = COALESCE(pending_balance, 0) + p_amount
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_pending_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_pending_balance TO service_role;