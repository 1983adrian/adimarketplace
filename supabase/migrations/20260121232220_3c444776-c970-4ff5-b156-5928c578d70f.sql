-- Add missing KYC/payment fields for Adyen and MangoPay compliance
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name character varying(100),
ADD COLUMN IF NOT EXISTS last_name character varying(100),
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS nationality character varying(3),
ADD COLUMN IF NOT EXISTS country_of_residence character varying(3),
ADD COLUMN IF NOT EXISTS address_line1 character varying(255),
ADD COLUMN IF NOT EXISTS address_line2 character varying(255),
ADD COLUMN IF NOT EXISTS city character varying(100),
ADD COLUMN IF NOT EXISTS region character varying(100),
ADD COLUMN IF NOT EXISTS postal_code character varying(20),
ADD COLUMN IF NOT EXISTS bic character varying(11),
ADD COLUMN IF NOT EXISTS card_holder_name character varying(150),
ADD COLUMN IF NOT EXISTS adyen_account_holder_id character varying(100),
ADD COLUMN IF NOT EXISTS adyen_balance_account_id character varying(100),
ADD COLUMN IF NOT EXISTS seller_terms_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS kyc_documents_submitted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_verified_at timestamp with time zone;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'KYC: Legal first name for Adyen/MangoPay';
COMMENT ON COLUMN public.profiles.last_name IS 'KYC: Legal last name for Adyen/MangoPay';
COMMENT ON COLUMN public.profiles.birthday IS 'KYC: Date of birth for identity verification';
COMMENT ON COLUMN public.profiles.nationality IS 'KYC: ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN public.profiles.country_of_residence IS 'KYC: Country where seller resides';
COMMENT ON COLUMN public.profiles.address_line1 IS 'KYC: Street address for verification';
COMMENT ON COLUMN public.profiles.bic IS 'Bank BIC/SWIFT code for SEPA transfers';
COMMENT ON COLUMN public.profiles.adyen_account_holder_id IS 'Adyen: Account holder reference';
COMMENT ON COLUMN public.profiles.adyen_balance_account_id IS 'Adyen: Balance account for payouts';