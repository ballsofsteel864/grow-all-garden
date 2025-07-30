-- Update seeds with proper growth times and multi-harvest data
-- Wheat (Common)
UPDATE public.seeds 
SET growth_time = 30, multi_harvest = false 
WHERE name = 'Wheat' AND rarity = 'Common';

-- Carrot (Common)
UPDATE public.seeds 
SET growth_time = 45, multi_harvest = false 
WHERE name = 'Carrot' AND rarity = 'Common';

-- Potato (Common)
UPDATE public.seeds 
SET growth_time = 60, multi_harvest = false 
WHERE name = 'Potato' AND rarity = 'Common';

-- Corn (Uncommon)
UPDATE public.seeds 
SET growth_time = 90, multi_harvest = true 
WHERE name = 'Corn' AND rarity = 'Uncommon';

-- Pumpkin (Uncommon)
UPDATE public.seeds 
SET growth_time = 120, multi_harvest = false 
WHERE name = 'Pumpkin' AND rarity = 'Uncommon';

-- Watermelon (Rare)
UPDATE public.seeds 
SET growth_time = 180, multi_harvest = false 
WHERE name = 'Watermelon' AND rarity = 'Rare';

-- Strawberry (Rare)
UPDATE public.seeds 
SET growth_time = 150, multi_harvest = true 
WHERE name = 'Strawberry' AND rarity = 'Rare';

-- Grape (Legendary)
UPDATE public.seeds 
SET growth_time = 300, multi_harvest = true 
WHERE name = 'Grape' AND rarity = 'Legendary';

-- Golden Wheat (Mythical)
UPDATE public.seeds 
SET growth_time = 600, multi_harvest = false 
WHERE name = 'Golden Wheat' AND rarity = 'Mythical';

-- Dragon Fruit (Divine)
UPDATE public.seeds 
SET growth_time = 900, multi_harvest = true 
WHERE name = 'Dragon Fruit' AND rarity = 'Divine';

-- Update shop stock with proper restock chances
UPDATE public.shop_stock 
SET restock_chance = 0.90, max_stock = 10, min_stock = 3
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Common';

UPDATE public.shop_stock 
SET restock_chance = 0.75, max_stock = 8, min_stock = 2
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Uncommon';

UPDATE public.shop_stock 
SET restock_chance = 0.50, max_stock = 5, min_stock = 1
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Rare';

UPDATE public.shop_stock 
SET restock_chance = 0.25, max_stock = 3, min_stock = 1
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Legendary';

UPDATE public.shop_stock 
SET restock_chance = 0.10, max_stock = 2, min_stock = 0
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Mythical';

UPDATE public.shop_stock 
SET restock_chance = 0.05, max_stock = 1, min_stock = 0
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Divine';

UPDATE public.shop_stock 
SET restock_chance = 0.03, max_stock = 1, min_stock = 0
FROM public.seeds 
WHERE shop_stock.seed_id = seeds.id AND seeds.rarity = 'Prismatic';

-- Set next restock to 5 minutes from now
UPDATE public.shop_stock 
SET next_restock = now() + interval '5 minutes',
    next_restock_at = now() + interval '5 minutes';

-- Create function to calculate mutation price multipliers
CREATE OR REPLACE FUNCTION public.calculate_mutation_price(base_price INTEGER, mutations TEXT[])
RETURNS INTEGER AS $$
DECLARE
  final_price INTEGER := base_price;
  mutation TEXT;
  special_multiplier INTEGER := 1;
  regular_multiplier DECIMAL := 1.0;
BEGIN
  -- Check for special mutations (rainbow/gold) - these override others
  FOREACH mutation IN ARRAY mutations LOOP
    IF mutation = 'rainbow' THEN
      special_multiplier := 50;
    ELSIF mutation = 'gold' AND special_multiplier = 1 THEN
      special_multiplier := 20;
    END IF;
  END LOOP;
  
  -- If no special mutations, calculate regular mutation multiplier
  IF special_multiplier = 1 THEN
    regular_multiplier := 1.0 + (array_length(mutations, 1) * 0.25);
  END IF;
  
  final_price := base_price * special_multiplier * regular_multiplier;
  RETURN final_price;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically advance crop growth
