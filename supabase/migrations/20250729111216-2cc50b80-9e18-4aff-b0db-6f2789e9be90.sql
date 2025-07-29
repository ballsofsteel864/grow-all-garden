-- Create RPC function to handle stock decrement
CREATE OR REPLACE FUNCTION public.decrement_stock(seed_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.shop_stock 
  SET current_stock = GREATEST(current_stock - 1, 0)
  WHERE shop_stock.seed_id = decrement_stock.seed_id;
END;
$$;