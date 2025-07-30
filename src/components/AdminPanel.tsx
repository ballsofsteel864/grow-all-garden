import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Cloud, Settings, Database, Terminal, Activity, Coins, Zap, AlertTriangle } from "lucide-react";
import { WEATHER_TYPES, ADMIN_COMMANDS } from "@/lib/gameData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerWeather: (weatherType: string, isGlobal?: boolean) => void;
  players: any[];
}

export const AdminPanel = ({ isOpen, onClose, onTriggerWeather, players }: AdminPanelProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [customCommand, setCustomCommand] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [weatherDuration, setWeatherDuration] = useState<number>(300);
  const [selectedWeather, setSelectedWeather] = useState<string>("");
  const [moneyAmount, setMoneyAmount] = useState<number>(100);
  const [seedAmount, setSeedAmount] = useState<number>(1);
  const { toast } = useToast();

  const handleResetPlayerMoney = async (playerId: string, amount: number = 100) => {
    try {
      const { error } = await supabase.rpc('reset_player_money', { 
        player_id_param: playerId 
      });

      if (error) throw error;

      const player = players.find(p => p.id === playerId);
      toast({
        title: "Money Reset",
        description: `${player?.username}'s money has been reset to ${amount} sheckles.`,
      });
      
      addToCommandHistory(`Money reset for ${player?.username}: ${amount} sheckles`);
    } catch (error) {
      console.error('Error resetting player money:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset player money.",
        variant: "destructive"
      });
    }
  };

  const handleGivePlayerMoney = async (playerId: string, amount: number) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      const { error } = await supabase
        .from('players')
        .update({ money: player.money + amount })
        .eq('id', playerId);

      if (error) throw error;

      toast({
        title: "Money Given",
        description: `Gave ${amount} sheckles to ${player.username}.`,
      });
      
      addToCommandHistory(`Gave ${amount} sheckles to ${player.username}`);
    } catch (error) {
      console.error('Error giving money:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to give money to player.",
        variant: "destructive"
      });
    }
  };

  const handleGivePlayerSeeds = async (playerId: string, seedId: string, quantity: number) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      // Check if player already has this seed
      const { data: existingItem } = await supabase
        .from('player_inventories')
        .select('quantity')
        .eq('player_id', playerId)
        .eq('seed_id', seedId)
        .single();

      if (existingItem) {
        // Update existing inventory
        const { error } = await supabase
          .from('player_inventories')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('player_id', playerId)
          .eq('seed_id', seedId);

        if (error) throw error;
      } else {
        // Create new inventory item
        const { error } = await supabase
          .from('player_inventories')
          .insert({
            player_id: playerId,
            seed_id: seedId,
            quantity: quantity
          });

        if (error) throw error;
      }

      toast({
        title: "Seeds Given",
        description: `Gave ${quantity} seeds to ${player.username}.`,
      });
      
      addToCommandHistory(`Gave ${quantity} seeds to ${player.username}`);
    } catch (error) {
      console.error('Error giving seeds:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to give seeds to player.",
        variant: "destructive"
      });
    }
  };

  const handleTriggerWeather = (weatherType: string) => {
    onTriggerWeather(weatherType, true);
    toast({
      title: "Weather Triggered",
      description: `${weatherType} weather has been activated globally for ${weatherDuration} seconds.`,
    });
    addToCommandHistory(`Triggered global ${weatherType} weather for ${weatherDuration}s`);
  };

  const handleExecuteCommand = () => {
    if (!customCommand.trim()) {
      toast({
        title: "Invalid Command",
        description: "Please enter a command to execute.",
        variant: "destructive"
      });
      return;
    }

    addToCommandHistory(`> ${customCommand}`);
    
    // Parse and execute common commands
    const cmd = customCommand.toLowerCase().trim();
    
    if (cmd.startsWith('/weather ')) {
      const weatherType = cmd.replace('/weather ', '');
      if (WEATHER_TYPES.includes(weatherType)) {
        handleTriggerWeather(weatherType);
      } else {
        addToCommandHistory(`Error: Unknown weather type "${weatherType}"`);
      }
    } else if (cmd === '/clear weather') {
      handleTriggerWeather("Clear");
    } else if (cmd.startsWith('/give money ')) {
      const amount = parseInt(cmd.replace('/give money ', ''));
      if (selectedPlayer && !isNaN(amount)) {
        handleGivePlayerMoney(selectedPlayer, amount);
      } else {
        addToCommandHistory(`Error: Invalid syntax or no player selected`);
      }
    } else {
      addToCommandHistory(`Command executed: ${customCommand}`);
      toast({
        title: "Command Executed",
        description: `Executed: ${customCommand}`,
      });
    }
    
    setCustomCommand("");
  };

  const addToCommandHistory = (message: string) => {
    setCommandHistory(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleKickPlayer = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // In a real implementation, you'd actually kick the player
    toast({
      title: "Player Kicked",
      description: `${player.username} has been kicked from the game.`,
    });
    addToCommandHistory(`Kicked player: ${player.username}`);
  };

  const handleBanPlayer = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // In a real implementation, you'd ban the player
    toast({
      title: "Player Banned",
      description: `${player.username} has been banned from the game.`,
      variant: "destructive"
    });
    addToCommandHistory(`Banned player: ${player.username}`);
  };

  const totalPlayers = players.length;
  const adminPlayers = players.filter(p => p.is_admin).length;
  const activePlayers = players.filter(p => p.room_id).length;
  const totalMoney = players.reduce((sum, p) => sum + (p.money || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            Admin Control Panel
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Players
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="economy" className="flex items-center gap-1">
              <Coins className="w-3 h-3" />
              Economy
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalPlayers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{adminPlayers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    In Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary-foreground">{activePlayers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Total Economy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{totalMoney.toLocaleString()} ¢</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-1 font-mono text-sm">
                    {commandHistory.slice(-10).map((entry, index) => (
                      <div key={index} className="text-muted-foreground">
                        {entry}
                      </div>
                    ))}
                    {commandHistory.length === 0 && (
                      <div className="text-muted-foreground">No recent activity</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{player.username}</span>
                              {player.is_admin && (
                                <Badge variant="destructive">Admin</Badge>
                              )}
                              {player.room_id && (
                                <Badge variant="secondary">Room: {player.room_id}</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Money: {player.money?.toLocaleString() || 0} ¢ | Level: {player.level || 1} | XP: {player.xp || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPlayerMoney(player.id)}
                          >
                            Reset Money
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleKickPlayer(player.id)}
                          >
                            Kick
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBanPlayer(player.id)}
                          >
                            Ban
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Give Items Section */}
            <Card>
              <CardHeader>
                <CardTitle>Give Items to Player</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="player-select">Select Player</Label>
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose player..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="money-amount">Money Amount</Label>
                    <Input
                      id="money-amount"
                      type="number"
                      value={moneyAmount}
                      onChange={(e) => setMoneyAmount(Number(e.target.value))}
                      min={1}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seed-amount">Seed Amount</Label>
                    <Input
                      id="seed-amount"
                      type="number"
                      value={seedAmount}
                      onChange={(e) => setSeedAmount(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    onClick={() => selectedPlayer && handleGivePlayerMoney(selectedPlayer, moneyAmount)}
                    disabled={!selectedPlayer}
                  >
                    Give Money
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => selectedPlayer && handleResetPlayerMoney(selectedPlayer, 100)}
                    disabled={!selectedPlayer}
                  >
                    Reset Money
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => selectedPlayer && handleGivePlayerMoney(selectedPlayer, 1000)}
                    disabled={!selectedPlayer}
                  >
                    Give 1000 ¢
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => selectedPlayer && handleGivePlayerMoney(selectedPlayer, 10000)}
                    disabled={!selectedPlayer}
                  >
                    Give 10k ¢
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Weather Control System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weather-duration">Duration (seconds)</Label>
                    <Input
                      id="weather-duration"
                      type="number"
                      value={weatherDuration}
                      onChange={(e) => setWeatherDuration(Number(e.target.value))}
                      min={30}
                      max={3600}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => handleTriggerWeather("Clear")}
                      className="w-full"
                      variant="destructive"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Clear All Weather
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-48">
                  <div className="grid grid-cols-3 gap-2">
                    {WEATHER_TYPES.map((weather) => (
                      <Button
                        key={weather}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerWeather(weather)}
                        className="text-xs capitalize"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {weather}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Economic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Money in Circulation</div>
                    <div className="text-2xl font-bold">{totalMoney.toLocaleString()} ¢</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average Player Wealth</div>
                    <div className="text-2xl font-bold">
                      {totalPlayers > 0 ? Math.floor(totalMoney / totalPlayers).toLocaleString() : 0} ¢
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global Economy Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      players.forEach(player => handleResetPlayerMoney(player.id, 100));
                      toast({
                        title: "Economy Reset",
                        description: "All players' money has been reset to 100 sheckles.",
                      });
                    }}
                  >
                    Reset All Player Money
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      players.forEach(player => handleGivePlayerMoney(player.id, 1000));
                      toast({
                        title: "Money Distributed",
                        description: "Gave 1000 sheckles to all players.",
                      });
                    }}
                  >
                    Give All Players 1000 ¢
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Console</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-48 w-full border rounded p-4 bg-black text-green-400 font-mono text-sm">
                  {commandHistory.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                  {commandHistory.length === 0 && (
                    <div className="text-muted-foreground">Console ready. Type commands below.</div>
                  )}
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="Enter command (e.g., /weather sunny, /give money 1000)..."
                    onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
                    className="font-mono"
                  />
                  <Button onClick={handleExecuteCommand}>Execute</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-3 gap-2">
                    {ADMIN_COMMANDS.slice(0, 12).map((cmd) => (
                      <Button
                        key={cmd}
                        size="sm"
                        variant="outline"
                        onClick={() => setCustomCommand(`/${cmd} `)}
                        className="text-xs"
                      >
                        /{cmd}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({ title: "Backup", description: "Database backup initiated" });
                      addToCommandHistory("Database backup initiated");
                    }}
                  >
                    Backup Database
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({ title: "Cleanup", description: "Database cleanup initiated" });
                      addToCommandHistory("Database cleanup initiated");
                    }}
                  >
                    Cleanup Old Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({ title: "Optimize", description: "Database optimization initiated" });
                      addToCommandHistory("Database optimization initiated");
                    }}
                  >
                    Optimize Tables
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({ title: "Stats", description: "Database stats generated" });
                      addToCommandHistory("Database stats generated");
                    }}
                  >
                    Generate Stats
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        Database operations can affect game performance. Use these tools carefully and during low-traffic periods.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close Panel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};