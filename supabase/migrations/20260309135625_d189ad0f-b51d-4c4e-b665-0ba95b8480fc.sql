
-- Fix function search path warning
ALTER FUNCTION public.log_order_status_change() SET search_path = 'public';
ALTER FUNCTION public.award_loyalty_points() SET search_path = 'public';
