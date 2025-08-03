import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCommandsProps {
  onExecuteCommand: (command: string) => void;
  isAdmin: boolean;
}

export const AdminCommands = ({ onExecuteCommand, isAdmin }: AdminCommandsProps) => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Admin Commands
            <Badge variant="destructive">Access Denied</Badge>
          </CardTitle>
          <CardDescription>
            Only administrators can use these commands.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    setIsExecuting(true);
    try {
      const parts = cmd.trim().split(' ');
      const action = parts[0];
      
      switch (action) {
        case '/give':
          if (parts.length >= 4 && parts[1] === 'seeds') {
            const username = parts[2];
            const seedName = parts.slice(3, -1).join(' ');
            const quantity = parseInt(parts[parts.length - 1]);
            
            if (isNaN(quantity)) {
              toast({ title: "Error", description: "Invalid quantity", variant: "destructive" });
              return;
            }
            
            const { error } = await supabase.rpc('give_seeds_to_player', {
              target_username: username,
              seed_name: seedName,
              quantity_param: quantity
            });
            
            if (error) throw error;
            toast({ title: "Success", description: `Gave ${quantity} ${seedName} to ${username}` });
          } else if (parts.length === 4 && parts[1] === 'money') {
            const username = parts[2];
            const amount = parseInt(parts[3]);
            
            if (isNaN(amount)) {
              toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
              return;
            }
            
            const { error } = await supabase.rpc('give_money_to_player', {
              target_username: username,
              amount: amount
            });
            
            if (error) throw error;
            toast({ title: "Success", description: `Gave ${amount} money to ${username}` });
          } else {
            toast({ title: "Error", description: "Invalid give command format", variant: "destructive" });
          }
          break;
          
        case '/weather':
          if (parts.length === 2) {
            onExecuteCommand(cmd);
          } else {
            toast({ title: "Error", description: "Invalid weather command format", variant: "destructive" });
          }
          break;
          
        default:
          onExecuteCommand(cmd);
          break;
      }
    } catch (error) {
      console.error('Command execution error:', error);
      toast({ title: "Error", description: "Failed to execute command", variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  };

  const quickCommands = [
    { label: "Give 10 Carrot seeds", command: "/give seeds player1 Carrot 10" },
    { label: "Give 1000 money", command: "/give money player1 1000" },
    { label: "Clear weather", command: "/weather clear" },
    { label: "Start rain", command: "/weather rain" },
    { label: "Start storm", command: "/weather storm" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Admin Commands
          <Badge variant="secondary">Admin Only</Badge>
        </CardTitle>
        <CardDescription>
          Execute administrative commands for game management.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter command (e.g., /give seeds username Carrot 5)"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                executeCommand(command);
                setCommand('');
              }
            }}
          />
          <Button 
            onClick={() => {
              executeCommand(command);
              setCommand('');
            }}
            disabled={isExecuting || !command.trim()}
          >
            Execute
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Commands:</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setCommand(cmd.command);
                  executeCommand(cmd.command);
                  setCommand('');
                }}
                disabled={isExecuting}
                className="text-left justify-start"
              >
                {cmd.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Commands:</strong></p>
          <p>• /give seeds [username] [seed name] [quantity]</p>
          <p>• /give money [username] [amount]</p>
          <p>• /weather [type] or /weather clear</p>
        </div>
      </CardContent>
    </Card>
  );
};