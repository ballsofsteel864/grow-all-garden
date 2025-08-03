import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WEATHER_TYPES, type WeatherEvent } from "@/lib/gameData";
import { Cloud, CloudRain, Snowflake, Moon, Tornado, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherControlProps {
  currentWeather: WeatherEvent | null;
  onTriggerWeather: (weatherType: string, isGlobal?: boolean) => void;
  isAdmin: boolean;
}

export const WeatherControl = ({ currentWeather, onTriggerWeather, isAdmin }: WeatherControlProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Update countdown timer for current weather
  useEffect(() => {
    if (!currentWeather) {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const startTime = new Date(currentWeather.started_at).getTime();
      const endTime = startTime + (currentWeather.duration * 1000);
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft("");
        // Weather has ended
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWeather]);

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType.toLowerCase()) {
      case 'rain':
      case 'tropical rain':
      case 'chocolate rain':
      case 'honey rain':
      case 'green rain':
        return <CloudRain className="w-4 h-4" />;
      case 'thunderstorm':
        return <Cloud className="w-4 h-4" />;
      case 'frost':
        return <Snowflake className="w-4 h-4" />;
      case 'tornado':
        return <Tornado className="w-4 h-4" />;
      case 'night':
      case 'blood moon':
        return <Moon className="w-4 h-4" />;
      case 'heatwave':
      case 'sungod':
        return <Sun className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getWeatherColor = (weatherType: string) => {
    switch (weatherType.toLowerCase()) {
      case 'rain':
      case 'tropical rain':
        return 'bg-rain text-white';
      case 'thunderstorm':
        return 'bg-thunder text-white';
      case 'frost':
        return 'bg-frost text-black';
      case 'blood moon':
        return 'bg-blood-moon text-white';
      case 'tornado':
        return 'bg-tornado text-white';
      case 'sandstorm':
        return 'bg-sandstorm text-black';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <Card className="h-full shadow-farm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Cloud className="w-5 h-5" />
          Weather Control
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div>
          <h3 className="font-semibold mb-2">Current Weather</h3>
          {currentWeather && timeLeft ? (
            <div className="space-y-2">
              <Badge 
                className={`${getWeatherColor(currentWeather.weather_type)} flex items-center gap-1 text-sm`}
              >
                {getWeatherIcon(currentWeather.weather_type)}
                {currentWeather.weather_type}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Time remaining: {timeLeft}
              </p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p>No active weather effects</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Weather Effects Info */}
        <div>
          <h3 className="font-semibold mb-2">Weather Effects</h3>
          <ScrollArea className="h-32">
            <div className="space-y-1 text-sm">
              <div><strong>Rain:</strong> Crops get wet mutation (2x multiplier)</div>
              <div><strong>Thunderstorm:</strong> Crops get wet and shocked mutations</div>
              <div><strong>Frost:</strong> Crops get chilled mutation (2x multiplier)</div>
              <div><strong>Blood Moon:</strong> Crops get bloodlit mutation (4x multiplier)</div>
              <div><strong>Tornado:</strong> Crops get twisted mutation (5x multiplier)</div>
              <div><strong>Sandstorm:</strong> Crops get sandy mutation (3x multiplier)</div>
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Admin Weather Controls */}
        {isAdmin && (
          <div>
            <h3 className="font-semibold mb-2">Trigger Weather</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onTriggerWeather("Clear")}
                className="w-full"
              >
                Clear Weather
              </Button>
              
              <ScrollArea className="h-40">
                <div className="grid grid-cols-2 gap-1">
                  {WEATHER_TYPES.map((weather) => (
                    <Button
                      key={weather}
                      variant="outline"
                      size="sm"
                      onClick={() => onTriggerWeather(weather)}
                      className="text-xs"
                    >
                      {weather}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Admin privileges required to control weather</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};