-- Complete the comprehensive farming game fixes

-- Update seeds with proper data
UPDATE public.seeds SET 
  growth_time = CASE name
    WHEN 'Wheat' THEN 60
    WHEN 'Corn' THEN 120
    WHEN 'Tomato' THEN 180
    WHEN 'Carrot' THEN 90
    WHEN 'Potato' THEN 150
    WHEN 'Strawberry' THEN 240
    WHEN 'Blueberry' THEN 300
    WHEN 'Apple' THEN 600
    WHEN 'Orange' THEN 480
    WHEN 'Banana' THEN 360
    WHEN 'Grape' THEN 420
    WHEN 'Watermelon' THEN 540
    WHEN 'Pumpkin' THEN 720
    WHEN 'Sunflower' THEN 300
    WHEN 'Rose' THEN 180
    WHEN 'Tulip' THEN 120
    WHEN 'Lily' THEN 240
    WHEN 'Orchid' THEN 480
    WHEN 'Cactus' THEN 360
    WHEN 'Bamboo' THEN 300
    WHEN 'Oak Tree' THEN 1800
    WHEN 'Pine Tree' THEN 1500
    WHEN 'Magic Bean' THEN 900
    WHEN 'Golden Wheat' THEN 300
    WHEN 'Rainbow Flower' THEN 600
    ELSE 300
  END,
  multi_harvest = CASE name
    WHEN 'Apple' THEN true
    WHEN 'Orange' THEN true
    WHEN 'Banana' THEN true
    WHEN 'Grape' THEN true
    WHEN 'Strawberry' THEN true
    WHEN 'Blueberry' THEN true
    WHEN 'Tomato' THEN true
    WHEN 'Oak Tree' THEN true
    WHEN 'Pine Tree' THEN true
    WHEN 'Bamboo' THEN true
    WHEN 'Cactus' THEN true
    ELSE false
  END;

-- Update shop_stock with proper rarity-based chances
UPDATE public.shop_stock SET 
  restock_chance = CASE 
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'common') THEN 0.8
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'uncommon') THEN 0.5
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'rare') THEN 0.3
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'epic') THEN 0.15
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'legendary') THEN 0.05
    ELSE 0.1
  END,
  max_stock = CASE 
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'common') THEN 20
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'uncommon') THEN 15
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'rare') THEN 10
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'epic') THEN 5
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'legendary') THEN 2
    ELSE 10
  END,
  min_stock = CASE 
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'common') THEN 5
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'uncommon') THEN 3
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'rare') THEN 2
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'epic') THEN 1
    WHEN seed_id IN (SELECT id FROM seeds WHERE rarity = 'legendary') THEN 0
    ELSE 1
  END,
  next_restock = now() + interval '5 minutes',
  next_restock_at = now() + interval '5 minutes';

-- Create function to calculate mutation price
CREATE OR REPLACE FUNCTION public.calculate_mutation_price(base_price INTEGER, mutations TEXT[])
RETURNS INTEGER AS $$
DECLARE
  multiplier DECIMAL := 1.0;
  mutation TEXT;
BEGIN
  -- Check for rainbow or gold mutations first (they override each other)
  IF 'rainbow' = ANY(mutations) THEN
    multiplier := 50.0;
  ELSIF 'gold' = ANY(mutations) THEN
    multiplier := 20.0;
  END IF;
  
  -- Add other mutation multipliers
  FOREACH mutation IN ARRAY mutations
  LOOP
    CASE mutation
      WHEN 'giant' THEN multiplier := multiplier * 2.0;
      WHEN 'shiny' THEN multiplier := multiplier * 1.5;
      WHEN 'fast_growing' THEN multiplier := multiplier * 1.2;
      WHEN 'hardy' THEN multiplier := multiplier * 1.3;
      WHEN 'sweet' THEN multiplier := multiplier * 1.4;
      WHEN 'juicy' THEN multiplier := multiplier * 1.6;
      WHEN 'fragrant' THEN multiplier := multiplier * 1.1;
      WHEN 'colorful' THEN multiplier := multiplier * 1.3;
      WHEN 'magical' THEN multiplier := multiplier * 3.0;
      WHEN 'ancient' THEN multiplier := multiplier * 2.5;
    END CASE;
  END LOOP;
  
  RETURN FLOOR(base_price * multiplier);
