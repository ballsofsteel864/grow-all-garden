import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Coins, Zap, Target } from 'lucide-react';
import type { Crop } from '@/lib/gameData';
import { MUTATIONS } from '@/lib/gameData';

interface CropInfoProps {
  crop: Crop;
  onHarvest: (cropId: string) => void;
  onClose: () => void;
}

export const CropInfo = ({ crop, onHarvest, onClose }: CropInfoProps) => {
  const calculateTimeRemaining = () => {
    if (!crop.planted_at || crop.ready_to_harvest) return 0;
    
    const plantedTime = new Date(crop.planted_at).getTime();
    const growthTimeMs = (crop as any).seeds?.growth_time * 1000 || 300000;
    const readyTime = plantedTime + growthTimeMs;
    const now = Date.now();
    
    return Math.max(0, Math.ceil((readyTime - now) / 1000));
  };

  const calculatePrice = () => {
    const basePrice = (crop as any).seeds?.sell_price || 10;
    let multiplier = 1;
    
    if (crop.mutations && crop.mutations.length > 0) {
      crop.mutations.forEach(mutationName => {
        const mutation = MUTATIONS.find(m => m.name === mutationName);
        if (mutation) {
          multiplier *= mutation.multiplier;
        }
      });
    }
    
    return Math.floor(basePrice * multiplier);
  };

  const timeRemaining = calculateTimeRemaining();
  const estimatedPrice = calculatePrice();
  const harvestsRemaining = (crop as any).harvest_remaining || 10;

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Ready!";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{(crop as any).seeds?.name || 'Unknown Plant'}</span>
          <Badge variant="outline">Stage {crop.growth_stage}/{crop.max_growth_stage}</Badge>
        </CardTitle>
        <CardDescription>
          Plot ({crop.x_position}, {crop.y_position})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Time remaining: <Badge variant={timeRemaining === 0 ? "default" : "secondary"}>
              {formatTime(timeRemaining)}
            </Badge>
          </span>
        </div>

        {crop.mutations && crop.mutations.length > 0 && (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Mutations:</span>
            <div className="flex flex-wrap gap-1">
              {crop.mutations.map((mutation, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {mutation}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          <span className="text-sm">Estimated price: {estimatedPrice} sheckles</span>
        </div>

        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="text-sm">Harvests remaining: {harvestsRemaining}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onHarvest(crop.id)}
            disabled={!crop.ready_to_harvest}
            className="flex-1"
          >
            {crop.ready_to_harvest ? 'Harvest' : 'Not Ready'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};