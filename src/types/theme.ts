export type AtelierThemeId = 'bordeaux' | 'sapphire' | 'emerald' | 'champagne' | 'electric' | 'aurora' | 'amethyst';

export interface AtelierTheme {
  id: AtelierThemeId;
  name: string;
  tagline: string;
  badge: string;
  dotColor: string;
  bgClass: string;
  orb1: string;
  orb2: string;
  orb3: string;
  orb4: string;
}

export const ATELIER_THEMES: Record<AtelierThemeId, AtelierTheme> = {
  bordeaux: {
    id: 'bordeaux',
    name: 'Imperial Bordeaux & Starlit Gold',
    tagline: 'Luminous crimson silk with radiant Florentine gold embers',
    badge: 'Signature Haute Couture',
    dotColor: '#e11d48',
    bgClass: 'bg-theme-bordeaux',
    orb1: 'colorful-orb-rose',
    orb2: 'colorful-orb-violet',
    orb3: 'colorful-orb-amber',
    orb4: 'colorful-orb-rose'
  },
  sapphire: {
    id: 'sapphire',
    name: 'Midnight Royal Sapphire',
    tagline: 'Deep cosmic cobalt with electric celestial indigo glow',
    badge: 'Black Tie Gala',
    dotColor: '#3b82f6',
    bgClass: 'bg-theme-sapphire',
    orb1: 'colorful-orb-sapphire',
    orb2: 'colorful-orb-cyan',
    orb3: 'colorful-orb-violet',
    orb4: 'colorful-orb-sapphire'
  },
  emerald: {
    id: 'emerald',
    name: 'Imperial Emerald & Antique Gold',
    tagline: 'Lush malachite silk with gilded Florentine warmth',
    badge: 'Artisan Heritage',
    dotColor: '#10b981',
    bgClass: 'bg-theme-emerald',
    orb1: 'colorful-orb-emerald',
    orb2: 'colorful-orb-teal',
    orb3: 'colorful-orb-amber',
    orb4: 'colorful-orb-emerald'
  },
  champagne: {
    id: 'champagne',
    name: 'Champagne Pearl & Rose Gold',
    tagline: 'Iridescent mother-of-pearl, peach blossom & warm blush',
    badge: 'Ethereal Glamour',
    dotColor: '#f472b6',
    bgClass: 'bg-theme-champagne',
    orb1: 'colorful-orb-rose',
    orb2: 'colorful-orb-amber',
    orb3: 'colorful-orb-fuchsia',
    orb4: 'colorful-orb-amber'
  },
  electric: {
    id: 'electric',
    name: 'Electric Runway Magenta',
    tagline: 'Hyper-vivid Paris runway spotlights & neon violet aura',
    badge: 'Avant-Garde Runway',
    dotColor: '#d946ef',
    bgClass: 'bg-theme-electric',
    orb1: 'colorful-orb-fuchsia',
    orb2: 'colorful-orb-rose',
    orb3: 'colorful-orb-violet',
    orb4: 'colorful-orb-cyan'
  },
  aurora: {
    id: 'aurora',
    name: 'Celestial Aurora Borealis',
    tagline: 'Mystical polar emerald, azure currents & cosmic violet veil',
    badge: 'Nordic Couture',
    dotColor: '#14b8a6',
    bgClass: 'bg-theme-aurora',
    orb1: 'colorful-orb-teal',
    orb2: 'colorful-orb-emerald',
    orb3: 'colorful-orb-sapphire',
    orb4: 'colorful-orb-violet'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Amethyst & Violet Orchid',
    tagline: 'Deep twilight orchid velvet with shimmering crystal violet',
    badge: 'Imperial Velvet',
    dotColor: '#a855f7',
    bgClass: 'bg-theme-amethyst',
    orb1: 'colorful-orb-violet',
    orb2: 'colorful-orb-fuchsia',
    orb3: 'colorful-orb-rose',
    orb4: 'colorful-orb-violet'
  }
};
