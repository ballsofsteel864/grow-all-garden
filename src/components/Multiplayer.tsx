import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, LogIn, Copy, Crown, Coins, GamepadIcon, UserPlus } from "lucide-react";

interface MultiplayerProps {
  currentRoom: string | null;
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (roomId: string) => Promise<boolean>;
  players: any[];
  player: any;
}

export const Multiplayer = ({ currentRoom, onCreateRoom, onJoinRoom, players, player }: MultiplayerProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const roomId = await onCreateRoom();
      toast({
        title: "Room Created!",
        description: `Room code: ${roomId}`,
      });
    } catch (error) {
      toast({
        title: "Failed to create room",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({
        title: "Invalid Room Code",
        description: "Please enter a valid room code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await onJoinRoom(joinRoomId.trim().toUpperCase());
      if (success) {
        toast({
          title: "Joined Room!",
          description: `Welcome to room ${joinRoomId.toUpperCase()}`,
        });
        setJoinRoomId("");
      } else {
        toast({
          title: "Room not found",
          description: "Check the room code and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to join room",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (currentRoom) {
      await onJoinRoom(""); // Leave room by joining empty room
      toast({
        title: "Left Room",
        description: "You've left the multiplayer room",
      });
    }
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      toast({
        title: "Room Code Copied!",
        description: "Share this code with friends to let them join",
      });
    }
  };

  return (
    <Card className="h-full shadow-farm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Users className="w-5 h-5" />
          Multiplayer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Room Status */}
        {currentRoom ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Current Room</Label>
                <p className="text-lg font-mono font-bold text-primary">{currentRoom}</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                Connected
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyRoomId} className="flex-1">
                <Copy className="w-3 h-3 mr-1" />
                Copy Code
              </Button>
              <Button size="sm" variant="outline" onClick={handleLeaveRoom} className="flex-1">
                Leave Room
              </Button>
            </div>
            
            <Separator />
            
            {/* Room Players */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Players in Room</Label>
                <Badge variant="outline">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {players.map((roomPlayer) => (
                  <div
                    key={roomPlayer.id}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      roomPlayer.id === player?.id ? 'bg-primary/10 border-primary' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {roomPlayer.is_admin && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">
                        {roomPlayer.username}
                      </span>
                      {roomPlayer.id === player?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      <span>${roomPlayer.money}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Join/Create Room Interface */
          <div className="space-y-3">
            <div className="text-center space-y-2">
              <GamepadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Create or join a room to play with friends
              </p>
            </div>
            
            <Separator />
            
            {/* Create Room */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Create New Room</Label>
              <Button 
                onClick={handleCreateRoom} 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </div>
            
            <Separator />
            
            {/* Join Room */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Join Existing Room</Label>
              <div className="flex gap-2">
                <Input
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter room code..."
                  className="flex-1 font-mono"
                  maxLength={6}
                />
                <Button 
                  onClick={handleJoinRoom}
                  disabled={loading || !joinRoomId.trim()}
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Join
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask a friend for their room code to join their game
              </p>
            </div>
          </div>
        )}
        
        {/* Game Features Info */}
        <Separator />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">MULTIPLAYER FEATURES</Label>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Shared weather events</p>
            <p>• Global shop stock</p>
            <p>• Player leaderboards</p>
            <p>• Real-time updates</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};