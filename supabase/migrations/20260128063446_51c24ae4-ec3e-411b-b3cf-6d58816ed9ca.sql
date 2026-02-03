-- Actualizare trigger handle_new_user pentru a prelua date de la Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  raw_meta JSONB;
  google_name TEXT;
  google_avatar TEXT;
  display_name TEXT;
BEGIN
  -- Get raw_user_meta_data
  raw_meta := NEW.raw_user_meta_data;
  
  -- Extract Google OAuth data if available
  google_name := COALESCE(
    raw_meta->>'full_name',
    raw_meta->>'name',
    raw_meta->>'display_name',
    NULL
  );
  
  google_avatar := COALESCE(
    raw_meta->>'avatar_url',
    raw_meta->>'picture',
    NULL
  );
  
  -- Insert profile with Google data if available
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, google_name, google_avatar);
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;