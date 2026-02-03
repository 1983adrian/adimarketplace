-- Activează taxa de promovare cu prețul corect de 5 RON
UPDATE platform_fees 
SET is_active = true, amount = 5.00, description = 'Promovare produs 7 zile pe homepage'
WHERE fee_type = 'weekly_promotion';

-- Adaugă trigger pentru generare automată de SKU unic la fiecare produs
-- Formatul: CM-XXXX-YYYY unde XXXX = primele 4 caractere din ID, YYYY = an

-- Funcție pentru generarea SKU-ului unic
CREATE OR REPLACE FUNCTION generate_listing_sku()
RETURNS TRIGGER AS $$
BEGIN
  -- Generează SKU unic bazat pe ID și timestamp
  -- Format: CM-XXXX-NNNN (CM = C-Market, XXXX = 4 caractere din UUID, NNNN = secvență)
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := 'CM-' || 
               UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 4)) || 
               '-' || 
               TO_CHAR(NOW(), 'YYMM') ||
               LPAD(FLOOR(RANDOM() * 9999)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pentru generare automată SKU la insert
DROP TRIGGER IF EXISTS trigger_generate_listing_sku ON listings;
CREATE TRIGGER trigger_generate_listing_sku
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_sku();

-- Actualizează produsele existente fără SKU
UPDATE listings 
SET sku = 'CM-' || 
          UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 4)) || 
          '-' || 
          TO_CHAR(created_at, 'YYMM') ||
          LPAD(FLOOR(RANDOM() * 9999)::text, 4, '0')
WHERE sku IS NULL OR sku = '';