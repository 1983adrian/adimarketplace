-- Add short unique ID column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- Create function to generate unique short ID (3 letters + 2 numbers)
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_id TEXT;
  letters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  done BOOLEAN := false;
BEGIN
  WHILE NOT done LOOP
    new_id := '';
    -- 3 random letters
    new_id := new_id || substr(letters, floor(random() * length(letters) + 1)::int, 1);
    new_id := new_id || substr(letters, floor(random() * length(letters) + 1)::int, 1);
    new_id := new_id || substr(letters, floor(random() * length(letters) + 1)::int, 1);
    -- 2 random digits
    new_id := new_id || floor(random() * 10)::int::text;
    new_id := new_id || floor(random() * 10)::int::text;
    
    -- Check uniqueness
    done := NOT EXISTS (SELECT 1 FROM profiles WHERE short_id = new_id);
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Assign short IDs to all existing users who don't have one
UPDATE profiles SET short_id = generate_short_id() WHERE short_id IS NULL;

-- Make it NOT NULL with default for future users
ALTER TABLE public.profiles ALTER COLUMN short_id SET DEFAULT generate_short_id();
ALTER TABLE public.profiles ALTER COLUMN short_id SET NOT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_short_id ON public.profiles(short_id);