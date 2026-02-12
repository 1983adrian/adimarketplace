
-- Add PayPal processor settings row
INSERT INTO public.payment_processor_settings (processor_name, is_active, environment)
VALUES ('paypal', false, 'sandbox')
ON CONFLICT DO NOTHING;