END;
$$ LANGUAGE plpgsql;

-- Create function to advance crop growth
CREATE OR REPLACE FUNCTION public.advance_crop_growth()
RETURNS void AS $$
DECLARE
  crop_record RECORD;
  weather_multiplier DECIMAL := 1.0;
  current_weather TEXT;
BEGIN
  -- Get current active weather
  SELECT weather_type INTO current_weather
  FROM weather_events 
  WHERE is_active = true 
  AND started_at + (duration || ' seconds')::interval > now()
  LIMIT 1;
  
  -- Set weather multiplier
  CASE current_weather
    WHEN 'sunny' THEN weather_multiplier := 1.5;
    WHEN 'rainy' THEN weather_multiplier := 1.3;
    WHEN 'storm' THEN weather_multiplier := 0.8;
    WHEN 'drought' THEN weather_multiplier := 0.5;
    WHEN 'fog' THEN weather_multiplier := 0.9;
    ELSE weather_multiplier := 1.0;
  END CASE;
  
  -- Update crop growth
  FOR crop_record IN 
    SELECT c.*, s.growth_time
    FROM crops c
    JOIN seeds s ON c.seed_id = s.id
    WHERE c.growth_stage < c.max_growth_stage
    AND c.planted_at + (s.growth_time * (1.0/weather_multiplier) || ' seconds')::interval <= now()
  LOOP
    UPDATE crops 
    SET growth_stage = LEAST(growth_stage + 1, max_growth_stage),
        is_fully_grown = (growth_stage + 1) >= max_growth_stage,
        ready_to_harvest = (growth_stage + 1) >= max_growth_stage
    WHERE id = crop_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger weather mutations
CREATE OR REPLACE FUNCTION public.trigger_weather_mutations(weather_type_param TEXT)
RETURNS void AS $$
DECLARE
  crop_record RECORD;
  new_mutations TEXT[];
BEGIN
  FOR crop_record IN 
    SELECT * FROM crops 
    WHERE growth_stage > 0 
    AND NOT (mutations && ARRAY[
      CASE weather_type_param
        WHEN 'sunny' THEN 'golden'
        WHEN 'rainy' THEN 'giant'
        WHEN 'storm' THEN 'hardy'
        WHEN 'rainbow' THEN 'rainbow'
        WHEN 'snow' THEN 'shiny'
        WHEN 'wind' THEN 'fast_growing'
        WHEN 'heat' THEN 'sweet'
        WHEN 'cold' THEN 'juicy'
        WHEN 'fog' THEN 'fragrant'
        WHEN 'drought' THEN 'colorful'
        ELSE 'none'
      END
    ])
  LOOP
    -- Add weather-specific mutation with 15% chance
    IF random() < 0.15 THEN
      new_mutations := crop_record.mutations;
      CASE weather_type_param
        WHEN 'sunny' THEN new_mutations := array_append(new_mutations, 'golden');
        WHEN 'rainy' THEN new_mutations := array_append(new_mutations, 'giant');
        WHEN 'storm' THEN new_mutations := array_append(new_mutations, 'hardy');
        WHEN 'rainbow' THEN new_mutations := array_append(new_mutations, 'rainbow');
        WHEN 'snow' THEN new_mutations := array_append(new_mutations, 'shiny');
        WHEN 'wind' THEN new_mutations := array_append(new_mutations, 'fast_growing');
        WHEN 'heat' THEN new_mutations := array_append(new_mutations, 'sweet');
        WHEN 'cold' THEN new_mutations := array_append(new_mutations, 'juicy');
        WHEN 'fog' THEN new_mutations := array_append(new_mutations, 'fragrant');
        WHEN 'drought' THEN new_mutations := array_append(new_mutations, 'colorful');
      END CASE;
      
      UPDATE crops 
      SET mutations = new_mutations 
      WHERE id = crop_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset player money
CREATE OR REPLACE FUNCTION public.reset_player_money(player_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE players 
  SET money = 100 
  WHERE id = player_id_param;
END;
$$ LANGUAGE plpgsql;