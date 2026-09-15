import { 
  GarmentType, 
  FabricInfo, 
  GarmentColor, 
  SleeveStyle, 
  NecklineStyle, 
  FitStyle, 
  LengthStyle, 
  PocketStyle, 
  ClosureStyle,
  CustomGarmentConfig,
  StandardSize
} from '../types/garment';

export const GARMENT_TYPES: {
  id: GarmentType;
  name: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'one_piece';
  gender: 'men' | 'women' | 'unisex';
  description: string;
  basePrice: number; // ₹ INR
  baseMaterialMeters: number;
  baseDays: number;
  imageUrl: string;
  supportedSleeves: SleeveStyle[];
  supportedNecklines: NecklineStyle[];
  supportedPockets: PocketStyle[];
  supportedClosures: ClosureStyle[];
}[] = [
  // --- MEN'S BESPOKE COLLECTION ---
  {
    id: 'shirt',
    name: 'Bespoke Button-Up Shirt',
    category: 'tops',
    gender: 'men',
    description: 'Crisp, perfectly proportioned formal or casual shirt with personalized collar spread and cuff ease.',
    basePrice: 2499,
    baseMaterialMeters: 1.8,
    baseDays: 4,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['short', 'long', 'three_quarter', 'french_cuff'],
    supportedNecklines: ['collar', 'spread_collar', 'cutaway_collar', 'mandarin', 'high_neck', 'round', 'v_neck'],
    supportedPockets: ['none', 'chest', 'front'],
    supportedClosures: ['buttons', 'snap_buttons']
  },
  {
    id: 'tuxedo',
    name: 'Atelier Black-Tie Tuxedo',
    category: 'outerwear',
    gender: 'men',
    description: 'Impeccable evening dinner jacket with silk grosgrain/satin peak lapels, floating canvas, and hand-stitched armholes.',
    basePrice: 8999,
    baseMaterialMeters: 3.4,
    baseDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['long', 'french_cuff'],
    supportedNecklines: ['collar', 'spread_collar', 'v_neck'],
    supportedPockets: ['front', 'chest', 'multiple'],
    supportedClosures: ['buttons']
  },
  {
    id: 'jacket',
    name: 'Architectural Tailored Blazer',
    category: 'outerwear',
    gender: 'men',
    description: 'Structured tailoring with floating canvas chest piece, customized shoulder line, and bespoke lining.',
    basePrice: 6499,
    baseMaterialMeters: 2.8,
    baseDays: 8,
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['long', 'three_quarter'],
    supportedNecklines: ['collar', 'spread_collar', 'v_neck', 'high_neck'],
    supportedPockets: ['front', 'side', 'multiple', 'chest'],
    supportedClosures: ['buttons', 'zipper', 'snap_buttons', 'hook_eye']
  },
  {
    id: 'nehru_jacket',
    name: 'Heritage Bandhgala Coat',
    category: 'outerwear',
    gender: 'men',
    description: 'Aristocratic mandarin collar jacket featuring tailored chest canvas, structured shoulder pads, and handcrafted buttons.',
    basePrice: 5799,
    baseMaterialMeters: 2.5,
    baseDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['long', 'sleeveless'],
    supportedNecklines: ['mandarin', 'high_neck'],
    supportedPockets: ['chest', 'front', 'multiple'],
    supportedClosures: ['buttons']
  },
  {
    id: 'polo',
    name: 'Fine Piqué Knit Polo',
    category: 'tops',
    gender: 'men',
    description: 'Luxe mercerized cotton polo with structured knit collar, reinforced placket, and customized athletic bicep fit.',
    basePrice: 1899,
    baseMaterialMeters: 1.5,
    baseDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1625910513413-562777b7cb34?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['short', 'long'],
    supportedNecklines: ['collar', 'v_neck'],
    supportedPockets: ['none', 'chest'],
    supportedClosures: ['buttons', 'snap_buttons']
  },
  {
    id: 'trousers',
    name: 'Precision Pleated Trousers',
    category: 'bottoms',
    gender: 'men',
    description: 'Flawless leg opening, rise height, and waistband construction tailored for both sitting and standing poise.',
    basePrice: 3299,
    baseMaterialMeters: 2.2,
    baseDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless'],
    supportedNecklines: ['round'],
    supportedPockets: ['side', 'front', 'multiple', 'none'],
    supportedClosures: ['zipper', 'buttons', 'hook_eye', 'snap_buttons']
  },

  // --- WOMEN'S BESPOKE DRESSES & COLLECTION ---
  {
    id: 'dress',
    name: 'Couture Silk Evening Gown',
    category: 'one_piece',
    gender: 'women',
    description: 'Sculptural gown tailored to exact bust-to-hip waist curvature, slit heights, and graceful hem drape.',
    basePrice: 4899,
    baseMaterialMeters: 3.2,
    baseDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless', 'cap', 'short', 'three_quarter', 'long', 'puff', 'bell', 'bishop'],
    supportedNecklines: ['sweetheart', 'cowl', 'v_neck', 'square', 'boat', 'round', 'halter', 'off_shoulder', 'high_neck'],
    supportedPockets: ['none', 'side'],
    supportedClosures: ['zipper', 'buttons', 'hook_eye', 'tie']
  },
  {
    id: 'blazer_dress',
    name: 'Atelier Structured Blazer Dress',
    category: 'one_piece',
    gender: 'women',
    description: 'Sharp double-breasted silhouette merging tailored suiting with sensual evening length and gold atelier buttons.',
    basePrice: 5999,
    baseMaterialMeters: 2.9,
    baseDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['long', 'three_quarter', 'sleeveless'],
    supportedNecklines: ['collar', 'v_neck', 'spread_collar'],
    supportedPockets: ['front', 'multiple', 'none'],
    supportedClosures: ['buttons', 'tie']
  },
  {
    id: 'cocktail_dress',
    name: 'Emerald A-Line Cocktail Dress',
    category: 'one_piece',
    gender: 'women',
    description: 'Graceful structured cocktail dress with fitted bodice, sculpted waist darts, and flared architectural hemline.',
    basePrice: 4999,
    baseMaterialMeters: 2.8,
    baseDays: 6,
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless', 'cap', 'short', 'elbow', 'three_quarter'],
    supportedNecklines: ['sweetheart', 'square', 'v_neck', 'boat', 'round'],
    supportedPockets: ['none', 'side'],
    supportedClosures: ['zipper', 'hook_eye']
  },
  {
    id: 'sundress',
    name: 'Riviera Linen Summer Sundress',
    category: 'one_piece',
    gender: 'women',
    description: 'Breezy handcrafted pure flax linen dress with delicate tailored shoulder straps, tiered skirt sweep, and pockets.',
    basePrice: 3799,
    baseMaterialMeters: 2.7,
    baseDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless', 'cap', 'puff'],
    supportedNecklines: ['square', 'sweetheart', 'v_neck', 'round', 'halter'],
    supportedPockets: ['side', 'none'],
    supportedClosures: ['zipper', 'buttons', 'tie']
  },
  {
    id: 'blouse',
    name: 'Fluid Designer Silk Blouse',
    category: 'tops',
    gender: 'women',
    description: 'Elegant draped silhouette with delicate seam finishes, romantic bishop sleeves, and versatile neckline variations.',
    basePrice: 2999,
    baseMaterialMeters: 2.0,
    baseDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless', 'short', 'elbow', 'three_quarter', 'long', 'puff', 'bell', 'bishop'],
    supportedNecklines: ['cowl', 'v_neck', 'boat', 'square', 'collar', 'high_neck', 'mandarin'],
    supportedPockets: ['none', 'front'],
    supportedClosures: ['buttons', 'tie', 'hook_eye', 'zipper']
  },
  {
    id: 'skirt',
    name: 'Statement Sculpted Skirt',
    category: 'bottoms',
    gender: 'women',
    description: 'Tailored waist contouring with custom panel pleating, walking slit placement, and flowing hem sweep.',
    basePrice: 2799,
    baseMaterialMeters: 1.9,
    baseDays: 4,
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless'],
    supportedNecklines: ['round'],
    supportedPockets: ['none', 'side', 'front'],
    supportedClosures: ['zipper', 'buttons', 'tie', 'hook_eye']
  },

  // --- UNISEX & ESSENTIALS ---
  {
    id: 'tshirt',
    name: 'Tailored Luxury T-Shirt',
    category: 'tops',
    gender: 'unisex',
    description: 'Elevated everyday essential with precision drape, reinforced collar ribbing, and custom chest drop.',
    basePrice: 1499,
    baseMaterialMeters: 1.4,
    baseDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    supportedSleeves: ['sleeveless', 'short', 'long'],
    supportedNecklines: ['round', 'v_neck', 'boat', 'high_neck', 'turtleneck'],
    supportedPockets: ['none', 'chest'],
    supportedClosures: ['buttons', 'snap_buttons', 'tie']
  }
];

