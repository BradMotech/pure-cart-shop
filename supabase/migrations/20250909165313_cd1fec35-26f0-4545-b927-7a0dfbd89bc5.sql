-- Drop the JWT-based admin policies and replace with simpler ones
DROP POLICY IF EXISTS "Email-admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Email-admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Email-admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Email-admins can update any orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create a function to check if current user is admin based on their profile email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.admins a ON p.email = a.email
    WHERE p.id = auth.uid()
  );
$$;

-- Update policies to use the function
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Admins can update any orders"
ON public.orders
FOR UPDATE
USING (public.is_admin_user() OR auth.uid() = user_id)
WITH CHECK (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin_user() OR auth.uid() = id);

CREATE POLICY "Admins can update any profiles" 
ON public.profiles
FOR UPDATE
USING (public.is_admin_user() OR auth.uid() = id)
WITH CHECK (public.is_admin_user() OR auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.is_admin_user() OR auth.uid() = id);

CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (public.is_admin_user() OR EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));