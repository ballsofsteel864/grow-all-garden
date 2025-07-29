import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_COMMANDS, WEATHER_TYPES } from "@/lib/gameData";
import { Settings, Terminal, Users, Cloud, Database, FileText } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerWeather: (weather: string, isGlobal?: boolean) => void;
  players: any[];
}

export const AdminPanel = ({ isOpen, onClose, onTriggerWeather, players }: AdminPanelProps) => {
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSeed, setSelectedSeed] = useState("");
  const [selectedWeather, setSelectedWeather] = useState("");
  const [eventScope, setEventScope] = useState<"local" | "global">("global");
  const { toast } = useToast();

  const executeCommand = () => {
    if (!commandInput.trim()) return;

    const command = commandInput.trim();
    setCommandHistory(prev => [...prev, `> ${command}`]);
    
    // Mock command execution
    setCommandHistory(prev => [...prev, `Executed: ${command}`]);
    
    toast({
      title: "Command Executed",
      description: `Command "${command}" executed successfully`,
    });
    
    setCommandInput("");
  };

  const giveItemToPlayer = (item: string) => {
    if (!selectedPlayer) {
      toast({
        title: "No Player Selected",
        description: "Please select a player first",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Item Given",
      description: `${item} given to ${selectedPlayer} successfully`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Settings className="w-5 h-5" />
            Administrator Panel
          </DialogTitle>
          <DialogDescription>
            Full control over game systems and player management
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="players">
              <Users className="w-4 h-4 mr-1" />
              Players
            </TabsTrigger>
            <TabsTrigger value="commands">
              <Terminal className="w-4 h-4 mr-1" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="events">
              <Cloud className="w-4 h-4 mr-1" />
              Events
            </TabsTrigger>
            <TabsTrigger value="economy">
              Economy
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Database className="w-4 h-4 mr-1" />
              Data Editor
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="w-4 h-4 mr-1" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Online Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.length === 0 ? (
                    <p className="text-muted-foreground">No players online</p>
                  ) : (
                    players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{player.username}</span>
                          {player.is_admin && <Badge className="ml-2">Admin</Badge>}
                        </div>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">Kick</Button>
                          <Button size="sm" variant="outline">Ban</Button>
                          <Button size="sm" variant="outline">Join Server</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Give Items Section */}
            <Card>
              <CardHeader>
                <CardTitle>Give Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Player</Label>
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose player..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.username}>
                            {player.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Select Seed</Label>
                    <Select value={selectedSeed} onValueChange={setSelectedSeed}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose seed..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carrot">Carrot</SelectItem>
                        <SelectItem value="strawberry">Strawberry</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button size="sm" onClick={() => giveItemToPlayer("Seeds")}>Give Seeds</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("All Seeds")}>Give All Seeds</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Gear")}>Give Gear</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Sheckles")}>Give Sheckles</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Pet")}>Give Pet</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Egg")}>Give Egg</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Crate")}>Give Crate</Button>
                  <Button size="sm" onClick={() => giveItemToPlayer("Cosmetic")}>Give Cosmetic</Button>
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
                <ScrollArea className="h-60 w-full border rounded p-4 bg-black text-green-400 font-mono text-sm">
                  {commandHistory.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Enter command..."
                    onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                    className="font-mono"
                  />
                  <Button onClick={executeCommand}>Execute</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="grid grid-cols-3 gap-2">
                    {ADMIN_COMMANDS.map((cmd) => (
                      <Button
                        key={cmd}
                        size="sm"
                        variant="outline"
                        onClick={() => setCommandInput(`/${cmd} `)}
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

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weather & Events Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Scope</Label>
                    <Select value={eventScope} onValueChange={(value: "local" | "global") => setEventScope(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Select Weather</Label>
                    <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose weather..." />
                      </SelectTrigger>
                      <SelectContent>
                        {WEATHER_TYPES.map((weather) => (
                          <SelectItem key={weather} value={weather}>
                            {weather}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={() => selectedWeather && onTriggerWeather(selectedWeather, eventScope === 'global')}
                  disabled={!selectedWeather}
                  className="w-full"
                >
                  Trigger {eventScope} {selectedWeather}
                </Button>

                <Separator />

                <div className="grid grid-cols-3 gap-2">
                  {WEATHER_TYPES.map((weather) => (
                    <Button
                      key={weather}
                      size="sm"
                      variant="outline"
                      onClick={() => onTriggerWeather(weather, eventScope === 'global')}
                      className="text-xs"
                    >
                      {weather}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Economic Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Economy management tools will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Data Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">In-game data editor for seeds, mutations, and game settings.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Real-time system and player activity logs.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};