CREATE OR REPLACE FUNCTION public.advance_crop_growth()
RETURNS void AS $$
DECLARE
  crop_record RECORD;
  growth_rate INTEGER;
  seed_growth_time INTEGER;
  should_grow BOOLEAN;
  weather_multiplier DECIMAL := 1.0;
  active_weather TEXT;
BEGIN
  -- Get current active weather
  SELECT weather_type INTO active_weather 
  FROM weather_events 
  WHERE is_active = true 
  AND started_at + (duration || ' seconds')::interval > now()
  LIMIT 1;
  
  -- Set weather multipliers
  CASE active_weather
    WHEN 'rain' THEN weather_multiplier := 1.5;
    WHEN 'sunshine' THEN weather_multiplier := 1.3;
    WHEN 'frost' THEN weather_multiplier := 0.5;
    WHEN 'drought' THEN weather_multiplier := 0.7;
    ELSE weather_multiplier := 1.0;
  END CASE;
  
  -- Process each crop
  FOR crop_record IN 
    SELECT c.*, s.growth_time, s.multi_harvest, s.sell_price
    FROM crops c
    JOIN seeds s ON c.seed_id = s.id
    WHERE c.growth_stage < c.max_growth_stage
  LOOP
    -- Calculate if crop should grow (based on time since planted)
    seed_growth_time := crop_record.growth_time;
    growth_rate := GREATEST(1, seed_growth_time / 5); -- 5 growth stages
    
    should_grow := (
      EXTRACT(EPOCH FROM (now() - crop_record.planted_at)) / growth_rate * weather_multiplier
    ) > crop_record.growth_stage;
    
    IF should_grow THEN
      UPDATE crops 
      SET growth_stage = LEAST(growth_stage + 1, max_growth_stage),
          is_fully_grown = (growth_stage + 1 >= max_growth_stage),
          ready_to_harvest = (growth_stage + 1 >= max_growth_stage)
      WHERE id = crop_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger weather mutations
CREATE OR REPLACE FUNCTION public.trigger_weather_mutations()
RETURNS void AS $$
DECLARE
  active_weather TEXT;
  crop_record RECORD;
  mutation_chance DECIMAL;
  new_mutations TEXT[];
BEGIN
  -- Get current active weather
  SELECT weather_type INTO active_weather 
  FROM weather_events 
  WHERE is_active = true 
  AND started_at + (duration || ' seconds')::interval > now()
  LIMIT 1;
  
  IF active_weather IS NULL THEN
    RETURN;
  END IF;
  
  -- Process crops for mutations based on weather
  FOR crop_record IN 
    SELECT * FROM crops 
    WHERE is_fully_grown = true 
    AND ready_to_harvest = true
  LOOP
    mutation_chance := 0.05; -- 5% base chance
    new_mutations := crop_record.mutations;
    
    -- Weather-specific mutations
    CASE active_weather
      WHEN 'rain' THEN
        IF random() < mutation_chance THEN
          new_mutations := array_append(new_mutations, 'juicy');
        END IF;
      WHEN 'thunder' THEN
        IF random() < mutation_chance * 2 THEN -- 10% for rare mutation
          new_mutations := array_append(new_mutations, 'electric');
        END IF;
      WHEN 'blood_moon' THEN
        IF random() < mutation_chance * 0.5 THEN -- 2.5% for ultra rare
          new_mutations := array_append(new_mutations, 'cursed');
        END IF;
      WHEN 'rainbow' THEN
        IF random() < mutation_chance * 0.2 THEN -- 1% for rainbow
          new_mutations := array_append(new_mutations, 'rainbow');
        END IF;
      WHEN 'golden_hour' THEN
        IF random() < mutation_chance * 0.4 THEN -- 2% for gold
          new_mutations := array_append(new_mutations, 'gold');
        END IF;
    END CASE;
    
    -- Update crop with new mutations
    IF array_length(new_mutations, 1) > array_length(crop_record.mutations, 1) THEN
      UPDATE crops 
      SET mutations = new_mutations 
      WHERE id = crop_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add function to reset player money
CREATE OR REPLACE FUNCTION public.reset_player_money(player_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE players 
  SET money = 100 
  WHERE username = player_username;
END;
$$ LANGUAGE plpgsql;