import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RARITY_COLORS, type Seed } from "@/lib/gameData";
import { ShoppingCart, Coins } from "lucide-react";
import { useEffect, useState } from "react";

interface SeedShopProps {
  seeds: Seed[];
  shopStock: any[];
  onBuySeed: (seedId: string, cost: number) => Promise<boolean>;
  playerMoney: number;
  restockTime?: Date;
}

export const SeedShop = ({ seeds, shopStock, onBuySeed, playerMoney, restockTime }: SeedShopProps) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Update countdown timer from shop stock
  useEffect(() => {
    if (!shopStock || shopStock.length === 0) return;

    const interval = setInterval(() => {
      // Get the next restock time from any shop stock item (they should all be the same)
      const nextRestock = shopStock[0]?.next_restock;
      if (!nextRestock) {
        setTimeLeft("Loading...");
        return;
      }

      const now = new Date().getTime();
      const target = new Date(nextRestock).getTime();
      const difference = target - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft("Restocking...");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [shopStock]);

  const handleBuySeed = async (seed: Seed, stock: number) => {
    if (stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This seed is currently out of stock!",
        variant: "destructive"
      });
      return;
    }

    if (playerMoney < seed.cost_sheckles) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${seed.cost_sheckles} sheckles to buy this seed!`,
        variant: "destructive"
      });
      return;
    }

    await onBuySeed(seed.id, seed.cost_sheckles);
  };

  const getStockForSeed = (seedId: string) => {
    const stockItem = shopStock.find(item => item.seed_id === seedId);
    return stockItem?.current_stock || 0;
  };

  const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ultra Rare'];
  const sortedSeeds = [...seeds].sort((a, b) => {
    const aIndex = rarityOrder.indexOf(a.rarity);
    const bIndex = rarityOrder.indexOf(b.rarity);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    // If same rarity, sort by price (ascending)
    return a.cost_sheckles - b.cost_sheckles;
  });

  return (
    <Card className="h-full shadow-farm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShoppingCart className="w-5 h-5" />
          Seed Shop
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Next Restock: {timeLeft || "Loading..."}
          </span>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-accent" />
            <span className="font-semibold">{playerMoney.toLocaleString()} ¢</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-2 p-4">
            {sortedSeeds.map((seed) => {
              const stock = getStockForSeed(seed.id);
              const canAfford = playerMoney >= seed.cost_sheckles;
              const inStock = stock > 0;
              
              return (
                <Card 
                  key={seed.id} 
                  className={`transition-all hover:shadow-md ${!inStock ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{seed.name}</h3>
                          <Badge 
                            className={`${RARITY_COLORS[seed.rarity as keyof typeof RARITY_COLORS]} text-white`}
                            variant="secondary"
                          >
                            {seed.rarity}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="font-medium">{seed.cost_sheckles.toLocaleString()} ¢</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sell Price:</span>
                            <span className="font-medium">{seed.sell_price.toLocaleString()} ¢</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Multi-Harvest:</span>
                            <span className="font-medium">{seed.multi_harvest ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stock:</span>
                            <span className={`font-medium ${stock > 0 ? 'text-primary' : 'text-destructive'}`}>
                              {stock}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => handleBuySeed(seed, stock)}
                          disabled={!canAfford || !inStock}
                          variant={canAfford && inStock ? "default" : "secondary"}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          {!inStock ? 'Out of Stock' : !canAfford ? 'Too Expensive' : 'Buy'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};