export type GarmentType = 
  | 'shirt'
  | 'tshirt'
  | 'polo'
  | 'tuxedo'
  | 'nehru_jacket'
  | 'blouse'
  | 'dress'
  | 'blazer_dress'
  | 'cocktail_dress'
  | 'sundress'
  | 'jacket'
  | 'trousers'
  | 'skirt';

export type StandardSize = 
  | 'XS' 
  | 'S' 
  | 'M' 
  | 'L' 
  | 'XL' 
  | 'XXL' 
  | '3XL' 
  | '4XL' 
  | 'Petite' 
  | 'Tall' 
  | 'Custom';

export type SleeveStyle = 
  | 'sleeveless' 
  | 'cap' 
  | 'short' 
  | 'elbow' 
  | 'three_quarter' 
  | 'long' 
  | 'french_cuff' 
  | 'puff' 
  | 'bell' 
  | 'bishop';
export type SleeveType = SleeveStyle;

export type NecklineStyle = 
  | 'round' 
  | 'v_neck' 
  | 'square' 
  | 'boat' 
  | 'collar' 
  | 'spread_collar' 
  | 'cutaway_collar' 
  | 'mandarin' 
  | 'sweetheart' 
  | 'cowl' 
  | 'halter' 
  | 'off_shoulder' 
  | 'turtleneck' 
  | 'high_neck';
export type NecklineType = NecklineStyle;

export type FitStyle = 
  | 'ultra_slim' 
  | 'slim' 
  | 'regular' 
  | 'relaxed' 
  | 'oversized' 
  | 'athletic';
export type FitSilhouette = FitStyle;

export type LengthStyle = 'cropped' | 'standard' | 'long' | 'custom';
export type LengthType = LengthStyle;

export type FabricType = 
  | 'cotton'
  | 'linen'
  | 'silk'
  | 'denim'
  | 'wool'
  | 'cashmere'
  | 'satin'
  | 'crepe'
  | 'oxford'
  | 'velvet'
  | 'rayon'
  | 'polyester'
  | 'organic_cotton'
  | 'blended';

export type PocketStyle = 'none' | 'side' | 'front' | 'chest' | 'multiple';
export type PocketType = PocketStyle;

export type ClosureStyle = 'buttons' | 'zipper' | 'snap_buttons' | 'tie' | 'hook_eye';
export type ClosureType = ClosureStyle;

export type OccasionType = 'casual' | 'formal' | 'party' | 'work' | 'sports' | 'travel';

export type ClimateType = 'hot' | 'cold' | 'humid' | 'mild';

export interface BodyMeasurements {
  height?: number; // cm
  chest?: number; // cm
  waist?: number; // cm
  hip?: number; // cm
  shoulder?: number; // cm
  sleeveLength?: number; // cm
  armLength?: number; // alias
  garmentLength?: number; // cm
  torsoLength?: number;
  inseam?: number;
  outseam?: number;
  neckCircumference?: number; // cm
  neck?: number; // alias
  unit: 'cm' | 'inches' | 'in';
}

export interface DesignDetails {
  stitching: 'single' | 'double_edge' | 'contrast' | 'hidden' | 'matching';
  monogramText?: string;
  monogramPlacement?: 'chest' | 'cuff' | 'hem' | 'inner_label';
  monogramColor?: string;
  lining: 'unlined' | 'half_silk' | 'full_satin' | 'breathable_mesh';
  hemStyle: 'straight' | 'curved' | 'split' | 'raw';
}

export interface GarmentColor {
  name: string;
  hex: string;
  category: 'neutrals' | 'wine_burgundy' | 'earthy' | 'statement' | 'pastels' | 'wine' | 'dark' | 'light' | 'vibrant' | 'jewel';
}

