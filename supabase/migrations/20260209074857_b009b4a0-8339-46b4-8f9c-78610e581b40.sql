-- RLS Policy for profiles: Users can only see their own profile
CREATE POLICY "Users can only see their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy for saved_addresses: Users can manage their own addresses
CREATE POLICY "Users can manage their own addresses" 
ON public.saved_addresses 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);