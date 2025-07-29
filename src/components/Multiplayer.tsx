import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, LogIn, Copy } from "lucide-react";

interface MultiplayerProps {
  currentRoom: string | null;
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (roomId: string) => Promise<boolean>;
  players: any[];
}

export const Multiplayer = ({ currentRoom, onCreateRoom, onJoinRoom, players }: MultiplayerProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const roomId = await onCreateRoom();
      toast({
        title: "Room Created",
        description: `Room created with ID: ${roomId}`,
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
        title: "Invalid Room ID",
        description: "Please enter a valid room ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await onJoinRoom(joinRoomId.trim());
      if (success) {
        toast({
          title: "Joined Room",
          description: `Successfully joined room ${joinRoomId}`,
        });
        setJoinRoomId("");
      } else {
        toast({
          title: "Failed to join room",
          description: "Room not found or is full",
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

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      toast({
        title: "Room ID Copied",
        description: "Share this ID with friends to let them join",
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
        {/* Current Room */}
        {currentRoom ? (
          <div className="space-y-2">
            <Label>Current Room</Label>
            <div className="flex items-center gap-2">
              <Input value={currentRoom} readOnly className="flex-1" />
              <Button size="sm" variant="outline" onClick={copyRoomId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this room ID with friends
            </p>
          </div>
        ) : (
          <div>
            <Button 
              onClick={handleCreateRoom} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Room
            </Button>
          </div>
        )}

        {/* Join Room */}
        <div className="space-y-2">
          <Label htmlFor="room-id">Join Another Player's Room</Label>
          <div className="flex gap-2">
            <Input
              id="room-id"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter room code"
              className="flex-1"
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
            Ask a friend for their room ID to join their game
          </p>
        </div>

        {/* Players in Room */}
        <div className="space-y-2">
          <Label>Players in Room ({players.length})</Label>
          <div className="space-y-1">
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other players</p>
            ) : (
              players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{player.username}</span>
                  {player.is_admin && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};