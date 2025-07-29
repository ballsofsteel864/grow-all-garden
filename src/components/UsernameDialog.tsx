import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UsernameDialogProps {
  open: boolean;
  onUsernameSet: (username: string) => void;
}

export const UsernameDialog = ({ open, onUsernameSet }: UsernameDialogProps) => {
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long",
        variant: "destructive"
      });
      return;
    }
    onUsernameSet(username.trim());
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Welcome to Grow All Garden!</DialogTitle>
          <DialogDescription>
            Enter your username to start farming. Your progress will be saved.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full"
              autoFocus
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Start Farming
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};