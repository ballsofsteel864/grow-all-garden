import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { UsernameDialog } from "@/components/UsernameDialog";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminPanel } from "@/components/AdminPanel";
import { SeedShop } from "@/components/SeedShop";
import { Inventory } from "@/components/Inventory";
import { FarmGrid } from "@/components/FarmGrid";
import { WeatherControl } from "@/components/WeatherControl";
import { Multiplayer } from "@/components/Multiplayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const {
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
    loadAllPlayers,
    loadRoomPlayers,
    resetPlayerMoney,
    harvestCrop
  } = useGameState();

  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedUsername = localStorage.getItem('farmUsername');
    if (!savedUsername && !player) {
      setShowUsernameDialog(true);
    }
  }, [player]);

  // Load players when admin panel is opened or player has room
  useEffect(() => {
    const loadPlayers = async () => {
      if (isAdmin || adminLoggedIn) {
        const players = await loadAllPlayers();
        setAllPlayers(players);
      }
      
      if (player?.room_id) {
        const players = await loadRoomPlayers(player.room_id);
        setRoomPlayers(players);
      }
    };
    
    loadPlayers();
  }, [player, isAdmin, adminLoggedIn, loadAllPlayers, loadRoomPlayers]);

  const handleUsernameSet = async (username: string) => {
    await initializePlayer(username);
    setShowUsernameDialog(false);
  };

  const handlePlantSeed = async (x: number, y: number) => {
    if (!selectedSeedId) return;
    const success = await plantSeed(selectedSeedId, x, y);
    if (success) {
      setSelectedSeedId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-farm">
        <div className="text-center">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-primary">Loading Grow All Garden...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-farm p-4">
      <UsernameDialog open={showUsernameDialog} onUsernameSet={handleUsernameSet} />
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">🌱 Grow All Garden</h1>
          {player && (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                Welcome, {player.username}!
              </Badge>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-accent" />
                <span className="font-semibold">{player.money.toLocaleString()} ¢</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={resetPlayerMoney} variant="outline" size="sm">
            Reset Money
          </Button>
          <AdminLogin onAdminLogin={setAdminLoggedIn} isLoggedIn={adminLoggedIn} />
          {(isAdmin || adminLoggedIn) && (
            <Button onClick={() => setShowAdminPanel(true)} variant="outline">
              Admin Panel
            </Button>
          )}
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Farm */}
        <div className="lg:col-span-2 space-y-6">
          <FarmGrid
            crops={crops}
            selectedSeedId={selectedSeedId}
            onPlantSeed={handlePlantSeed}
            onHarvestCrop={harvestCrop}
            gridSize={10}
          />
        </div>

        {/* Right Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop and Inventory Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SeedShop
              seeds={seeds}
              shopStock={shopStock}
              onBuySeed={buySeed}
              playerMoney={player?.money || 0}
            />
            
            <Inventory
              inventory={inventory}
              onSelectSeed={setSelectedSeedId}
              selectedSeedId={selectedSeedId}
            />
          </div>

          {/* Weather and Multiplayer Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeatherControl
              currentWeather={currentWeather}
              onTriggerWeather={(weatherType) => triggerWeather(weatherType, true)}
              isAdmin={isAdmin || adminLoggedIn}
            />
            
            <Multiplayer
              currentRoom={player?.room_id || null}
              onCreateRoom={createRoom}
              onJoinRoom={joinRoom}
              players={roomPlayers}
            />
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onTriggerWeather={triggerWeather}
        players={allPlayers}
      />
    </div>
  );
};

export default Index;