export interface FabricInfo {
  id: FabricType;
  name: string;
  description: string;
  weight: string; // e.g. "160 GSM"
  breathability: 'High' | 'Medium' | 'Low';
  stretch: 'None' | 'Low' | 'Medium' | 'High';
  drape: 'Structured' | 'Fluid' | 'Soft' | 'Heavy';
  priceMultiplier: number;
  texturePattern: 'smooth' | 'woven' | 'ribbed' | 'crosshatch' | 'subtle';
  imageUrl?: string;
  suggestedOccasions: OccasionType[];
  suggestedClimates: ClimateType[];
}

export interface CompetitorEvidence {
  platform: string;
  listingTitle: string;
  competitorPrice: number;
  productUrl?: string;
  evidenceImageUrl?: string;
  priceDifference?: number;
  percentageLower?: number;
  evidenceType?: 'benchmark_listing' | 'user_upload' | 'verified_url';
}

export interface NegotiatedDiscount {
  originalPrice: number;
  negotiatedPrice: number;
  savings: number;
  percentage: number;
  reason: string;
  agreedAt: string;
  dealCode: string;
  tailorQuote: string;
  roundsTaken: number;
  competitorEvidence?: CompetitorEvidence;
}

export type MannequinPose = 'neutral' | 'runway' | 'hands_on_hip' | 'side_profile';
export type MannequinType = 'atelier_form' | 'full_body' | 'masculine' | 'feminine';
export type MannequinFinish = 'ecru_linen' | 'noir_obsidian' | 'ivory_porcelain' | 'walnut_brass';

export type DeliveryTier = 'standard' | 'express' | 'instant';

export interface DeliveryOption {
  tier: DeliveryTier;
  label: string;
  shortLabel: string;
  sublabel: string;
  description: string;
  surchargeINR: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  dispatchTimeStr: string;
  badge?: string;
  courierType: string;
  perks: string[];
}

export interface CustomGarmentConfig {
  id?: string;
  name?: string;
  title?: string;
  garmentType: GarmentType;
  size: StandardSize;
  measurements: BodyMeasurements;
  length: LengthStyle;
  customLengthValue?: number;
  sleeve: SleeveStyle;
  neckline: NecklineStyle;
  fit: FitStyle;
  color: GarmentColor;
  fabric: FabricType;
  pockets: PocketStyle;
  closure: ClosureStyle;
  details?: Partial<DesignDetails>;
  occasion: OccasionType;
  climate: ClimateType;
  stylePreference?: string;
  comfortPreference?: string;
  functionalRequirements?: string[];
  estimatedPrice?: number; // in INR ₹
  negotiatedDiscount?: NegotiatedDiscount;
  deliveryTier?: DeliveryTier; // standard (₹0), express (+₹499), instant (+₹1,199)
  productionTime?: string; // e.g. "4–6 days"
  materialRequired?: string; // e.g. "1.8 meters"
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'fabric' | 'color' | 'fit' | 'sleeve' | 'neckline' | 'combination';
  suggestedValues: Partial<CustomGarmentConfig>;
  reasoning: string;
  tag?: string;
  confidence: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  designId?: string;
  designConfig: CustomGarmentConfig;
  totalPriceINR: number;
  garmentSummary?: {
    name: string;
    garmentType: GarmentType;
    fabric: string;
    colorName: string;
    colorHex: string;
    size: string;
    measurements: BodyMeasurements;
  };
  status: 'submitted' | 'cutting' | 'tailoring' | 'quality_check' | 'dispatched' | 'delivered' | 'Design Submitted' | 'Production' | 'Quality Check' | 'Shipped' | 'Delivered';
  price?: number;
  productionDaysEstimate?: string;
  deliveryTier?: DeliveryTier;
  deliverySurchargeINR?: number;
  deliveryOptionName?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street?: string;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentStatus?: string;
  trackingSteps?: {
    status: string;
    timestamp: string;
    description: string;
    completed: boolean;
    current: boolean;
  }[];
  estimatedDelivery?: string;
  createdAt: string;
}
