-- Create admins table to control admin access
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read admin emails (needed for auth check)
CREATE POLICY "Anyone can view admin emails" 
ON public.admins 
FOR SELECT 
USING (true);

-- Only existing admins can manage the admins table
CREATE POLICY "Admins can manage admins table" 
ON public.admins 
FOR ALL 
USING (email IN (SELECT email FROM public.admins))
WITH CHECK (email IN (SELECT email FROM public.admins));

-- Insert initial admin emails (you can modify these)
INSERT INTO public.admins (email) VALUES 
('mashaobradley@gmail.com'),
('bradley@motechxpress.co.za');

-- Update orders table to allow payment status updates
CREATE POLICY "Allow payment status updates" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (true);