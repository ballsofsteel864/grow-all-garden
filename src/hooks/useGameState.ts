import { useState, useEffect, useCallback } from 'react';
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

  // Reset player money to 100
  const resetPlayerMoney = async () => {
    if (!player) return false;
    
    try {
      await supabase.rpc('reset_player_money', { player_id_param: player.id });
      setPlayer(prev => prev ? { ...prev, money: 100 } : null);
      
      toast({
        title: "Money Reset!",
        description: "Your money has been reset to 100 sheckles!",
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting money:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset money. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Harvest crop
  const harvestCrop = async (cropId: string) => {
    if (!player) return false;

    try {
      const { data: crop, error: cropError } = await supabase
        .from('crops')
        .select(`
          *,
          seeds (sell_price, multi_harvest, growth_time)
        `)
        .eq('id', cropId)
        .single();

      if (cropError || !crop) throw cropError;

      // Check if crop is actually ready based on real-time calculation
      const plantedTime = new Date(crop.planted_at).getTime();
      const growthTimeMs = (crop as any).seeds?.growth_time * 1000 || 300000;
      const readyTime = plantedTime + growthTimeMs;
      const now = Date.now();
      const isActuallyReady = now >= readyTime && crop.growth_stage >= crop.max_growth_stage;

      if (!isActuallyReady) {
        toast({
          title: "Not Ready",
          description: "This crop is not ready to harvest yet!",
          variant: "destructive"
        });
        return false;
      }

      // Calculate sell price with mutations
      const basePrice = crop.seeds?.sell_price || 10;
      const { data: finalPrice } = await supabase
        .rpc('calculate_mutation_price', { 
          base_price: basePrice, 
          mutations: crop.mutations || [] 
        });

      const sellPrice = finalPrice || basePrice;

      // Update player money
      const { error: moneyError } = await supabase
        .from('players')
        .update({ money: player.money + sellPrice })
        .eq('id', player.id);

      if (moneyError) throw moneyError;

      // Handle multi-harvest vs single harvest
      if (crop.seeds?.multi_harvest && crop.harvest_remaining > 1) {
        // Multi-harvest: reduce harvest count and reset growth
        const { error: updateError } = await supabase
          .from('crops')
          .update({ 
            harvest_remaining: crop.harvest_remaining - 1,
            last_harvest_at: new Date().toISOString(),
            ready_to_harvest: false,
            growth_stage: 1,
            planted_at: new Date().toISOString()
          })
          .eq('id', cropId);

        if (updateError) throw updateError;
      } else {
        // Single harvest: remove crop
        const { error: deleteError } = await supabase
          .from('crops')
          .delete()
          .eq('id', cropId);

        if (deleteError) throw deleteError;
      }

      // Update local state
      setPlayer(prev => prev ? { ...prev, money: prev.money + sellPrice } : null);

      const mutationText = crop.mutations && crop.mutations.length > 0 
        ? ` (${crop.mutations.join(', ')})` 
        : '';
      
      toast({
        title: "Harvest Successful!",
        description: `Sold for ${sellPrice} sheckles${mutationText}`,
      });

      // Reload data
      await loadCrops(player.id);
      return true;
    } catch (error) {
      console.error('Error harvesting crop:', error);
      toast({
        title: "Harvest Failed",
        description: "Failed to harvest crop. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

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

  // Load shop stock with rarity-based filtering and restock countdown
  const loadShopStock = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_stock')
        .select(`
          *,
          seeds (*)
        `);

      if (error) throw error;
      
      // Add countdown timer for each item
      const stockWithCountdown = (data || []).map(item => ({
        ...item,
        timeUntilRestock: item.next_restock_at 
          ? Math.max(0, Math.floor((new Date(item.next_restock_at).getTime() - Date.now()) / 1000))
          : 0
      }));
      
      setShopStock(stockWithCountdown);
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
    // Admin check removed since buttons are only shown to admins

    try {
      // End current weather first
      await supabase
        .from('weather_events')
        .update({ is_active: false })
        .eq('is_active', true);

      // Start new weather (skip if clearing)
      if (weatherType !== "Clear") {
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

        // Trigger weather mutations on existing crops
        await supabase.rpc('trigger_weather_mutations', { 
          weather_type_param: weatherType 
        });
      }

      toast({
        title: "Weather Changed!",
        description: weatherType === "Clear" ? "Weather cleared!" : `${weatherType} weather has started!`,
      });

      await loadCurrentWeather();
      return true;
    } catch (error) {
      console.error('Error triggering weather:', error);
      toast({
        title: "Error",
        description: "Failed to trigger weather event",
        variant: "destructive"
      });
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

  // Multiplayer functions
  const createRoom = async () => {
    if (!player) return '';
    
    try {
      const roomCode = Math.random().toString(36).substring(2, 11).toUpperCase();
      
      const { error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          created_by: player.id
        });
      
      if (roomError) throw roomError;
      
      // Join the room
      const { error: playerError } = await supabase
        .from('players')
        .update({ room_id: roomCode })
        .eq('id', player.id);
        
      if (playerError) throw playerError;
      
      setPlayer(prev => prev ? { ...prev, room_id: roomCode } : null);
      
      toast({
        title: "Room Created!",
        description: `Room ${roomCode} created and joined successfully!`,
      });
      
      return roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    if (!player) return false;
    
    try {
      const { error } = await supabase.rpc('leave_room', { 
        player_id_param: player.id 
      });
      
      if (error) throw error;
      
      setPlayer(prev => prev ? { ...prev, room_id: null } : null);
      
      toast({
        title: "Left Room",
        description: "You have left the room successfully!",
      });
      
      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error",
        description: "Failed to leave room",
        variant: "destructive"
      });
      return false;
    }
  };

  const joinRoom = async (roomCode: string) => {
    if (!player) return false;
    
    try {
      // Check if room exists
      const { data: room } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .eq('is_active', true)
        .single();
        
      if (!room) return false;
      
      // Join the room
      const { error } = await supabase
        .from('players')
        .update({ room_id: roomCode })
        .eq('id', player.id);
        
      if (error) throw error;
      
      setPlayer(prev => prev ? { ...prev, room_id: roomCode } : null);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  // Load players for admin panel
  const loadAllPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
  };

  // Load room players
  const loadRoomPlayers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading room players:', error);
      return [];
    }
  };

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
    loadCrops,
    createRoom,
    joinRoom,
    leaveRoom,
    loadAllPlayers,
    loadRoomPlayers,
    resetPlayerMoney,
    harvestCrop
  };
};