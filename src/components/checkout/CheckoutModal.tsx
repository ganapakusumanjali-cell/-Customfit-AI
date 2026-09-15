import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Package,
  Calendar,
  ExternalLink,
  Handshake,
  Scissors,
  Award,
  Tag,
  RotateCcw,
  Scale,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomGarmentConfig, OrderRecord, NegotiatedDiscount, DeliveryTier } from '../../types/garment';
import { calculateGarmentEstimates, formatINR, DELIVERY_OPTIONS } from '../../lib/pricing';
import { saveOrderToFirestore } from '../../lib/firebase';
import { User } from 'firebase/auth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomGarmentConfig;
  user: User | null;
  onOrderCompleted: (order: OrderRecord) => void;
  onOpenBargainModal?: (config: CustomGarmentConfig) => void;
  onApplyNegotiatedPrice?: (discount: NegotiatedDiscount) => void;
  onResetBargain?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  config,
  user,
  onOrderCompleted,
  onOpenBargainModal,
  onApplyNegotiatedPrice,
  onResetBargain
}) => {
  const [activeConfig, setActiveConfig] = useState<CustomGarmentConfig>(config);
  const [step, setStep] = useState<'review' | 'shipping' | 'payment' | 'confirmed'>('review');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    setActiveConfig(config);
  }, [config]);

  // Handle removing a deal directly from checkout
  const handleRemoveDeal = () => {
    const nextConfig = { ...activeConfig };
    delete nextConfig.negotiatedDiscount;
    setActiveConfig(nextConfig);
    if (onResetBargain) {
      onResetBargain();
    }
  };

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.displayName || '',
    phone: '+91 98765 43210',
    street: '42 Fashion Avenue, Atelier Suite 402',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  if (!isOpen) return null;

  const estimates = calculateGarmentEstimates(activeConfig);

  // Delivery date calculation
  const deliveryDateStr = estimates.estimatedDeliveryDateStr;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder: OrderRecord = {
        id: orderId,
        userId: user?.uid || 'guest_client',
        designConfig: activeConfig,
        totalPriceINR: estimates.priceINR,
        status: 'cutting',
        productionDaysEstimate: estimates.productionTimeStr,
        deliveryTier: activeConfig.deliveryTier || 'standard',
        deliverySurchargeINR: estimates.deliverySurchargeINR,
        deliveryOptionName: estimates.deliveryOption.label,
        shippingAddress: { ...shippingAddress },
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      };

      await saveOrderToFirestore(newOrder);
      setConfirmedOrder(newOrder);
      onOrderCompleted(newOrder);
      setStep('confirmed');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7a152d', '#c9365e', '#ede8dd', '#d4af37']
        });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Error placing bespoke order', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141215] border border-[#352e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#29222c] flex items-center justify-between bg-[#171419]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7a152d] flex items-center justify-center text-[#fbf9f6]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                Bespoke Atelier Checkout
              </h3>
              <p className="text-xs text-[#8c8588]">
                Individually tailored on-demand • Zero deadstock waste
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

        {/* Step Progress Bar */}
        {step !== 'confirmed' && (
          <div className="flex items-center justify-between px-8 py-3 bg-[#110f13] border-b border-[#241f27] text-xs">
            <button
              onClick={() => setStep('review')}
              className={`flex items-center gap-1.5 font-semibold ${
                step === 'review' ? 'text-[#c9365e]' : 'text-[#8c8588]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              Review Spec
            </button>
            <div className="flex-1 h-px bg-[#2a242d] mx-3" />
            <button
              onClick={() => setStep('shipping')}
              className={`flex items-center gap-1.5 font-semibold ${
                step === 'shipping' ? 'text-[#c9365e]' : 'text-[#8c8588]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              Delivery Address
            </button>
            <div className="flex-1 h-px bg-[#2a242d] mx-3" />
            <button
              onClick={() => setStep('payment')}
              className={`flex items-center gap-1.5 font-semibold ${
                step === 'payment' ? 'text-[#c9365e]' : 'text-[#8c8588]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              Payment
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* STEP 1: REVIEW DESIGN SPEC */}
          {step === 'review' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-[#1a171d] border border-[#2d2630] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-xl border border-white/20 shadow-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.color.hex }}
                  >
                    <span className="text-[10px] font-bold text-white uppercase drop-shadow">
                      {config.garmentType.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#fbf9f6]">{config.title || `Custom ${config.garmentType}`}</h4>
                    <p className="text-xs text-[#dfd8cb]/80 mt-0.5">
                      {config.fabric} weave • {config.color.name} • {config.fit} fit
                    </p>
                    <p className="text-[11px] text-[#8c8588] mt-0.5">
                      Size: <strong className="text-[#fbf9f6]">{config.size}</strong> • Hem: {config.length}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-[#2a242d] sm:pl-4">
                  <span className="text-xs text-[#8c8588] block">Atelier Net</span>
                  {estimates.isNegotiated ? (
                    <div>
                      <span className="text-xs line-through text-[#8c8588] block">
                        {formatINR(estimates.originalPriceINR)}
                      </span>
                      <span className="font-serif-fashion text-2xl font-bold text-emerald-400">
                        {formatINR(estimates.priceINR)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        Handshake Deal Applied
                      </span>
                    </div>
                  ) : (
                    <span className="font-serif-fashion text-2xl font-bold text-[#fbf9f6]">
                      {formatINR(estimates.priceINR)}
                    </span>
                  )}
                </div>
              </div>

              {/* ================= BARGAINING SECTION WHILE ORDERING ================= */}
              {estimates.isNegotiated ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/70 to-[#0e1812] border-2 border-emerald-500/60 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 flex-shrink-0">
                        <Handshake className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                            Bespoke Handshake Deal Applied!
                            <Award className="w-4 h-4 text-amber-400" />
                          </h4>
                          <span className="font-mono text-[10px] font-bold text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/60">
                            {activeConfig.negotiatedDiscount?.dealCode}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-300/90 mt-0.5 font-medium">
                          Master Rajesh accepted <strong className="text-white">{estimates.negotiatedDiscountPercentage}% concession</strong> saving <strong className="text-white">{formatINR(estimates.negotiatedSavings)}</strong>
                        </p>
                        {activeConfig.negotiatedDiscount?.competitorEvidence && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-300 font-medium">
                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                            <span>Competitor Proof Matched: {activeConfig.negotiatedDiscount.competitorEvidence.platform} ({formatINR(activeConfig.negotiatedDiscount.competitorEvidence.competitorPrice)})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {onOpenBargainModal && (
                        <button
                          type="button"
                          onClick={() => onOpenBargainModal(activeConfig)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-700/50 transition-colors"
                        >
                          Review Deal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveDeal}
                        className="px-2 py-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-900 text-xs transition-colors"
                        title="Remove negotiated discount"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {activeConfig.negotiatedDiscount?.tailorQuote && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-stone-200 italic flex items-start gap-2">
                      <span className="text-emerald-400 font-serif text-lg leading-none">“</span>
                      <span className="text-[11px] leading-relaxed">{activeConfig.negotiatedDiscount.tailorQuote}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#211613] via-[#1a141c] to-[#25171d] border border-amber-500/50 shadow-lg space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-rose-600 p-0.5 shadow-md">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                            alt="Master Tailor Rajesh"
                            className="w-full h-full object-cover rounded-[10px]"
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#141215] rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                            <Handshake className="w-4 h-4 text-amber-400" />
                            Bargain with Master Tailor Rajesh
                          </h4>
                          <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Up to 25% Concession
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 leading-relaxed mt-1">
                          Propose a patron counter-offer before ordering. Master Rajesh evaluates your occasion, fabric yardage, and timeline.
                        </p>
                      </div>
                    </div>

                    {onOpenBargainModal && (
                      <button
                        type="button"
                        onClick={() => onOpenBargainModal(activeConfig)}
                        className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 transition-all flex-shrink-0"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Bargain Price</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[10px] text-stone-400">
                    <span>💡 3 rounds of back-and-forth negotiation</span>
                    <span className="text-amber-300">Instant handshake discount upon agreement</span>
                  </div>
                </div>
              )}

              {/* Delivery Speed Selection & Instant Delivery Surcharge */}
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#18151c] to-[#120f14] border border-[#2e2633] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#c9365e]" />
                    <span className="text-xs font-bold text-[#fbf9f6] tracking-wide uppercase">
                      Select Dispatch Speed
                    </span>
                  </div>
                  {activeConfig.deliveryTier === 'instant' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      +₹1,199 Instant Rush
                    </span>
                  )}
                  {activeConfig.deliveryTier === 'express' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      +₹499 Express Priority
                    </span>
                  )}
                  {(!activeConfig.deliveryTier || activeConfig.deliveryTier === 'standard') && (
                    <span className="text-[10px] font-medium text-[#22c55e]">
                      Complimentary Standard
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'express', 'instant'] as DeliveryTier[]).map((tierKey) => {
                    const opt = DELIVERY_OPTIONS[tierKey];
                    const isSelected = (activeConfig.deliveryTier || 'standard') === tierKey;
                    return (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => setActiveConfig(prev => ({ ...prev, deliveryTier: tierKey }))}
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

                {activeConfig.deliveryTier === 'instant' && (
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Instant Rush Surcharge: +₹1,199</strong>
                      <span>Overnight overtime allocated for Master Rajesh's cutting team. Guaranteed dispatch within 24–48 hours.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Estimates Pill */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  activeConfig.deliveryTier === 'instant'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-[#171419] border-[#262029]'
                }`}>
                  {activeConfig.deliveryTier === 'instant' ? (
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#c9365e] flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-[#8c8588] block text-[10px]">Crafting Timeline</span>
                    <span className={`font-semibold ${activeConfig.deliveryTier === 'instant' ? 'text-amber-300' : 'text-[#fbf9f6]'}`}>
                      {estimates.productionTimeStr}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#171419] border border-[#262029] flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#c9365e] flex-shrink-0" />
                  <div>
                    <span className="text-[#8c8588] block text-[10px]">Estimated Delivery</span>
                    <span className="font-semibold text-[#fbf9f6]">{deliveryDateStr}</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="p-3.5 rounded-xl bg-[#171419] border border-[#262029] space-y-2 text-xs">
                <div className="flex justify-between text-[#dfd8cb]">
                  <span>Garment Subtotal:</span>
                  <span>{formatINR(estimates.garmentSubtotalINR)}</span>
                </div>
                <div className="flex justify-between text-[#dfd8cb]">
                  <span>Bespoke Pattern Drafting:</span>
                  <span className="text-[#22c55e]">Included</span>
                </div>
                
                {estimates.deliverySurchargeINR > 0 ? (
                  <div className="flex justify-between text-amber-300 font-semibold bg-amber-950/20 p-1.5 rounded-lg border border-amber-800/30">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {estimates.deliveryOption.shortLabel} Surcharge:
                    </span>
                    <span>+{formatINR(estimates.deliverySurchargeINR)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[#dfd8cb]">
                    <span>White-Glove Atelier Shipping:</span>
                    <span className="text-[#22c55e]">Complimentary (₹0)</span>
                  </div>
                )}

                {estimates.isNegotiated && (
                  <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                    <span className="flex items-center gap-1.5">
                      <Handshake className="w-3.5 h-3.5" />
                      Master Rajesh Concession ({estimates.negotiatedDiscountPercentage}%):
                    </span>
                    <span>-{formatINR(estimates.negotiatedSavings)}</span>
                  </div>
                )}

                <div className="border-t border-[#29222c] pt-2 flex justify-between font-bold text-sm text-[#fbf9f6]">
                  <span>Total Amount Due:</span>
                  <span className={estimates.isNegotiated ? "text-emerald-400 font-mono text-base" : "text-[#c9365e]"}>
                    {formatINR(estimates.priceINR)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('shipping')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Continue to Shipping Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {step === 'shipping' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#8c8588]">Recipient Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8c8588]">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8c8588]">Postal PIN Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#8c8588]">Street Address & Suite</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8c8588]">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8c8588]">State / Region</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="px-4 py-2.5 rounded-xl bg-[#1a171d] text-[#dfd8cb] hover:bg-[#252028] text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Proceed to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 'payment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Bargain Status Alert in Payment */}
              {estimates.isNegotiated ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Handshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Bespoke Handshake Concession: <strong>-{formatINR(estimates.negotiatedSavings)}</strong> ({estimates.negotiatedDiscountPercentage}% off)</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/60">
                    {activeConfig.negotiatedDiscount?.dealCode}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Handshake className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Have a target budget? Propose a patron counter-offer to Master Rajesh.</span>
                  </div>
                  {onOpenBargainModal && (
                    <button
                      type="button"
                      onClick={() => onOpenBargainModal(activeConfig)}
                      className="text-[11px] text-amber-400 hover:text-amber-200 font-bold underline flex-shrink-0"
                    >
                      Bargain Price
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8c8588] block">Select Payment Gateway</label>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#c9365e] bg-[#24131b] text-[#fbf9f6]'
                        : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#dfd8cb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-[#c9365e]" />
                      <div>
                        <span className="font-semibold block text-[#fbf9f6]">Credit / Debit Card</span>
                        <span className="text-[10px] text-[#8c8588]">Visa, Mastercard, Amex (Encrypted 256-bit)</span>
                      </div>
                    </div>
                    {paymentMethod === 'card' && <Check className="w-4 h-4 text-[#c9365e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      paymentMethod === 'upi'
                        ? 'border-[#c9365e] bg-[#24131b] text-[#fbf9f6]'
                        : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#dfd8cb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#c9365e]" />
                      <div>
                        <span className="font-semibold block text-[#fbf9f6]">UPI Instant Transfer</span>
                        <span className="text-[10px] text-[#8c8588]">Google Pay, PhonePe, Paytm QR</span>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check className="w-4 h-4 text-[#c9365e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#c9365e] bg-[#24131b] text-[#fbf9f6]'
                        : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#dfd8cb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#c9365e]" />
                      <div>
                        <span className="font-semibold block text-[#fbf9f6]">Atelier Direct Wire / Net Banking</span>
                        <span className="text-[10px] text-[#8c8588]">HDFC, ICICI, SBI, Axis Private Banking</span>
                      </div>
                    </div>
                    {paymentMethod === 'netbanking' && <Check className="w-4 h-4 text-[#c9365e]" />}
                  </button>
                </div>
              </div>

              {/* Security guarantee */}
              <div className="p-3 rounded-xl bg-[#171419] border border-[#2a242d] text-xs text-[#8c8588] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Zero-risk guarantee: complimentary adjustments if fit deviates by more than 0.5 cm.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="px-4 py-2.5 rounded-xl bg-[#1a171d] text-[#dfd8cb] hover:bg-[#252028] text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7a152d]/40 transition-all"
                >
                  {submitting ? (
                    <span>Registering with Master Tailor...</span>
                  ) : (
                    <>
                      <span>Authorize & Place Order ({formatINR(estimates.priceINR)})</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMED */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#22c55e] flex items-center justify-center mx-auto shadow-lg shadow-[#22c55e]/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#c9365e] font-semibold block">
                  Commission Received
                </span>
                <h4 className="font-serif-fashion text-3xl font-bold text-[#fbf9f6] mt-1">
                  Your Bespoke Garment is in Production
                </h4>
                <p className="text-xs text-[#dfd8cb]/80 max-w-md mx-auto mt-2 leading-relaxed">
                  Our master pattern cutters have received your individual biometric specification. Laser fabric cutting commences immediately.
                </p>
              </div>

              {/* Order Tracking Card */}
              <div className="p-4 rounded-xl bg-[#171419] border border-[#2d2630] max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#252028] pb-2">
                  <span className="text-xs text-[#8c8588]">Tracking ID:</span>
                  <span className="font-mono text-xs font-bold text-[#c9365e]">{confirmedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#252028] pb-2 text-xs">
                  <span className="text-[#8c8588]">Garment:</span>
                  <span className="text-[#fbf9f6] font-medium">{confirmedOrder.designConfig.title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#252028] pb-2 text-xs">
                  <span className="text-[#8c8588]">Estimated Dispatch:</span>
                  <span className="text-[#fbf9f6] font-medium">{confirmedOrder.productionDaysEstimate}</span>
                </div>
                {confirmedOrder.deliveryTier && (
                  <div className="flex items-center justify-between border-b border-[#252028] pb-2 text-xs">
                    <span className="text-[#8c8588]">Dispatch Tier:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      confirmedOrder.deliveryTier === 'instant' ? 'text-amber-300' : 'text-[#fbf9f6]'
                    }`}>
                      {confirmedOrder.deliveryTier === 'instant' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      {confirmedOrder.deliveryOptionName || confirmedOrder.deliveryTier}
                      {confirmedOrder.deliverySurchargeINR ? ` (+${formatINR(confirmedOrder.deliverySurchargeINR)})` : ''}
                    </span>
                  </div>
                )}
                {confirmedOrder.designConfig.negotiatedDiscount && (
                  <div className="flex items-center justify-between border-b border-[#252028] pb-2 text-xs text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Handshake className="w-3.5 h-3.5" />
                      Handshake Deal Applied:
                    </span>
                    <span className="font-bold">
                      Saved {formatINR(confirmedOrder.designConfig.negotiatedDiscount.savings)} ({confirmedOrder.designConfig.negotiatedDiscount.percentage}% off)
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8c8588]">Recipient:</span>
                  <span className="text-[#fbf9f6] font-medium">{confirmedOrder.shippingAddress.fullName} ({confirmedOrder.shippingAddress.city})</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] text-[#fbf9f6] text-xs font-semibold tracking-wide transition-all shadow-md"
                >
                  Return to Atelier Studio
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
