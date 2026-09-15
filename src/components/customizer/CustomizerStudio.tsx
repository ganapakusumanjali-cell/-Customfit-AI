import React, { useState } from 'react';
import { CustomGarmentConfig, OrderRecord, BodyMeasurements } from '../../types/garment';
import { CustomizerCategories } from './CustomizerCategories';
import { GarmentVisualizer } from './GarmentVisualizer';
import { SummaryAndPricingCard } from './SummaryAndPricingCard';
import { AiRecommendationPanel } from './AiRecommendationPanel';
import { Eye, Sliders, Sparkles, FileText, ArrowLeft, Handshake, Box } from 'lucide-react';

interface CustomizerStudioProps {
  config: CustomGarmentConfig;
  onChangeConfig: (updates: Partial<CustomGarmentConfig>) => void;
  onSaveDesign: () => Promise<void>;
  onAddToCart: () => void;
  onProceedCheckout: () => void;
  onOpenTechPack: () => void;
  onOpenMeasurementsModal: () => void;
  onOpenOccasionModal: () => void;
  onOpenBargainModal?: () => void;
  onOpen3DFittingRoom?: () => void;
  onBackToHome: () => void;
}

export const CustomizerStudio: React.FC<CustomizerStudioProps> = ({
  config,
  onChangeConfig,
  onSaveDesign,
  onAddToCart,
  onProceedCheckout,
  onOpenTechPack,
  onOpenMeasurementsModal,
  onOpenOccasionModal,
  onOpenBargainModal,
  onOpen3DFittingRoom,
  onBackToHome
}) => {
  // Mobile active tab view ('customize' | 'preview' | 'ai_summary')
  const [mobileTab, setMobileTab] = useState<'customize' | 'preview' | 'ai_summary'>('preview');

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Studio Top Control Bar */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-lg text-[#8c8588] hover:text-[#fbf9f6] hover:bg-[#201b22] transition-colors"
            title="Back to Atelier Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9365e] font-semibold block">
              Atelier Interactive Studio
            </span>
            <h1 className="font-serif-fashion text-lg sm:text-xl font-bold text-[#fbf9f6] leading-none">
              {config.title || `Custom ${config.garmentType}`}
            </h1>
          </div>
        </div>

        {/* Quick action buttons on studio bar */}
        <div className="flex items-center gap-2">
          {onOpenBargainModal && (
            <button
              onClick={onOpenBargainModal}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                config.negotiatedDiscount
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-gradient-to-r from-amber-950/60 to-rose-950/60 border-amber-600/50 text-amber-200 hover:text-white hover:border-amber-400'
              }`}
              title="Negotiate bespoke price directly with Master Tailor Rajesh"
            >
              <Handshake className={`w-3.5 h-3.5 ${config.negotiatedDiscount ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">
                {config.negotiatedDiscount ? 'Deal Sealed' : 'Bargain with Tailor'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenOccasionModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1820] hover:bg-[#29222e] text-[#dfd8cb] border border-[#362d3a] text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c9365e]" />
            <span>Context</span>
          </button>

          <button
            onClick={onOpenTechPack}
            className="px-3 py-1.5 rounded-xl bg-[#1d1820] hover:bg-[#29222e] text-[#dfd8cb] border border-[#362d3a] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#8c8588]" />
            <span className="hidden md:inline">Tech Pack</span>
          </button>

          {onOpen3DFittingRoom && (
            <button
              onClick={onOpen3DFittingRoom}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-800 hover:from-rose-800 hover:to-amber-700 text-white border border-rose-500/60 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
              title="Open full-screen 3D Virtual Fitting Salon"
            >
              <Box className="w-3.5 h-3.5 text-amber-300" />
              <span>3D Fitting Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-[#171419] p-1 rounded-xl border border-[#2d2630]">
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'preview' ? 'bg-[#7a152d] text-[#fbf9f6]' : 'text-[#8c8588]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Visualizer
        </button>

        <button
          onClick={() => setMobileTab('customize')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'customize' ? 'bg-[#7a152d] text-[#fbf9f6]' : 'text-[#8c8588]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Customize
        </button>

        <button
          onClick={() => setMobileTab('ai_summary')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'ai_summary' ? 'bg-[#7a152d] text-[#fbf9f6]' : 'text-[#8c8588]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI & Price
        </button>
      </div>

      {/* ================= 3-COLUMN STUDIO LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMN 1: Customization Categories (Left 4 cols on lg, 3 cols on xl) */}
        <div className={`lg:col-span-4 xl:col-span-4 ${mobileTab === 'customize' ? 'block' : 'hidden lg:block'}`}>
          <CustomizerCategories
            config={config}
            onChange={onChangeConfig}
            onOpenMeasurementModal={onOpenMeasurementsModal}
          />
        </div>

        {/* COLUMN 2: Live Garment Preview (Center 4 cols on lg, 5 cols on xl) */}
        <div className={`lg:col-span-4 xl:col-span-4 h-[620px] ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <GarmentVisualizer config={config} className="h-full" onOpen3DFittingRoom={onOpen3DFittingRoom} />
        </div>

        {/* COLUMN 3: AI Recommendations & Pricing Summary (Right 4 cols) */}
        <div className={`lg:col-span-4 xl:col-span-4 space-y-5 ${mobileTab === 'ai_summary' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Summary & Pricing card */}
          <SummaryAndPricingCard
            config={config}
            onSaveDesign={onSaveDesign}
            onAddToCart={onAddToCart}
            onProceedCheckout={onProceedCheckout}
            onOpenTechPack={onOpenTechPack}
            onOpenBargainModal={onOpenBargainModal}
            onUpdateDeliveryTier={(tier) => onChangeConfig({ deliveryTier: tier })}
          />

          {/* AI Recommendation System panel */}
          <AiRecommendationPanel
            config={config}
            onApplyRecommendation={onChangeConfig}
            onOpenOccasionModal={onOpenOccasionModal}
          />

        </div>

      </div>

    </div>
  );
};
