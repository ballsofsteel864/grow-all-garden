import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

interface AdminLoginProps {
  onAdminLogin: (isAdmin: boolean) => void;
  isLoggedIn: boolean;
}

export const AdminLogin = ({ onAdminLogin, isLoggedIn }: AdminLoginProps) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === "headphones" && password === "Aubaida29102010.") {
      onAdminLogin(true);
      setOpen(false);
      setUsername("");
      setPassword("");
      toast({
        title: "Admin Access Granted",
        description: "You now have administrator privileges",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials",
        variant: "destructive"
      });
    }
  };

  if (isLoggedIn) {
    return (
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => onAdminLogin(false)}
        className="bg-destructive hover:bg-destructive/90"
      >
        <Shield className="w-4 h-4 mr-2" />
        Admin Logout
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Shield className="w-4 h-4 mr-2" />
          Admin Login
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Administrator Login</DialogTitle>
          <DialogDescription>
            Enter admin credentials to access administrator panel
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin username"
              className="w-full"
              autoFocus
            />
          </div>
          
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full"
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Login as Admin
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};