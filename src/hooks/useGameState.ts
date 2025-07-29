import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Player, Seed, Crop, WeatherEvent } from '@/lib/gameData';

export const useGameState = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherEvent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shopStock, setShopStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize player
  const initializePlayer = async (username: string) => {
    try {
      // Check if player exists
      let { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .single();

      if (!existingPlayer) {
        // Create new player
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert({ username, money: 100 })
          .select()
          .single();

        if (error) throw error;
        existingPlayer = newPlayer;
      }

      setPlayer(existingPlayer);
      setIsAdmin(existingPlayer.is_admin);
      localStorage.setItem('farmUsername', username);
      return existingPlayer;
    } catch (error) {
      console.error('Error initializing player:', error);
      toast({
        title: "Error",
        description: "Failed to initialize player",
        variant: "destructive"
      });
    }
  };

  // Load seeds data
  const loadSeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('seeds')
        .select('*')
        .order('rarity', { ascending: true });

      if (error) throw error;
      setSeeds((data || []) as Seed[]);
    } catch (error) {
      console.error('Error loading seeds:', error);
    }
  };

  // Load shop stock
  const loadShopStock = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_stock')
        .select(`
          *,
          seeds (*)
        `);

      if (error) throw error;
      setShopStock(data || []);
    } catch (error) {
      console.error('Error loading shop stock:', error);
    }
  };

  // Load player inventory
  const loadInventory = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_inventories')
        .select(`
          *,
          seeds (*)
        `)
        .eq('player_id', playerId);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // Load current weather
  const loadCurrentWeather = async () => {
    try {
      const { data, error } = await supabase
        .from('weather_events')
        .select('*')
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setCurrentWeather((data?.[0] || null) as WeatherEvent | null);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  // Buy seed from shop
  const buySeed = async (seedId: string, cost: number) => {
    if (!player) return false;

    if (player.money < cost) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough sheckles!",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Start transaction-like operations
      // Update player money
      const { error: playerError } = await supabase
        .from('players')
        .update({ money: player.money - cost })
        .eq('id', player.id);

      if (playerError) throw playerError;

      // Update shop stock
      const { error: stockError } = await supabase
        .rpc('decrement_stock', { seed_id: seedId });

      if (stockError) throw stockError;

      // Add to inventory
      const { data: existingItem } = await supabase
        .from('player_inventories')
        .select('quantity')
        .eq('player_id', player.id)
        .eq('seed_id', seedId)
        .single();

      if (existingItem) {
        const { error: inventoryError } = await supabase
          .from('player_inventories')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('player_id', player.id)
          .eq('seed_id', seedId);
        if (inventoryError) throw inventoryError;
      } else {
        const { error: inventoryError } = await supabase
          .from('player_inventories')
          .insert({
            player_id: player.id,
            seed_id: seedId,
            quantity: 1
          });
        if (inventoryError) throw inventoryError;
      }

      // Update local state
      setPlayer(prev => prev ? { ...prev, money: prev.money - cost } : null);
      
      toast({
        title: "Purchase Successful!",
        description: "Seed purchased and added to inventory",
      });

      // Reload data
      await Promise.all([
        loadInventory(player.id),
        loadShopStock()
      ]);

      return true;
    } catch (error) {
      console.error('Error buying seed:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to buy seed. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Plant seed
  const plantSeed = async (seedId: string, x: number, y: number) => {
    if (!player) return false;

    try {
      // Check if position is already occupied
      const { data: existingCrop } = await supabase
        .from('crops')
        .select('id')
        .eq('x_position', x)
        .eq('y_position', y)
        .eq('player_id', player.id)
        .single();

      if (existingCrop) {
        toast({
          title: "Position Occupied",
          description: "There's already a crop at this position!",
          variant: "destructive"
        });
        return false;
      }

      // Check inventory
      const { data: inventoryItem } = await supabase
        .from('player_inventories')
        .select('quantity')
        .eq('player_id', player.id)
        .eq('seed_id', seedId)
        .single();

      if (!inventoryItem || inventoryItem.quantity < 1) {
        toast({
          title: "No Seeds",
          description: "You don't have this seed in your inventory!",
          variant: "destructive"
        });
        return false;
      }

      // Plant the crop
      const { error: cropError } = await supabase
        .from('crops')
        .insert({
          player_id: player.id,
          seed_id: seedId,
          x_position: x,
          y_position: y,
          growth_stage: 0,
          max_growth_stage: 5
        });

      if (cropError) throw cropError;

      // Reduce inventory
      const { error: inventoryError } = await supabase
        .from('player_inventories')
        .update({ quantity: inventoryItem.quantity - 1 })
        .eq('player_id', player.id)
        .eq('seed_id', seedId);

      if (inventoryError) throw inventoryError;

      toast({
        title: "Seed Planted!",
        description: "Your seed has been planted successfully!",
      });

      // Reload data
      await Promise.all([
        loadInventory(player.id),
        loadCrops(player.id)
      ]);

      return true;
    } catch (error) {
      console.error('Error planting seed:', error);
      toast({
        title: "Failed to plant crop!",
        description: "There was an error saving your game. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load crops
  const loadCrops = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select(`
          *,
          seeds (*)
        `)
        .eq('player_id', playerId);

      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error('Error loading crops:', error);
    }
  };

  // Trigger weather (admin only)
  const triggerWeather = async (weatherType: string, isGlobal: boolean = true) => {
    if (!isAdmin) return false;

    try {
      // End current weather
      await supabase
        .from('weather_events')
        .update({ is_active: false })
        .eq('is_active', true);

      // Start new weather
      const { error } = await supabase
        .from('weather_events')
        .insert({
          weather_type: weatherType,
          duration: 300, // 5 minutes
          is_active: true,
          triggered_by_admin: true,
          scope: isGlobal ? 'global' : 'local'
        });

      if (error) throw error;

      toast({
        title: "Weather Changed!",
        description: `${weatherType} weather has started!`,
      });

      await loadCurrentWeather();
      return true;
    } catch (error) {
      console.error('Error triggering weather:', error);
      return false;
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!player) return;

    // Subscribe to weather changes
    const weatherSubscription = supabase
      .channel('weather-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_events'
        },
        () => loadCurrentWeather()
      )
      .subscribe();

    // Subscribe to shop stock changes
    const stockSubscription = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shop_stock'
        },
        () => loadShopStock()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weatherSubscription);
      supabase.removeChannel(stockSubscription);
    };
  }, [player]);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        loadSeeds(),
        loadShopStock(),
        loadCurrentWeather()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  // Auto-login saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem('farmUsername');
    if (savedUsername && !player) {
      initializePlayer(savedUsername);
    }
  }, []);

  return {
    player,
    seeds,
    inventory,
    crops,
    currentWeather,
    isAdmin,
    shopStock,
    loading,
    initializePlayer,
    buySeed,
    plantSeed,
    triggerWeather,
    loadInventory,
    loadCrops
  };
};