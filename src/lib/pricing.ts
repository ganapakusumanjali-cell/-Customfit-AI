import { CustomGarmentConfig, GarmentType, FabricType, DeliveryTier, DeliveryOption } from '../types/garment';
import { GARMENT_TYPES, FABRICS_DATABASE } from './garmentData';

export const DELIVERY_OPTIONS: Record<DeliveryTier, DeliveryOption> = {
  standard: {
    tier: 'standard',
    label: 'Standard Atelier Crafting & Delivery',
    shortLabel: 'Standard Delivery',
    sublabel: 'Complimentary standard queue',
    description: 'Careful bespoke cutting, artisanal hand-finishing & insured overland courier',
    surchargeINR: 0,
    estimatedDaysMin: 4,
    estimatedDaysMax: 6,
    dispatchTimeStr: '4–6 business days',
    courierType: 'Insured White-Glove Surface Courier',
    perks: ['Complimentary standard crafting', 'Zero surcharge']
  },
  express: {
    tier: 'express',
    label: 'Express Priority Bench',
    shortLabel: 'Express (2–3 Days)',
    sublabel: 'Priority cutting & express air',
    description: 'Prioritized cutting table, accelerated hand-assembly & expedited air courier',
    surchargeINR: 499,
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
    dispatchTimeStr: '2–3 business days',
    badge: 'Expedited',
    courierType: 'Priority Air Express Logistics',
    perks: ['Fast-track cutting queue', 'Express air delivery (+₹499)']
  },
  instant: {
    tier: 'instant',
    label: 'Instant VIP Next-Day Delivery',
    shortLabel: 'Instant Delivery (24–48h)',
    sublabel: 'Overnight Master Tailor rush',
    description: 'Master Tailor dedicated overnight shift, priority laser pattern cutting, immediate dispatch via same-day express flight/express van',
    surchargeINR: 1199,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    dispatchTimeStr: '24–48 hours (Next-Day dispatch)',
    badge: '⚡ Instant VIP Rush',
    courierType: 'Same-Day Dedicated Express Flight & Courier',
    perks: ['Dedicated Master Tailor overtime slot', 'Same-day priority flight/van handover', 'Live concierge dispatch tracking']
  }
};

export interface PriceEstimateResult {
  priceINR: number;
  originalPriceINR: number;
  garmentSubtotalINR: number;
  deliveryTier: DeliveryTier;
  deliverySurchargeINR: number;
  deliveryOption: DeliveryOption;
  negotiatedSavings: number;
  isNegotiated: boolean;
  negotiatedDiscountPercentage: number;
  minDays: number;
  maxDays: number;
  productionTimeStr: string;
  estimatedDeliveryDateStr: string;
  materialMeters: number;
  materialMetersStr: string;
  breakdown: {
    baseGarment: number;
    fabricPremium: number;
    designElements: number;
    customTailoring: number;
    monogramFee: number;
    deliveryFee: number;
    negotiatedDiscount?: number;
  };
}

