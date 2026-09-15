import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Handshake, 
  Sparkles, 
  Check, 
  TrendingDown, 
  ArrowRight, 
  MessageSquare, 
  RefreshCw, 
  ShieldCheck, 
  Scissors,
  Flame,
  Award,
  Scale,
  Upload,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomGarmentConfig, NegotiatedDiscount, CompetitorEvidence } from '../../types/garment';
import { calculateGarmentEstimates, formatINR } from '../../lib/pricing';
import { FABRICS_DATABASE, GARMENT_TYPES } from '../../lib/garmentData';
import { 
  getCompetitorBenchmarksForGarment, 
  CompetitorBenchmarkItem, 
  PLATFORM_CONFIGS 
} from './competitorBenchmarks';

interface BargainModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomGarmentConfig;
  onApplyNegotiatedPrice: (discount: NegotiatedDiscount) => void;
  onResetBargain?: () => void;
}

interface DialogueEntry {
  sender: 'patron' | 'tailor';
  text: string;
  proposedPrice?: number;
  time: string;
  competitorEvidence?: CompetitorEvidence;
}

const BARGAIN_REASONS = [
  { id: 'competitor_evidence', label: '🏷️ Found cheaper price on another online platform (Evidence attached)' },
  { id: 'first_time', label: '🌟 First-time client exploring bespoke tailoring' },
  { id: 'wedding', label: '💍 Commissioning for an upcoming wedding or gala' },
  { id: 'flexible', label: '⏳ Flexible timeline (grant 3 extra days to atelier)' },
  { id: 'word_of_mouth', label: '🗣️ Will recommend CustomFit to sartorial friends' },
  { id: 'admirer', label: '✂️ Genuine lover of hand-stitched artisanal craft' },
  { id: 'wardrobe', label: '👔 Planning to commission a full 3-piece capsule soon' }
];

