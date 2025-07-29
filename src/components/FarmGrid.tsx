import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Leaf } from "lucide-react";
import { type Crop } from "@/lib/gameData";

interface FarmGridProps {
  crops: Crop[];
  selectedSeedId: string | null;
  onPlantSeed: (x: number, y: number) => void;
  gridSize: number;
}

export const FarmGrid = ({ crops, selectedSeedId, onPlantSeed, gridSize = 10 }: FarmGridProps) => {
  const { toast } = useToast();

  const handleCellClick = (x: number, y: number) => {
    if (!selectedSeedId) {
      toast({
        title: "No Seed Selected",
        description: "Select a seed from your inventory first!",
        variant: "destructive"
      });
      return;
    }

    const existingCrop = crops.find(crop => crop.x_position === x && crop.y_position === y);
    if (existingCrop) {
      toast({
        title: "Position Occupied",
        description: "There's already a crop planted here!",
        variant: "destructive"
      });
      return;
    }

    onPlantSeed(x, y);
  };

  const getCropAtPosition = (x: number, y: number) => {
    return crops.find(crop => crop.x_position === x && crop.y_position === y);
  };

  const getGrowthIcon = (growthStage: number, maxStage: number) => {
    const progress = growthStage / maxStage;
    if (progress < 0.3) return <div className="w-2 h-2 bg-primary rounded-full" />;
    if (progress < 0.7) return <Leaf className="w-4 h-4 text-primary" />;
    return <Sprout className="w-6 h-6 text-primary" />;
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
          <div>Sprinklers: 0</div>
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
                  aspect-square p-0 h-auto min-h-[40px] border-2 transition-all
                  ${crop ? 'bg-primary/20 border-primary' : 'bg-white/80 border-border hover:border-primary'}
                  ${selectedSeedId && !crop ? 'hover:bg-primary/10' : ''}
                `}
                onClick={() => handleCellClick(x, y)}
                disabled={!!crop}
              >
                {crop ? (
                  <div className="flex flex-col items-center gap-1">
                    {getGrowthIcon(crop.growth_stage, crop.max_growth_stage)}
                    {crop.mutations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {crop.mutations.slice(0, 2).map((mutation, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                            {mutation.slice(0, 2)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedSeedId && (
                    <div className="text-xs opacity-60">+</div>
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