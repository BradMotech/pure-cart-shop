-- Add delivery fields to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_phone text,
ADD COLUMN delivery_email text,
ADD COLUMN delivery_address text,
ADD COLUMN delivery_city text,
ADD COLUMN delivery_province text,
ADD COLUMN delivery_postal_code text;