export const BargainModal: React.FC<BargainModalProps> = ({
  isOpen,
  onClose,
  config,
  onApplyNegotiatedPrice,
  onResetBargain
}) => {
  const estimates = calculateGarmentEstimates({ ...config, negotiatedDiscount: undefined });
  const standardPrice = estimates.originalPriceINR;
  const fabricInfo = FABRICS_DATABASE.find(f => f.id === config.fabric) || FABRICS_DATABASE[0];
  const garmentInfo = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];

  const [round, setRound] = useState<number>(1);
  const [offerPrice, setOfferPrice] = useState<number>(Math.round(standardPrice * 0.85));
  const [selectedReason, setSelectedReason] = useState<string>(BARGAIN_REASONS[0].label);
  const [customNote, setCustomNote] = useState<string>('');
  const [tailorState, setTailorState] = useState<'idle' | 'evaluating' | 'counter_offered' | 'deal_agreed' | 'stalemate'>('idle');
  const [tailorCounterPrice, setTailorCounterPrice] = useState<number>(0);
  const [agreedDeal, setAgreedDeal] = useState<NegotiatedDiscount | null>(config.negotiatedDiscount || null);
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([]);

  // Competitor Evidence State
  const [attachedEvidence, setAttachedEvidence] = useState<CompetitorEvidence | null>(null);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState<boolean>(false);
  const [evidenceTab, setEvidenceTab] = useState<'benchmarks' | 'custom'>('benchmarks');
  const [customPlatform, setCustomPlatform] = useState<string>('Myntra');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customProofImage, setCustomProofImage] = useState<string>('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const benchmarks = getCompetitorBenchmarksForGarment(config.garmentType, standardPrice);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (config.negotiatedDiscount) {
        setAgreedDeal(config.negotiatedDiscount);
        setTailorState('deal_agreed');
        if (config.negotiatedDiscount.competitorEvidence) {
          setAttachedEvidence(config.negotiatedDiscount.competitorEvidence);
        }
      } else {
        setRound(1);
        setOfferPrice(Math.round(standardPrice * 0.85));
        setTailorState('idle');
        setAgreedDeal(null);
        setAttachedEvidence(null);
        setShowEvidenceDrawer(false);
        setDialogue([
          {
            sender: 'tailor',
            text: `Namaste and welcome to our atelier negotiation chamber! I am Master Tailor Rajesh. This ${garmentInfo.name} in genuine ${fabricInfo.name} is one of my personal proudest patterns. What fair patron offer do you bring to my table?`,
            time: 'Just now'
          }
        ]);
      }
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const currentSavings = standardPrice - offerPrice;
  const currentDiscountPct = Math.round((currentSavings / standardPrice) * 100);

  // Quick preset shortcuts
  const handleSelectPreset = (percent: number) => {
    const discounted = Math.round(standardPrice * (1 - percent / 100));
    setOfferPrice(discounted);
  };

  // Attach a benchmark as competitor evidence
  const handleAttachBenchmark = (benchmark: CompetitorBenchmarkItem) => {
    const evidence: CompetitorEvidence = {
      platform: benchmark.platform,
      listingTitle: benchmark.listingTitle,
      competitorPrice: benchmark.competitorPrice,
      productUrl: benchmark.productUrl,
      evidenceImageUrl: benchmark.sampleProofImage,
      priceDifference: standardPrice - benchmark.competitorPrice,
      percentageLower: Math.round(((standardPrice - benchmark.competitorPrice) / standardPrice) * 100),
      evidenceType: 'benchmark_listing'
    };

    setAttachedEvidence(evidence);
    setSelectedReason(`🏷️ Found cheaper price on ${benchmark.platform} (Evidence attached)`);
    setOfferPrice(benchmark.competitorPrice);
  };

  // Attach custom user evidence
  const handleAttachCustomEvidence = () => {
    const num = parseFloat(customPrice.replace(/[^0-9.]/g, ''));
    if (!num || num <= 0) {
      alert("Please enter a valid competitor price in ₹ (INR).");
      return;
    }
    if (!customTitle.trim()) {
      alert("Please provide the product/item title from the other platform.");
      return;
    }

    const price = Math.round(num);
    const evidence: CompetitorEvidence = {
      platform: customPlatform,
      listingTitle: customTitle.trim(),
      competitorPrice: price,
      productUrl: customUrl.trim() || undefined,
      evidenceImageUrl: customProofImage || undefined,
      priceDifference: Math.max(0, standardPrice - price),
      percentageLower: Math.round(((standardPrice - price) / standardPrice) * 100),
      evidenceType: customProofImage ? 'user_upload' : 'verified_url'
    };

    setAttachedEvidence(evidence);
    setSelectedReason(`🏷️ Found cheaper price on ${customPlatform} (Evidence attached)`);
    setOfferPrice(price);
    setShowEvidenceDrawer(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomProofImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleProof = (platform: string, defaultPrice: number) => {
    setCustomPlatform(platform);
    setCustomTitle(`${platform} App Order Page: Comparable ${garmentInfo.name}`);
    setCustomPrice(defaultPrice.toString());
    setCustomProofImage('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80');
  };

  // User submits offer to Tailor
  const handleSubmitOffer = async () => {
    if (offerPrice >= standardPrice) {
      alert("Please propose an offer lower than the standard atelier valuation to bargain!");
      return;
    }

    setTailorState('evaluating');
    const userMessage: DialogueEntry = {
      sender: 'patron',
      text: `Master Rajesh, I propose ${formatINR(offerPrice)} (${currentDiscountPct}% concession). ${selectedReason}.${
        attachedEvidence ? ` Attached proof: ${attachedEvidence.platform} listed "${attachedEvidence.listingTitle}" at ${formatINR(attachedEvidence.competitorPrice)}.` : ''
      }${customNote ? ` Note: "${customNote}"` : ''}`,
      proposedPrice: offerPrice,
      time: 'Just now',
      competitorEvidence: attachedEvidence || undefined
    };

    setDialogue(prev => [...prev, userMessage]);

    // Try AI Bargain API with local tailor fallback
    try {
      const response = await fetch('/api/ai/bargain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentName: config.title || garmentInfo.name,
          fabricName: fabricInfo.name,
          standardPrice,
          proposedPrice: offerPrice,
          discountPercentage: currentDiscountPct,
          reason: selectedReason,
          customNote,
          round,
          competitorEvidence: attachedEvidence
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const { decision, tailorResponse, counterPrice, dealAgreed } = json.data;
          const now = 'Just now';

          if (dealAgreed || decision === 'accept') {
            sealDeal(offerPrice, currentDiscountPct, tailorResponse, round, attachedEvidence);
            return;
          } else {
            const finalCounter = counterPrice || Math.round(standardPrice * 0.85);
            setTailorCounterPrice(finalCounter);
            setTailorState('counter_offered');
            setDialogue(prev => [
              ...prev,
              {
                sender: 'tailor',
                text: tailorResponse,
                proposedPrice: finalCounter,
                time: now
              }
            ]);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('AI bargain service notice, using master tailor rules:', err);
    }

    // Fallback to master tailor rules
    setTimeout(() => {
      evaluateTailorDecision(offerPrice, currentDiscountPct, round, attachedEvidence);
    }, 1000);
  };

  const evaluateTailorDecision = (
    proposed: number, 
    discountPct: number, 
    currentRound: number,
    evidence: CompetitorEvidence | null
  ) => {
    let tailorText = '';
    const now = 'Just now';

    // SPECIAL RULE: Evidence submitted from competitor platform
    if (evidence && evidence.competitorPrice && evidence.competitorPrice < standardPrice) {
      const compPrice = evidence.competitorPrice;
      const compPlatform = evidence.platform;
      const itemTitle = evidence.listingTitle;

      if (discountPct <= 20) {
        tailorText = `Aha! You show me verified proof from ${compPlatform} for "${itemTitle}" listed at ${formatINR(compPrice)}! Look closely at their tag, my friend—that is mass-produced factory sizing with synthetic thread and fused glue canvas. Here at CustomFit, your ${garmentInfo.name} is single-needle hand-felled in genuine ${fabricInfo.name} drafted strictly to your body measurements. BUT, because you took the effort to bring verifiable market proof and I refuse to lose a smart patron to fast fashion, I honor your market evidence and seal our handshake at ${formatINR(proposed)}!`;
        sealDeal(proposed, discountPct, tailorText, currentRound, evidence);
        return;
      } else {
        const matchFloor = Math.max(Math.round(standardPrice * 0.80), Math.round((proposed + compPrice) / 2));
        const savings = standardPrice - matchFloor;
        const pct = Math.round((savings / standardPrice) * 100);
        tailorText = `Aha! You show me this listing on ${compPlatform} for ${formatINR(compPrice)}! In ready-to-wear, factories churn out 10,000 identical pieces with synthetic canvas. Here at CustomFit, each piece of ${fabricInfo.name} is cut by my own shears to your exact body measurements with zero deadstock. However, because you showed authentic market proof, I will grant a special Master Market-Match concession of ${formatINR(matchFloor)} (${pct}% off, saving ${formatINR(savings)})!`;
        setTailorCounterPrice(matchFloor);
        setTailorState('counter_offered');
        setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: matchFloor, time: now }]);
        return;
      }
    }

    // 1. REASONABLE / GENTLE OFFER (5% to 13% off): Instant Deal!
    if (discountPct <= 13) {
      tailorText = `Splendid! You have the eye of a discerning connoisseur and the fairness of a true patron. For a ${fabricInfo.name} piece of this caliber, I gladly seal our handshake at ${formatINR(proposed)}. May it serve you with elegance!`;
      sealDeal(proposed, discountPct, tailorText, currentRound, null);
      return;
    }

    // 2. MODERATE HAGGLE (14% to 22% off):
    if (discountPct <= 22) {
      if (currentRound >= 3) {
        // Final round - tailor accepts or makes a final microscopic concession
        const finalPrice = Math.round(standardPrice * 0.82); // 18% off final
        tailorText = `You are as stubborn as pure Irish linen! But your passion for our tailoring won me over. I cannot do ${formatINR(proposed)}, but on my personal honor, I will seal our final handshake at ${formatINR(finalPrice)} (18% concession). This is my final word!`;
        setTailorCounterPrice(finalPrice);
        setTailorState('counter_offered');
        setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: finalPrice, time: now }]);
      } else {
        // Propose a middle ground counter-offer
        const counter = Math.round(standardPrice - (currentSavings * 0.62));
        tailorText = `Ah! You cut close to the bone! The raw ${fabricInfo.name} bolt and hand-felled stitches have fixed costs, my friend. However, because ${selectedReason.toLowerCase()}, I will meet you in the middle at ${formatINR(counter)} (Save ${formatINR(standardPrice - counter)}). Does this honor our craft?`;
        setTailorCounterPrice(counter);
        setTailorState('counter_offered');
        setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: counter, time: now }]);
      }
      return;
    }

    // 3. AMBITIOUS HAGGLE (23% to 32% off):
    if (discountPct <= 32) {
      if (currentRound >= 3) {
        const floorPrice = Math.round(standardPrice * 0.80); // 20% max ceiling
        tailorText = `I admire your fierce negotiating spirit! Any more and my buttonhole makers will go on strike. As my absolute final master concession, I can do ${formatINR(floorPrice)} (20% off). Take the shears, let us shake hands!`;
        setTailorCounterPrice(floorPrice);
        setTailorState('counter_offered');
        setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: floorPrice, time: now }]);
      } else {
        const counter = Math.round(standardPrice * 0.84); // 16% off
        tailorText = `Ay yai yai! My shears trembled in my hand! ${formatINR(proposed)}? That barely covers our master pattern cutter's evening chai! But because I appreciate a patron with boldness, the sharpest cut I can grant is ${formatINR(counter)}. Counter me once more if you dare, or shake hands now!`;
        setTailorCounterPrice(counter);
        setTailorState('counter_offered');
        setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: counter, time: now }]);
      }
      return;
    }

    // 4. ABSURD / LOWBALL (> 32% off):
    const generousCounter = Math.round(standardPrice * 0.85); // 15% off
    tailorText = `Hahaha! You have a great sense of humor, my friend! For ${formatINR(proposed)}, I could only give you half a sleeve of pure ${fabricInfo.name}! We are a Savile Row-trained atelier, not a wholesale bargain bin. But because your audacity made me smile, here is an honorable counter: ${formatINR(generousCounter)} (15% off). Propose something realistic!`;
    setTailorCounterPrice(generousCounter);
    setTailorState('counter_offered');
    setDialogue(prev => [...prev, { sender: 'tailor', text: tailorText, proposedPrice: generousCounter, time: now }]);
  };

  // Seal the deal
  const sealDeal = (
    finalPrice: number, 
    discountPct: number, 
    quote: string, 
    roundsUsed: number,
    evidence?: CompetitorEvidence | null
  ) => {
    const savings = standardPrice - finalPrice;
    const activeEvidence = evidence !== undefined ? evidence : attachedEvidence;
    const dealCode = activeEvidence 
      ? `MATCH-${activeEvidence.platform.toUpperCase().replace(/[^A-Z]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      : `TAILOR-DEAL-${Math.floor(1000 + Math.random() * 9000)}`;

    const deal: NegotiatedDiscount = {
      originalPrice: standardPrice,
      negotiatedPrice: finalPrice,
      savings,
      percentage: discountPct,
      reason: selectedReason,
      agreedAt: new Date().toISOString(),
      dealCode,
      tailorQuote: quote,
      roundsTaken: roundsUsed,
      competitorEvidence: activeEvidence || undefined
    };

    setAgreedDeal(deal);
    setTailorState('deal_agreed');
    setDialogue(prev => [
      ...prev,
      {
        sender: 'tailor',
        text: quote,
        proposedPrice: finalPrice,
        time: 'Just now'
      }
    ]);

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#c9365e', '#f59e0b', '#10b981', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAcceptTailorCounter = () => {
    const pct = Math.round(((standardPrice - tailorCounterPrice) / standardPrice) * 100);
    sealDeal(
      tailorCounterPrice,
      pct,
      `Handshake agreed at ${formatINR(tailorCounterPrice)}! It is an absolute pleasure crafting this bespoke piece for you.`,
      round
    );
  };

  const handlePrepareNextRound = () => {
    if (round < 3) {
      setRound(prev => prev + 1);
      // set offer price slightly higher than previous offer to show good faith
      setOfferPrice(Math.round((offerPrice + tailorCounterPrice) / 2));
      setTailorState('idle');
    } else {
      setTailorState('stalemate');
    }
  };

  const handleApplyToGarment = () => {
    if (agreedDeal) {
      onApplyNegotiatedPrice(agreedDeal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#131116] border border-[#3b3240] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Master Tailor Rajesh */}
        <div className="px-6 py-4 border-b border-[#2a2330] bg-gradient-to-r from-[#21121d] via-[#1a1520] to-[#251a14] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 p-0.5 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Master Tailor Rajesh"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#131116] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-fashion text-lg sm:text-xl font-bold text-white tracking-wide">
                  Master Tailor Rajesh
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Scissors className="w-2.5 h-2.5" />
                  Head Cutter
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Atelier Bargaining Chamber • Round {round} of 3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Piece Context Strip */}
        <div className="px-6 py-3 bg-[#19151e] border-b border-[#28212e] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div 
              className="w-7 h-7 rounded-lg border border-white/20 shadow-sm flex-shrink-0"
              style={{ backgroundColor: config.color.hex }}
            />
            <div>
              <span className="font-bold text-stone-200">{config.title || `Custom ${garmentInfo.name}`}</span>
              <span className="text-stone-400 mx-1.5">•</span>
              <span className="text-stone-400">{fabricInfo.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-[11px] uppercase tracking-wider">Standard Atelier Price:</span>
            <span className="font-serif-fashion text-base font-bold text-stone-200 line-through opacity-70">
              {formatINR(standardPrice)}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Conversation Log */}
          <div className="space-y-3.5 bg-[#0f0e12] p-4 rounded-2xl border border-[#26202c]">
            <div className="text-[10px] uppercase tracking-widest text-stone-400 flex items-center justify-between pb-1 border-b border-stone-800">
              <span className="flex items-center gap-1.5 font-semibold">
                <MessageSquare className="w-3 h-3 text-rose-400" />
                Negotiation Exchange
              </span>
              <span>{round <= 3 ? `Step ${round}/3` : 'Completed'}</span>
            </div>

            <div className="space-y-3">
              {dialogue.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 text-xs leading-relaxed ${
                    entry.sender === 'patron' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      entry.sender === 'patron'
                        ? 'bg-rose-600 text-white'
                        : 'bg-gradient-to-tr from-amber-600 to-yellow-600 text-stone-950 font-extrabold'
                    }`}
                  >
                    {entry.sender === 'patron' ? 'You' : 'MR'}
                  </div>

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl shadow-sm space-y-1 ${
                      entry.sender === 'patron'
                        ? 'bg-rose-950/60 border border-rose-800/60 text-stone-100 rounded-tr-none'
                        : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none'
                    }`}
                  >
                    <p>{entry.text}</p>
                    
                    {/* Embedded Competitor Evidence Card in Dialogue */}
                    {entry.competitorEvidence && (
                      <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-amber-500/40 space-y-2 text-[11px] text-stone-200">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {entry.competitorEvidence.platform} Market Proof
                          </span>
                          <span className="font-serif-fashion text-xs font-bold text-amber-300">
                            Listed: {formatINR(entry.competitorEvidence.competitorPrice)}
                          </span>
                        </div>
                        <p className="font-semibold text-stone-100 text-xs leading-snug">
                          "{entry.competitorEvidence.listingTitle}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5 border-t border-stone-800">
                          <span>Standard Atelier: {formatINR(standardPrice)}</span>
                          <span className="text-rose-400 font-semibold">
                            Platform is {formatINR(standardPrice - entry.competitorEvidence.competitorPrice)} cheaper ({Math.round(((standardPrice - entry.competitorEvidence.competitorPrice) / standardPrice) * 100)}% lower)
                          </span>
                        </div>
                        {entry.competitorEvidence.evidenceImageUrl && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal(entry.competitorEvidence?.evidenceImageUrl || null)}
                              className="group relative block rounded-lg overflow-hidden border border-stone-700 max-h-24 max-w-[200px] hover:border-amber-400 transition-colors"
                            >
                              <img
                                src={entry.competitorEvidence.evidenceImageUrl}
                                alt="Competitor listing proof"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">
                                Click to enlarge proof
                              </div>
                            </button>
                          </div>
                        )}
                        {entry.competitorEvidence.productUrl && (
                          <a
                            href={entry.competitorEvidence.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 underline pt-0.5"
                          >
                            <span>Open Platform Listing</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {entry.proposedPrice && (
                      <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-stone-400">Offer on Table:</span>
                        <span className={entry.sender === 'patron' ? 'text-rose-300' : 'text-amber-400'}>
                          {formatINR(entry.proposedPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {tailorState === 'evaluating' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-amber-300 animate-pulse">
                  <Scissors className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Master Rajesh is measuring fabric yardage & consulting his leather ledger...</span>
                </div>
              )}
            </div>
          </div>

          {/* ================= STATE 1: DEAL AGREED SUCCESS VIEW ================= */}
          {tailorState === 'deal_agreed' && agreedDeal && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/60 to-[#121915] border-2 border-emerald-500/50 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif-fashion text-xl font-bold text-white flex items-center gap-2">
                      <span>Bespoke Handshake Sealed!</span>
                      <Award className="w-4 h-4 text-amber-400" />
                    </h4>
                    <p className="text-xs text-emerald-300/90">
                      Bargained deal code: <strong className="font-mono text-white">{agreedDeal.dealCode}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black uppercase tracking-wider">
                  Deal Agreed
                </span>
              </div>

              {/* Price comparison card */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-950/80 border border-emerald-900/60 text-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Original Price</span>
                  <span className="font-serif-fashion text-lg text-stone-400 line-through">
                    {formatINR(agreedDeal.originalPrice)}
                  </span>
                </div>

                <div className="border-x border-stone-800">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">
                    Your Savings
                  </span>
                  <span className="font-serif-fashion text-lg font-bold text-emerald-400">
                    -{formatINR(agreedDeal.savings)} ({agreedDeal.percentage}%)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">
                    Agreed Price
                  </span>
                  <span className="font-serif-fashion text-2xl font-black text-white">
                    {formatINR(agreedDeal.negotiatedPrice)}
                  </span>
                </div>
              </div>

              {/* Competitor Price Match Applied Badge */}
              {agreedDeal.competitorEvidence && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-stone-100 flex items-center gap-1.5">
                        <span>Master Market-Match Honored: {agreedDeal.competitorEvidence.platform}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                      <span className="text-[11px] text-stone-300">
                        Citing "{agreedDeal.competitorEvidence.listingTitle}" (Online price: {formatINR(agreedDeal.competitorEvidence.competitorPrice)})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Verified Match
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleApplyToGarment}
                  className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock in & Apply to Garment</span>
                </button>

                {onResetBargain && (
                  <button
                    onClick={() => {
                      onResetBargain();
                      setAgreedDeal(null);
                      setTailorState('idle');
                      setRound(1);
                    }}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-700 text-xs font-semibold transition-colors"
                  >
                    Renegotiate from Scratch
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= STATE 2: TAILOR COUNTER-OFFER ================= */}
          {tailorState === 'counter_offered' && (
            <div className="p-5 rounded-2xl bg-[#1e1712] border border-amber-600/50 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Master Rajesh's Compromise Offer</span>
                </div>
                <span className="text-xs text-stone-400">Round {round} Decision</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block">Proposed Master Price:</span>
                  <span className="font-serif-fashion text-2xl font-black text-amber-300">
                    {formatINR(tailorCounterPrice)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Savings</span>
                  <span className="text-sm font-bold text-emerald-400">
                    Save {formatINR(standardPrice - tailorCounterPrice)} ({Math.round(((standardPrice - tailorCounterPrice) / standardPrice) * 100)}% off)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAcceptTailorCounter}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Accept Handshake ({formatINR(tailorCounterPrice)})</span>
                </button>

                {round < 3 ? (
                  <button
                    onClick={handlePrepareNextRound}
                    className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Counter-Offer (Round {round + 1}/3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleAcceptTailorCounter}
                    className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <span>Take Master's Final Deal</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= STATE 3: FORMULATING PATRON OFFER ================= */}
          {(tailorState === 'idle' || tailorState === 'evaluating') && !agreedDeal && (
            <div className="space-y-5 bg-[#17141b] p-5 rounded-2xl border border-[#2d2532]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  Propose Your Counter-Offer
                </h4>
                <span className="text-[11px] text-stone-400">
                  Patron Discretion: 5%–25% off
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { pct: 10, label: '-10% Gentle' },
                  { pct: 15, label: '-15% Balanced' },
                  { pct: 20, label: '-20% Bold' },
                  { pct: 25, label: '-25% Ambitious' }
                ].map(preset => {
                  const presetPrice = Math.round(standardPrice * (1 - preset.pct / 100));
                  const isSelected = offerPrice === presetPrice;
                  return (
                    <button
                      key={preset.pct}
                      type="button"
                      onClick={() => handleSelectPreset(preset.pct)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-950/60 text-white font-bold ring-1 ring-rose-500'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{preset.label}</span>
                      <span className="text-[10px] text-stone-400">{formatINR(presetPrice)}</span>
                    </button>
                  );
                })}
              </div>

              {/* ================= COMPETITOR PRICE MATCH EVIDENCE MODULE ================= */}
              <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-b from-[#1c161a] to-[#141018] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-100 flex items-center gap-2">
                        <span>Competitor Price Match Evidence</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                          Price Less Elsewhere?
                        </span>
                      </h5>
                      <p className="text-[11px] text-stone-400">
                        Cite lower prices from Myntra, Ajio, Zara, or Amazon to persuade Master Rajesh for a match
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEvidenceDrawer(prev => !prev)}
                    className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>{showEvidenceDrawer ? 'Hide Evidence' : attachedEvidence ? 'Change Proof' : '+ Add Proof'}</span>
                    {showEvidenceDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Active Attached Evidence Card */}
                {attachedEvidence && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {attachedEvidence.platform} Verified Evidence
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Saves {formatINR(standardPrice - attachedEvidence.competitorPrice)} ({attachedEvidence.percentageLower}% less)
                          </span>
                        </div>
                        <p className="font-semibold text-stone-100 text-xs">
                          "{attachedEvidence.listingTitle}"
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAttachedEvidence(null)}
                        className="text-[10px] text-stone-400 hover:text-rose-400 underline flex-shrink-0"
                      >
                        Remove Evidence
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-900/60 text-[11px]">
                      <div className="flex items-center gap-3">
                        <span>Online Listed: <strong className="text-amber-300 font-bold">{formatINR(attachedEvidence.competitorPrice)}</strong></span>
                        <span className="text-stone-400">vs Atelier: <span className="line-through">{formatINR(standardPrice)}</span></span>
                      </div>

                      {/* Quick Evidence Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOfferPrice(attachedEvidence.competitorPrice)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                          title="Match competitor price exactly"
                        >
                          Match Price ({formatINR(attachedEvidence.competitorPrice)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOfferPrice(Math.round((standardPrice + attachedEvidence.competitorPrice) / 2))}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] transition-colors"
                          title="Offer a fair compromise halfway between competitor and atelier"
                        >
                          Meet Halfway ({formatINR(Math.round((standardPrice + attachedEvidence.competitorPrice) / 2))})
                        </button>
                      </div>
                    </div>

                    {attachedEvidence.evidenceImageUrl && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(attachedEvidence?.evidenceImageUrl || null)}
                          className="flex items-center gap-1 text-[10px] text-amber-300 hover:underline"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>View Attached Screenshot Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Selection Drawer */}
                {showEvidenceDrawer && (
                  <div className="p-4 rounded-xl bg-black/40 border border-[#382a3c] space-y-4 animate-in fade-in duration-200">
                    {/* Drawer Tabs */}
                    <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
                      <button
                        type="button"
                        onClick={() => setEvidenceTab('benchmarks')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          evidenceTab === 'benchmarks'
                            ? 'bg-amber-500 text-stone-950 shadow-md'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Verified Market Benchmarks ({benchmarks.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvidenceTab('custom')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          evidenceTab === 'custom'
                            ? 'bg-amber-500 text-stone-950 shadow-md'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Upload Custom Proof / Link
                      </button>
                    </div>

                    {/* Tab 1: Market Benchmarks */}
                    {evidenceTab === 'benchmarks' && (
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-stone-400">
                          Select a verified competitor listing for <span className="text-white font-semibold">{garmentInfo.name}</span> on top online platforms:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {benchmarks.map(b => {
                            const isAttached = attachedEvidence?.listingTitle === b.listingTitle;
                            const diff = standardPrice - b.competitorPrice;
                            const pctLower = Math.round((diff / standardPrice) * 100);
                            const platformStyle = PLATFORM_CONFIGS[b.platform] || PLATFORM_CONFIGS.Other;

                            return (
                              <div
                                key={b.id}
                                className={`p-3 rounded-xl border transition-all space-y-2 ${
                                  isAttached
                                    ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500'
                                    : 'bg-[#151219] border-stone-800 hover:border-stone-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${b.platformBadgeColor}`}>
                                    {b.platform}
                                  </span>
                                  <span className="text-[10px] text-rose-400 font-semibold">
                                    {formatINR(diff)} cheaper (-{pctLower}%)
                                  </span>
                                </div>

                                <div>
                                  <h6 className="text-xs font-semibold text-stone-200 line-clamp-1">
                                    {b.listingTitle}
                                  </h6>
                                  <p className="text-[10px] text-stone-400 pt-0.5">
                                    {b.fastFashionComp} • ★ {b.rating} ({b.reviewsCount} reviews)
                                  </p>
                                </div>

                                <div className="p-2 rounded-lg bg-black/40 border border-stone-800 text-[10px] text-stone-400 space-y-1">
                                  <p><strong className="text-stone-300">Why cheaper:</strong> {b.keyDifferenceNote}</p>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  <span className="font-serif-fashion text-sm font-bold text-amber-300">
                                    {formatINR(b.competitorPrice)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAttachBenchmark(b)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      isAttached
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-200'
                                    }`}
                                  >
                                    {isAttached ? '✓ Attached' : 'Attach Proof'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Custom Proof / Upload */}
                    {evidenceTab === 'custom' && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-stone-300 block">
                            Competitor Platform:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {['Myntra', 'Ajio', 'Zara', 'Amazon', 'Raymond', 'Tata CLiQ', 'Other'].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setCustomPlatform(p)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  customPlatform === p
                                    ? 'bg-amber-500 text-stone-950 font-bold'
                                    : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-stone-400 block">
                              Product Title on Platform:
                            </label>
                            <input
                              type="text"
                              value={customTitle}
                              onChange={(e) => setCustomTitle(e.target.value)}
                              placeholder={`e.g. ${customPlatform} Tailored Shirt`}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-stone-400 block">
                              Competitor Price in INR (₹):
                            </label>
                            <input
                              type="number"
                              value={customPrice}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              placeholder="e.g. 2199"
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-stone-400 block">
                            Product Link / URL (Optional):
                          </label>
                          <input
                            type="url"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            placeholder="https://www.myntra.com/..."
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Screenshot proof upload */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-stone-400 block">
                              Screenshot / Photo Proof of Lower Price:
                            </label>
                            <button
                              type="button"
                              onClick={() => handleLoadSampleProof(customPlatform, Math.round(standardPrice * 0.65))}
                              className="text-[10px] text-amber-300 hover:text-amber-200 underline"
                            >
                              Load Sample App Screenshot
                            </button>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />

                          {customProofImage ? (
                            <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={customProofImage}
                                  alt="Proof upload preview"
                                  className="w-12 h-12 object-cover rounded-lg border border-stone-700"
                                />
                                <div>
                                  <span className="text-xs font-semibold text-stone-200 block">
                                    Evidence Image Attached
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImageModal(customProofImage)}
                                    className="text-[10px] text-amber-300 hover:underline"
                                  >
                                    Click to preview
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCustomProofImage('')}
                                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="p-4 rounded-xl border border-dashed border-stone-700 hover:border-amber-500/80 bg-stone-900/40 text-center cursor-pointer transition-colors space-y-1"
                            >
                              <Upload className="w-5 h-5 mx-auto text-amber-400" />
                              <p className="text-xs text-stone-300">
                                Click or drag screenshot of competitor cart/page
                              </p>
                              <p className="text-[10px] text-stone-400">
                                PNG, JPG, or WEBP supported
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAttachCustomEvidence}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Attach Evidence & Set Offer Price</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Range Slider + Manual Input */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-stone-400">Adjust Custom Offer:</label>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif-fashion text-2xl font-bold text-rose-400">
                      {formatINR(offerPrice)}
                    </span>
                    <span className="text-xs text-stone-400">
                      (Save {formatINR(currentSavings)} • {currentDiscountPct}% off)
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={Math.round(standardPrice * 0.6)}
                  max={standardPrice - 100}
                  step={50}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Audacious ({formatINR(Math.round(standardPrice * 0.6))})</span>
                  <span>Sweet Spot (15% off)</span>
                  <span>Standard ({formatINR(standardPrice)})</span>
                </div>
              </div>

              {/* Bargaining Reason Selector */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300 block">
                  Select Your Persuasion Leverage:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BARGAIN_REASONS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReason(r.label)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedReason === r.label
                          ? 'border-amber-500/80 bg-amber-950/40 text-amber-200'
                          : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional custom note */}
              <div className="space-y-1">
                <label className="text-[11px] text-stone-400 block">
                  Personal Message to Master Rajesh (Optional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Master Rajesh, I have admired your work since your Savile Row days..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Offer Button */}
              <button
                type="button"
                disabled={tailorState === 'evaluating'}
                onClick={handleSubmitOffer}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
              >
                <Handshake className="w-4 h-4" />
                <span>Submit Offer to Master Tailor (Round {round}/3)</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#110f14] border-t border-[#241f28] flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Handcrafted Bespoke Guarantee
          </span>
          <span>Zero Deadstock • Master Tailor Rajesh Signed</span>
        </div>

      </div>

      {/* Screenshot / Proof Image Lightbox Modal */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-xl w-full max-h-[85vh] bg-[#1a1622] rounded-2xl border border-amber-500/40 overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800 text-stone-200">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Competitor Listing Screenshot Proof
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full py-4 flex items-center justify-center overflow-auto max-h-[70vh]">
              <img
                src={previewImageModal}
                alt="Competitor Listing Evidence"
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-stone-700 shadow-lg"
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center">
              Market comparison proof attached to Master Rajesh bargaining dossier
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
