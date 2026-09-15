import React, { useState } from 'react';
import { 
  Sparkles, 
  Scissors, 
  Ruler, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Compass, 
  Heart,
  Eye,
  Palette,
  Check,
  Flame,
  Zap,
  Award
} from 'lucide-react';
import { CustomGarmentConfig } from '../../types/garment';
import { AtelierThemeId, ATELIER_THEMES } from '../../types/theme';
import { GARMENT_TYPES, FABRICS_DATABASE, COLOR_PALETTES } from '../../lib/garmentData';
import { formatINR } from '../../lib/pricing';
import { ATELIER_IMAGES } from '../../lib/imageAssets';

interface LandingPageProps {
  onStartCustomizing: () => void;
  onSelectCuratedDesign: (config: Partial<CustomGarmentConfig>) => void;
  onQuickOrder?: (config: Partial<CustomGarmentConfig>) => void;
  onOpenLogin?: () => void;
  currentTheme?: AtelierThemeId;
  onSelectTheme?: (theme: AtelierThemeId) => void;
}

const CURATED_SHOWCASE: {
  title: string;
  category: string;
  gender: 'men' | 'women';
  fabric: string;
  colorName: string;
  colorHex: string;
  price: number;
  image: string;
  tag: string;
  tagColor: string;
  config: Partial<CustomGarmentConfig>;
}[] = [
  // 1. Men's Tuxedo
  {
    title: 'The Sovereign Midnight Tuxedo',
    category: 'Black-Tie & Gala Formal',
    gender: 'men',
    fabric: 'Super 150s Worsted Wool & Grosgrain Silk',
    colorName: 'Midnight Noir',
    colorHex: '#121113',
    price: 9800,
    image: ATELIER_IMAGES.mensTuxedo,
    tag: 'Black-Tie Mastery',
    tagColor: 'from-purple-600/80 to-indigo-700/80',
    config: {
      garmentType: 'tuxedo',
      fabric: 'wool',
      color: { name: 'Midnight Noir', hex: '#121113', category: 'neutrals' },
      fit: 'slim',
      sleeve: 'long',
      neckline: 'spread_collar',
      length: 'standard',
      pockets: 'chest',
      closure: 'buttons',
      occasion: 'formal',
      climate: 'mild'
    }
  },
  // 2. Women's Blazer Dress
  {
    title: 'Sculpted Double-Breasted Blazer Dress',
    category: 'Couture Suiting & Evening',
    gender: 'women',
    fabric: 'Mulberry Charmeuse Silk & Wool Twill',
    colorName: 'Imperial Bordeaux',
    colorHex: '#631024',
    price: 7600,
    image: ATELIER_IMAGES.womensBlazerDress,
    tag: 'Architectural Chic',
    tagColor: 'from-rose-600/80 to-pink-700/80',
    config: {
      garmentType: 'blazer_dress',
      fabric: 'silk',
      color: { name: 'Imperial Bordeaux', hex: '#631024', category: 'wine_burgundy' },
      fit: 'slim',
      sleeve: 'long',
      neckline: 'collar',
      length: 'cropped',
      pockets: 'side',
      closure: 'buttons',
      occasion: 'party',
      climate: 'mild'
    }
  },
  // 3. Women's Cocktail Dress
  {
    title: 'Imperial Draped Silk Cocktail Gown',
    category: 'Haute Gala & Cocktail Soirée',
    gender: 'women',
    fabric: 'Pure Mulberry Silk Charmeuse',
    colorName: 'Merlot Burgundy',
    colorHex: '#7a152d',
    price: 6900,
    image: ATELIER_IMAGES.womensCocktail,
    tag: 'Fluid Decollete',
    tagColor: 'from-red-600/80 to-rose-700/80',
    config: {
      garmentType: 'cocktail_dress',
      fabric: 'silk',
      color: { name: 'Merlot Burgundy', hex: '#7a152d', category: 'wine_burgundy' },
      fit: 'slim',
      sleeve: 'sleeveless',
      neckline: 'sweetheart',
      length: 'standard',
      pockets: 'none',
      closure: 'zipper',
      occasion: 'party',
      climate: 'mild'
    }
  },
  // 4. Women's Sundress
  {
    title: 'Tuscan Terracotta Linen Sundress',
    category: 'Resort & Summer Garden',
    gender: 'women',
    fabric: 'Normandy Slub Flax Linen',
    colorName: 'Tuscan Terracotta',
    colorHex: '#c2410c',
    price: 4300,
    image: ATELIER_IMAGES.womensSundress,
    tag: 'Airy Slub Weave',
    tagColor: 'from-amber-500/80 to-orange-600/80',
    config: {
      garmentType: 'sundress',
      fabric: 'linen',
      color: { name: 'Tuscan Terracotta', hex: '#c2410c', category: 'earthy' },
      fit: 'relaxed',
      sleeve: 'sleeveless',
      neckline: 'square',
      length: 'standard',
      pockets: 'side',
      closure: 'buttons',
      occasion: 'casual',
      climate: 'hot'
    }
  },
  // 5. Men's Riviera Shirt
  {
    title: 'The Bordeaux Riviera Shirt',
    category: 'Resort & Casual Elegance',
    gender: 'men',
    fabric: 'Pure Normandy Flax Linen',
    colorName: 'Imperial Bordeaux',
    colorHex: '#631024',
    price: 3450,
    image: ATELIER_IMAGES.rivieraShirt,
    tag: 'Bespoke Best-Seller',
    tagColor: 'from-rose-500/80 to-red-600/80',
    config: {
      garmentType: 'shirt',
      fabric: 'linen',
      color: { name: 'Imperial Bordeaux', hex: '#631024', category: 'wine_burgundy' },
      fit: 'relaxed',
      sleeve: 'long',
      neckline: 'collar',
      pockets: 'chest',
      closure: 'buttons',
      occasion: 'casual',
      climate: 'mild'
    }
  },
  // 6. Women's Emerald Silk Gown
  {
    title: 'Emerald Silk Atelier Gown',
    category: 'Haute Gala & Evening',
    gender: 'women',
    fabric: 'Mulberry Charmeuse Silk',
    colorName: 'Emerald Royale',
    colorHex: '#047857',
    price: 6800,
    image: ATELIER_IMAGES.silkDress,
    tag: 'Liquid Sheen Drape',
    tagColor: 'from-emerald-500/80 to-teal-600/80',
    config: {
      garmentType: 'dress',
      fabric: 'silk',
      color: { name: 'Emerald Royale', hex: '#047857', category: 'jewel' },
      fit: 'slim',
      sleeve: 'sleeveless',
      neckline: 'square',
      length: 'long',
      pockets: 'none',
      closure: 'zipper',
      occasion: 'party',
      climate: 'mild'
    }
  },
  // 7. Men's Nehru Jacket / Bandhgala
  {
    title: 'Heritage Matka Silk Nehru Jacket',
    category: 'Royal Ceremonial Tailoring',
    gender: 'men',
    fabric: 'Handwoven Raw Matka Silk',
    colorName: 'Jet Midnight',
    colorHex: '#121214',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    tag: 'Grandad Mandarin Collar',
    tagColor: 'from-amber-600/80 to-red-700/80',
    config: {
      garmentType: 'nehru_jacket',
      fabric: 'silk',
      color: { name: 'Jet Midnight', hex: '#121214', category: 'neutrals' },
      fit: 'slim',
      sleeve: 'sleeveless',
      neckline: 'mandarin',
      length: 'standard',
      pockets: 'chest',
      closure: 'buttons',
      occasion: 'formal',
      climate: 'mild'
    }
  },
  // 8. Men's Pique Polo
  {
    title: 'Sea Island Cotton Piqué Polo',
    category: 'Luxury Sport & Leisure',
    gender: 'men',
    fabric: 'Double-Mercerized Organic Cotton',
    colorName: 'Sapphire Cobalt',
    colorHex: '#1d4ed8',
    price: 2900,
    image: 'https://images.unsplash.com/photo-1625910513413-562777b7cb34?auto=format&fit=crop&w=800&q=80',
    tag: 'Mother-of-Pearl Placket',
    tagColor: 'from-blue-500/80 to-cyan-600/80',
    config: {
      garmentType: 'polo',
      fabric: 'cotton',
      color: { name: 'Sapphire Cobalt', hex: '#1d4ed8', category: 'jewel' },
      fit: 'athletic',
      sleeve: 'short',
      neckline: 'collar',
      length: 'standard',
      pockets: 'none',
      closure: 'buttons',
      occasion: 'casual',
      climate: 'mild'
    }
  },
  // 9. Men's Milano Pleated Trousers
  {
    title: 'Milano Pleated Wide Trousers',
    category: 'Executive Tailoring',
    gender: 'men',
    fabric: 'Super 130s Merino Wool',
    colorName: 'Espresso Twill',
    colorHex: '#2b1e1a',
    price: 4950,
    image: ATELIER_IMAGES.woolTrousers,
    tag: 'Razor-Sharp Crease',
    tagColor: 'from-amber-600/80 to-yellow-700/80',
    config: {
      garmentType: 'trousers',
      fabric: 'wool',
      color: { name: 'Espresso Twill', hex: '#2b1e1a', category: 'earthy' },
      fit: 'relaxed',
      length: 'standard',
      pockets: 'side',
      closure: 'hook_eye',
      occasion: 'work',
      climate: 'cold'
    }
  },
  // 10. Women's Minimalist Blouse
  {
    title: 'Champagne Minimalist Blouse',
    category: 'Day & Evening Fluidity',
    gender: 'women',
    fabric: 'Silk-Linen Performance Blend',
    colorName: 'Champagne Ecru',
    colorHex: '#ede8dd',
    price: 3800,
    image: ATELIER_IMAGES.blouse,
    tag: 'Featherlight Weave',
    tagColor: 'from-amber-300/80 to-stone-400/80',
    config: {
      garmentType: 'blouse',
      fabric: 'blended',
      color: { name: 'Champagne Ecru', hex: '#ede8dd', category: 'neutrals' },
      fit: 'regular',
      sleeve: 'three_quarter',
      neckline: 'v_neck',
      pockets: 'none',
      closure: 'buttons',
      occasion: 'work',
      climate: 'mild'
    }
  },
  // 11. Men's Royal Sapphire Tailored Blazer
  {
    title: 'Royal Sapphire Tailored Blazer',
    category: 'Architectural Outerwear',
    gender: 'men',
    fabric: 'Italian Worsted Virgin Wool',
    colorName: 'Sapphire Cobalt',
    colorHex: '#1d4ed8',
    price: 7490,
    image: ATELIER_IMAGES.blazer,
    tag: 'Structured Floating Canvas',
    tagColor: 'from-blue-600/80 to-indigo-700/80',
    config: {
      garmentType: 'jacket',
      fabric: 'wool',
      color: { name: 'Sapphire Cobalt', hex: '#1d4ed8', category: 'jewel' },
      fit: 'slim',
      sleeve: 'long',
      neckline: 'collar',
      pockets: 'chest',
      closure: 'buttons',
      occasion: 'formal',
      climate: 'cold'
    }
  },
  // 12. Women's A-Line Skirt
  {
    title: 'Sunset Terracotta A-Line Skirt',
    category: 'Sculptural Bottoms',
    gender: 'women',
    fabric: 'Eco-Viscose Rayon',
    colorName: 'Tuscan Terracotta',
    colorHex: '#c2410c',
    price: 3100,
    image: ATELIER_IMAGES.skirt,
    tag: 'High-Motion Silhouette',
    tagColor: 'from-orange-500/80 to-rose-600/80',
    config: {
      garmentType: 'skirt',
      fabric: 'rayon',
      color: { name: 'Tuscan Terracotta', hex: '#c2410c', category: 'earthy' },
      fit: 'regular',
      length: 'standard',
      pockets: 'side',
      closure: 'zipper',
      occasion: 'casual',
      climate: 'mild'
    }
  }
];

