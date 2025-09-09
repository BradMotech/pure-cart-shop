-- Fix search path for existing functions to address security warnings
ALTER FUNCTION public.has_role(uuid, user_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_admin_user() SET search_path = public;