export function calculateGarmentEstimates(config: Partial<CustomGarmentConfig>): PriceEstimateResult {
  const garment = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];
  const fabric = FABRICS_DATABASE.find(f => f.id === config.fabric) || FABRICS_DATABASE[0];

  // Base price
  let basePrice = garment.basePrice;
  
  // Fabric multiplier
  const fabricMultiplier = fabric.priceMultiplier;
  const fabricPremium = Math.round(basePrice * (fabricMultiplier - 1));

  // Design elements complexity
  let designFee = 0;
  if (config.pockets === 'multiple') designFee += 350;
  else if (config.pockets === 'side' || config.pockets === 'front') designFee += 180;

  if (config.closure === 'zipper' || config.closure === 'snap_buttons') designFee += 250;
  if (config.closure === 'hook_eye') designFee += 150;

  if (config.sleeve === 'puff' || config.sleeve === 'bell') designFee += 300;
  if (config.length === 'long') designFee += 250;

  // Custom measurements tailoring fee
  let customTailoringFee = 0;
  if (config.size === 'Custom') {
    customTailoringFee = 650; // master tailor pattern drafting fee
  }

  // Monogram / personal embroidery
  let monogramFee = 0;
  if (config.details?.monogramText && config.details.monogramText.trim().length > 0) {
    monogramFee = 250;
  }

  const standardGarmentPrice = Math.round(basePrice + fabricPremium + designFee + customTailoringFee + monogramFee);

  // Delivery tier surcharge (e.g. Instant Delivery increases price)
  const deliveryTier: DeliveryTier = config.deliveryTier || 'standard';
  const deliveryOption = DELIVERY_OPTIONS[deliveryTier] || DELIVERY_OPTIONS.standard;
  const deliverySurchargeINR = deliveryOption.surchargeINR;

  // Check if there is an agreed bargain / negotiated price on garment
  let garmentPrice = standardGarmentPrice;
  let negotiatedSavings = 0;
  let isNegotiated = false;
  let negotiatedDiscountPercentage = 0;

  if (config.negotiatedDiscount && config.negotiatedDiscount.negotiatedPrice) {
    const negotiatedTarget = Math.round(config.negotiatedDiscount.negotiatedPrice);
    if (negotiatedTarget < standardGarmentPrice && negotiatedTarget > 0) {
      garmentPrice = negotiatedTarget;
      negotiatedSavings = standardGarmentPrice - garmentPrice;
      isNegotiated = true;
      negotiatedDiscountPercentage = Math.round((negotiatedSavings / standardGarmentPrice) * 100);
    }
  }

  // Final total includes garment price + instant/express delivery surcharge
  const finalPrice = garmentPrice + deliverySurchargeINR;
  const originalTotalPrice = standardGarmentPrice + deliverySurchargeINR;

  // Production days & delivery timeline calculation
  let minDays = garment.baseDays;
  let maxDays = garment.baseDays + 2;

  if (deliveryTier === 'instant') {
    // 24–48 hours rush turnaround
    minDays = 1;
    maxDays = 2;
  } else if (deliveryTier === 'express') {
    // 2–3 business days priority turnaround
    minDays = 2;
    maxDays = 3;
  } else {
    // Standard atelier queue
    if (config.size === 'Custom') {
      minDays += 1;
      maxDays += 2;
    }
    if (fabric.id === 'silk' || fabric.id === 'wool') {
      minDays += 1;
      maxDays += 1;
    }
    if (monogramFee > 0) {
      minDays += 1;
    }
  }

  let productionTimeStr: string;
  if (deliveryTier === 'instant') {
    productionTimeStr = 'Within 24–48 hours (Instant VIP Rush)';
  } else if (deliveryTier === 'express') {
    productionTimeStr = '2–3 business days (Express Priority)';
  } else {
    productionTimeStr = `${minDays}–${maxDays} business days`;
  }

  // Estimated calendar delivery date
  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + maxDays);
  const estimatedDeliveryDateStr = deliveryDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Material calculation in meters
  let meters = garment.baseMaterialMeters;
  if (config.length === 'cropped') meters -= 0.3;
  if (config.length === 'long') meters += 0.5;
  if (config.sleeve === 'sleeveless') meters -= 0.4;
  if (config.sleeve === 'puff' || config.sleeve === 'bell') meters += 0.4;
  if (config.size === 'XL' || config.size === 'XXL') meters += 0.3;
  if (config.size === 'XS') meters -= 0.2;
  meters = Math.max(1.0, Math.round(meters * 10) / 10);

  return {
    priceINR: finalPrice,
    originalPriceINR: originalTotalPrice,
    garmentSubtotalINR: standardGarmentPrice,
    deliveryTier,
    deliverySurchargeINR,
    deliveryOption,
    negotiatedSavings,
    isNegotiated,
    negotiatedDiscountPercentage,
    minDays,
    maxDays,
    productionTimeStr,
    estimatedDeliveryDateStr,
    materialMeters: meters,
    materialMetersStr: `${meters.toFixed(1)} meters`,
    breakdown: {
      baseGarment: basePrice,
      fabricPremium: Math.max(0, fabricPremium),
      designElements: designFee,
      customTailoring: customTailoringFee,
      monogramFee,
      deliveryFee: deliverySurchargeINR,
      negotiatedDiscount: isNegotiated ? negotiatedSavings : 0
    }
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
