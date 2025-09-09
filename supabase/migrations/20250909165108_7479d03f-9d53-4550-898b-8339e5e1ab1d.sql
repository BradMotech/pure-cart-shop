-- Fix RLS policies to allow admins to access their own profiles
-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
));

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
))
WITH CHECK (true);

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
) OR auth.uid() = id);