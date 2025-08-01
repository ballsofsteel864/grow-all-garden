-- Update seeds with correct prices, sell prices, and harvest types
UPDATE seeds SET cost_sheckles = 10, sell_price = 22, multi_harvest = false WHERE name = 'Carrot';
UPDATE seeds SET cost_sheckles = 50, sell_price = 19, multi_harvest = true WHERE name = 'Strawberry';
UPDATE seeds SET cost_sheckles = 400, sell_price = 21, multi_harvest = true WHERE name = 'Blueberry';
UPDATE seeds SET cost_sheckles = 600, sell_price = 792, multi_harvest = false WHERE name = 'Orange Tulip';
UPDATE seeds SET cost_sheckles = 800, sell_price = 35, multi_harvest = true WHERE name = 'Tomato';
UPDATE seeds SET cost_sheckles = 1300, sell_price = 44, multi_harvest = true WHERE name = 'Corn';
UPDATE seeds SET cost_sheckles = 1000, sell_price = 988, multi_harvest = false WHERE name = 'Daffodil';
UPDATE seeds SET cost_sheckles = 2500, sell_price = 2905, multi_harvest = false WHERE name = 'Watermelon';
UPDATE seeds SET cost_sheckles = 3000, sell_price = 3854, multi_harvest = false WHERE name = 'Pumpkin';
UPDATE seeds SET cost_sheckles = 3250, sell_price = 266, multi_harvest = true WHERE name = 'Apple';
UPDATE seeds SET cost_sheckles = 4000, sell_price = 3944, multi_harvest = false WHERE name = 'Bamboo';
UPDATE seeds SET cost_sheckles = 6000, sell_price = 2670, multi_harvest = true WHERE name = 'Coconut';
UPDATE seeds SET cost_sheckles = 15000, sell_price = 3224, multi_harvest = true WHERE name = 'Cactus';
UPDATE seeds SET cost_sheckles = 50000, sell_price = 4566, multi_harvest = true WHERE name = 'Dragon Fruit';
UPDATE seeds SET cost_sheckles = 100000, sell_price = 6308, multi_harvest = true WHERE name = 'Mango';
UPDATE seeds SET cost_sheckles = 850000, sell_price = 7554, multi_harvest = true WHERE name = 'Grape';
UPDATE seeds SET cost_sheckles = 150000, sell_price = 142443, multi_harvest = false WHERE name = 'Mushroom';
UPDATE seeds SET cost_sheckles = 1000000, sell_price = 7220, multi_harvest = true WHERE name = 'Pepper';
UPDATE seeds SET cost_sheckles = 2500000, sell_price = 9927, multi_harvest = true WHERE name = 'Cacao';
UPDATE seeds SET cost_sheckles = 10000000, sell_price = 18050, multi_harvest = true WHERE name = 'Beanstalk';
UPDATE seeds SET cost_sheckles = 20000000, sell_price = 65000, multi_harvest = true WHERE name = 'Ember Lily';
UPDATE seeds SET cost_sheckles = 25000000, sell_price = 50000, multi_harvest = true WHERE name = 'Sugar Apple';
UPDATE seeds SET cost_sheckles = 50000000, sell_price = 135000, multi_harvest = true WHERE name = 'Burning Bud';
UPDATE seeds SET cost_sheckles = 65000000, sell_price = 65000, multi_harvest = true WHERE name = 'Giant Pinecone';

-- Fix harvest logic by updating crops that should be ready
UPDATE crops 
SET ready_to_harvest = true 
WHERE growth_stage >= max_growth_stage 
AND planted_at + (
  SELECT growth_time || ' seconds'
  FROM seeds 
  WHERE seeds.id = crops.seed_id
)::interval <= now();