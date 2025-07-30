-- Fix the seeds table structure first
-- Add unique constraint to name column
ALTER TABLE public.seeds ADD CONSTRAINT seeds_name_unique UNIQUE (name);

-- Add missing columns to shop_stock
ALTER TABLE public.shop_stock 
ADD COLUMN IF NOT EXISTS restock_chance DECIMAL(5,4) DEFAULT 0.1,
ADD COLUMN IF NOT EXISTS next_restock_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour'),
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0;

-- Add missing columns to crops for multi-harvest tracking
ALTER TABLE public.crops
ADD COLUMN IF NOT EXISTS harvest_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_fully_grown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_harvest_at TIMESTAMP WITH TIME ZONE;