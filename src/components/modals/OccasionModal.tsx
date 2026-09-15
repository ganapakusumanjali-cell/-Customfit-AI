import React, { useState } from 'react';
import { X, Compass, Thermometer, Sparkles, Check, Heart, Feather } from 'lucide-react';
import { OccasionType, ClimateType, CustomGarmentConfig } from '../../types/garment';

interface OccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomGarmentConfig;
  onSave: (updates: Partial<CustomGarmentConfig>) => void;
}

export const OccasionModal: React.FC<OccasionModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [occasion, setOccasion] = useState<OccasionType>(config.occasion);
  const [climate, setClimate] = useState<ClimateType>(config.climate);
  const [stylePreference, setStylePreference] = useState<string>(config.stylePreference || 'Balanced Sartorial Poise');
  const [comfortPreference, setComfortPreference] = useState<string>(config.comfortPreference || 'Breathable & Light Movement');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      occasion,
      climate,
      stylePreference,
      comfortPreference
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#141215] border border-[#352e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#29222c] flex items-center justify-between bg-[#171419]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7a152d]/30 text-[#c9365e] border border-[#7a152d]/50">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                Occasion & Environmental Context
              </h3>
              <p className="text-xs text-[#8c8588]">
                Informs the AI Stylist on fabric breathability, weave tension, and formality grade
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* 1. Occasion */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6] block">
              Intended Occasion
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'casual', label: 'Casual', desc: 'Weekend ease & everyday elegance' },
                { id: 'formal', label: 'Formal', desc: 'Black tie, galas & dignitaries' },
                { id: 'work', label: 'Executive Work', desc: 'Boardroom authority & polish' },
                { id: 'party', label: 'Evening Party', desc: 'Sensory allure & celebration' },
                { id: 'sports', label: 'Active Sports', desc: 'Dynamic mobility & resilience' },
                { id: 'travel', label: 'Travel & Resort', desc: 'Wrinkle-resistant airflow' }
              ].map(item => {
                const isSelected = occasion === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOccasion(item.id as OccasionType)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-[#c9365e] bg-[#24131b] text-white'
                        : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#fbf9f6]">{item.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                    </div>
                    <p className="text-[10px] text-[#8c8588] mt-0.5 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Climate */}
          <div className="space-y-2 pt-2 border-t border-[#262029]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6] flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#c9365e]" />
              Climate & Temperature
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'hot', label: 'Hot / Summer', sub: '> 28°C' },
                { id: 'mild', label: 'Mild / Spring', sub: '16°C – 24°C' },
                { id: 'humid', label: 'Humid / Coastal', sub: 'High moisture' },
                { id: 'cold', label: 'Cold / Winter', sub: '< 12°C' }
              ].map(item => {
                const isSelected = climate === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setClimate(item.id as ClimateType)}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'border-[#c9365e] bg-[#24131b] text-white'
                        : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                    }`}
                  >
                    <span className="text-xs font-semibold block text-[#fbf9f6]">{item.label}</span>
                    <span className="text-[10px] text-[#8c8588] block mt-0.5">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Style & Comfort Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262029]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#c9365e]" />
                Aesthetic Archetype
              </label>
              <select
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
              >
                <option value="Modern Architectural Minimalism">Modern Architectural Minimalism</option>
                <option value="Balanced Sartorial Poise">Balanced Sartorial Poise</option>
                <option value="Effortless Parisian Chic">Effortless Parisian Chic</option>
                <option value="Avant-Garde Dramatic Cut">Avant-Garde Dramatic Cut</option>
                <option value="Relaxed Organic Bohemian">Relaxed Organic Bohemian</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6] flex items-center gap-1">
                <Feather className="w-3 h-3 text-[#c9365e]" />
                Tactile Comfort Priority
              </label>
              <select
                value={comfortPreference}
                onChange={(e) => setComfortPreference(e.target.value)}
                className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
              >
                <option value="Breathable & Light Movement">Breathable & Light Movement</option>
                <option value="Structured Poise & Sculptural Hold">Structured Poise & Sculptural Hold</option>
                <option value="Liquid Soft Skin Contact">Liquid Soft Skin Contact</option>
                <option value="Dynamic Ergonomic Flex">Dynamic Ergonomic Flex</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#29222c] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1d1920] hover:bg-[#27212b] text-[#dfd8cb] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold tracking-wide transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Update & Query AI Stylist
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
