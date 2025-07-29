// Game data constants and types

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythical' | 'Divine' | 'Prismatic';

export interface Seed {
  id: string;
  name: string;
  rarity: Rarity;
  cost_sheckles: number;
  cost_robux: number | null;
  sell_price: number;
  growth_time: number;
  multi_harvest: boolean;
  obtainable: boolean;
  description: string;
  stock: number;
  max_stock: number;
  min_stock: number;
}

export interface Player {
  id: string;
  username: string;
  is_admin: boolean;
  money: number;
  room_id: string | null;
  level: number;
  xp: number;
}

export interface Crop {
  id: string;
  player_id: string;
  seed_id: string;
  x_position: number;
  y_position: number;
  planted_at: string;
  growth_stage: number;
  max_growth_stage: number;
  mutations: string[];
  watered: boolean;
  ready_to_harvest: boolean;
}

export interface WeatherEvent {
  id: string;
  weather_type: string;
  started_at: string;
  duration: number;
  is_active: boolean;
  triggered_by_admin: boolean;
  scope: 'global' | 'local';
}

export interface Mutation {
  name: string;
  multiplier: number;
  trigger: string;
}

export const MUTATIONS: Mutation[] = [
  { name: 'Overgrown', multiplier: 1, trigger: 'Random' },
  { name: 'Wet', multiplier: 2, trigger: 'Rain/Thunderstorm' },
  { name: 'Chilled', multiplier: 2, trigger: 'Frost' },
  { name: 'Chocolate', multiplier: 2, trigger: 'Chocolate Rain' },
  { name: 'Moonlit', multiplier: 2, trigger: 'Night' },
  { name: 'Pollinated', multiplier: 3, trigger: 'Swarm' },
  { name: 'Bloodlit', multiplier: 4, trigger: 'Blood Moon' },
  { name: 'Burnt', multiplier: 4, trigger: 'Chicken Rain' },
  { name: 'Cooked', multiplier: 25, trigger: 'Chicken Rain' },
  { name: 'Fried', multiplier: 15, trigger: 'Chicken Rain' },
  { name: 'Honey Glazed', multiplier: 5, trigger: 'Honey Rain' },
  { name: 'Plasma', multiplier: 5, trigger: 'Laser' },
  { name: 'Frozen', multiplier: 10, trigger: 'Wet + Chilled' },
  { name: 'Golden', multiplier: 20, trigger: '1% chance' },
  { name: 'Zombified', multiplier: 25, trigger: 'Aubi Zombie' },
  { name: 'Heavenly', multiplier: 5, trigger: 'Floating Aubi' },
  { name: 'Molten', multiplier: 25, trigger: 'Volcano' },
  { name: 'Rainbow', multiplier: 50, trigger: '0.1% random' },
  { name: 'Shocked', multiplier: 100, trigger: 'Thunderstorm' },
  { name: 'Celestial', multiplier: 120, trigger: 'Meteor' },
  { name: 'Disco', multiplier: 125, trigger: 'Disco' },
  { name: 'Voidtouched', multiplier: 135, trigger: 'Blackhole' },
  { name: 'Dawnbound', multiplier: 150, trigger: 'Sungod' },
  { name: 'Sundried', multiplier: 85, trigger: 'Heatwave' },
  { name: 'Windstruck', multiplier: 2, trigger: 'Gale/Windy' },
  { name: 'Twisted', multiplier: 5, trigger: 'Tornado' },
  { name: 'Verdant', multiplier: 10, trigger: 'Green Rain' },
  { name: 'Pardisal', multiplier: 100, trigger: 'Sundried + Verdant' },
  { name: 'Aurora', multiplier: 90, trigger: 'Aurora Borealis' },
  { name: 'Drenched', multiplier: 5, trigger: 'Tropical Rain' },
  { name: 'Sandy', multiplier: 3, trigger: 'Sandstorm' }
];

export const WEATHER_TYPES = [
  'Rain',
  'Thunderstorm', 
  'Frost',
  'Blood Moon',
  'Tornado',
  'Sandstorm',
  'Chocolate Rain',
  'Night',
  'Honey Rain',
  'Laser',
  'Volcano',
  'Heatwave',
  'Gale',
  'Green Rain',
  'Aurora Borealis',
  'Tropical Rain',
  'Disco',
  'Swarm',
  'Meteor',
  'Blackhole',
  'Sungod',
  'Aubi Zombie',
  'Floating Aubi',
  'Chicken Rain'
];

export const RARITY_COLORS: Record<Rarity, string> = {
  'Common': 'bg-common',
  'Uncommon': 'bg-uncommon', 
  'Rare': 'bg-rare',
  'Legendary': 'bg-legendary',
  'Mythical': 'bg-mythical',
  'Divine': 'bg-divine',
  'Prismatic': 'bg-prismatic'
};

export const ADMIN_COMMANDS = [
  'giveseeds',
  'giveallseeds', 
  'givegear',
  'giveexoticseedpack',
  'givesuperseed',
  'giveseedpack',
  'giveallfruits',
  'giverainbowseed',
  'givesheckles',
  'givepet',
  'giveegg',
  'givecrate',
  'givecosmetic',
  'givehoney',
  'giveallcosmetic',
  'setweather',
  'globalbloodmoon',
  'localbloodmoon',
  'globalnight',
  'localnight',
  'globalswarm',
  'localswarm',
  'randomfarm',
  'globalinvite',
  'globalawardchickenzombie',
  'teleport',
  'position',
  'respawn',
  'kick',
  'kill',
  'gamemode',
  'goto-place',
  'get-player-place-instance',
  'uptime',
  'progresstime',
  'setexpansion',
  'setexpansiontimer',
  'tutorialvariant',
  'edit',
  'replace',
  'alias',
  'announce',
  'notify',
  'history',
  'hover',
  'help',
  'version',
  'rand',
  'run',
  'run-lines',
  'runif',
  'unbind',
  'pick',
  'tallyplants',
  'len',
  'math',
  'convertTimestamp',
  'json-array-decode',
  'json-array-encode',
  'clear',
  'clearplants',
  'clearfruit',
  'clearcosmetics',
  'clearinventory',
  'clearpetinventory',
  'clear0bjects',
  'mutateplant',
  'stockSeed'
];