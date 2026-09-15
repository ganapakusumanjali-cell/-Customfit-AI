import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, RefreshCw, Layers, ShieldCheck, Thermometer, Compass, Lightbulb, ChevronRight } from 'lucide-react';
import { CustomGarmentConfig } from '../../types/garment';
import { FABRICS_DATABASE, COLOR_PALETTES } from '../../lib/garmentData';

interface AiRecommendationPanelProps {
  config: CustomGarmentConfig;
  onApplyRecommendation: (updates: Partial<CustomGarmentConfig>) => void;
  onOpenOccasionModal: () => void;
}

export const AiRecommendationPanel: React.FC<AiRecommendationPanelProps> = ({
  config,
  onApplyRecommendation,
  onOpenOccasionModal
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [appliedItems, setAppliedItems] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<boolean>(false);

  const fetchAiRecommendations = async () => {
    setLoading(true);
    setDismissed(false);
    setAppliedItems({});

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentType: config.garmentType,
          occasion: config.occasion,
          climate: config.climate,
          measurements: config.measurements,
          currentFabric: config.fabric,
          currentColor: config.color.name,
          currentFit: config.fit,
          stylePreference: config.stylePreference,
          comfortPreference: config.comfortPreference
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setRecommendations(data.data);
      }
    } catch (err) {
      console.error('AI Stylist request error', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on initial load or occasion/climate change
  useEffect(() => {
    fetchAiRecommendations();
  }, [config.garmentType, config.occasion, config.climate]);

  const handleApplyFabric = (fabricId: any) => {
    onApplyRecommendation({ fabric: fabricId });
    setAppliedItems(prev => ({ ...prev, fabric: true }));
  };

  const handleApplyColor = (colorHex: string, colorName: string) => {
    const found = COLOR_PALETTES.find(c => c.hex.toLowerCase() === colorHex.toLowerCase()) || {
      name: colorName,
      hex: colorHex,
      category: 'statement' as const
    };
    onApplyRecommendation({ color: found });
    setAppliedItems(prev => ({ ...prev, color: true }));
  };

  const handleApplyFit = (fit: any) => {
    onApplyRecommendation({ fit });
    setAppliedItems(prev => ({ ...prev, fit: true }));
  };

  const handleApplySleeve = (sleeve: any) => {
    onApplyRecommendation({ sleeve });
    setAppliedItems(prev => ({ ...prev, sleeve: true }));
  };

  const handleApplyNeckline = (neckline: any) => {
    onApplyRecommendation({ neckline });
    setAppliedItems(prev => ({ ...prev, neckline: true }));
  };

  const handleApplyAll = () => {
    if (!recommendations) return;
    const updates: Partial<CustomGarmentConfig> = {};

    if (recommendations.recommendedFabrics?.[0]) {
      updates.fabric = recommendations.recommendedFabrics[0].fabricId;
    }
    if (recommendations.recommendedColors?.[0]) {
      const rec = recommendations.recommendedColors[0];
      const match = COLOR_PALETTES.find(c => c.hex.toLowerCase() === rec.colorHex.toLowerCase()) || {
        name: rec.colorName,
        hex: rec.colorHex,
        category: 'statement' as const
      };
      updates.color = match;
    }
    if (recommendations.recommendedFit?.fit) {
      updates.fit = recommendations.recommendedFit.fit;
    }
    if (recommendations.recommendedSleeve?.sleeve && config.garmentType !== 'trousers' && config.garmentType !== 'skirt') {
      updates.sleeve = recommendations.recommendedSleeve.sleeve;
    }
    if (recommendations.recommendedNeckline?.neckline && config.garmentType !== 'trousers' && config.garmentType !== 'skirt') {
      updates.neckline = recommendations.recommendedNeckline.neckline;
    }

    onApplyRecommendation(updates);
    setAppliedItems({ fabric: true, color: true, fit: true, sleeve: true, neckline: true });
  };

  return (
    <div className="bg-[#141215] rounded-2xl border border-[#2d2630] p-5 shadow-xl space-y-4">
      {/* Header & Occasion Bar */}
      <div className="flex items-center justify-between border-b border-[#262029] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7a152d] to-[#c9365e] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-[#fbf9f6] flex items-center gap-2">
              Gemini AI Stylist
              <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-[#7a152d]/30 text-[#c9365e] border border-[#7a152d]/40">
                Live Analysis
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={fetchAiRecommendations}
          disabled={loading}
          className="p-1.5 text-[#8c8588] hover:text-[#fbf9f6] hover:bg-[#201b23] rounded-lg transition-colors"
          title="Regenerate AI Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c9365e]' : ''}`} />
        </button>
      </div>

      {/* Occasion & Climate Context Tags */}
      <div className="flex items-center justify-between text-xs bg-[#1a171d] p-2.5 rounded-xl border border-[#2d2630]">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="flex items-center gap-1 text-[#dfd8cb]">
            <Compass className="w-3 h-3 text-[#c9365e]" />
            <strong className="capitalize">{config.occasion}</strong>
          </span>
          <span className="text-[#8c8588]">•</span>
          <span className="flex items-center gap-1 text-[#dfd8cb]">
            <Thermometer className="w-3 h-3 text-[#c9365e]" />
            <strong className="capitalize">{config.climate}</strong> Climate
          </span>
        </div>
        <button
          onClick={onOpenOccasionModal}
          className="text-[#c9365e] hover:text-[#e04e76] text-[11px] font-medium underline underline-offset-2 flex items-center"
        >
          Change Context <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#7a152d] border-t-transparent animate-spin" />
          <p className="text-xs text-[#dfd8cb]">Analyzing textile weave and anatomical drape...</p>
        </div>
      ) : recommendations && !dismissed ? (
        <div className="space-y-3 text-xs">
          
          {/* Primary Advice */}
          <div className="p-3 rounded-xl bg-[#201a23] border border-[#3b2f40] text-[#fbf9f6] leading-relaxed relative">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#c9365e] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#ede8dd] font-medium">
                  {recommendations.primaryAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Fabrics */}
          {recommendations.recommendedFabrics?.[0] && (
            <div className="p-3 rounded-xl bg-[#171419] border border-[#2a242d] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8c8588] uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-[#c9365e]" />
                  <span>Fabric Recommendation</span>
                </div>
                <p className="text-xs font-semibold text-[#fbf9f6]">
                  {recommendations.recommendedFabrics[0].title}
                </p>
                <p className="text-[11px] text-[#dfd8cb]/80 leading-snug">
                  {recommendations.recommendedFabrics[0].reason}
                </p>
              </div>

              <button
                onClick={() => handleApplyFabric(recommendations.recommendedFabrics[0].fabricId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0 ${
                  config.fabric === recommendations.recommendedFabrics[0].fabricId || appliedItems.fabric
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-[#7a152d] text-[#fbf9f6] hover:bg-[#9e1d3d]'
                }`}
              >
                {config.fabric === recommendations.recommendedFabrics[0].fabricId || appliedItems.fabric ? (
                  <>
                    <Check className="w-3 h-3" /> Applied
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          )}

          {/* Recommended Color */}
          {recommendations.recommendedColors?.[0] && (
            <div className="p-3 rounded-xl bg-[#171419] border border-[#2a242d] flex items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8c8588] uppercase tracking-wider">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block" 
                    style={{ backgroundColor: recommendations.recommendedColors[0].colorHex }} 
                  />
                  <span>Palette Recommendation</span>
                </div>
                <p className="text-xs font-semibold text-[#fbf9f6]">
                  {recommendations.recommendedColors[0].colorName}
                </p>
                <p className="text-[11px] text-[#dfd8cb]/80 leading-snug">
                  {recommendations.recommendedColors[0].paletteVibe}
                </p>
              </div>

              <button
                onClick={() => handleApplyColor(recommendations.recommendedColors[0].colorHex, recommendations.recommendedColors[0].colorName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0 ${
                  config.color.hex.toLowerCase() === recommendations.recommendedColors[0].colorHex.toLowerCase() || appliedItems.color
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-[#7a152d] text-[#fbf9f6] hover:bg-[#9e1d3d]'
                }`}
              >
                {config.color.hex.toLowerCase() === recommendations.recommendedColors[0].colorHex.toLowerCase() || appliedItems.color ? (
                  <>
                    <Check className="w-3 h-3" /> Applied
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          )}

          {/* Recommended Fit */}
          {recommendations.recommendedFit && (
            <div className="p-3 rounded-xl bg-[#171419] border border-[#2a242d] flex items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8c8588] uppercase tracking-wider">
                  <span>Silhouette & Fit</span>
                </div>
                <p className="text-xs font-semibold text-[#fbf9f6] capitalize">
                  {recommendations.recommendedFit.fit} Fit
                </p>
                <p className="text-[11px] text-[#dfd8cb]/80 leading-snug">
                  {recommendations.recommendedFit.reason}
                </p>
              </div>

              <button
                onClick={() => handleApplyFit(recommendations.recommendedFit.fit)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0 ${
                  config.fit === recommendations.recommendedFit.fit || appliedItems.fit
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-[#7a152d] text-[#fbf9f6] hover:bg-[#9e1d3d]'
                }`}
              >
                {config.fit === recommendations.recommendedFit.fit || appliedItems.fit ? (
                  <>
                    <Check className="w-3 h-3" /> Applied
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          )}

          {/* Master Apply All & Dismiss actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              id="apply-all-ai-recommendations-btn"
              onClick={handleApplyAll}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Harmonized Preset
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-xl bg-[#1b171d] hover:bg-[#252028] text-[#8c8588] hover:text-[#fbf9f6] border border-[#2d2630] transition-colors"
              title="Dismiss Suggestions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="p-3 text-center">
          <p className="text-xs text-[#8c8588]">AI recommendations dismissed.</p>
          <button
            onClick={() => { setDismissed(false); fetchAiRecommendations(); }}
            className="text-xs text-[#c9365e] underline mt-1"
          >
            Show Recommendations
          </button>
        </div>
      )}

      {/* Tailor Construction Note */}
      {recommendations?.tailorNotes && !dismissed && (
        <div className="pt-3 border-t border-[#262029] text-[11px] text-[#8c8588] flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c9365e] flex-shrink-0 mt-0.5" />
          <p><strong className="text-[#dfd8cb]">Atelier Note:</strong> {recommendations.tailorNotes}</p>
        </div>
      )}
    </div>
  );
};
