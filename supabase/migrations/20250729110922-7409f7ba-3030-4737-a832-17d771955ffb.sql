-- Create game database schema for Grow All Garden

-- Players table for user management
CREATE TABLE public.players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN DEFAULT false,
  money INTEGER DEFAULT 100,
  room_id TEXT DEFAULT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0
);

-- Seeds table with all varieties
CREATE TABLE public.seeds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical', 'Divine', 'Prismatic')),
  cost_sheckles INTEGER NOT NULL,
  cost_robux INTEGER DEFAULT NULL,
  sell_price INTEGER NOT NULL,
  growth_time INTEGER NOT NULL DEFAULT 300, -- seconds
  multi_harvest BOOLEAN DEFAULT false,
  obtainable BOOLEAN DEFAULT true,
  description TEXT DEFAULT '',
  stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 5,
  min_stock INTEGER DEFAULT 1
);

-- Player inventories
CREATE TABLE public.player_inventories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  seed_id uuid REFERENCES public.seeds(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  UNIQUE(player_id, seed_id)
);

-- Crops/plants on farms
CREATE TABLE public.crops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  seed_id uuid REFERENCES public.seeds(id) ON DELETE CASCADE,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  planted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  growth_stage INTEGER DEFAULT 0,
  max_growth_stage INTEGER DEFAULT 5,
  mutations TEXT[] DEFAULT '{}',
  watered BOOLEAN DEFAULT false,
  ready_to_harvest BOOLEAN DEFAULT false
);

-- Weather and events system
CREATE TABLE public.weather_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  weather_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER DEFAULT 300, -- 5 minutes in seconds
  is_active BOOLEAN DEFAULT true,
  triggered_by_admin BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'global' CHECK (scope IN ('global', 'local'))
);

-- Shop stock management
CREATE TABLE public.shop_stock (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_id uuid REFERENCES public.seeds(id) ON DELETE CASCADE,
  current_stock INTEGER DEFAULT 0,
  last_restock TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_restock TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '5 minutes')
);

-- Game rooms for multiplayer
CREATE TABLE public.game_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  created_by uuid REFERENCES public.players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  player_count INTEGER DEFAULT 1
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Players can view all players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Players can update own profile" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Players can insert own profile" ON public.players FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view seeds" ON public.seeds FOR SELECT USING (true);
CREATE POLICY "Admins can modify seeds" ON public.seeds FOR ALL USING (true);

CREATE POLICY "Players can view own inventory" ON public.player_inventories FOR SELECT USING (true);
CREATE POLICY "Players can modify own inventory" ON public.player_inventories FOR ALL USING (true);

CREATE POLICY "Players can view all crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Players can modify own crops" ON public.crops FOR ALL USING (true);

CREATE POLICY "Anyone can view weather" ON public.weather_events FOR SELECT USING (true);
CREATE POLICY "Admins can control weather" ON public.weather_events FOR ALL USING (true);

CREATE POLICY "Anyone can view shop stock" ON public.shop_stock FOR SELECT USING (true);
CREATE POLICY "System can update shop stock" ON public.shop_stock FOR ALL USING (true);

CREATE POLICY "Anyone can view rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Players can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Room creators can modify rooms" ON public.game_rooms FOR UPDATE USING (true);

-- Insert initial seed data
INSERT INTO public.seeds (name, rarity, cost_sheckles, cost_robux, sell_price, multi_harvest) VALUES
-- Common Seeds
('Carrot', 'Common', 10, 7, 15, false),
('Strawberry', 'Common', 50, 21, 14, true),

-- Uncommon Seeds  
('Blueberry', 'Uncommon', 400, 49, 18, true),
('Orange Tulip', 'Uncommon', 600, 14, 767, false),
('Stonebite', 'Uncommon', 1300, 135, 36, true),

-- Rare Seeds
('Tomato', 'Rare', 800, 79, 27, true),
('Daffodil', 'Rare', 1000, 19, 903, false),
('Cauliflower', 'Rare', 1300, 135, 36, true),
('Corn', 'Rare', 1300, 135, 36, true),
('Paradise Petal', 'Rare', 2500, 195, 2708, false),
('Watermelon', 'Rare', 2500, 195, 2708, false),

-- Legendary Seeds
('Pumpkin', 'Legendary', 3000, 210, 3069, false),
('Apple', 'Legendary', 3250, 375, 248, true),
('Green Apple', 'Legendary', 3500, 399, 271, true),
('Banana', 'Legendary', 7000, 459, 1579, true),
('Bamboo', 'Legendary', 4000, 99, 3610, false),
('Rafflesia', 'Legendary', 3200, 215, 3159, false),

-- Mythical Seeds
('Pineapple', 'Mythical', 7500, 475, 1805, true),
('Coconut', 'Mythical', 6000, 435, 361, true),
('Cactus', 'Mythical', 15000, 497, 3069, true),
('Dragon Fruit', 'Mythical', 50000, 597, 4287, true),
('Mango', 'Mythical', 100000, 580, 5866, true),
('Kiwi', 'Mythical', 10000, 529, 2482, true),
('Bell Pepper', 'Mythical', 55000, 589, 4964, true),
('Prickly Pear', 'Mythical', 555000, 599, 6318, true),

-- Divine Seeds
('Grape', 'Divine', 850000, 599, 7850, true),
('Loquat', 'Divine', 900000, 629, 7220, true),
('Mushroom', 'Divine', 150000, 249, 136278, false),
('Pepper', 'Divine', 1000000, 629, 7220, true),
('Cacao', 'Divine', 2500000, 679, 10830, true),
('Feijoa', 'Divine', 2750000, 679, 11733, true),
('Pitcher Plant', 'Divine', 7500000, 715, 28880, true),

-- Prismatic Seeds
('Beanstalk', 'Prismatic', 10000000, 715, 25270, true),
('Ember Lily', 'Prismatic', 15000000, 779, 60166, true),
('Sugar Apple', 'Prismatic', 25000000, 819, 43320, true),
('Burning Bud', 'Prismatic', 40000000, 915, 70000, true);

-- Initialize shop stock for all seeds
INSERT INTO public.shop_stock (seed_id, current_stock)
SELECT id, 
  CASE 
    WHEN rarity = 'Common' THEN 25
    WHEN rarity = 'Uncommon' THEN 6  
    WHEN rarity = 'Rare' THEN 3
    WHEN rarity = 'Legendary' THEN 2
    WHEN rarity = 'Mythical' THEN 1
    WHEN rarity = 'Divine' THEN 1
    WHEN rarity = 'Prismatic' THEN 0
    ELSE 0
  END
FROM public.seeds;

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto timestamps
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();