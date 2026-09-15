import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Bookmark, 
  Printer, 
  Clock, 
  Layers, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ShieldAlert,
  Ruler,
  Handshake,
  Award,
  Zap,
  Truck
} from 'lucide-react';
import { CustomGarmentConfig, DeliveryTier } from '../../types/garment';
import { calculateGarmentEstimates, formatINR, DELIVERY_OPTIONS } from '../../lib/pricing';
import { FABRICS_DATABASE, GARMENT_TYPES } from '../../lib/garmentData';

interface SummaryAndPricingCardProps {
  config: CustomGarmentConfig;
  onSaveDesign: () => Promise<void>;
  onAddToCart: () => void;
  onProceedCheckout: () => void;
  onOpenTechPack: () => void;
  onOpenBargainModal?: () => void;
  onUpdateDeliveryTier?: (tier: DeliveryTier) => void;
}

export const SummaryAndPricingCard: React.FC<SummaryAndPricingCardProps> = ({
  config,
  onSaveDesign,
  onAddToCart,
  onProceedCheckout,
  onOpenTechPack,
  onOpenBargainModal,
  onUpdateDeliveryTier
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const estimates = calculateGarmentEstimates(config);
  const fabricInfo = FABRICS_DATABASE.find(f => f.id === config.fabric) || FABRICS_DATABASE[0];
  const garmentInfo = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];
  const activeTier: DeliveryTier = config.deliveryTier || 'standard';

  const handleSelectDeliveryTier = (tier: DeliveryTier) => {
    if (onUpdateDeliveryTier) {
      onUpdateDeliveryTier(tier);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveDesign();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    onAddToCart();
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="bg-[#141215] rounded-2xl border border-[#2b252d] p-5 shadow-xl space-y-5">
      
      {/* Price & Primary Delivery Estimate */}
      <div className="border-b border-[#262029] pb-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8c8588] block">
              {estimates.isNegotiated ? 'Negotiated Atelier Price' : 'Estimated Atelier Price'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif-fashion text-3xl font-bold text-[#fbf9f6] tracking-tight">
                {formatINR(estimates.priceINR)}
              </span>
              {estimates.isNegotiated && (
                <span className="text-sm text-stone-400 line-through">
                  {formatINR(estimates.originalPriceINR)}
                </span>
              )}
              <span className="text-xs text-[#8c8588]">all inclusive</span>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-[#c9365e] hover:text-[#e04e76] flex items-center gap-1 font-medium"
          >
            {showBreakdown ? 'Hide Breakdown' : 'Cost Breakdown'}
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bargained Status Banner or Bargain CTA */}
        {estimates.isNegotiated ? (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#121f18] border border-emerald-500/50 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Handshake className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-emerald-300 block leading-tight">
                  Handshake Deal Sealed (-{formatINR(estimates.negotiatedSavings)})
                </span>
                <span className="text-[10px] text-stone-400">
                  Code: {config.negotiatedDiscount?.dealCode} • {estimates.negotiatedDiscountPercentage}% off
                </span>
              </div>
            </div>

            {onOpenBargainModal && (
              <button
                onClick={onOpenBargainModal}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold border border-emerald-700/60 transition-colors"
              >
                Review Deal
              </button>
            )}
          </div>
        ) : (
          onOpenBargainModal && (
            <button
              onClick={onOpenBargainModal}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-rose-950/40 border border-amber-600/40 hover:border-amber-500 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-amber-950/20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 text-stone-950 flex items-center justify-center font-bold flex-shrink-0 shadow">
                  <Handshake className="w-4 h-4 text-stone-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
                      Bargain with Master Tailor
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                      Interactive
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Propose your patron counter-offer to Master Rajesh (up to 25% off)
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Haggle <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          )
        )}
      </div>

      {/* Expandable Price Breakdown */}
      {showBreakdown && (
        <div className="p-3.5 rounded-xl bg-[#1a171d] border border-[#2d2630] space-y-2 text-xs animate-in fade-in duration-150">
          <div className="flex justify-between text-[#dfd8cb]">
            <span>Base Silhouette ({garmentInfo.name}):</span>
            <span>{formatINR(estimates.breakdown.baseGarment)}</span>
          </div>
          {estimates.breakdown.fabricPremium > 0 && (
            <div className="flex justify-between text-[#dfd8cb]">
              <span>Textile Grade ({fabricInfo.name}):</span>
              <span>+{formatINR(estimates.breakdown.fabricPremium)}</span>
            </div>
          )}
          {estimates.breakdown.designElements > 0 && (
            <div className="flex justify-between text-[#dfd8cb]">
              <span>Hardware & Pattern Additions:</span>
              <span>+{formatINR(estimates.breakdown.designElements)}</span>
            </div>
          )}
          {estimates.breakdown.customTailoring > 0 && (
            <div className="flex justify-between text-[#dfd8cb]">
              <span>Bespoke Drafting & Individual Sizing:</span>
              <span>+{formatINR(estimates.breakdown.customTailoring)}</span>
            </div>
          )}
          {estimates.breakdown.monogramFee > 0 && (
            <div className="flex justify-between text-[#dfd8cb]">
              <span>Hand-Embroidered Monogram:</span>
              <span>+{formatINR(estimates.breakdown.monogramFee)}</span>
            </div>
          )}
          {estimates.breakdown.deliveryFee > 0 ? (
            <div className="flex justify-between text-amber-300 font-semibold bg-amber-950/20 p-1.5 rounded-lg border border-amber-800/30">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {estimates.deliveryOption.shortLabel} Surcharge:
              </span>
              <span>+{formatINR(estimates.breakdown.deliveryFee)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[#dfd8cb]">
              <span>White-Glove Atelier Delivery:</span>
              <span className="text-[#22c55e]">Complimentary (₹0)</span>
            </div>
          )}
          {estimates.isNegotiated && estimates.breakdown.negotiatedDiscount && estimates.breakdown.negotiatedDiscount > 0 && (
            <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-[#2a242c]">
              <span className="flex items-center gap-1">
                <Handshake className="w-3 h-3" />
                Master Tailor Bargain Concession:
              </span>
              <span>-{formatINR(estimates.breakdown.negotiatedDiscount)}</span>
            </div>
          )}
          <div className="border-t border-[#2a242c] pt-2 flex justify-between font-semibold text-[#fbf9f6]">
            <span>Net Total:</span>
            <span className="text-[#c9365e]">{formatINR(estimates.priceINR)}</span>
          </div>
        </div>
      )}

      {/* Delivery Speed & Instant Delivery Surcharge Selector */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#18151c] to-[#120f14] border border-[#2e2633] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#c9365e]" />
            <span className="text-xs font-bold text-[#fbf9f6] tracking-wide uppercase">
              Delivery Speed & Dispatch
            </span>
          </div>
          {activeTier === 'instant' && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              +₹1,199 Instant Rush
            </span>
          )}
          {activeTier === 'express' && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
              +₹499 Express
            </span>
          )}
          {activeTier === 'standard' && (
            <span className="text-[10px] font-medium text-[#22c55e]">
              Free Delivery
            </span>
          )}
        </div>

        {/* 3 Tier Options */}
        <div className="grid grid-cols-3 gap-2">
          {(['standard', 'express', 'instant'] as DeliveryTier[]).map((tierKey) => {
            const opt = DELIVERY_OPTIONS[tierKey];
            const isSelected = activeTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => handleSelectDeliveryTier(tierKey)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? tierKey === 'instant'
                      ? 'bg-gradient-to-b from-amber-950/60 to-rose-950/50 border-amber-500 shadow-md shadow-amber-900/20 text-white ring-1 ring-amber-500/50'
                      : tierKey === 'express'
                      ? 'bg-sky-950/50 border-sky-500 text-white'
                      : 'bg-[#24131b] border-[#c9365e] text-[#fbf9f6]'
                    : 'bg-[#161318] border-[#29222c] text-[#8c8588] hover:border-[#3d3342] hover:text-[#dfd8cb]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold block truncate">
                      {tierKey === 'instant' ? '⚡ Instant' : opt.shortLabel.split(' ')[0]}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] block opacity-80 mt-0.5">
                    {opt.dispatchTimeStr.split(' ')[0]} {opt.dispatchTimeStr.split(' ')[1] || ''}
                  </span>
                </div>

                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${
                    tierKey === 'instant'
                      ? 'text-amber-300'
                      : tierKey === 'express'
                      ? 'text-sky-300'
                      : 'text-emerald-400'
                  }`}>
                    {opt.surchargeINR === 0 ? 'Free' : `+${formatINR(opt.surchargeINR)}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeTier === 'instant' && (
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2 animate-in fade-in duration-150">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Instant 24–48h Atelier VIP Turnaround</strong>
              <span>Price increased by {formatINR(DELIVERY_OPTIONS.instant.surchargeINR)} for overnight master craftsman overtime & priority same-day express flight logistics.</span>
            </div>
          </div>
        )}
      </div>

      {/* Production & Textile Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
          activeTier === 'instant'
            ? 'bg-amber-950/30 border-amber-500/50'
            : 'bg-[#1a171d] border-[#2d2630]'
        }`}>
          {activeTier === 'instant' ? (
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-[#c9365e] flex-shrink-0" />
          )}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8c8588] block">
              {activeTier === 'instant' ? '⚡ Instant Lead Time' : 'Crafting Time'}
            </span>
            <span className={`text-xs font-semibold ${activeTier === 'instant' ? 'text-amber-300 font-bold' : 'text-[#fbf9f6]'}`}>
              {estimates.productionTimeStr}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#1a171d] border border-[#2d2630] flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#c9365e] flex-shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8c8588] block">Textile Yield</span>
            <span className="text-xs font-semibold text-[#fbf9f6]">{estimates.materialMetersStr}</span>
          </div>
        </div>
      </div>

      {/* Garment Quick Specs Pills */}
      <div className="p-3 rounded-xl bg-[#171419] border border-[#29222c] space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[#8c8588] text-[11px] pb-1 border-b border-[#241f27]">
          <span>SPECIFICATION DIGEST</span>
          <span className="text-[#c9365e] font-semibold">{config.size} Size</span>
        </div>
        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-[#dfd8cb]">
          <div><span className="text-[#8c8588]">Fabric:</span> {fabricInfo.name}</div>
          <div><span className="text-[#8c8588]">Color:</span> {config.color.name}</div>
          <div><span className="text-[#8c8588]">Fit:</span> {config.fit}</div>
          <div><span className="text-[#8c8588]">Length:</span> {config.length}</div>
          <div><span className="text-[#8c8588]">Pockets:</span> {config.pockets}</div>
          <div><span className="text-[#8c8588]">Closure:</span> {config.closure}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        
        {/* Primary CTA: Proceed to Checkout */}
        <button
          id="btn-proceed-checkout"
          onClick={onProceedCheckout}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7a152d] via-[#9e1d3d] to-[#7a152d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#7a152d]/30"
        >
          <span>Order Bespoke Garment</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary CTAs Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Add to Cart */}
          <button
            id="btn-add-to-cart"
            onClick={handleAdd}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              addedSuccess
                ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30'
                : 'bg-[#1a171d] text-[#fbf9f6] border-[#352e39] hover:bg-[#252028]'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#c9365e]" /> Add to Bag
              </>
            )}
          </button>

          {/* Save Design */}
          <button
            id="btn-save-design"
            onClick={handleSave}
            disabled={saving}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              savedSuccess
                ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30'
                : 'bg-[#1a171d] text-[#fbf9f6] border-[#352e39] hover:bg-[#252028]'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#c9365e]" /> Save Design
              </>
            )}
          </button>
        </div>

        {/* Tech Pack / Print Spec Modal trigger */}
        <button
          id="btn-view-techpack"
          onClick={onOpenTechPack}
          className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-[#1f1a23] text-[#dfd8cb] hover:text-[#fbf9f6] border border-[#2b242e] text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-[#8c8588]" />
          <span>Generate Atelier Tech Pack / Print Spec</span>
        </button>

      </div>

    </div>
  );
};
