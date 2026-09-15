import React, { useState } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Ruler, 
  Sparkles, 
  Info,
  CheckCircle2,
  Camera,
  Layers,
  Box
} from 'lucide-react';
import { CustomGarmentConfig } from '../../types/garment';
import { GARMENT_TYPES, FABRICS_DATABASE } from '../../lib/garmentData';
import { ATELIER_IMAGES } from '../../lib/imageAssets';
import { ThreeDMannequinCanvas } from './3d/ThreeDMannequinCanvas';

interface GarmentVisualizerProps {
  config: CustomGarmentConfig;
  className?: string;
  onOpen3DFittingRoom?: () => void;
}

export const GarmentVisualizer: React.FC<GarmentVisualizerProps> = ({ 
  config, 
  className = '',
  onOpen3DFittingRoom
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [renderMode, setRenderMode] = useState<'3d' | 'realistic' | 'cad'>('3d');
  const [zoom, setZoom] = useState<number>(1);
  const [rotationY, setRotationY] = useState<number>(0);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'fabric' | 'stitching'>('all');

  const garmentInfo = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];
  const fabricInfo = FABRICS_DATABASE.find(f => f.id === config.fabric) || FABRICS_DATABASE[0];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setRotationY(0);
  };

  const garmentColor = config.color?.hex || '#631024';
  const isDarkGarment = isHexDark(garmentColor);
  const stitchColor = config.details?.stitching === 'contrast'
    ? (isDarkGarment ? '#f7f5f0' : '#121214')
    : (isDarkGarment ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)');

  // Get photo representation for realistic atelier mode
  const getGarmentPhoto = () => {
    switch (config.garmentType) {
      case 'shirt': return ATELIER_IMAGES.rivieraShirt;
      case 'dress': return ATELIER_IMAGES.silkDress;
      case 'trousers': return ATELIER_IMAGES.woolTrousers;
      case 'blouse': return ATELIER_IMAGES.blouse;
      case 'jacket': return ATELIER_IMAGES.blazer;
      case 'skirt': return ATELIER_IMAGES.skirt;
      case 'tshirt': return ATELIER_IMAGES.tshirt;
      case 'tuxedo': return ATELIER_IMAGES.mensTuxedo;
      case 'cocktail_dress': return ATELIER_IMAGES.womensCocktail;
      case 'blazer_dress': return ATELIER_IMAGES.womensBlazerDress;
      case 'sundress': return ATELIER_IMAGES.womensSundress;
      case 'polo': return 'https://images.unsplash.com/photo-1625910513413-562777b7cb34?auto=format&fit=crop&w=800&q=80';
      case 'nehru_jacket': return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80';
      default: return ATELIER_IMAGES.heroAtelier;
    }
  };

  // Fit scale modifications
  let fitScaleX = 1;
  let fitScaleY = 1;
  if (config.fit === 'ultra_slim') { fitScaleX = 0.88; }
  else if (config.fit === 'slim') { fitScaleX = 0.92; }
  else if (config.fit === 'relaxed') { fitScaleX = 1.08; }
  else if (config.fit === 'oversized') { fitScaleX = 1.18; }
  else if (config.fit === 'athletic') { fitScaleX = 1.04; }

  if (config.length === 'cropped') { fitScaleY = 0.82; }
  else if (config.length === 'long') { fitScaleY = 1.22; }

  return (
    <div className={`relative flex flex-col h-full bg-gradient-to-b from-[#141215] to-[#0c0b0d] rounded-2xl border border-[#2b252d] overflow-hidden ${className}`}>
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Mode & View Switchers */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Mode Switcher: 3D Model vs Realistic vs 2D CAD */}
          <div className="flex items-center bg-[#1b171d]/90 backdrop-blur-md rounded-full p-1 border border-[#352e39] shadow-lg">
            <button
              id="mode-3d-button"
              onClick={() => setRenderMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                renderMode === '3d'
                  ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-[#8c8588] hover:text-[#fbf9f6]'
              }`}
              title="Display garment on interactive 3D virtual mannequin"
            >
              <Box className="w-3.5 h-3.5 text-amber-300" />
              <span>3D Model</span>
            </button>
            <button
              id="mode-realistic-button"
              onClick={() => setRenderMode('realistic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                renderMode === 'realistic'
                  ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm'
                  : 'text-[#8c8588] hover:text-[#fbf9f6]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Realistic</span>
            </button>
            <button
              id="mode-cad-button"
              onClick={() => setRenderMode('cad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                renderMode === 'cad'
                  ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm'
                  : 'text-[#8c8588] hover:text-[#fbf9f6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CAD</span>
            </button>
          </div>

          {/* View Switcher: Front / Back (for 2D CAD & Realistic) */}
          {renderMode !== '3d' && (
            <div className="flex items-center bg-[#1b171d]/90 backdrop-blur-md rounded-full p-1 border border-[#352e39] shadow-lg animate-in fade-in">
              <button
                id="view-front-button"
                onClick={() => setView('front')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                  view === 'front' 
                    ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm' 
                    : 'text-[#8c8588] hover:text-[#fbf9f6]'
                }`}
              >
                Front
              </button>
              <button
                id="view-back-button"
                onClick={() => setView('back')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                  view === 'back' 
                    ? 'bg-[#7a152d] text-[#fbf9f6] shadow-sm' 
                    : 'text-[#8c8588] hover:text-[#fbf9f6]'
                }`}
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Center: Status / Live Feedback Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-[#1b171d]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#352e39] text-xs text-[#dfd8cb] pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-medium tracking-wide">{garmentInfo.name}</span>
          <span className="text-[#8c8588]">•</span>
          <span className="text-[#c9365e] font-semibold">{fabricInfo.name}</span>
        </div>

        {/* Right: Expand to 3D Fitting Room button or 2D Tool Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#1b171d]/90 backdrop-blur-md p-1 rounded-full border border-[#352e39] shadow-lg">
          {onOpen3DFittingRoom && (
            <button
              onClick={onOpen3DFittingRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-950/80 to-amber-950/80 hover:from-rose-900 hover:to-amber-900 border border-rose-500/50 text-rose-200 text-xs font-semibold transition-all shadow-sm"
              title="Open full-screen 3D Fitting Room Studio"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">3D Fitting Room</span>
            </button>
          )}

          {renderMode !== '3d' && (
            <>
              <button
                id="toggle-measurements-btn"
                onClick={() => setShowMeasurements(!showMeasurements)}
                className={`p-1.5 rounded-full transition-colors ${
                  showMeasurements ? 'bg-[#7a152d] text-[#fbf9f6]' : 'text-[#8c8588] hover:text-[#fbf9f6]'
                }`}
                title="Toggle Body Measurements Overlay"
              >
                <Ruler className="w-4 h-4" />
              </button>

              <button
                id="zoom-out-btn"
                onClick={handleZoomOut}
                className="p-1.5 rounded-full text-[#8c8588] hover:text-[#fbf9f6] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-[#dfd8cb] px-1">
                {Math.round(zoom * 100)}%
              </span>

              <button
                id="zoom-in-btn"
                onClick={handleZoomIn}
                className="p-1.5 rounded-full text-[#8c8588] hover:text-[#fbf9f6] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                id="reset-zoom-btn"
                onClick={handleResetZoom}
                className="p-1.5 rounded-full text-[#8c8588] hover:text-[#fbf9f6] transition-colors"
                title="Reset Perspective"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render Mode Body */}
      {renderMode === '3d' ? (
        /* ================= 3D VIRTUAL MANNEQUIN VIEWPORT ================= */
        <div className="relative flex-1 w-full h-full pt-16">
          <ThreeDMannequinCanvas
            config={config}
            className="w-full h-full rounded-none border-none"
            onRequestExpand={onOpen3DFittingRoom}
            showExpandButton={true}
          />
        </div>
      ) : (
        /* ================= 2D REALISTIC PHOTO OR CAD VIEW ================= */
        <>
          <div className="relative flex-1 flex items-center justify-center p-6 pt-16 overflow-hidden select-none">
        
        {/* Ambient atelier studio lighting effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-35 transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${garmentColor}55 0%, transparent 70%)`
          }}
        />

        {/* Grid floor guide */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1b2210_1px,transparent_1px),linear-gradient(to_bottom,#1f1b2210_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Garment Rendering Wrapper with 3D perspective rotation and zoom */}
        <div 
          className="relative transition-transform duration-300 ease-out max-h-[640px] flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) rotateY(${rotationY}deg)`,
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {/* Subtle drop shadow under garment */}
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/70 rounded-full blur-xl pointer-events-none" 
            style={{ width: `${200 * fitScaleX}px` }}
          />

          {renderMode === 'realistic' ? (
            /* ================= REALISTIC ATELIER PHOTO RENDER ================= */
            <div className="relative w-[320px] sm:w-[380px] md:w-[410px] aspect-[4/5] rounded-3xl overflow-hidden border border-stone-700/80 shadow-2xl bg-stone-950 group">
              
              {/* Photorealistic Model/Garment Image */}
              <img
                src={getGarmentPhoto()}
                alt={garmentInfo.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-top transition-transform duration-700 ${
                  view === 'back' ? 'scale-x-[-1] brightness-95' : 'group-hover:scale-105'
                }`}
              />

              {/* Dynamic Dye Tone Color Overlay (Mix Blend Mode) */}
              <div 
                className="absolute inset-0 mix-blend-color opacity-35 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: garmentColor }}
              />
              <div 
                className="absolute inset-0 mix-blend-multiply opacity-25 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: garmentColor }}
              />

              {/* Atelier Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none" />

              {/* Top Details Callout */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-[10px] font-mono uppercase tracking-wider text-stone-300">
                  {view === 'front' ? 'Front Perspective' : 'Dorsal Seam View'}
                </span>

                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5"
                  style={{ backgroundColor: `${garmentColor}cc` }}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>{config.color?.name || 'Custom'}</span>
                </span>
              </div>

              {/* Monogram Simulation Overlay */}
              {config.details?.monogramText && (
                <div className="absolute bottom-16 right-4 px-3 py-1.5 rounded-lg bg-stone-950/90 backdrop-blur-md border border-rose-500/40 shadow-xl flex items-center gap-1.5 z-10 animate-in fade-in">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span className="font-serif tracking-widest text-xs font-bold text-amber-200 uppercase">
                    {config.details.monogramText}
                  </span>
                </div>
              )}

              {/* Anatomical Measurements Lines Overlay in Realistic Mode */}
              {showMeasurements && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-around px-6 py-12 z-20">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/85 border border-rose-400 text-[10px] font-mono text-white">
                      Shoulder: {config.measurements.shoulder} {config.measurements.unit}
                    </span>
                    <div className="h-[1px] flex-1 mx-2 border-b border-dashed border-rose-400/80" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/85 border border-rose-400 text-[10px] font-mono text-white">
                      Chest: {config.measurements.chest} {config.measurements.unit}
                    </span>
                    <div className="h-[1px] flex-1 mx-2 border-b border-dashed border-rose-400/80" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/85 border border-rose-400 text-[10px] font-mono text-white">
                      Waist: {config.measurements.waist} {config.measurements.unit}
                    </span>
                    <div className="h-[1px] flex-1 mx-2 border-b border-dashed border-rose-400/80" />
                  </div>
                </div>
              )}

              {/* Bottom Quick Spec Bar */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700/80 flex items-center justify-between z-10 text-white text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">{fabricInfo.name}</span>
                  <span className="font-semibold text-stone-100">{garmentInfo.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-medium block">Biometric Ease Fit</span>
                  <span className="font-mono text-xs text-rose-300 font-bold uppercase">{config.fit} • {config.size}</span>
                </div>
              </div>

            </div>
          ) : (
            /* ================= 2D TECHNICAL CAD SVG BLUEPRINT ================= */
            <svg
              viewBox="0 0 500 680"
              className="w-[340px] sm:w-[420px] md:w-[460px] h-auto drop-shadow-2xl filter"
              style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Fabric Texture Filters & Patterns */}
              <pattern id="linenTexture" width="6" height="6" patternUnits="userSpaceOnUse">
                <path d="M0 3 L6 3 M3 0 L3 6" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
              </pattern>

              <pattern id="denimTexture" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              </pattern>

              <radialGradient id="silkSheen" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </radialGradient>

              <linearGradient id="foldShadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>

              <linearGradient id="foldShadeRight" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>

            {/* Mannequin neck silhouette base */}
            <path
              d="M210 110 C210 90, 290 90, 290 110 L280 150 L220 150 Z"
              fill="#1b171c"
              stroke="#2e2732"
              strokeWidth="1.5"
            />
            {/* Collar stand base line */}
            <ellipse cx="250" cy="148" rx="32" ry="10" fill="#241e27" />

            {/* Garment Geometry Renderers based on Garment Type */}
            {renderGarmentSVG({
              config,
              view,
              garmentColor,
              stitchColor,
              fitScaleX,
              fitScaleY,
              isDarkGarment
            })}

            {/* Measurement lines overlay if toggled */}
            {showMeasurements && renderMeasurementGuides(config)}
          </svg>
          )}
        </div>
      </div>

      {/* Bottom Visualizer Toolbar */}
      <div className="px-6 py-4 bg-[#141116]/95 border-t border-[#2a242c] flex flex-wrap items-center justify-between gap-4 z-10">
        
        {/* Color & Fabric Quick Display */}
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full border border-white/30 shadow-inner flex-shrink-0"
            style={{ backgroundColor: garmentColor }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#fbf9f6] flex items-center gap-1.5">
              {config.color?.name || 'Custom Shade'}
              <span className="text-[10px] text-[#8c8588] font-mono">({garmentColor})</span>
            </span>
            <span className="text-[11px] text-[#dfd8cb]/70">
              {fabricInfo.name} • {fabricInfo.weight}
            </span>
          </div>
        </div>

        {/* 360 Rotation Slider */}
        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-[#8c8588]" />
          <span className="text-[11px] text-[#8c8588] uppercase tracking-wider">Perspective Tilt:</span>
          <input
            type="range"
            min="-30"
            max="30"
            value={rotationY}
            onChange={(e) => setRotationY(Number(e.target.value))}
            className="w-24 sm:w-32 accent-[#9e1d3d] bg-[#221d25] h-1 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-[#dfd8cb] w-7">{rotationY}°</span>
        </div>

        {/* Spec Pill Highlights */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#241f27] border border-[#38303d] text-[11px] text-[#dfd8cb] capitalize">
            Fit: {config.fit}
          </span>
          {config.garmentType !== 'trousers' && config.garmentType !== 'skirt' && (
            <span className="px-2.5 py-1 rounded-md bg-[#241f27] border border-[#38303d] text-[11px] text-[#dfd8cb] capitalize">
              Sleeve: {config.sleeve.replace('_', ' ')}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-[#241f27] border border-[#38303d] text-[11px] text-[#dfd8cb] capitalize">
            Size: {config.size}
          </span>
        </div>

      </div>
        </>
      )}

    </div>
  );
};

// Helper: Check if hex is dark
function isHexDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

// Master Garment SVG Renderer
function renderGarmentSVG({
  config,
  view,
  garmentColor,
  stitchColor,
  fitScaleX,
  fitScaleY,
  isDarkGarment
}: {
  config: CustomGarmentConfig;
  view: 'front' | 'back';
  garmentColor: string;
  stitchColor: string;
  fitScaleX: number;
  fitScaleY: number;
  isDarkGarment: boolean;
}) {
  const { garmentType, sleeve, neckline, length, pockets, closure, fabric, details } = config;

  // Render tops or bottoms
  if (garmentType === 'trousers') {
    return renderTrousersSVG({ view, garmentColor, stitchColor, fitScaleX, fitScaleY, pockets, closure, fabric });
  }

  if (garmentType === 'skirt') {
    return renderSkirtSVG({ view, garmentColor, stitchColor, fitScaleX, fitScaleY, pockets, closure, fabric, length });
  }

  // Tops (Shirt, T-shirt, Blouse, Dress, Jacket)
  return (
    <g id="garment-top-assembly" transform="translate(0, 0)">
      
      {/* 1. Sleeves (Behind or on sides) */}
      {renderSleevesSVG({ sleeve, garmentColor, stitchColor, fitScaleX, view, fabric, garmentType })}

      {/* 2. Main Bodice / Torso */}
      {renderBodiceSVG({
        garmentType,
        garmentColor,
        stitchColor,
        fitScaleX,
        fitScaleY,
        view,
        length,
        fabric
      })}

      {/* 3. Neckline & Collar */}
      {renderNecklineSVG({
        neckline,
        garmentColor,
        stitchColor,
        view,
        garmentType,
        fabric
      })}

      {/* 4. Closures (Placket, Buttons, Zipper, Snaps) */}
      {view === 'front' && renderClosureSVG({
        closure,
        garmentType,
        stitchColor,
        isDarkGarment,
        fitScaleY
      })}

      {/* 5. Pockets */}
      {view === 'front' && renderPocketsSVG({
        pockets,
        garmentType,
        garmentColor,
        stitchColor,
        fitScaleX
      })}

      {/* 6. Monogram / Initial details */}
      {details?.monogramText && details.monogramText.trim() !== '' && (
        <text
          x={details.monogramPlacement === 'cuff' ? 380 : 200}
          y={details.monogramPlacement === 'cuff' ? 440 : 260}
          fontFamily="serif"
          fontSize="10"
          fill={details.monogramColor || (isDarkGarment ? '#ede8dd' : '#7a152d')}
          letterSpacing="2"
          fontWeight="bold"
        >
          {details.monogramText.toUpperCase()}
        </text>
      )}

      {/* 7. Fabric Shading Texture Overlay */}
      {renderFabricOverlay(fabric)}
    </g>
  );
}

// Bodice Geometry
function renderBodiceSVG({
  garmentType,
  garmentColor,
  stitchColor,
  fitScaleX,
  fitScaleY,
  view,
  length,
  fabric
}: any) {
  // Base waist & hem points
  const shoulderLeftX = 250 - 105 * fitScaleX;
  const shoulderRightX = 250 + 105 * fitScaleX;
  const armpitLeftX = 250 - 85 * fitScaleX;
  const armpitRightX = 250 + 85 * fitScaleX;
  const waistLeftX = 250 - (72 * fitScaleX);
  const waistRightX = 250 + (72 * fitScaleX);

  // Hem Y positions
  let hemY = 460;
  let hemWidth = 80 * fitScaleX;
  if (length === 'cropped') hemY = 380;
  if (length === 'long') hemY = 560;

  const isDress = garmentType === 'dress' || garmentType === 'blazer_dress' || garmentType === 'cocktail_dress' || garmentType === 'sundress';
  if (isDress) {
    hemY = length === 'cropped' ? 480 : (length === 'long' ? 640 : 570);
    hemWidth = (garmentType === 'cocktail_dress' ? 160 : 140) * fitScaleX; // Flare skirt
  }

  const hemLeftX = 250 - hemWidth;
  const hemRightX = 250 + hemWidth;

  const pathFront = `
    M 210 148
    L ${shoulderLeftX} 175
    Q ${armpitLeftX - 10} 220, ${armpitLeftX} 265
    Q ${waistLeftX} 350, ${hemLeftX} ${hemY}
    Q 250 ${hemY + (isDress ? 15 : 8)}, ${hemRightX} ${hemY}
    Q ${waistRightX} 350, ${armpitRightX} 265
    Q ${armpitRightX + 10} 220, ${shoulderRightX} 175
    L 290 148
    Z
  `;

  return (
    <g id="bodice-group">
      {/* Main fill path */}
      <path
        d={pathFront}
        fill={garmentColor}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.5"
      />

      {/* Atelier Tailoring Darts & Princess Seams */}
      {view === 'front' ? (
        <>
          {/* Subtle chest contour darts */}
          <path
            d={`M ${waistLeftX + 20} 360 Q ${waistLeftX + 25} 300, ${armpitLeftX + 35} 255`}
            stroke={stitchColor}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            fill="none"
          />
          <path
            d={`M ${waistRightX - 20} 360 Q ${waistRightX - 25} 300, ${armpitRightX - 35} 255`}
            stroke={stitchColor}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            fill="none"
          />

          {/* Hem topstitch */}
          <path
            d={`M ${hemLeftX + 2} ${hemY - 4} Q 250 ${hemY + (garmentType === 'dress' ? 11 : 4)}, ${hemRightX - 2} ${hemY - 4}`}
            stroke={stitchColor}
            strokeWidth="1"
            strokeDasharray="2 2"
            fill="none"
          />
        </>
      ) : (
        /* Back View Seam lines */
        <>
          {/* Back Center Seam */}
          <line
            x1="250"
            y1="165"
            x2="250"
            y2={hemY}
            stroke={stitchColor}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          {/* Back Yoke Line */}
          <path
            d={`M ${shoulderLeftX + 15} 205 Q 250 215, ${shoulderRightX - 15} 205`}
            stroke={stitchColor}
            strokeWidth="1"
            fill="none"
          />
          {/* Back walking slit if dress or long coat */}
          {hemY > 480 && (
            <line
              x1="250"
              y1={hemY - 60}
              x2="250"
              y2={hemY}
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="2"
            />
          )}
        </>
      )}
    </g>
  );
}

// Sleeves Geometry
function renderSleevesSVG({ sleeve, garmentColor, stitchColor, fitScaleX, view, fabric, garmentType }: any) {
  if (sleeve === 'sleeveless') {
    // Just armhole edge binding
    return (
      <g id="sleeveless-armholes">
        <path
          d={`M ${250 - 105 * fitScaleX} 175 Q ${250 - 95 * fitScaleX} 220, ${250 - 85 * fitScaleX} 265`}
          stroke={stitchColor}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d={`M ${250 + 105 * fitScaleX} 175 Q ${250 + 95 * fitScaleX} 220, ${250 + 85 * fitScaleX} 265`}
          stroke={stitchColor}
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    );
  }

  // Sleeve shapes
  let lengthY = 460; // long
  let flareWidth = 32;

  if (sleeve === 'cap') { lengthY = 210; flareWidth = 24; }
  else if (sleeve === 'short') { lengthY = 270; flareWidth = 40; }
  else if (sleeve === 'elbow') { lengthY = 320; flareWidth = 36; }
  else if (sleeve === 'three_quarter') { lengthY = 370; flareWidth = 34; }
  else if (sleeve === 'puff') { lengthY = 450; flareWidth = 48; }
  else if (sleeve === 'bell') { lengthY = 460; flareWidth = 65; }
  else if (sleeve === 'bishop') { lengthY = 465; flareWidth = 55; }
  else if (sleeve === 'french_cuff') { lengthY = 470; flareWidth = 36; }

  const leftShoulderX = 250 - 105 * fitScaleX;
  const rightShoulderX = 250 + 105 * fitScaleX;

  const leftCuffX = leftShoulderX - (sleeve === 'bell' ? 45 : 28);
  const rightCuffX = rightShoulderX + (sleeve === 'bell' ? 45 : 28);

  const leftArmpitX = 250 - 85 * fitScaleX;
  const rightArmpitX = 250 + 85 * fitScaleX;

  // Puff sleeve extra shoulder curve
  const puffOffset = sleeve === 'puff' ? 18 : 0;

  return (
    <g id="sleeves-group">
      {/* Left Sleeve */}
      <path
        d={`
          M ${leftShoulderX} 175
          C ${leftShoulderX - 25 - puffOffset} ${165 - puffOffset}, ${leftCuffX - flareWidth} ${lengthY - 50}, ${leftCuffX - (sleeve === 'bell' ? flareWidth : 0)} ${lengthY}
          L ${leftCuffX + 25} ${lengthY + 4}
          C ${leftArmpitX - 15} ${lengthY - 60}, ${leftArmpitX - 5} 310, ${leftArmpitX} 265
          Z
        `}
        fill={garmentColor}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1.5"
      />

      {/* Right Sleeve */}
      <path
        d={`
          M ${rightShoulderX} 175
          C ${rightShoulderX + 25 + puffOffset} ${165 - puffOffset}, ${rightCuffX + flareWidth} ${lengthY - 50}, ${rightCuffX + (sleeve === 'bell' ? flareWidth : 0)} ${lengthY}
          L ${rightCuffX - 25} ${lengthY + 4}
          C ${rightArmpitX + 15} ${lengthY - 60}, ${rightArmpitX + 5} 310, ${rightArmpitX} 265
          Z
        `}
        fill={garmentColor}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1.5"
      />

      {/* Cuff stitch & buttons if long */}
      {(sleeve === 'long' || sleeve === 'three_quarter') && (
        <>
          <line
            x1={leftCuffX - 8}
            y1={lengthY - 14}
            x2={leftCuffX + 20}
            y2={lengthY - 12}
            stroke={stitchColor}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1={rightCuffX + 8}
            y1={lengthY - 14}
            x2={rightCuffX - 20}
            y2={lengthY - 12}
            stroke={stitchColor}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {/* Cuff buttons */}
          <circle cx={leftCuffX + 6} cy={lengthY - 7} r="2.5" fill="#dfd8cb" stroke="#333" strokeWidth="0.5" />
          <circle cx={rightCuffX - 6} cy={lengthY - 7} r="2.5" fill="#dfd8cb" stroke="#333" strokeWidth="0.5" />
        </>
      )}
    </g>
  );
}

// Necklines Geometry
function renderNecklineSVG({ neckline, garmentColor, stitchColor, view, garmentType }: any) {
  if (view === 'back') {
    return (
      <path
        d="M 210 148 Q 250 162, 290 148"
        stroke={stitchColor}
        strokeWidth="1.5"
        fill="none"
      />
    );
  }

  switch (neckline) {
    case 'v_neck':
      return (
        <g id="neckline-v">
          <path
            d="M 210 148 L 250 235 L 290 148"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
          {/* V-lapel border */}
          <path
            d="M 212 148 L 250 230 L 288 148"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="4"
          />
        </g>
      );
    case 'square':
      return (
        <g id="neckline-square">
          <path
            d="M 215 148 L 215 210 L 285 210 L 285 148"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
        </g>
      );
    case 'boat':
      return (
        <g id="neckline-boat">
          <path
            d="M 198 152 Q 250 178, 302 152"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
        </g>
      );
    case 'high_neck':
      return (
        <g id="neckline-high">
          <path
            d="M 215 148 L 215 120 C 215 110, 285 110, 285 120 L 285 148 Z"
            fill={garmentColor}
            stroke={stitchColor}
            strokeWidth="1.5"
          />
          <line x1="215" y1="134" x2="285" y2="134" stroke={stitchColor} strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      );
    case 'sweetheart':
      return (
        <g id="neckline-sweetheart">
          <path
            d="M 210 152 Q 230 200, 250 220 Q 270 200, 290 152"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
        </g>
      );
    case 'mandarin':
      return (
        <g id="neckline-mandarin">
          <path
            d="M 220 148 L 220 132 C 220 128, 245 125, 248 125 L 248 148 Z"
            fill={garmentColor}
            stroke={stitchColor}
            strokeWidth="1.2"
          />
          <path
            d="M 280 148 L 280 132 C 280 128, 255 125, 252 125 L 252 148 Z"
            fill={garmentColor}
            stroke={stitchColor}
            strokeWidth="1.2"
          />
        </g>
      );
    case 'cowl':
      return (
        <g id="neckline-cowl">
          <path
            d="M 205 152 Q 250 220, 295 152"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
          <path
            d="M 215 170 Q 250 240, 285 170"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1.5"
          />
        </g>
      );
    case 'off_shoulder':
      return (
        <g id="neckline-off-shoulder">
          <path
            d="M 180 185 Q 250 205, 320 185"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2.5"
          />
        </g>
      );
    case 'halter':
      return (
        <g id="neckline-halter">
          <path
            d="M 235 125 L 250 148 L 265 125"
            fill="none"
            stroke={stitchColor}
            strokeWidth="2"
          />
        </g>
      );
    case 'turtleneck':
      return (
        <g id="neckline-turtleneck">
          <rect x="220" y="112" width="60" height="36" rx="4" fill={garmentColor} stroke={stitchColor} strokeWidth="1.5" />
          <line x1="220" y1="124" x2="280" y2="124" stroke={stitchColor} strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      );
    case 'spread_collar':
    case 'cutaway_collar':
      return (
        <g id="neckline-spread-collar">
          <path
            d="M 210 148 L 180 195 L 244 185 L 250 156 Z"
            fill={garmentColor}
            stroke="#1b171d"
            strokeWidth="1.2"
          />
          <path
            d="M 290 148 L 320 195 L 256 185 L 250 156 Z"
            fill={garmentColor}
            stroke="#1b171d"
            strokeWidth="1.2"
          />
        </g>
      );
    case 'collar':
    default:
      return (
        <g id="neckline-collar">
          {/* Left Collar Leaf */}
          <path
            d="M 210 148 L 195 205 L 246 190 L 250 156 Z"
            fill={garmentColor}
            stroke="#1b171d"
            strokeWidth="1.2"
          />
          {/* Right Collar Leaf */}
          <path
            d="M 290 148 L 305 205 L 254 190 L 250 156 Z"
            fill={garmentColor}
            stroke="#1b171d"
            strokeWidth="1.2"
          />
          {/* Topstitch along collar leaf edges */}
          <path
            d="M 212 152 L 198 202 L 246 188"
            fill="none"
            stroke={stitchColor}
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <path
            d="M 288 152 L 302 202 L 254 188"
            fill="none"
            stroke={stitchColor}
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </g>
      );
  }
}

// Closures
function renderClosureSVG({ closure, stitchColor, isDarkGarment, fitScaleY }: any) {
  const placketEndY = Math.min(460, 430 * fitScaleY);
  const buttonFill = isDarkGarment ? '#ede8dd' : '#221e25';

  if (closure === 'zipper') {
    return (
      <g id="closure-zipper">
        <line x1="250" y1="190" x2="250" y2={placketEndY} stroke="#888" strokeWidth="2" strokeDasharray="1 1" />
        {/* Metal zipper slider */}
        <rect x="247.5" y="240" width="5" height="10" rx="1.5" fill="#d4af37" stroke="#333" strokeWidth="0.5" />
        <line x1="250" y1="250" x2="250" y2="260" stroke="#d4af37" strokeWidth="1.5" />
      </g>
    );
  }

  if (closure === 'snap_buttons') {
    return (
      <g id="closure-snaps">
        <line x1="250" y1="190" x2="250" y2={placketEndY} stroke={stitchColor} strokeWidth="1" />
        {[215, 265, 315, 365, 415].map((y, idx) => (
          <circle key={idx} cx="250" cy={y} r="3.5" fill="#bbb" stroke="#555" strokeWidth="1" />
        ))}
      </g>
    );
  }

  if (closure === 'tie') {
    return (
      <g id="closure-tie">
        <path d="M 245 220 Q 230 250, 220 270 Q 235 260, 248 230" fill="none" stroke={stitchColor} strokeWidth="3" />
        <path d="M 255 220 Q 270 250, 280 270 Q 265 260, 252 230" fill="none" stroke={stitchColor} strokeWidth="3" />
        <circle cx="250" cy="225" r="5" fill={buttonFill} />
      </g>
    );
  }

  // Default: Buttons down standard placket
  return (
    <g id="closure-placket-buttons">
      {/* Placket Band */}
      <rect x="244" y="190" width="12" height={placketEndY - 190} fill="none" stroke={stitchColor} strokeWidth="0.8" />
      {/* 5 Real Mother-of-pearl buttons */}
      {[220, 270, 320, 370, 420].map((y, idx) => (
        <g key={idx}>
          <circle cx="250" cy={y} r="3.8" fill={buttonFill} stroke="#555" strokeWidth="0.6" />
          <circle cx="249" cy={y - 1} r="0.6" fill="#888" />
          <circle cx="251" cy={y - 1} r="0.6" fill="#888" />
          <circle cx="249" cy={y + 1} r="0.6" fill="#888" />
          <circle cx="251" cy={y + 1} r="0.6" fill="#888" />
        </g>
      ))}
    </g>
  );
}

// Pockets
function renderPocketsSVG({ pockets, stitchColor }: any) {
  if (pockets === 'none') return null;

  if (pockets === 'chest') {
    return (
      <g id="pocket-chest">
        <path
          d="M 195 240 L 225 240 L 225 275 L 210 285 L 195 275 Z"
          fill="none"
          stroke={stitchColor}
          strokeWidth="1.2"
        />
        <line x1="195" y1="246" x2="225" y2="246" stroke={stitchColor} strokeWidth="0.8" strokeDasharray="2 2" />
      </g>
    );
  }

  if (pockets === 'front' || pockets === 'side' || pockets === 'multiple') {
    return (
      <g id="pockets-front-side">
        {/* Left Waist Pocket */}
        <path
          d="M 180 340 L 220 340 L 220 385 L 180 385 Z"
          fill="none"
          stroke={stitchColor}
          strokeWidth="1.2"
        />
        {/* Right Waist Pocket */}
        <path
          d="M 280 340 L 320 340 L 320 385 L 280 385 Z"
          fill="none"
          stroke={stitchColor}
          strokeWidth="1.2"
        />
        {pockets === 'multiple' && (
          <path
            d="M 195 240 L 225 240 L 225 275 L 210 285 L 195 275 Z"
            fill="none"
            stroke={stitchColor}
            strokeWidth="1.2"
          />
        )}
      </g>
    );
  }

  return null;
}

// Trousers SVG
function renderTrousersSVG({ view, garmentColor, stitchColor, fitScaleX, fitScaleY, pockets, closure }: any) {
  const waistTopY = 160;
  const crotchY = 320;
  const hemY = 620 * fitScaleY;
  const waistLeft = 250 - (65 * fitScaleX);
  const waistRight = 250 + (65 * fitScaleX);
  const legLeftOut = 250 - (75 * fitScaleX);
  const legRightOut = 250 + (75 * fitScaleX);
  const leftHemInner = 250 - 15;
  const rightHemInner = 250 + 15;

  return (
    <g id="trousers-assembly">
      {/* Waistband */}
      <rect
        x={waistLeft}
        y={waistTopY}
        width={waistRight - waistLeft}
        height="22"
        rx="2"
        fill={garmentColor}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1.5"
      />
      {/* Belt loops */}
      {[-45, -20, 0, 20, 45].map((offset, i) => (
        <line
          key={i}
          x1={250 + offset}
          y1={waistTopY}
          x2={250 + offset}
          y2={waistTopY + 22}
          stroke={stitchColor}
          strokeWidth="1.5"
        />
      ))}

      {/* Main Trouser Legs */}
      <path
        d={`
          M ${waistLeft} ${waistTopY + 22}
          L ${legLeftOut} ${hemY}
          L ${leftHemInner} ${hemY}
          L 250 ${crotchY}
          L ${rightHemInner} ${hemY}
          L ${legRightOut} ${hemY}
          L ${waistRight} ${waistTopY + 22}
          Z
        `}
        fill={garmentColor}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1.5"
      />

      {/* Front Crease Press Lines (Tailored Pleats) */}
      <line
        x1={250 - 40 * fitScaleX}
        y1={waistTopY + 25}
        x2={250 - 45 * fitScaleX}
        y2={hemY - 10}
        stroke={stitchColor}
        strokeWidth="0.8"
        strokeDasharray="4 2"
      />
      <line
        x1={250 + 40 * fitScaleX}
        y1={waistTopY + 25}
        x2={250 + 45 * fitScaleX}
        y2={hemY - 10}
        stroke={stitchColor}
        strokeWidth="0.8"
        strokeDasharray="4 2"
      />

      {/* Fly & Pockets */}
      {view === 'front' && (
        <>
          {/* Trouser Fly */}
          <path
            d={`M 250 ${waistTopY + 22} L 250 240 Q 250 260, 240 270`}
            stroke={stitchColor}
            strokeWidth="1.2"
            fill="none"
          />
          {/* Slanted Side Slash Pockets */}
          <line
            x1={waistLeft + 10}
            y1={waistTopY + 24}
            x2={waistLeft - 2}
            y2={waistTopY + 95}
            stroke={stitchColor}
            strokeWidth="1.5"
          />
          <line
            x1={waistRight - 10}
            y1={waistTopY + 24}
            x2={waistRight + 2}
            y2={waistTopY + 95}
            stroke={stitchColor}
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}

// Skirt SVG
function renderSkirtSVG({ view, garmentColor, stitchColor, fitScaleX, fitScaleY, length }: any) {
  const waistTopY = 190;
  const waistLeft = 250 - (62 * fitScaleX);
  const waistRight = 250 + (62 * fitScaleX);
  let hemY = 480;
  let hemFlare = 115 * fitScaleX;
  if (length === 'cropped') { hemY = 400; hemFlare = 85 * fitScaleX; }
  if (length === 'long') { hemY = 620; hemFlare = 150 * fitScaleX; }

  return (
    <g id="skirt-assembly">
      {/* Fitted Waistband */}
      <rect
        x={waistLeft}
        y={waistTopY}
        width={waistRight - waistLeft}
        height="18"
        fill={garmentColor}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1.5"
      />
      {/* Skirt Body */}
      <path
        d={`
          M ${waistLeft} ${waistTopY + 18}
          Q ${waistLeft - 10} 270, ${250 - hemFlare} ${hemY}
          Q 250 ${hemY + 15}, ${250 + hemFlare} ${hemY}
          Q ${waistRight + 10} 270, ${waistRight} ${waistTopY + 18}
          Z
        `}
        fill={garmentColor}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.5"
      />
      {/* Pleat Lines */}
      {[-hemFlare * 0.5, 0, hemFlare * 0.5].map((offset, i) => (
        <path
          key={i}
          d={`M ${250 + offset * 0.4} ${waistTopY + 25} Q ${250 + offset * 0.6} ${hemY * 0.6}, ${250 + offset} ${hemY + 5}`}
          stroke={stitchColor}
          strokeWidth="0.8"
          strokeDasharray="3 3"
          fill="none"
        />
      ))}
    </g>
  );
}

// Fabric Texture Overlay
function renderFabricOverlay(fabric: string) {
  if (fabric === 'linen') {
    return <rect x="50" y="100" width="400" height="560" fill="url(#linenTexture)" opacity="0.4" pointerEvents="none" />;
  }
  if (fabric === 'denim') {
    return <rect x="50" y="100" width="400" height="560" fill="url(#denimTexture)" opacity="0.3" pointerEvents="none" />;
  }
  if (fabric === 'silk') {
    return <rect x="50" y="100" width="400" height="560" fill="url(#silkSheen)" opacity="0.35" pointerEvents="none" />;
  }
  return null;
}

// Measurement Guides Overlay
function renderMeasurementGuides(config: CustomGarmentConfig) {
  const m = config.measurements;
  const unit = m.unit || 'cm';

  return (
    <g id="measurement-callouts" className="animate-in fade-in duration-200">
      {/* Shoulder Width Callout */}
      <line x1="145" y1="175" x2="355" y2="175" stroke="#c9365e" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="145" cy="175" r="3" fill="#c9365e" />
      <circle cx="355" cy="175" r="3" fill="#c9365e" />
      <rect x="220" y="160" width="60" height="18" rx="4" fill="#1b171c" stroke="#c9365e" strokeWidth="1" />
      <text x="250" y="173" textAnchor="middle" fill="#fbf9f6" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
        {m.shoulder || 45} {unit}
      </text>

      {/* Chest / Bust Callout */}
      <line x1="165" y1="265" x2="335" y2="265" stroke="#c9365e" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="165" cy="265" r="3" fill="#c9365e" />
      <circle cx="335" cy="265" r="3" fill="#c9365e" />
      <rect x="220" y="252" width="60" height="18" rx="4" fill="#1b171c" stroke="#c9365e" strokeWidth="1" />
      <text x="250" y="265" textAnchor="middle" fill="#fbf9f6" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
        {m.chest || 98} {unit}
      </text>

      {/* Waist Callout */}
      <line x1="178" y1="350" x2="322" y2="350" stroke="#c9365e" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="178" cy="350" r="3" fill="#c9365e" />
      <circle cx="322" cy="350" r="3" fill="#c9365e" />
      <rect x="220" y="338" width="60" height="18" rx="4" fill="#1b171c" stroke="#c9365e" strokeWidth="1" />
      <text x="250" y="351" textAnchor="middle" fill="#fbf9f6" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
        {m.waist || 83} {unit}
      </text>
    </g>
  );
}