const COLORFUL_HERO_SWATCHES = [
  { name: 'Imperial Bordeaux', hex: '#631024', label: 'Wine Bordeaux' },
  { name: 'Emerald Royale', hex: '#047857', label: 'Emerald Royale' },
  { name: 'Sapphire Cobalt', hex: '#1d4ed8', label: 'Sapphire Blue' },
  { name: 'Sunset Coral', hex: '#f43f5e', label: 'Sunset Coral' },
  { name: 'Saffron Gold', hex: '#d97706', label: 'Saffron Amber' },
  { name: 'Amethyst Violet', hex: '#7e22ce', label: 'Amethyst Violet' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCustomizing,
  onSelectCuratedDesign,
  onQuickOrder,
  onOpenLogin,
  currentTheme = 'bordeaux',
  onSelectTheme
}) => {
  const [activeHeroColor, setActiveHeroColor] = useState(COLORFUL_HERO_SWATCHES[0]);
  const [selectedFabricTab, setSelectedFabricTab] = useState<string>('linen');
  const [showcaseGenderFilter, setShowcaseGenderFilter] = useState<'all' | 'men' | 'women'>('all');

  const filteredShowcase = CURATED_SHOWCASE.filter(item => {
    if (showcaseGenderFilter === 'all') return true;
    return item.gender === showcaseGenderFilter;
  });

  return (
    <div className="space-y-24 pb-20">
      
      {/* ================= 1. VIBRANT EDITORIAL HERO SECTION ================= */}
      <section className="relative pt-8 md:pt-16 pb-12 overflow-hidden">
        {/* Colorful ambient atmospheric backdrops */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[350px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-24 right-1/4 w-[450px] h-[350px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Colorful Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-amber-950/60 border border-rose-500/30 text-xs shadow-lg backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="uppercase tracking-[0.2em] font-semibold text-[11px] text-rose-200">
                  Generative Atelier & Couture Intelligence
                </span>
              </div>

              {/* Editorial Display Heading */}
              <h1 className="font-serif-fashion text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                Design Clothes <br />
                <span className="italic font-normal bg-gradient-to-r from-amber-200 via-rose-200 to-rose-400 bg-clip-text text-transparent">
                  That Truly Fit You.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Elevate beyond one-size-fits-none fast fashion. Customize every millimeter of silhouette, 
                vibrant dye tone, and luxurious textile weave—brought to life with machine-learning ergonomics and handcrafted by master tailors.
              </p>

              {/* Colorful Palette Picker Strip in Hero */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-stone-300">
                  <Palette className="w-3.5 h-3.5 text-rose-400" />
                  <span>Choose Your Atelier Tone:</span>
                  <strong className="text-white font-medium ml-1" style={{ color: activeHeroColor.hex }}>
                    {activeHeroColor.name}
                  </strong>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                  {COLORFUL_HERO_SWATCHES.map((swatch) => {
                    const isCurrent = activeHeroColor.name === swatch.name;
                    return (
                      <button
                        key={swatch.name}
                        onClick={() => setActiveHeroColor(swatch)}
                        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          isCurrent 
                            ? 'bg-stone-900 border-white text-white shadow-lg scale-105' 
                            : 'bg-stone-900/60 border-stone-700 text-stone-400 hover:text-white hover:border-stone-500'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-white/40 shadow-sm transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-[11px]">{swatch.label}</span>
                        {isCurrent && <Check className="w-3 h-3 text-rose-400 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTAs with Vivid Rich Color */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <button
                  id="hero-start-customizing-btn"
                  onClick={onStartCustomizing}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-900/40 hover:scale-[1.03] transition-all flex items-center justify-center gap-2.5"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Start Customizing</span>
                </button>

                <button
                  id="hero-explore-designs-btn"
                  onClick={() => {
                    document.getElementById('explore-designs-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700 hover:border-stone-500 text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Explore Atelier Silhouettes</span>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>

              {/* Colorful Trust Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="p-2 rounded-xl bg-stone-900/40 border border-stone-800/60">
                  <span className="font-serif-fashion text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent block">
                    0.3 mm
                  </span>
                  <span className="text-[11px] text-stone-400">Laser Cut Accuracy</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-900/40 border border-stone-800/60">
                  <span className="font-serif-fashion text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent block">
                    100%
                  </span>
                  <span className="text-[11px] text-stone-400">On-Demand Zero Waste</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-900/40 border border-stone-800/60">
                  <span className="font-serif-fashion text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent block">
                    Master
                  </span>
                  <span className="text-[11px] text-stone-400">Handcrafted Couture</span>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Showcase - Realistic Photography & Interactive Overlay */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              <div className="relative w-full max-w-lg rounded-3xl p-3 bg-gradient-to-br from-rose-950/40 via-stone-900 to-amber-950/30 border border-stone-700/80 shadow-2xl overflow-hidden group">
                
                {/* Image Container with Realistic High-Fashion Editorial Photo */}
                <div className="relative w-full aspect-[4/4.5] sm:aspect-[4/4.8] rounded-2xl overflow-hidden bg-stone-950">
                  <img
                    src={ATELIER_IMAGES.heroAtelier}
                    alt="Bespoke tailored fashion in sunlit atelier"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient dynamic overlay with the selected color hue */}
                  <div 
                    className="absolute inset-0 opacity-25 mix-blend-color transition-colors duration-500 pointer-events-none"
                    style={{ backgroundColor: activeHeroColor.hex }}
                  />

                  {/* Soft bottom vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  {/* Top Floating Pill: Live Bespoke Specimen */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono tracking-wider uppercase text-stone-200">
                        Atelier Specimen #849
                      </span>
                    </div>

                    <div 
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5"
                      style={{ backgroundColor: `${activeHeroColor.hex}cc` }}
                    >
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      <span>{activeHeroColor.name}</span>
                    </div>
                  </div>

                  {/* Floating Metric Callouts with Rich Hues */}
                  <div className="absolute left-4 bottom-24 p-3 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-stone-700 shadow-xl max-w-[200px] z-10 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Textile Provenance</span>
                    </div>
                    <span className="text-xs font-semibold text-white block">Normandy Flax Linen</span>
                    <span className="text-[10px] text-stone-400">185 GSM • Natural Weave</span>
                  </div>

                  <div className="absolute right-4 bottom-24 p-3 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-stone-700 shadow-xl max-w-[190px] z-10 text-right transition-transform hover:scale-105">
                    <div className="flex items-center justify-end gap-1.5 text-rose-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Ergonomic Cad</span>
                    </div>
                    <span className="text-xs font-semibold text-white block">Individual Biometrics</span>
                    <span className="text-[10px] text-stone-400">Zero Strain Ease Curve</span>
                  </div>

                  {/* Bottom Action Drawer */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700/80 flex items-center justify-between z-10">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Crafted on Demand</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif-fashion text-xl font-bold text-white">₹3,450</span>
                        <span className="text-[11px] text-emerald-400 font-medium">Free Atelier Shipping</span>
                      </div>
                    </div>

                    <button
                      onClick={onStartCustomizing}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-transform hover:scale-105"
                    >
                      <span>Customize Live</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= ATELIER ATMOSPHERE PALETTE BAR ================= */}
      {onSelectTheme && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="p-4 sm:p-5 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-400" />
                  <span className="text-xs uppercase tracking-widest font-bold text-white">
                    Atelier Background Atmosphere
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono">
                    Live Background Shift
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Select a luminous haute couture mood to bathe your fitting studio in rich ambient light:
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {(Object.keys(ATELIER_THEMES) as AtelierThemeId[]).map((themeKey) => {
                  const t = ATELIER_THEMES[themeKey];
                  const isSelected = currentTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => onSelectTheme(themeKey)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                        isSelected
                          ? 'bg-white/15 border-white/40 text-white shadow-lg scale-105 ring-1 ring-white/30'
                          : 'bg-white/[0.04] border-white/5 text-stone-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-white/30 transition-transform" 
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span className="text-[11px]">{t.name.split('&')[0].trim()}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= 2. FOUR CORE PILLARS / COLORFUL FEATURE CARDS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-rose-400 font-bold">
            The CustomFit Distinction
          </span>
          <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white">
            Architected for the Individual Body
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Standard fast-fashion sizes categorizes millions of unique geometries into five arbitrary letters. 
            We engineer garments that honor your posture and personal flair.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Precision Fit */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 hover:border-emerald-500/50 transition-all space-y-4 flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Ruler className="w-6 h-6" />
              </div>
              <h3 className="font-serif-fashion text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Precision Anatomical Fit
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Biometric pattern drafting customized to chest, waist, shoulder pitch, torso length, and arm circumference for zero-pulling elegance.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-2 border-t border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero gapping or pulling
            </span>
          </div>

          {/* Card 2: AI Stylist */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 hover:border-rose-500/50 transition-all space-y-4 flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif-fashion text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                Gemini AI Stylist
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Advanced machine reasoning analyzes your event occasion, climate temperature, and skin comfort to suggest harmonious textiles and silhouettes.
              </p>
            </div>
            <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 pt-2 border-t border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Neural textile intelligence
            </span>
          </div>

          {/* Card 3: Design Autonomy */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 hover:border-blue-500/50 transition-all space-y-4 flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-serif-fashion text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Total Design Autonomy
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Decide sleeve shapes, collar curves, pocket placements, lining silks, topstitching colors, and custom embroidered monograms.
              </p>
            </div>
            <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1.5 pt-2 border-t border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Over 10,000 permutations
            </span>
          </div>

          {/* Card 4: Industrial Tech Packs */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between group shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif-fashion text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Industrial Tech Packs
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Instant generation of fabric yield requirements in meters, crafting lead times, transparent cost models, and printable blueprints.
              </p>
            </div>
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 pt-2 border-t border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Master tailor blueprints
            </span>
          </div>

        </div>
      </section>

      {/* ================= 3. REALISTIC MASTER ATELIER CRAFTSMANSHIP SHOWCASE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs text-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase font-bold tracking-widest text-[10px]">Master Craftsmanship & Heritage</span>
              </div>

              <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white leading-tight">
                Where Computational CAD Meets <br />
                <span className="italic font-normal text-amber-200">The Master Tailor’s Touch.</span>
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Every pattern generated by CustomFit AI is reviewed by certified sartorial tailors. 
                We combine laser-guided fabric cutting with traditional hand-basted canvas chests, 
                mother-of-pearl buttons, and hand-bound seams for clothing that endures for decades.
              </p>

              {/* Four Key Tailoring Points */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Laser-Cut Precision
                  </span>
                  <span className="text-[11px] text-stone-400">Micro-tolerances down to 0.3mm across multi-layered fabrics</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Zero Waste Cutting
                  </span>
                  <span className="text-[11px] text-stone-400">Computational nesting algorithms save up to 28% fabric yield</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Vibrant Silk Thread
                  </span>
                  <span className="text-[11px] text-stone-400">Triple-twisted German Gütermann silk threads in over 200 colors</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Bespoke Monogramming
                  </span>
                  <span className="text-[11px] text-stone-400">Delicate tonal embroidery on cuffs, collar stands, or inner pockets</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onStartCustomizing}
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
                >
                  <span>Commission Your Piece</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Master Atelier Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-700 shadow-2xl group">
                <img
                  src={ATELIER_IMAGES.craftAtelier}
                  alt="Master tailor workbench with colorful spools and shears"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/11] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Artisan Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400 font-serif font-bold">
                      CF
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Atelier Milano & Bombay</span>
                      <span className="text-[10px] text-stone-400">Ethical On-Demand Guild Certified</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-semibold">
                    100% Guaranteed Fit
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 4. CURATED ATELIER SILHOUETTES GALLERY (REALISTIC IMAGERY) ================= */}
      <section id="explore-designs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-rose-400 font-bold">
              Curated Atelier Inceptions
            </span>
            <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white">
              Exemplary Bespoke Commissions
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
              Explore tailored dresses, suits, gowns, and bespoke menswear. Tap any archetype to customize its measurements or order directly with complimentary master tailoring.
            </p>
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-stone-900/90 border border-stone-800 self-stretch sm:self-auto">
            {[
              { id: 'all', label: 'All Collections', count: 12 },
              { id: 'men', label: "Men's Tailoring", count: 6 },
              { id: 'women', label: "Women's Dresses & Gowns", count: 6 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setShowcaseGenderFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                  showcaseGenderFilter === tab.id
                    ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-lg'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  showcaseGenderFilter === tab.id ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShowcase.map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-900/90 rounded-2xl border border-stone-800 hover:border-rose-500/60 transition-all group flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1 duration-300"
            >
              {/* Realistic Photo Frame */}
              <div 
                onClick={() => onSelectCuratedDesign(item.config)}
                className="relative aspect-[4/3] overflow-hidden bg-stone-950 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                
                {/* Soft gradient bottom vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                {/* Top Badge: Category & Gender */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-stone-200 border border-stone-700">
                    {item.category}
                  </span>
                  <span className="text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md bg-rose-950/90 text-rose-300 border border-rose-800/60">
                    {item.gender === 'men' ? "Men" : "Women"}
                  </span>
                </div>

                {/* Top Right: Tag */}
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${item.tagColor} text-white shadow-md`}>
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Overlay Color Dot & Fabric */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-stone-700">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <span className="text-[11px] font-medium">{item.colorName}</span>
                  </div>

                  <span className="text-[10px] font-mono text-stone-300 bg-stone-950/80 backdrop-blur-md px-2 py-1 rounded-full border border-stone-700">
                    {item.fabric}
                  </span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h4 
                    onClick={() => onSelectCuratedDesign(item.config)}
                    className="font-serif-fashion text-xl font-bold text-white group-hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">{item.fabric}</p>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-medium">Bespoke Estimate</span>
                    <span className="font-serif-fashion text-lg font-bold text-white">{formatINR(item.price)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCuratedDesign(item.config)}
                      className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow"
                      title="Open in Customizer Studio"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onQuickOrder) {
                          onQuickOrder(item.config);
                        } else {
                          onSelectCuratedDesign(item.config);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg"
                      title="Direct Commission & Order"
                    >
                      <span>Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Order & Account Access Action Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-amber-950/60 border border-rose-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif-fashion text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Have a Custom Design in Mind or Need to Track an Order?</span>
            </h3>
            <p className="text-xs text-stone-300">
              Commission any silhouette directly, sign in to view saved measurements, or monitor your tailoring progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow"
              >
                Sign In / Client Portal
              </button>
            )}

            <button
              onClick={onStartCustomizing}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-stone-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= 5. COLORFUL ARTISANAL TEXTILE & WEAVE GALLERY ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold">
                Tactile Textile Library
              </span>
              <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white">
                World-Class Natural & Sustainable Weaves
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
                Every fabric in our catalog is rigorously tested for tensile recovery, breathability, 
                and skin touch comfort. Select a textile to preview its natural weave structure.
              </p>
            </div>

            <button
              onClick={onStartCustomizing}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all self-start md:self-auto shadow-lg"
            >
              <span>Explore Fabrics In Customizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of Realistic Fabric Swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FABRICS_DATABASE.slice(0, 6).map((fabric) => {
              const isSelected = selectedFabricTab === fabric.id;
              return (
                <div
                  key={fabric.id}
                  onClick={() => setSelectedFabricTab(fabric.id)}
                  className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col group ${
                    isSelected 
                      ? 'border-emerald-400 bg-stone-900 shadow-xl ring-2 ring-emerald-500/20' 
                      : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-950">
                    <img
                      src={fabric.imageUrl || ATELIER_IMAGES.fabrics.cotton}
                      alt={fabric.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-[9px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                        {fabric.weight}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {fabric.name}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
                      <span>Drape: <strong className="text-stone-300">{fabric.drape}</strong></span>
                      <span className="text-emerald-400 font-semibold">{fabric.breathability}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 6. HOW IT WORKS (5-STEP WORKFLOW) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-stone-950 rounded-3xl border border-stone-800">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-rose-400 font-bold">
            The Bespoke Process
          </span>
          <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white">
            From Imagination to Atelier Delivery
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            A seamless digital-to-couture journey designed for effortless creativity and zero-compromise precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {[
            { step: '01', title: 'Choose Garment', desc: 'Select from classic shirts, trousers, blazers, gowns, skirts, blouses, or tees.', color: 'text-rose-400' },
            { step: '02', title: 'Customize Design', desc: 'Sculpt sleeves, collar cuts, length, pocket placements, and curated dye tones.', color: 'text-amber-400' },
            { step: '03', title: 'AI Consultation', desc: 'Receive neural guidance on fabric tension, breathability, and occasion harmony.', color: 'text-emerald-400' },
            { step: '04', title: 'Live 3D Preview', desc: 'Examine front & back seams, toggle measurements, and adjust 360° perspective.', color: 'text-blue-400' },
            { step: '05', title: 'Craft & Receive', desc: 'Master artisans cut and assemble your commission on-demand with white-glove delivery.', color: 'text-purple-400' }
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-3 relative text-center sm:text-left">
              <span className={`font-serif-fashion text-4xl font-bold ${item.color} block`}>
                {item.step}
              </span>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7. CLIENT ENDORSEMENTS WITH REALISTIC PORTRAITS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-rose-400 font-bold">
            Client Endorsements
          </span>
          <h2 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-white">
            Voices of Individual Expression
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Hear from discerning clients whose proportions, style, and comfort were neglected by ready-to-wear fast fashion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ATELIER_IMAGES.testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 flex flex-col justify-between shadow-xl hover:border-stone-700 transition-all"
            >
              <div className="space-y-3">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-stone-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-stone-700 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                  <p className="text-[10px] text-stone-400 truncate">{t.role}</p>
                  <span 
                    className="inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: t.colorTag }}
                  >
                    {t.garment}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 8. FINAL ATELIER CALL TO ACTION ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-r from-rose-950 via-stone-900 to-amber-950 border border-rose-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-bold">
              Your Unique Silhouette Awaits
            </span>
            <h2 className="font-serif-fashion text-3xl sm:text-5xl font-bold text-white leading-tight">
              Ready to Wear Clothing Engineered Exclusively for You?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Experience the luxury of garments drafted to your individual millimeter, verified by artificial intelligence, and crafted by certified master tailors.
            </p>
            <div className="pt-3">
              <button
                id="bottom-cta-start-customizing"
                onClick={onStartCustomizing}
                className="px-10 py-4 rounded-full bg-white hover:bg-stone-100 text-stone-950 text-xs font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-2xl inline-flex items-center gap-2.5"
              >
                <Scissors className="w-4 h-4 text-rose-600" />
                <span>Enter Atelier Studio</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