export const COLOR_PALETTES: GarmentColor[] = [
  // Vibrant Jewel & Statement Tones
  { name: 'Emerald Royale', hex: '#047857', category: 'jewel' },
  { name: 'Sapphire Cobalt', hex: '#1d4ed8', category: 'jewel' },
  { name: 'Amethyst Violet', hex: '#7e22ce', category: 'jewel' },
  { name: 'Imperial Bordeaux', hex: '#631024', category: 'wine_burgundy' },
  { name: 'Ruby Crimson', hex: '#be123c', category: 'vibrant' },
  { name: 'Ocean Teal', hex: '#0f766e', category: 'jewel' },

  // Vibrant Sunny, Warm & Resort
  { name: 'Sunset Coral', hex: '#f43f5e', category: 'vibrant' },
  { name: 'Saffron Marigold', hex: '#d97706', category: 'vibrant' },
  { name: 'Tuscan Terracotta', hex: '#c2410c', category: 'earthy' },
  { name: 'Aegean Azure', hex: '#0284c7', category: 'vibrant' },
  { name: 'Mediterranean Olive', hex: '#4d7c0f', category: 'earthy' },
  { name: 'Amber Gold', hex: '#b45309', category: 'vibrant' },

  // Pastels & Soft Hues
  { name: 'Blush Peony', hex: '#fb7185', category: 'pastels' },
  { name: 'Lavender Mist', hex: '#a78bfa', category: 'pastels' },
  { name: 'Pistachio Mint', hex: '#10b981', category: 'pastels' },
  { name: 'Dusty Rose Quartz', hex: '#b38289', category: 'pastels' },
  { name: 'Muted Sage', hex: '#7c8d7e', category: 'pastels' },

  // Atelier Luxury & Wine
  { name: 'Rich Wine Red', hex: '#871a33', category: 'wine_burgundy' },
  { name: 'Velvet Plum', hex: '#4a152d', category: 'wine_burgundy' },
  { name: 'Cabernet Reserve', hex: '#520c1e', category: 'wine_burgundy' },
  { name: 'Cashmere Camel', hex: '#b89778', category: 'earthy' },
  { name: 'Silk Off-White', hex: '#f7f5f0', category: 'neutrals' },
  { name: 'Champagne Ecru', hex: '#ede8dd', category: 'neutrals' },
  { name: 'Warm Alabaster', hex: '#fbf9f6', category: 'neutrals' },
  { name: 'Charcoal Slate', hex: '#26282b', category: 'neutrals' },
  { name: 'Midnight Noir', hex: '#121214', category: 'neutrals' },
];

