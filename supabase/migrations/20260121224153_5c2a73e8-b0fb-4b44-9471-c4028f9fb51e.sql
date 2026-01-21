-- Add UK bank account fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sort_code character varying(10),
ADD COLUMN IF NOT EXISTS account_number character varying(20);