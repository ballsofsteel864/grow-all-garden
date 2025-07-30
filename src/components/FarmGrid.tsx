import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Leaf } from "lucide-react";
import { type Crop } from "@/lib/gameData";

interface FarmGridProps {
  crops: any[];
  selectedSeedId: string | null;
  onPlantSeed: (x: number, y: number) => void;
  onHarvestCrop: (cropId: string) => void;
  gridSize: number;
}

export const FarmGrid = ({ crops, selectedSeedId, onPlantSeed, onHarvestCrop, gridSize = 10 }: FarmGridProps) => {
  const { toast } = useToast();

  const handleCellClick = (x: number, y: number) => {
    const existingCrop = getCropAtPosition(x, y);
    
    if (existingCrop) {
      if (existingCrop.ready_to_harvest) {
        onHarvestCrop(existingCrop.id);
        return;
      }
      
      // Show crop info for non-harvestable crops
      const timeRemaining = getTimeRemaining(existingCrop);
      const mutationText = existingCrop.mutations?.length > 0 
        ? ` (${existingCrop.mutations.join(', ')})` 
        : '';
      
      toast({
        title: `Unknown Crop${mutationText}`,
        description: timeRemaining > 0 
          ? `Ready in ${Math.ceil(timeRemaining / 60)} minutes` 
          : existingCrop.ready_to_harvest 
            ? "Ready to harvest!" 
            : "Growing...",
      });
      return;
    }
    
    if (!selectedSeedId) {
      toast({
        title: "No Seed Selected",
        description: "Please select a seed from your inventory first!",
        variant: "destructive",
      });
      return;
    }
    
    onPlantSeed(x, y);
  };

  const getCropAtPosition = (x: number, y: number) => {
    return crops.find(crop => crop.x_position === x && crop.y_position === y);
  };

  const getGrowthIcon = (growthStage: number, maxStage: number, mutations: string[] = []) => {
    // Special mutation displays
    if (mutations.includes('rainbow')) return "🌈";
    if (mutations.includes('golden')) return "⭐";
    if (mutations.includes('giant')) return "🦣";
    
    const progress = growthStage / maxStage;
    if (progress === 0) return "🌱";
    if (progress < 0.3) return "🌿";
    if (progress < 0.7) return "🌾";
    if (progress < 1) return "🌳";
    return "🍎"; // Fully grown/harvestable
  };

  const getTimeRemaining = (crop: any) => {
    if (!crop.seeds?.growth_time || !crop.planted_at) return 0;
    
    const plantedTime = new Date(crop.planted_at).getTime();
    const currentTime = Date.now();
    const growthDuration = crop.seeds.growth_time * 1000; // Convert to milliseconds
    const timeElapsed = currentTime - plantedTime;
    
    return Math.max(0, growthDuration - timeElapsed) / 1000; // Return in seconds
  };

  return (
    <Card className="h-full shadow-farm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sprout className="w-5 h-5" />
          Farm ({gridSize}×{gridSize})
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <div>Crops: {crops.length}</div>
          <div>Ready to harvest: {crops.filter(c => c.ready_to_harvest).length}</div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="grid gap-1 p-4 bg-gradient-farm rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            maxHeight: '500px'
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const crop = getCropAtPosition(x, y);
            
            return (
              <Button
                key={`${x}-${y}`}
                variant="outline"
                size="sm"
                className={`
                  aspect-square p-1 h-auto min-h-[40px] border-2 transition-all relative
                  ${crop ? 'bg-primary/20 border-primary' : 'bg-white/80 border-border hover:border-primary'}
                  ${selectedSeedId && !crop ? 'hover:bg-primary/10' : ''}
                  ${crop?.ready_to_harvest ? 'ring-2 ring-accent animate-pulse cursor-pointer' : ''}
                  ${crop && !crop.ready_to_harvest ? 'cursor-help' : ''}
                `}
                onClick={() => handleCellClick(x, y)}
              >
                {crop ? (
                  <div className="flex flex-col items-center justify-center h-full relative">
                    <span className="text-lg">
                      {getGrowthIcon(crop.growth_stage, crop.max_growth_stage, crop.mutations)}
                    </span>
                    {crop.mutations && crop.mutations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {crop.mutations.slice(0, 2).map((mutation: string, idx: number) => (
                          <span key={idx} className="text-xs">✨</span>
                        ))}
                      </div>
                    )}
                    {crop.ready_to_harvest && (
                      <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs px-1">
                        ⚡
                      </div>
                    )}
                    {crop.harvest_remaining && crop.harvest_remaining > 1 && (
                      <div className="absolute -bottom-1 -left-1 bg-primary text-primary-foreground rounded-full text-xs px-1">
                        {crop.harvest_remaining}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedSeedId && (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-lg opacity-50">+</span>
                    </div>
                  )
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};