export const FABRICS_DATABASE: FabricInfo[] = [
  {
    id: 'cotton',
    name: 'Fine Supima Cotton',
    description: 'Long-staple breathable weave with ultra-soft hand feel, exceptional durability, and natural temperature regulation.',
    weight: '160 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Structured',
    priceMultiplier: 1.0,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441ec157?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'work', 'travel'],
    suggestedClimates: ['hot', 'mild', 'humid']
  },
  {
    id: 'linen',
    name: 'Pure Normandy Flax Linen',
    description: 'Crisp, moisture-wicking natural linen that softens gracefully over time. The pinnacle of relaxed warm-weather luxury.',
    weight: '185 GSM',
    breathability: 'High',
    stretch: 'None',
    drape: 'Structured',
    priceMultiplier: 1.25,
    texturePattern: 'crosshatch',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'party', 'travel'],
    suggestedClimates: ['hot', 'humid']
  },
  {
    id: 'silk',
    name: 'Mulberry Charmeuse Silk',
    description: 'Opulent liquid luster with butter-smooth skin contact, hypoallergenic natural sheen, and fluid architectural drape.',
    weight: '110 GSM',
    breathability: 'Medium',
    stretch: 'None',
    drape: 'Fluid',
    priceMultiplier: 1.85,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1528458876885-e110acb9f390?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['party', 'formal'],
    suggestedClimates: ['mild', 'hot']
  },
  {
    id: 'wool',
    name: 'Super 130s Merino Wool',
    description: 'Refined worsted virgin wool offering natural wrinkle resistance, luxurious body, thermal insulation, and bespoke structure.',
    weight: '260 GSM',
    breathability: 'Medium',
    stretch: 'Low',
    drape: 'Structured',
    priceMultiplier: 1.6,
    texturePattern: 'woven',
    imageUrl: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['formal', 'work'],
    suggestedClimates: ['cold', 'mild']
  },
  {
    id: 'denim',
    name: 'Japanese Selvedge Denim',
    description: 'Shuttle-loom woven organic cotton denim with subtle slub texture and authentic fading character that moulds to your body.',
    weight: '340 GSM',
    breathability: 'Medium',
    stretch: 'Low',
    drape: 'Heavy',
    priceMultiplier: 1.3,
    texturePattern: 'ribbed',
    imageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'travel'],
    suggestedClimates: ['mild', 'cold']
  },
  {
    id: 'rayon',
    name: 'Eco-Viscose Rayon',
    description: 'Semi-synthetic fiber made from regenerated wood cellulose with silky feel, vibrant color saturation, and gentle flow.',
    weight: '145 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Fluid',
    priceMultiplier: 1.1,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'party'],
    suggestedClimates: ['hot', 'humid', 'mild']
  },
  {
    id: 'organic_cotton',
    name: 'GOTS Certified Organic Cotton',
    description: 'Sustainably farmed pesticide-free cotton woven with low-impact botanical dyes. Gentle on sensitive skin.',
    weight: '175 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Structured',
    priceMultiplier: 1.2,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'work', 'travel'],
    suggestedClimates: ['hot', 'mild', 'humid']
  },
  {
    id: 'blended',
    name: 'Linen-Silk Performance Blend',
    description: 'Technical artisanal union blending the airy breathability of linen with the soft tensile glow and drape of silk.',
    weight: '170 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Soft',
    priceMultiplier: 1.45,
    texturePattern: 'subtle',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['party', 'work', 'travel'],
    suggestedClimates: ['hot', 'mild']
  },
  {
    id: 'polyester',
    name: 'High-Twist Recycled Poly-Crepe',
    description: 'Crease-resistant performance weave engineered for effortless packability, stain resistance, and enduring color vibrancy.',
    weight: '190 GSM',
    breathability: 'Medium',
    stretch: 'Medium',
    drape: 'Soft',
    priceMultiplier: 0.95,
    texturePattern: 'woven',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441ec157?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['work', 'sports', 'travel'],
    suggestedClimates: ['cold', 'mild']
  },
  {
    id: 'cashmere',
    name: 'Mongolian Grade-A Cashmere Blend',
    description: 'Ultra-plush cashmere woven with fine merino for cloud-like softness, opulent thermal warmth, and refined drape.',
    weight: '310 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Soft',
    priceMultiplier: 2.2,
    texturePattern: 'woven',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['formal', 'party', 'work'],
    suggestedClimates: ['cold', 'mild']
  },
  {
    id: 'satin',
    name: 'Liquid Silk Charmeuse Satin',
    description: 'Sumptuous glossy face with crepe back, fluid cascading drape, and radiant luster ideal for cocktail and evening galas.',
    weight: '160 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Fluid',
    priceMultiplier: 1.9,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1528458876885-e110acb9f390?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['party', 'formal'],
    suggestedClimates: ['mild', 'hot']
  },
  {
    id: 'crepe',
    name: 'French Silk Crêpe de Chine',
    description: 'Distinctive crimped airy texture with graceful weightless flow, gentle matte sheen, and resistance to creasing.',
    weight: '140 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Fluid',
    priceMultiplier: 1.7,
    texturePattern: 'subtle',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['casual', 'party', 'work'],
    suggestedClimates: ['hot', 'mild', 'humid']
  },
  {
    id: 'oxford',
    name: 'Royal Cambridge Oxford Twill',
    description: 'Substantial basketweave cotton with pinpoint diamond texture, exceptional durability, and classic structure.',
    weight: '220 GSM',
    breathability: 'High',
    stretch: 'Low',
    drape: 'Structured',
    priceMultiplier: 1.35,
    texturePattern: 'woven',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['work', 'formal', 'casual'],
    suggestedClimates: ['mild', 'cold']
  },
  {
    id: 'velvet',
    name: 'Venetian Silk-Cotton Velvet',
    description: 'Deep pile luxury velvet with dramatic dimensional light catch, buttery hand-feel, and majestic structure.',
    weight: '330 GSM',
    breathability: 'Medium',
    stretch: 'Low',
    drape: 'Structured',
    priceMultiplier: 2.0,
    texturePattern: 'smooth',
    imageUrl: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=500&q=80',
    suggestedOccasions: ['formal', 'party'],
    suggestedClimates: ['cold', 'mild']
  }
];

