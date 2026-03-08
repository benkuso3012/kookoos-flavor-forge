
-- Inventory tracking for menu items
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 100,
  low_stock_threshold integer NOT NULL DEFAULT 10,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(menu_item_id)
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Inventory is publicly readable" ON public.inventory
  FOR SELECT USING (true);

-- Store settings
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.store_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Settings are publicly readable" ON public.store_settings
  FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.store_settings (key, value, description) VALUES
  ('delivery_fee', '2000', 'Delivery fee in TSh'),
  ('min_order_amount', '5000', 'Minimum order amount in TSh'),
  ('operating_hours_open', '09:00', 'Store opening time'),
  ('operating_hours_close', '22:00', 'Store closing time'),
  ('currency', 'TSh', 'Currency symbol'),
  ('tax_rate', '0', 'Tax rate percentage');

-- Audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
