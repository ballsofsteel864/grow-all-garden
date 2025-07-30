-- First, let's check if we need to update the seeds table structure
-- Update seeds with specific restock chances and growth times based on provided data

-- Update Carrot
UPDATE public.seeds 
SET cost_sheckles = 1, growth_time = 6.5 
WHERE name = 'Carrot';

-- Insert or update all seeds with proper data
INSERT INTO public.seeds (name, rarity, cost_sheckles, cost_robux, sell_price, growth_time, multi_harvest, obtainable, description) VALUES
('Carrot', 'Common', 1, NULL, 2, 6.5, true, true, 'A basic orange vegetable, perfect for beginners'),
('Strawberry', 'Common', 2, NULL, 4, 10, true, true, 'Sweet red berries that grow quickly'),
('Blueberry', 'Common', 5, NULL, 12, 105, true, true, 'Small blue berries packed with flavor'),
('Tomato', 'Common', 3, NULL, 8, 50, true, true, 'Juicy red tomatoes for cooking'),
('Orange Tulip', 'Uncommon', 8, NULL, 20, 6, true, true, 'Beautiful orange flowers'),
('Corn', 'Uncommon', 15, NULL, 35, 40, true, true, 'Golden corn kernels'),
('Daffodil', 'Uncommon', 18, NULL, 42, 50, true, true, 'Bright yellow spring flowers'),
('Watermelon', 'Uncommon', 25, NULL, 65, 100, true, true, 'Large sweet melons'),
('Pumpkin', 'Rare', 40, NULL, 110, 150, true, true, 'Orange pumpkins for autumn'),
('Apple', 'Rare', 50, NULL, 140, 150, true, true, 'Crisp red apples from trees'),
('Bamboo', 'Rare', 35, NULL, 95, 200, true, true, 'Fast-growing bamboo shoots'),
('Coconut', 'Legendary', 100, NULL, 300, 500, true, true, 'Tropical coconuts from palm trees'),
('Cactus', 'Legendary', 120, NULL, 380, 300, true, true, 'Desert cacti with prickly pears'),
('Dragon Fruit', 'Legendary', 200, NULL, 650, 450, true, true, 'Exotic pink dragon fruit'),
('Mango', 'Mythical', 300, NULL, 950, 500, true, true, 'Sweet tropical mangoes'),
('Grape', 'Mythical', 350, NULL, 1100, 500, true, true, 'Purple grapes for wine'),
('Mushroom', 'Mythical', 400, NULL, 1300, 500, true, true, 'Magical forest mushrooms'),
('Pepper', 'Divine', 500, NULL, 1800, 1000, true, true, 'Spicy hot peppers'),
('Cacao', 'Divine', 600, NULL, 2200, 1000, true, true, 'Chocolate cacao beans'),
('Beanstalk', 'Divine', 750, NULL, 2800, 1000, true, true, 'Magical growing beanstalk'),
('Ember Lily', 'Prismatic', 1000, NULL, 4500, 1500, true, true, 'Fiery magical lilies'),
('Sugar Apple', 'Prismatic', 1200, NULL, 5200, 1750, true, true, 'Sweet crystalline apples'),
('Burning Bud', 'Prismatic', 1500, NULL, 6500, 2000, true, true, 'Blazing magical flower buds')
ON CONFLICT (name) DO UPDATE SET
  rarity = EXCLUDED.rarity,
  cost_sheckles = EXCLUDED.cost_sheckles,
  sell_price = EXCLUDED.sell_price,
  growth_time = EXCLUDED.growth_time,
  multi_harvest = EXCLUDED.multi_harvest,
  description = EXCLUDED.description;

-- Create shop stock with proper restock chances
INSERT INTO public.shop_stock (seed_id, current_stock, max_stock, min_stock, restock_chance) 
SELECT 
  s.id,
  CASE s.rarity 
    WHEN 'Common' THEN 50
    WHEN 'Uncommon' THEN 20
    WHEN 'Rare' THEN 10
    WHEN 'Legendary' THEN 3
    WHEN 'Mythical' THEN 1
    WHEN 'Divine' THEN 1
    WHEN 'Prismatic' THEN 1
  END as current_stock,
  CASE s.rarity 
    WHEN 'Common' THEN 50
    WHEN 'Uncommon' THEN 20
    WHEN 'Rare' THEN 10
    WHEN 'Legendary' THEN 3
    WHEN 'Mythical' THEN 1
    WHEN 'Divine' THEN 1
    WHEN 'Prismatic' THEN 1
  END as max_stock,
  0 as min_stock,
  CASE s.name
    WHEN 'Carrot' THEN 1.0
    WHEN 'Strawberry' THEN 1.0
    WHEN 'Blueberry' THEN 1.0
    WHEN 'Tomato' THEN 1.0
    WHEN 'Orange Tulip' THEN 0.333
    WHEN 'Corn' THEN 0.16
    WHEN 'Daffodil' THEN 0.143
    WHEN 'Watermelon' THEN 0.125
    WHEN 'Pumpkin' THEN 0.1
    WHEN 'Apple' THEN 0.0714
    WHEN 'Bamboo' THEN 0.2
    WHEN 'Coconut' THEN 0.05
    WHEN 'Cactus' THEN 0.0333
    WHEN 'Dragon Fruit' THEN 0.02
    WHEN 'Mango' THEN 0.0125
    WHEN 'Grape' THEN 0.01
    WHEN 'Mushroom' THEN 0.0083
    WHEN 'Pepper' THEN 0.0071
    WHEN 'Cacao' THEN 0.0063
    WHEN 'Beanstalk' THEN 0.0048
    WHEN 'Ember Lily' THEN 0.0042
    WHEN 'Sugar Apple' THEN 0.0034
    WHEN 'Burning Bud' THEN 0.0029
    ELSE 0.1
  END as restock_chance
FROM public.seeds s
ON CONFLICT (seed_id) DO UPDATE SET
  restock_chance = EXCLUDED.restock_chance,
  max_stock = EXCLUDED.max_stock;

-- Add restock_chance column if it doesn't exist
ALTER TABLE public.shop_stock 
ADD COLUMN IF NOT EXISTS restock_chance DECIMAL(5,4) DEFAULT 0.1;

-- Add restock_timer for next restock countdown
ALTER TABLE public.shop_stock 
ADD COLUMN IF NOT EXISTS next_restock_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour');

-- Add harvest_remaining column to crops for multi-harvest tracking
ALTER TABLE public.crops
ADD COLUMN IF NOT EXISTS harvest_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_fully_grown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_harvest_at TIMESTAMP WITH TIME ZONE;

-- Function to calculate if a crop is ready to harvest
CREATE OR REPLACE FUNCTION update_crop_growth()
RETURNS trigger AS $$
BEGIN
  -- Calculate if crop is fully grown based on growth time
  NEW.is_fully_grown = (
    EXTRACT(EPOCH FROM (now() - NEW.planted_at)) >= 
    (SELECT growth_time FROM seeds WHERE id = NEW.seed_id)
  );
  
  NEW.ready_to_harvest = NEW.is_fully_grown AND NEW.harvest_remaining > 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update crop growth status
DROP TRIGGER IF EXISTS update_crop_growth_trigger ON public.crops;
CREATE TRIGGER update_crop_growth_trigger
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION update_crop_growth();

-- Reset all players money to 100 (temporary helper)
UPDATE public.players SET money = 100;