import React, { useState } from 'react';
import { X, Ruler, Sparkles, Check, HelpCircle, User, ArrowRight } from 'lucide-react';
import { BodyMeasurements } from '../../types/garment';

interface MeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: BodyMeasurements;
  onSave: (newMeasurements: BodyMeasurements) => void;
}

const MEASUREMENT_FIELDS: { key: keyof Omit<BodyMeasurements, 'unit'>; label: string; min: number; max: number; desc: string }[] = [
  { key: 'chest', label: 'Chest / Bust Circumference', min: 70, max: 150, desc: 'Measure around the fullest part of your chest, keeping tape horizontal.' },
  { key: 'waist', label: 'Natural Waist', min: 55, max: 140, desc: 'Measure around your natural waistline, where your body bends side to side.' },
  { key: 'hip', label: 'Full Hip Circumference', min: 75, max: 160, desc: 'Measure around the widest part of your hips and buttocks.' },
  { key: 'shoulder', label: 'Shoulder Bi-Acromial Width', min: 32, max: 62, desc: 'Distance from the tip of left shoulder bone across the back to the right shoulder tip.' },
  { key: 'armLength', label: 'Sleeve / Arm Length', min: 45, max: 80, desc: 'From shoulder bone point down along the relaxed elbow to your wrist bone.' },
  { key: 'neck', label: 'Neck Circumference', min: 30, max: 55, desc: 'Around base of neck, allowing one finger space inside tape.' },
  { key: 'torsoLength', label: 'Torso Vertical Length', min: 40, max: 75, desc: 'From base of neck at the back down to your natural waistline.' },
  { key: 'inseam', label: 'Trouser Inseam', min: 55, max: 100, desc: 'From the lowest crotch seam down the inner leg to the ankle.' },
  { key: 'outseam', label: 'Trouser Outseam', min: 80, max: 130, desc: 'From the waistband down the outer side of leg to the bottom hem.' }
];

