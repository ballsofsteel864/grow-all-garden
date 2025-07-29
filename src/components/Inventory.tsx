import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RARITY_COLORS } from "@/lib/gameData";
import { Package } from "lucide-react";

interface InventoryProps {
  inventory: any[];
  onSelectSeed: (seedId: string) => void;
  selectedSeedId: string | null;
}

export const Inventory = ({ inventory, onSelectSeed, selectedSeedId }: InventoryProps) => {
  return (
    <Card className="h-full shadow-farm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Package className="w-5 h-5" />
          Inventory
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click a seed to select it for planting
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 p-4">
            {inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No seeds in inventory</p>
                <p className="text-sm">Buy some seeds from the shop!</p>
              </div>
            ) : (
              inventory.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSeedId === item.seed_id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onSelectSeed(item.seed_id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-medium">{item.seeds?.name}</h4>
                          <Badge 
                            className={`${RARITY_COLORS[item.seeds?.rarity as keyof typeof RARITY_COLORS]} text-white text-xs`}
                            variant="secondary"
                          >
                            {item.seeds?.rarity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};