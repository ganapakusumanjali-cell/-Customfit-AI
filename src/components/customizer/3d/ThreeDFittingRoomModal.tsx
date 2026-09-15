import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Camera, 
  Layers, 
  Ruler, 
  Flame, 
  Sun, 
  Sparkles, 
  User, 
  Sliders, 
  Check, 
  Maximize2,
  Minimize2,
  Info,
  Download
} from 'lucide-react';
import { CustomGarmentConfig, BodyMeasurements } from '../../../types/garment';
import { ThreeDMannequinCanvas } from './ThreeDMannequinCanvas';

interface ThreeDFittingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomGarmentConfig;
  onUpdateConfig: (updates: Partial<CustomGarmentConfig>) => void;
}

export const ThreeDFittingRoomModal: React.FC<ThreeDFittingRoomModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'morphology' | 'ambiance' | 'styling'>('morphology');
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMeasurementChange = (key: keyof BodyMeasurements, val: number) => {
    onUpdateConfig({
      measurements: {
        ...config.measurements,
        [key]: val
      }
    });
  };

  const m = config.measurements;
  const unit = m.unit || 'cm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#0f0d11] border border-[#352d3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        
        {/* Left / Center: Interactive 3D Mannequin Viewport (70% width on desktop) */}
        <div className="relative flex-1 h-[55%] lg:h-full flex flex-col bg-[#0b0a0d]">
          
          {/* Top Modal Header */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-[#1b1720]/90 backdrop-blur-md border border-[#362e3d] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-serif-fashion text-sm font-bold text-white">
                3D Virtual Fitting Salon
              </span>
              <span className="text-[#8c8588]">•</span>
              <span className="text-xs text-rose-300 font-semibold">{config.title || config.garmentType}</span>
            </div>
          </div>

          {/* Close button top right on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 z-30 p-2 rounded-full bg-stone-900/90 border border-stone-700 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 3D Canvas Viewport */}
          <div className="flex-1 w-full h-full">
            <ThreeDMannequinCanvas
              config={config}
              className="w-full h-full rounded-none border-none"
              showExpandButton={false}
              onSnapshotTaken={(imgUrl) => setCapturedSnapshot(imgUrl)}
            />
          </div>

          {/* Snapshot Preview Card if captured */}
          {capturedSnapshot && (
            <div className="absolute bottom-4 left-4 z-30 p-2 rounded-2xl bg-black/90 backdrop-blur-md border border-rose-500/50 shadow-2xl flex items-center gap-3 animate-in fade-in">
              <img src={capturedSnapshot} alt="Snapshot" className="w-14 h-14 object-cover rounded-xl border border-stone-700" />
              <div className="pr-2">
                <span className="text-xs font-semibold text-white block">3D Snapshot Captured</span>
                <span className="text-[10px] text-stone-400 block mb-1">Saved to high-resolution atelier gallery</span>
                <a
                  href={capturedSnapshot}
                  download={`customfit_3d_${config.garmentType}.png`}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Image</span>
                </a>
              </div>
              <button onClick={() => setCapturedSnapshot(null)} className="text-stone-500 hover:text-white p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Biometric Morphing & Atelier Fitting Controls (30% on desktop) */}
        <div className="w-full lg:w-[380px] h-[45%] lg:h-full bg-[#141117] border-t lg:border-t-0 lg:border-l border-[#2e2632] flex flex-col overflow-hidden">
          
          {/* Header with Close */}
          <div className="px-5 py-4 border-b border-[#2a232e] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400 font-semibold block">
                Digital Tailoring
              </span>
              <h2 className="font-serif-fashion text-lg font-bold text-white">
                Biometric Fitting Controls
              </h2>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#231d27] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtabs */}
          <div className="flex border-b border-[#2a232e] bg-[#100e13]">
            <button
              onClick={() => setActiveTab('morphology')}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'morphology'
                  ? 'border-rose-600 text-rose-200 bg-[#19151e]'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Body Morph
            </button>
            <button
              onClick={() => setActiveTab('styling')}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'styling'
                  ? 'border-rose-600 text-rose-200 bg-[#19151e]'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Fit & Drape
            </button>
            <button
              onClick={() => setActiveTab('ambiance')}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'ambiance'
                  ? 'border-rose-600 text-rose-200 bg-[#19151e]'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Atelier Info
            </button>
          </div>

          {/* Scrollable Control Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {activeTab === 'morphology' && (
              <div className="space-y-5">
                <div className="p-3 rounded-xl bg-[#1b1721] border border-[#332a39] text-xs text-stone-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Adjust the sliders below to see the 3D model adapt in real time to your anatomical measurements.
                  </span>
                </div>

                {/* Shoulder Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">Shoulder Width</span>
                    <span className="font-mono text-rose-300 font-bold">{m.shoulder || 45} {unit}</span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="56"
                    value={m.shoulder || 45}
                    onChange={(e) => handleMeasurementChange('shoulder', Number(e.target.value))}
                    className="w-full accent-rose-600 bg-[#251f2b] h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>36 cm (Petite)</span>
                    <span>45 cm (Standard)</span>
                    <span>56 cm (Broad)</span>
                  </div>
                </div>

                {/* Chest / Bust Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">Chest / Bust Circumference</span>
                    <span className="font-mono text-rose-300 font-bold">{m.chest || 98} {unit}</span>
                  </div>
                  <input
                    type="range"
                    min="76"
                    max="128"
                    value={m.chest || 98}
                    onChange={(e) => handleMeasurementChange('chest', Number(e.target.value))}
                    className="w-full accent-rose-600 bg-[#251f2b] h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>76 cm (Slim)</span>
                    <span>98 cm (Regular)</span>
                    <span>128 cm (Plus)</span>
                  </div>
                </div>

                {/* Waistline Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">Waist Circumference</span>
                    <span className="font-mono text-rose-300 font-bold">{m.waist || 83} {unit}</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="116"
                    value={m.waist || 83}
                    onChange={(e) => handleMeasurementChange('waist', Number(e.target.value))}
                    className="w-full accent-rose-600 bg-[#251f2b] h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>60 cm (Cinch)</span>
                    <span>83 cm (Tailored)</span>
                    <span>116 cm (Generous)</span>
                  </div>
                </div>

                {/* Hip / Seat Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">Hips & Seat</span>
                    <span className="font-mono text-rose-300 font-bold">{m.hip || 98} {unit}</span>
                  </div>
                  <input
                    type="range"
                    min="78"
                    max="130"
                    value={m.hip || 98}
                    onChange={(e) => handleMeasurementChange('hip', Number(e.target.value))}
                    className="w-full accent-rose-600 bg-[#251f2b] h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>78 cm</span>
                    <span>98 cm</span>
                    <span>130 cm</span>
                  </div>
                </div>

                {/* Unit Switcher */}
                <div className="pt-2 flex items-center justify-between border-t border-[#2a232e]">
                  <span className="text-xs text-stone-400">Measurement System:</span>
                  <div className="flex bg-[#201a25] p-0.5 rounded-lg border border-[#352c3c]">
                    <button
                      onClick={() => handleMeasurementChange('unit' as any, 'cm' as any)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        unit === 'cm' ? 'bg-[#7a152d] text-white' : 'text-stone-400'
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                    <button
                      onClick={() => handleMeasurementChange('unit' as any, 'inches' as any)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        unit === 'inches' || unit === 'in' ? 'bg-[#7a152d] text-white' : 'text-stone-400'
                      }`}
                    >
                      Inches (in)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'styling' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-2">Ease & Fit Silhouette</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ultra_slim', 'slim', 'regular', 'relaxed', 'oversized'] as const).map((fitOption) => (
                      <button
                        key={fitOption}
                        onClick={() => onUpdateConfig({ fit: fitOption })}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left capitalize transition-all ${
                          config.fit === fitOption
                            ? 'bg-rose-950/80 border-rose-500 text-white shadow'
                            : 'bg-[#1b1720] border-[#312937] text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-semibold">{fitOption.replace('_', ' ')}</div>
                        <div className="text-[10px] text-stone-500">
                          {fitOption === 'ultra_slim' && 'Body-skimming precision'}
                          {fitOption === 'slim' && 'Tailored close contour'}
                          {fitOption === 'regular' && 'Classic drape balance'}
                          {fitOption === 'relaxed' && 'Comfortable ease allowance'}
                          {fitOption === 'oversized' && 'Contemporary dropped silhouette'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-2">Garment Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cropped', 'standard', 'long'] as const).map((len) => (
                      <button
                        key={len}
                        onClick={() => onUpdateConfig({ length: len })}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize text-center transition-all ${
                          config.length === len
                            ? 'bg-rose-950/80 border-rose-500 text-white'
                            : 'bg-[#1b1720] border-[#312937] text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ambiance' && (
              <div className="space-y-4 text-xs text-stone-300">
                <div className="p-3.5 rounded-xl bg-[#1b1720] border border-[#312937] space-y-2">
                  <div className="font-serif-fashion text-sm font-bold text-rose-300">
                    Atelier 3D Rendering Engine
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    This real-time 3D viewport renders the bespoke garment pattern conforming to dynamic anthropometric morphing. The engine models fabric drape, micro-weave relief, and material reflectance under physically accurate studio illumination.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-stone-400 font-mono text-[10px] uppercase">Specifications</div>
                  <div className="p-3 rounded-xl bg-[#18141c] border border-[#2b2430] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Garment Type:</span>
                      <span className="text-white capitalize">{config.garmentType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Fabric Composition:</span>
                      <span className="text-amber-200 capitalize">{config.fabric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Dye Color:</span>
                      <span className="text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: config.color.hex }} />
                        {config.color.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Sleeve:</span>
                      <span className="text-white capitalize">{config.sleeve.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Neckline:</span>
                      <span className="text-white capitalize">{config.neckline.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-[#2a232e] bg-[#100e13] flex items-center justify-between">
            <span className="text-xs text-stone-400">
              Live updates synced to design
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 text-white text-xs font-semibold hover:from-rose-600 hover:to-rose-800 transition-all shadow-lg"
            >
              Apply & Close Fitting Room
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
