-- Create a function to check if a user has a special role (admin/moderator)
-- This function bypasses RLS to allow checking roles for verified badge display
CREATE OR REPLACE FUNCTION public.get_user_special_status(check_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'is_admin', EXISTS (SELECT 1 FROM user_roles WHERE user_id = check_user_id AND role = 'admin'),
    'is_moderator', EXISTS (SELECT 1 FROM user_roles WHERE user_id = check_user_id AND role = 'moderator'),
    'is_verified', (SELECT is_verified FROM profiles WHERE user_id = check_user_id)
  )
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_special_status(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_special_status(uuid) TO authenticated;