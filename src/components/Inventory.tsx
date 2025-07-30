import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RARITY_COLORS } from "@/lib/gameData";
import { Package, Sprout, Clock } from "lucide-react";

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
                        <Sprout className="w-4 h-4 text-green-600" />
                        <div>
                          <h4 className="font-medium">{item.seeds?.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`${RARITY_COLORS[item.seeds?.rarity as keyof typeof RARITY_COLORS]} text-white text-xs`}
                              variant="secondary"
                            >
                              {item.seeds?.rarity}
                            </Badge>
                            {item.seeds?.multi_harvest && (
                              <Badge variant="outline" className="text-xs">
                                Multi-Harvest
                              </Badge>
                            )}
                          </div>
                          {item.seeds?.growth_time && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{Math.floor(item.seeds.growth_time / 60)}min grow</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          ×{item.quantity}
                        </span>
                        {item.seeds?.sell_price && (
                          <p className="text-xs text-muted-foreground">
                            Sells for ${item.seeds.sell_price}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {item.seeds?.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.seeds.description}
                      </p>
                    )}
                    
                    {selectedSeedId === item.seed_id && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-primary font-medium">
                          Click on an empty farm plot to plant this seed
                        </p>
                      </div>
                    )}
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