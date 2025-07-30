-- Update seeds table with correct prices, growth times, and restock chances
UPDATE seeds SET 
  cost_sheckles = 10,
  growth_time = 7,
  sell_price = 15,
  rarity = 'Common'
WHERE name = 'Carrot';

UPDATE seeds SET 
  cost_sheckles = 50,
  growth_time = 10,
  sell_price = 75,
  rarity = 'Common'
WHERE name = 'Strawberry';

UPDATE seeds SET 
  cost_sheckles = 400,
  growth_time = 105,
  sell_price = 600,
  rarity = 'Common'
WHERE name = 'Blueberry';

UPDATE seeds SET 
  cost_sheckles = 800,
  growth_time = 50,
  sell_price = 1200,
  rarity = 'Common'
WHERE name = 'Tomato';

UPDATE seeds SET 
  cost_sheckles = 600,
  growth_time = 6,
  sell_price = 900,
  rarity = 'Uncommon'
WHERE name = 'Orange Tulip';

-- Insert missing seeds if they don't exist
INSERT INTO seeds (name, cost_sheckles, growth_time, sell_price, rarity, description, obtainable, multi_harvest, stock, max_stock, min_stock, cost_robux)
VALUES 
  ('Corn', 1300, 40, 1950, 'Uncommon', 'Golden kernels of deliciousness', true, false, 0, 3, 0, null),
  ('Daffodil', 1000, 50, 1500, 'Uncommon', 'Bright yellow spring flower', true, false, 0, 3, 0, null),
  ('Watermelon', 2500, 100, 3750, 'Rare', 'Juicy summer fruit', true, false, 0, 2, 0, null),
  ('Pumpkin', 3000, 150, 4500, 'Rare', 'Orange fall gourd', true, false, 0, 2, 0, null),
  ('Apple', 3250, 150, 4875, 'Rare', 'Crisp red apple', true, false, 0, 2, 0, null),
  ('Bamboo', 4000, 200, 6000, 'Rare', 'Fast growing plant', true, false, 0, 2, 0, null),
  ('Coconut', 6000, 500, 9000, 'Legendary', 'Tropical tree nut', true, false, 0, 1, 0, null),
  ('Cactus', 15000, 300, 22500, 'Legendary', 'Desert survivor', true, false, 0, 1, 0, null),
  ('Dragon Fruit', 50000, 450, 75000, 'Legendary', 'Exotic pink fruit', true, false, 0, 1, 0, null),
  ('Mango', 100000, 500, 150000, 'Mythical', 'Sweet tropical fruit', true, false, 0, 1, 0, null),
  ('Grape', 850000, 500, 1275000, 'Mythical', 'Purple wine grapes', true, false, 0, 1, 0, null),
  ('Mushroom', 150000, 500, 225000, 'Mythical', 'Forest fungi', true, false, 0, 1, 0, null),
  ('Pepper', 1000000, 1000, 1500000, 'Divine', 'Spicy hot pepper', true, false, 0, 1, 0, null),
  ('Cacao', 2500000, 1000, 3750000, 'Divine', 'Chocolate bean pod', true, false, 0, 1, 0, null),
  ('Beanstalk', 10000000, 1000, 15000000, 'Divine', 'Giant magical vine', true, false, 0, 1, 0, null),
  ('Ember Lily', 15000000, 1500, 22500000, 'Prismatic', 'Fire flower', true, false, 0, 1, 0, null),
  ('Sugar Apple', 25000000, 1750, 37500000, 'Prismatic', 'Sweet custard apple', true, false, 0, 1, 0, null),
  ('Burning Bud', 40000000, 2000, 60000000, 'Prismatic', 'Flame flower bud', true, false, 0, 1, 0, null),
  ('Giant Pinecone', 55000000, 2500, 82500000, 'Prismatic', 'Enormous pine seed', true, false, 0, 1, 0, null),
  ('Elder Strawberry', 70000000, 3000, 105000000, 'Prismatic', 'Ancient berry', true, false, 0, 1, 0, null)
ON CONFLICT (name) DO UPDATE SET
  cost_sheckles = EXCLUDED.cost_sheckles,
  growth_time = EXCLUDED.growth_time,
  sell_price = EXCLUDED.sell_price,
  rarity = EXCLUDED.rarity,
  description = EXCLUDED.description,
  max_stock = EXCLUDED.max_stock;

-- Update shop_stock table with restock chances
UPDATE shop_stock SET restock_chance = 1.0 WHERE seed_id IN (SELECT id FROM seeds WHERE name IN ('Carrot', 'Strawberry', 'Blueberry', 'Tomato'));
UPDATE shop_stock SET restock_chance = 0.333 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Orange Tulip');
UPDATE shop_stock SET restock_chance = 0.16 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Corn');
UPDATE shop_stock SET restock_chance = 0.143 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Daffodil');
UPDATE shop_stock SET restock_chance = 0.125 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Watermelon');
UPDATE shop_stock SET restock_chance = 0.1 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Pumpkin');
UPDATE shop_stock SET restock_chance = 0.0714 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Apple');
UPDATE shop_stock SET restock_chance = 0.2 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Bamboo');
UPDATE shop_stock SET restock_chance = 0.05 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Coconut');
UPDATE shop_stock SET restock_chance = 0.0333 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Cactus');
UPDATE shop_stock SET restock_chance = 0.02 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Dragon Fruit');
UPDATE shop_stock SET restock_chance = 0.0125 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Mango');
UPDATE shop_stock SET restock_chance = 0.01 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Grape');
UPDATE shop_stock SET restock_chance = 0.0083 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Mushroom');
UPDATE shop_stock SET restock_chance = 0.0071 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Pepper');
UPDATE shop_stock SET restock_chance = 0.0063 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Cacao');
UPDATE shop_stock SET restock_chance = 0.0048 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Beanstalk');
UPDATE shop_stock SET restock_chance = 0.0042 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Ember Lily');
UPDATE shop_stock SET restock_chance = 0.0034 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Sugar Apple');
UPDATE shop_stock SET restock_chance = 0.0029 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Burning Bud');
UPDATE shop_stock SET restock_chance = 0.0026 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Giant Pinecone');
UPDATE shop_stock SET restock_chance = 0.0024 WHERE seed_id IN (SELECT id FROM seeds WHERE name = 'Elder Strawberry');

-- Insert shop_stock entries for new seeds
INSERT INTO shop_stock (seed_id, current_stock, max_stock, min_stock, restock_chance, last_restock, next_restock)
SELECT s.id, 0, 
  CASE 
    WHEN s.rarity IN ('Common') THEN 10
    WHEN s.rarity IN ('Uncommon') THEN 5
    WHEN s.rarity IN ('Rare') THEN 3
    WHEN s.rarity IN ('Legendary') THEN 2
    ELSE 1
  END,
  0,
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
    WHEN 'Giant Pinecone' THEN 0.0026
    WHEN 'Elder Strawberry' THEN 0.0024
    ELSE 0.1
  END,
  now(), 
  now() + interval '5 minutes'
FROM seeds s
WHERE NOT EXISTS (SELECT 1 FROM shop_stock ss WHERE ss.seed_id = s.id);

-- Update game_rooms to allow longer room codes
ALTER TABLE game_rooms ALTER COLUMN room_code TYPE varchar(20);