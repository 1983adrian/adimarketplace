-- Create platform_settings table for general platform configuration
CREATE TABLE public.platform_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}',
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create homepage_content table for hero text, banners, etc.
CREATE TABLE public.homepage_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text NOT NULL UNIQUE,
    title text,
    subtitle text,
    description text,
    image_url text,
    button_text text,
    button_url text,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create seo_settings table for meta titles, descriptions
CREATE TABLE public.seo_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key text NOT NULL UNIQUE,
    meta_title text,
    meta_description text,
    og_title text,
    og_description text,
    og_image text,
    keywords text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create email_templates table for email template customization
CREATE TABLE public.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key text NOT NULL UNIQUE,
    name text NOT NULL,
    subject text NOT NULL,
    body_html text NOT NULL,
    body_text text,
    variables text[],
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    old_values jsonb,
    new_values jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create policies_content table for legal policies
CREATE TABLE public.policies_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key text NOT NULL UNIQUE,
    title text NOT NULL,
    content text NOT NULL,
    version text NOT NULL DEFAULT '1.0',
    is_published boolean NOT NULL DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies_content ENABLE ROW LEVEL SECURITY;

-- Platform settings policies
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Homepage content policies
CREATE POLICY "Anyone can view active homepage content" ON public.homepage_content
    FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage homepage content" ON public.homepage_content
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- SEO settings policies
CREATE POLICY "Anyone can view SEO settings" ON public.seo_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Email templates policies
CREATE POLICY "Admins can view email templates" ON public.email_templates
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies content policies
CREATE POLICY "Anyone can view published policies" ON public.policies_content
    FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage policies" ON public.policies_content
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_content_updated_at
    BEFORE UPDATE ON public.homepage_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policies_content_updated_at
    BEFORE UPDATE ON public.policies_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage content
INSERT INTO public.homepage_content (section_key, title, subtitle, description, button_text, button_url, sort_order) VALUES
('hero', 'Marketplace de Încredere', 'Cumpără și vinde în siguranță', 'Descoperă mii de produse de la vânzători verificați', 'Explorează', '/browse', 1),
('featured_banner', 'Oferte Speciale', 'Până la 50% reducere', 'Profită de cele mai bune oferte ale săptămânii', 'Vezi Ofertele', '/browse?sale=true', 2);

-- Insert default SEO settings
INSERT INTO public.seo_settings (page_key, meta_title, meta_description) VALUES
('home', 'Marketplace - Cumpără și Vinde Online', 'Cel mai mare marketplace online din România. Găsește produse noi și second-hand la prețuri excelente.'),
('browse', 'Răsfoiește Produse | Marketplace', 'Explorează mii de produse de la vânzători verificați. Filtrează după categorie, preț și locație.'),
('login', 'Autentificare | Marketplace', 'Conectează-te la contul tău pentru a cumpăra și vinde pe marketplace.');

-- Insert default email templates
INSERT INTO public.email_templates (template_key, name, subject, body_html, variables) VALUES
('welcome', 'Email de Bun Venit', 'Bine ai venit pe Marketplace!', '<h1>Bine ai venit, {{name}}!</h1><p>Îți mulțumim că te-ai alăturat comunității noastre.</p>', ARRAY['name', 'email']),
('order_confirmation', 'Confirmare Comandă', 'Comanda ta #{{order_id}} a fost plasată', '<h1>Mulțumim pentru comandă!</h1><p>Comanda ta cu numărul {{order_id}} a fost înregistrată.</p>', ARRAY['order_id', 'amount', 'items']),
('shipping_notification', 'Notificare Expediere', 'Comanda ta a fost expediată', '<h1>Comanda ta e pe drum!</h1><p>Număr de tracking: {{tracking_number}}</p>', ARRAY['order_id', 'tracking_number', 'carrier']);

-- Insert default policies
INSERT INTO public.policies_content (policy_key, title, content, is_published) VALUES
('terms', 'Termeni și Condiții', '# Termeni și Condiții\n\nAcești termeni și condiții reglementează utilizarea platformei noastre.', true),
('privacy', 'Politica de Confidențialitate', '# Politica de Confidențialitate\n\nRespectăm confidențialitatea datelor tale personale.', true),
('refund', 'Politica de Retur', '# Politica de Retur\n\nPoți returna produsele în termen de 14 zile.', true);

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, category) VALUES
('site_name', '"Marketplace"', 'general'),
('site_description', '"Cel mai mare marketplace online"', 'general'),
('contact_email', '"contact@marketplace.ro"', 'general'),
('maintenance_mode', 'false', 'system'),
('maintenance_message', '"Site-ul este în mentenanță. Revenim în curând!"', 'system'),
('default_currency', '"RON"', 'localization'),
('default_language', '"ro"', 'localization'),
('allow_guest_checkout', 'false', 'marketplace'),
('require_phone_verification', 'false', 'security');