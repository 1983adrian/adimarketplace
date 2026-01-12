-- Adaugă câmpul store_name în tabelul profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS is_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_listings INTEGER DEFAULT 10;

-- Comentariu pentru documentare
COMMENT ON COLUMN public.profiles.store_name IS 'Numele magazinului vânzătorului';
COMMENT ON COLUMN public.profiles.is_seller IS 'Dacă utilizatorul este vânzător activ';
COMMENT ON COLUMN public.profiles.max_listings IS 'Numărul maxim de produse permise (default 10)';