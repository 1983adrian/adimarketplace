
-- Create a trigger that automatically invalidates expired tokens on any table access
CREATE OR REPLACE FUNCTION public.auto_invalidate_expired_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically mark expired tokens as invalid
  UPDATE push_tokens 
  SET is_valid = false 
  WHERE expires_at < now() AND is_valid = true;
  
  RETURN NEW;
END;
$$;

-- Create trigger on push_tokens insert/update to cleanup expired tokens
DROP TRIGGER IF EXISTS trigger_cleanup_expired_tokens ON push_tokens;
CREATE TRIGGER trigger_cleanup_expired_tokens
AFTER INSERT OR UPDATE ON push_tokens
FOR EACH STATEMENT
EXECUTE FUNCTION auto_invalidate_expired_tokens();

-- Also create a function that can be called to extend token expiration when actively used
CREATE OR REPLACE FUNCTION public.extend_token_expiration(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE push_tokens 
  SET 
    expires_at = now() + interval '30 days',
    last_used_at = now()
  WHERE token = p_token 
    AND user_id = p_user_id 
    AND is_valid = true
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- Cleanup function that deletes old invalid/expired tokens (keeps DB clean)
CREATE OR REPLACE FUNCTION public.purge_old_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Delete tokens that are invalid or expired more than 7 days ago
  DELETE FROM push_tokens 
  WHERE is_valid = false 
    OR expires_at < (now() - interval '7 days');
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
