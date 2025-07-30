-- Clear all player data and reset the game
DELETE FROM crops;
DELETE FROM player_inventories;
DELETE FROM players;
DELETE FROM weather_events;
DELETE FROM shop_stock;

-- Reset shop stock for all seeds
INSERT INTO shop_stock (seed_id, current_stock, max_stock, min_stock, restock_chance)
SELECT 
  id,
  FLOOR(RANDOM() * 6 + 5)::integer, -- 5-10 stock
  10,
  0,
  0.1
FROM seeds
WHERE obtainable = true;