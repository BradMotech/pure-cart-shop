-- Create admin user role for existing users (update existing admin to have proper admin role)
INSERT INTO public.user_roles (user_id, role)
SELECT 
    id,
    'admin'::user_role
FROM auth.users
WHERE email = 'admin@example.com'  -- Change this to your admin email
ON CONFLICT (user_id, role) DO NOTHING;

-- Update product categories to match the new unisex structure
UPDATE public.products 
SET category = CASE 
    WHEN category IN ('Shirts', 'T-Shirts') THEN 'Tops'
    WHEN category = 'Pants' THEN 'Bottoms'
    WHEN category = 'Accessories' THEN 'Headwear'
    ELSE 'Tops'
END;

-- Update gender to be unisex for all products
UPDATE public.products SET gender = 'Unisex';