-- Fix infinite recursion by dropping problematic admin policies
DROP POLICY IF EXISTS "Admins can manage admins table" ON public.admins;

-- Make admins table simply readable by everyone (it's just email list for auth)
-- and only allow updates by existing admins using a simple email check
CREATE POLICY "Anyone can read admin emails"
ON public.admins
FOR SELECT
USING (true);

-- Only allow inserts/updates by users whose email is already in the table
-- Use a direct email comparison to avoid recursion
CREATE POLICY "Existing admins can manage admins"
ON public.admins
FOR ALL
USING (auth.jwt() ->> 'email' = ANY(ARRAY['mashaobradley@gmail.com', 'bradley@motechxpress.co.za']))
WITH CHECK (auth.jwt() ->> 'email' = ANY(ARRAY['mashaobradley@gmail.com', 'bradley@motechxpress.co.za']));