export const MeasurementsModal: React.FC<MeasurementsModalProps> = ({
  isOpen,
  onClose,
  measurements,
  onSave
}) => {
  const [localValues, setLocalValues] = useState<BodyMeasurements>({ ...measurements });
  const [selectedTip, setSelectedTip] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUnit = localValues.unit || 'cm';

  // Toggle unit with accurate mathematical conversion
  const handleToggleUnit = (targetUnit: 'cm' | 'in') => {
    if (targetUnit === currentUnit) return;

    const factor = targetUnit === 'in' ? (1 / 2.54) : 2.54;
    const updated: any = { ...localValues, unit: targetUnit };

    MEASUREMENT_FIELDS.forEach(f => {
      const val = (localValues as any)[f.key];
      if (val !== undefined && typeof val === 'number') {
        updated[f.key] = Math.round(val * factor * 10) / 10;
      }
    });

    setLocalValues(updated);
  };

  const handleFieldChange = (key: keyof Omit<BodyMeasurements, 'unit'>, value: string) => {
    const num = parseFloat(value) || 0;
    setLocalValues(prev => ({ ...prev, [key]: num }));
  };

  // Presets
  const applyPreset = (type: 'athletic' | 'classic' | 'petite' | 'tall') => {
    let preset: any = {};
    if (currentUnit === 'cm') {
      if (type === 'athletic') preset = { chest: 104, waist: 82, hip: 98, shoulder: 48, armLength: 64, neck: 41, torsoLength: 52, inseam: 82, outseam: 106 };
      if (type === 'classic') preset = { chest: 96, waist: 84, hip: 100, shoulder: 44, armLength: 62, neck: 39, torsoLength: 50, inseam: 79, outseam: 102 };
      if (type === 'petite') preset = { chest: 84, waist: 68, hip: 90, shoulder: 38, armLength: 56, neck: 35, torsoLength: 44, inseam: 72, outseam: 94 };
      if (type === 'tall') preset = { chest: 102, waist: 86, hip: 104, shoulder: 47, armLength: 68, neck: 42, torsoLength: 56, inseam: 88, outseam: 114 };
    } else {
      if (type === 'athletic') preset = { chest: 41, waist: 32, hip: 38.5, shoulder: 18.9, armLength: 25.2, neck: 16.1, torsoLength: 20.5, inseam: 32.3, outseam: 41.7 };
      if (type === 'classic') preset = { chest: 37.8, waist: 33, hip: 39.4, shoulder: 17.3, armLength: 24.4, neck: 15.4, torsoLength: 19.7, inseam: 31.1, outseam: 40.2 };
      if (type === 'petite') preset = { chest: 33, waist: 26.8, hip: 35.4, shoulder: 15, armLength: 22, neck: 13.8, torsoLength: 17.3, inseam: 28.3, outseam: 37 };
      if (type === 'tall') preset = { chest: 40.2, waist: 33.9, hip: 41, shoulder: 18.5, armLength: 26.8, neck: 16.5, torsoLength: 22, inseam: 34.6, outseam: 44.9 };
    }
    setLocalValues(prev => ({ ...prev, ...preset, unit: currentUnit }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141215] border border-[#352e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#29222c] flex items-center justify-between bg-[#171419]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7a152d]/30 text-[#c9365e] border border-[#7a152d]/50">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                Bespoke Measurement Profile
              </h3>
              <p className="text-xs text-[#8c8588]">
                Precision anatomical dimensions for computerized pattern drafting
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

        {/* Units & Presets Sub-bar */}
        <div className="px-6 py-3 bg-[#19161c] border-b border-[#29222c] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Unit Toggle */}
          <div className="flex items-center gap-1.5 bg-[#121013] p-1 rounded-xl border border-[#2d2630]">
            <span className="text-[11px] text-[#8c8588] px-2 font-medium">Unit:</span>
            <button
              type="button"
              onClick={() => handleToggleUnit('cm')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                currentUnit === 'cm'
                  ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm'
                  : 'text-[#8c8588] hover:text-[#fbf9f6]'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              type="button"
              onClick={() => handleToggleUnit('in')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                currentUnit === 'in'
                  ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm'
                  : 'text-[#8c8588] hover:text-[#fbf9f6]'
              }`}
            >
              Inches (in)
            </button>
          </div>

          {/* Quick Archetype Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#8c8588]">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('classic')}
              className="px-2 py-0.5 rounded bg-[#252028] hover:bg-[#322a36] text-[#dfd8cb] text-[11px] transition-colors"
            >
              Classic
            </button>
            <button
              type="button"
              onClick={() => applyPreset('athletic')}
              className="px-2 py-0.5 rounded bg-[#252028] hover:bg-[#322a36] text-[#dfd8cb] text-[11px] transition-colors"
            >
              Athletic
            </button>
            <button
              type="button"
              onClick={() => applyPreset('tall')}
              className="px-2 py-0.5 rounded bg-[#252028] hover:bg-[#322a36] text-[#dfd8cb] text-[11px] transition-colors"
            >
              Tall & Lean
            </button>
            <button
              type="button"
              onClick={() => applyPreset('petite')}
              className="px-2 py-0.5 rounded bg-[#252028] hover:bg-[#322a36] text-[#dfd8cb] text-[11px] transition-colors"
            >
              Petite
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MEASUREMENT_FIELDS.map(f => {
              const val = (localValues as any)[f.key] ?? 0;
              return (
                <div key={f.key} className="space-y-1 bg-[#171419] p-3 rounded-xl border border-[#2a232c]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#fbf9f6] flex items-center gap-1">
                      {f.label}
                      <button
                        type="button"
                        onClick={() => setSelectedTip(selectedTip === f.key ? null : f.key)}
                        className="text-[#8c8588] hover:text-[#c9365e]"
                        title="Measurement guidance"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    <span className="text-[10px] font-mono text-[#c9365e] font-semibold">{currentUnit}</span>
                  </div>

                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={val || ''}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    className="w-full bg-[#121013] border border-[#352e39] rounded-lg px-3 py-1.5 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />

                  {selectedTip === f.key && (
                    <p className="text-[10px] text-[#dfd8cb] bg-[#221c25] p-2 rounded-lg mt-1 border border-[#3b3141] leading-relaxed">
                      {f.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-[#20151c] border border-[#7a152d]/40 text-xs text-[#dfd8cb] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#c9365e] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Master Tailor Fitting Assurance:</strong> Pattern drafting formulas automatically calculate ease allowance based on your selected fit silhouette (Slim, Regular, or Relaxed) and chosen textile stretch profile.
            </p>
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
              Apply Bespoke Measurements
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
