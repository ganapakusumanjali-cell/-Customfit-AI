import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Handshake, Tag, Zap, Truck } from 'lucide-react';
import { CustomGarmentConfig } from '../../types/garment';
import { calculateGarmentEstimates, formatINR, DELIVERY_OPTIONS } from '../../lib/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CustomGarmentConfig[];
  onRemoveItem: (index: number) => void;
  onCheckoutItem: (item: CustomGarmentConfig) => void;
  onOpenItemInCustomizer: (item: CustomGarmentConfig) => void;
  onOpenBargainModal?: (item: CustomGarmentConfig) => void;
  onUpdateCartItem?: (index: number, updates: Partial<CustomGarmentConfig>) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckoutItem,
  onOpenItemInCustomizer,
  onOpenBargainModal,
  onUpdateCartItem
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + calculateGarmentEstimates(item).priceINR;
  }, 0);

  const instantItemCount = cartItems.filter(item => item.deliveryTier === 'instant').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#141215] border-l border-[#2d2630] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[#262029] flex items-center justify-between bg-[#171419]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#7a152d]/30 text-[#c9365e] border border-[#7a152d]/50">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                  Atelier Shopping Bag
                </h3>
                <p className="text-xs text-[#8c8588]">
                  {cartItems.length} bespoke garment{cartItems.length === 1 ? '' : 's'} commissioned
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8c8588] hover:text-[#fbf9f6] hover:bg-[#231e26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#4d4452] mx-auto stroke-1" />
                <h4 className="text-sm font-semibold text-[#fbf9f6]">Your Atelier Bag is Empty</h4>
                <p className="text-xs text-[#8c8588] max-w-xs mx-auto">
                  Customize a silhouette to add your first personalized garment with custom measurements and bespoke fabric.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#7a152d] text-[#fbf9f6] text-xs font-semibold tracking-wider uppercase mt-2"
                >
                  Start Customizing
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const est = calculateGarmentEstimates(item);
                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-[#1a171d] border border-[#2d2630] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border border-white/20 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#fbf9f6]">{item.title || `Custom ${item.garmentType}`}</h4>
                          <p className="text-[11px] text-[#dfd8cb]/80">
                            {item.fabric} • {item.color.name} • {item.fit} fit
                          </p>
                          <p className="text-[10px] text-[#8c8588]">
                            Size: {item.size} • Crafting: {est.productionTimeStr}
                          </p>

                          {/* Delivery Tier Badge & Quick Toggle */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {item.deliveryTier === 'instant' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded">
                                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                                ⚡ Instant Delivery (+₹1,199)
                              </span>
                            ) : item.deliveryTier === 'express' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/40 px-2 py-0.5 rounded">
                                Express (+₹499)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded">
                                Standard Delivery (Free)
                              </span>
                            )}

                            {onUpdateCartItem && (
                              <button
                                type="button"
                                onClick={() => onUpdateCartItem(idx, { deliveryTier: item.deliveryTier === 'instant' ? 'standard' : 'instant' })}
                                className="text-[9px] text-amber-400 hover:text-amber-300 underline font-medium"
                              >
                                {item.deliveryTier === 'instant' ? 'Revert to Standard' : '⚡ Upgrade to Instant (+₹1,199)'}
                              </button>
                            )}
                          </div>

                          {item.negotiatedDiscount && (
                            <div className="mt-1 space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                                <Handshake className="w-3 h-3" />
                                Handshake Deal: -{formatINR(item.negotiatedDiscount.savings)} ({item.negotiatedDiscount.percentage}% off)
                              </span>
                              {item.negotiatedDiscount.competitorEvidence && (
                                <span className="block text-[9px] text-amber-300/90 font-medium">
                                  ⚖️ {item.negotiatedDiscount.competitorEvidence.platform} Price-Match Honored ({formatINR(item.negotiatedDiscount.competitorEvidence.competitorPrice)})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-[#8c8588] hover:text-red-400 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="border-t border-[#262029] pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onOpenItemInCustomizer(item);
                            onClose();
                          }}
                          className="text-[11px] text-[#c9365e] hover:underline"
                        >
                          Edit in Studio
                        </button>
                        {!item.negotiatedDiscount && onOpenBargainModal && (
                          <button
                            onClick={() => {
                              onOpenBargainModal(item);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] font-semibold hover:bg-amber-900/60 flex items-center gap-1 transition-colors"
                            title="Bargain with Master Tailor Rajesh"
                          >
                            <Handshake className="w-3 h-3" />
                            <span>Bargain</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {est.isNegotiated ? (
                          <div className="text-right">
                            <span className="text-[10px] line-through text-[#8c8588] block">
                              {formatINR(est.originalPriceINR)}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              {formatINR(est.priceINR)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#fbf9f6]">{formatINR(est.priceINR)}</span>
                        )}
                        <button
                          onClick={() => {
                            onCheckoutItem(item);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-[#7a152d] text-white text-[11px] font-semibold hover:bg-[#9e1d3d] transition-colors"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#262029] bg-[#171419] space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8c8588]">Subtotal:</span>
                <span className="font-serif-fashion text-2xl font-bold text-[#fbf9f6]">
                  {formatINR(totalAmount)}
                </span>
              </div>
              {instantItemCount > 0 && (
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Includes {instantItemCount} garment{instantItemCount > 1 ? 's' : ''} with ⚡ Instant VIP Delivery surcharge (+{formatINR(instantItemCount * 1199)}).</span>
                </div>
              )}
              <p className="text-[11px] text-[#8c8588]">
                Complimentary white-glove bespoke packaging and insured shipping included.
              </p>
              <button
                onClick={() => {
                  if (cartItems.length > 0) {
                    onCheckoutItem(cartItems[0]);
                    onClose();
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7a152d]/30 transition-all"
              >
                <span>Checkout Garment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
