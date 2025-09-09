-- Allow email-based admins to view all orders
CREATE POLICY "Email-admins can view all orders"
ON public.orders
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
));

-- Allow email-based admins to view all profiles (for order join)
CREATE POLICY "Email-admins can view all profiles"
ON public.profiles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
));

-- Allow email-based admins to view all order items (for order join)
CREATE POLICY "Email-admins can view all order items"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
));

-- Replace overly permissive orders update policy
DROP POLICY IF EXISTS "Allow payment status updates" ON public.orders;

CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Email-admins can update any orders"
ON public.orders
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.admins a
  WHERE a.email = auth.jwt() ->> 'email'
))
WITH CHECK (true);