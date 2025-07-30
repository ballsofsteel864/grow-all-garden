-- Clear existing data and setup proper seeds
DELETE FROM shop_stock;
DELETE FROM seeds;

-- Insert seeds with exact specifications
INSERT INTO seeds (name, rarity, cost_sheckles, sell_price, growth_time, multi_harvest, obtainable, description) VALUES
('Carrot', 'Common', 10, 15, 7, true, true, 'A crunchy orange vegetable'),
('Strawberry', 'Common', 15, 22, 10, true, true, 'Sweet red berries'),
('Blueberry', 'Common', 20, 30, 105, true, true, 'Small blue antioxidant berries'),
('Tomato', 'Common', 25, 35, 50, true, true, 'Juicy red fruit'),
('Orange Tulip', 'Uncommon', 50, 75, 6, true, true, 'Beautiful orange flower'),
('Corn', 'Uncommon', 75, 110, 40, true, true, 'Golden kernels on a cob'),
('Daffodil', 'Uncommon', 100, 150, 50, true, true, 'Bright yellow spring flower'),
('Watermelon', 'Rare', 150, 225, 100, true, true, 'Large green striped fruit'),
('Pumpkin', 'Rare', 200, 300, 150, true, true, 'Orange gourd for carving'),
('Apple', 'Rare', 250, 375, 150, true, true, 'Crisp red or green fruit'),
('Bamboo', 'Rare', 300, 450, 200, true, true, 'Fast growing green stalks'),
('Coconut', 'Legendary', 500, 750, 500, true, true, 'Tropical brown nut'),
('Cactus', 'Legendary', 750, 1125, 300, true, true, 'Spiky desert plant'),
('Dragon Fruit', 'Legendary', 1000, 1500, 450, true, true, 'Exotic pink scaly fruit'),
('Mango', 'Mythical', 1500, 2250, 500, true, true, 'Sweet tropical orange fruit'),
('Grape', 'Mythical', 2000, 3000, 500, true, true, 'Purple clusters for wine'),
('Mushroom', 'Mythical', 2500, 3750, 500, true, true, 'Earthy forest fungi'),
('Pepper', 'Divine', 3000, 4500, 1000, true, true, 'Spicy hot capsicum'),
('Cacao', 'Divine', 4000, 6000, 1000, true, true, 'Source of chocolate'),
('Beanstalk', 'Divine', 5000, 7500, 1000, true, true, 'Magical climbing plant'),
('Ember Lily', 'Prismatic', 7500, 11250, 1500, true, true, 'Fiery glowing flower'),
('Sugar Apple', 'Prismatic', 10000, 15000, 1750, true, true, 'Sweet custard-like fruit'),
('Burning Bud', 'Prismatic', 15000, 22500, 2000, true, true, 'Blazing magical flower');

-- Setup shop stock with proper restock chances (converted to decimal)
INSERT INTO shop_stock (seed_id, current_stock, max_stock, min_stock, restock_chance, next_restock) 
SELECT 
  s.id,
  5, -- current_stock
  10, -- max_stock
  0, -- min_stock
  CASE s.name
    WHEN 'Carrot' THEN 1.0
    WHEN 'Strawberry' THEN 1.0
    WHEN 'Blueberry' THEN 1.0
    WHEN 'Tomato' THEN 1.0
    WHEN 'Orange Tulip' THEN 0.333
    WHEN 'Corn' THEN 0.167
    WHEN 'Daffodil' THEN 0.143
    WHEN 'Watermelon' THEN 0.125
    WHEN 'Pumpkin' THEN 0.1
    WHEN 'Apple' THEN 0.071
    WHEN 'Bamboo' THEN 0.2
    WHEN 'Coconut' THEN 0.05
    WHEN 'Cactus' THEN 0.033
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
  END,
  now() + interval '5 minutes'
FROM seeds s;

-- Enable realtime for shop_stock and weather_events
ALTER TABLE shop_stock REPLICA IDENTITY FULL;
ALTER TABLE weather_events REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE shop_stock;
ALTER publication supabase_realtime ADD TABLE weather_events;