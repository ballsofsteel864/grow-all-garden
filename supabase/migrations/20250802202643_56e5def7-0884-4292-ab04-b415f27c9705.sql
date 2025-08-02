-- Fix Elder Strawberry sell price
UPDATE seeds SET sell_price = 90000 WHERE name = 'Elder Strawberry';

-- Fix single harvest crops (set multi_harvest to false for these)
UPDATE seeds 
SET multi_harvest = false
WHERE name IN ('Carrot', 'Daffodil', 'Bamboo', 'Corn', 'Orange Tulip', 'Watermelon', 'Pumpkin');

-- Update restock chances in shop_stock table to be 1 in X where X varies by rarity
UPDATE shop_stock 
SET restock_chance = 0.8 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Common');

UPDATE shop_stock 
SET restock_chance = 0.6 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Uncommon');

UPDATE shop_stock 
SET restock_chance = 0.4 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Rare');

UPDATE shop_stock 
SET restock_chance = 0.2 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Epic');

UPDATE shop_stock 
SET restock_chance = 0.1 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Legendary');

UPDATE shop_stock 
SET restock_chance = 0.05 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Mythic');

UPDATE shop_stock 
SET restock_chance = 0.01 
WHERE seed_id IN (SELECT id FROM seeds WHERE rarity = 'Ultra Rare');

-- Fix RLS policies that are causing 406 errors
DROP POLICY IF EXISTS "Players can modify own crops" ON crops;
DROP POLICY IF EXISTS "Players can view all crops" ON crops;

CREATE POLICY "Players can view own crops" ON crops
FOR SELECT USING (player_id::text = auth.uid()::text OR player_id IS NULL);

CREATE POLICY "Players can insert own crops" ON crops
FOR INSERT WITH CHECK (player_id::text = auth.uid()::text);

CREATE POLICY "Players can update own crops" ON crops
FOR UPDATE USING (player_id::text = auth.uid()::text);

CREATE POLICY "Players can delete own crops" ON crops
FOR DELETE USING (player_id::text = auth.uid()::text);

-- Fix inventory RLS policies
DROP POLICY IF EXISTS "Players can modify own inventory" ON player_inventories;
DROP POLICY IF EXISTS "Players can view own inventory" ON player_inventories;

CREATE POLICY "Players can view own inventory" ON player_inventories
FOR SELECT USING (player_id::text = auth.uid()::text);

CREATE POLICY "Players can insert own inventory" ON player_inventories
FOR INSERT WITH CHECK (player_id::text = auth.uid()::text);

CREATE POLICY "Players can update own inventory" ON player_inventories
FOR UPDATE USING (player_id::text = auth.uid()::text);

CREATE POLICY "Players can delete own inventory" ON player_inventories
FOR DELETE USING (player_id::text = auth.uid()::text);

-- Add leave room function
CREATE OR REPLACE FUNCTION leave_room(player_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE players SET room_id = NULL WHERE id = player_id_param;
END;
$$ LANGUAGE plpgsql;