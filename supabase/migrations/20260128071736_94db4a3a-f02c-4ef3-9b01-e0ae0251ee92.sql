-- Fix: Adăugăm politică RLS pe password_reset_attempts
-- Acest tabel ar trebui să fie accesibil doar de admin/sistem

-- Doar adminii pot vedea încercările de resetare (pentru audit)
CREATE POLICY "password_reset_attempts_admin_only"
ON public.password_reset_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Nimeni nu poate insera direct - doar prin edge function cu service_role
CREATE POLICY "password_reset_attempts_no_direct_insert"
ON public.password_reset_attempts FOR INSERT
WITH CHECK (false);

-- Comentariu: Inserările se fac prin edge function cu service_role key