export const STANDARD_MEASUREMENTS: Record<string, { chest: number; waist: number; hip: number; shoulder: number; length: number }> = {
  XS: { chest: 86, waist: 71, hip: 89, shoulder: 41, length: 68 },
  S: { chest: 92, waist: 77, hip: 95, shoulder: 43, length: 70 },
  M: { chest: 98, waist: 83, hip: 101, shoulder: 45, length: 72 },
  L: { chest: 104, waist: 89, hip: 107, shoulder: 47, length: 74 },
  XL: { chest: 112, waist: 97, hip: 115, shoulder: 49, length: 76 },
  XXL: { chest: 120, waist: 105, hip: 123, shoulder: 51, length: 78 },
  '3XL': { chest: 128, waist: 115, hip: 131, shoulder: 53, length: 80 },
  '4XL': { chest: 136, waist: 124, hip: 139, shoulder: 55, length: 82 },
  Petite: { chest: 90, waist: 74, hip: 94, shoulder: 40, length: 64 },
  Tall: { chest: 102, waist: 86, hip: 104, shoulder: 47, length: 78 },
};

export const STANDARD_SIZES: StandardSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Petite', 'Tall', 'Custom'];

export const INITIAL_DEFAULT_CONFIG: CustomGarmentConfig = {
  id: 'cfg-' + Date.now(),
  name: 'Bordeaux Tailored Shirt',
  title: 'Bordeaux Tailored Shirt',
  garmentType: 'shirt',
  size: 'M',
  measurements: {
    height: 178,
    chest: 98,
    waist: 83,
    hip: 101,
    shoulder: 45,
    sleeveLength: 64,
    armLength: 64,
    garmentLength: 72,
    torsoLength: 49,
    inseam: 78,
    outseam: 102,
    neckCircumference: 39,
    neck: 39,
    unit: 'cm'
  },
  length: 'standard',
  sleeve: 'long',
  neckline: 'collar',
  fit: 'regular',
  color: COLOR_PALETTES[0], // Imperial Bordeaux
  fabric: 'cotton',
  pockets: 'chest',
  closure: 'buttons',
  details: {
    stitching: 'single',
    monogramText: '',
    monogramPlacement: 'cuff',
    lining: 'unlined',
    hemStyle: 'curved'
  },
  occasion: 'work',
  climate: 'mild',
  stylePreference: 'Modern Minimalist',
  comfortPreference: 'Breathable with slight ease',
  functionalRequirements: ['Breathable', 'Wrinkle Resistant'],
  estimatedPrice: 2499,
  productionTime: '4–6 days',
  materialRequired: '1.8 meters',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const DEFAULT_GARMENT_CONFIG: CustomGarmentConfig = INITIAL_DEFAULT_CONFIG;

export const DEFAULT_MEASUREMENTS = INITIAL_DEFAULT_CONFIG.measurements;


