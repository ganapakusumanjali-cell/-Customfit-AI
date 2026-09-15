import React, { useState } from 'react';
import { 
  Shirt, 
  Ruler, 
  Layers, 
  Palette, 
  Scissors, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { 
  CustomGarmentConfig, 
  GarmentType, 
  FabricType, 
  SleeveType, 
  NecklineType, 
  LengthType, 
  PocketType, 
  ClosureType, 
  StandardSize,
  FitSilhouette
} from '../../types/garment';
import { 
  GARMENT_TYPES, 
  FABRICS_DATABASE, 
  COLOR_PALETTES, 
  STANDARD_SIZES 
} from '../../lib/garmentData';
import { ATELIER_IMAGES } from '../../lib/imageAssets';

interface CustomizerCategoriesProps {
  config: CustomGarmentConfig;
  onChange: (updates: Partial<CustomGarmentConfig>) => void;
  onOpenMeasurementModal: () => void;
}

export const CustomizerCategories: React.FC<CustomizerCategoriesProps> = ({
  config,
  onChange,
  onOpenMeasurementModal
}) => {
  const [activeSection, setActiveSection] = useState<'garment' | 'size' | 'structure' | 'fabric' | 'details'>('garment');
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');

  const selectedGarment = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];

  const filteredGarments = GARMENT_TYPES.filter(g => {
    if (genderFilter === 'all') return true;
    return g.gender === genderFilter || (genderFilter === 'men' && g.gender === 'unisex') || (genderFilter === 'women' && g.gender === 'unisex');
  });

  return (
    <div className="bg-[#141215] rounded-2xl border border-[#2b252d] overflow-hidden shadow-xl">
      
      {/* Category Tab Strip */}
      <div className="flex border-b border-[#2a242c] bg-[#100f12] overflow-x-auto custom-scrollbar">
        <button
          id="cat-tab-garment"
          onClick={() => setActiveSection('garment')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeSection === 'garment'
              ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Shirt className="w-3.5 h-3.5 text-[#c9365e]" />
          Garment
        </button>

        <button
          id="cat-tab-size"
          onClick={() => setActiveSection('size')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeSection === 'size'
              ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 text-[#c9365e]" />
          Size & Fit
        </button>

        <button
          id="cat-tab-structure"
          onClick={() => setActiveSection('structure')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeSection === 'structure'
              ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5 text-[#c9365e]" />
          Structure
        </button>

        <button
          id="cat-tab-fabric"
          onClick={() => setActiveSection('fabric')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeSection === 'fabric'
              ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#c9365e]" />
          Fabric & Color
        </button>

        <button
          id="cat-tab-details"
          onClick={() => setActiveSection('details')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeSection === 'details'
              ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c9365e]" />
          Atelier Details
        </button>
      </div>

      {/* Main Options Panel Area */}
      <div className="p-5 max-h-[580px] overflow-y-auto custom-scrollbar space-y-6">
        
        {/* ================= 1. GARMENT TYPE ================= */}
        {activeSection === 'garment' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#fbf9f6] uppercase tracking-wider">
                  Select Base Garment Silhouette
                </h3>
                <p className="text-xs text-[#8c8588] mt-0.5">
                  Handcrafted bespoke tailoring for Men, Women, and Couture One-Pieces.
                </p>
              </div>

              {/* Gender / Department Filter Pills */}
              <div className="flex items-center gap-1 bg-[#1a161e] p-1 rounded-xl border border-[#2d2633] self-start sm:self-auto">
                {(['all', 'men', 'women', 'unisex'] as const).map(gTab => (
                  <button
                    key={gTab}
                    onClick={() => setGenderFilter(gTab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      genderFilter === gTab
                        ? 'bg-[#c9365e] text-white shadow-sm'
                        : 'text-[#8c8588] hover:text-[#fbf9f6]'
                    }`}
                  >
                    {gTab === 'all' ? 'All (13)' : gTab === 'men' ? 'Men (6)' : gTab === 'women' ? 'Women (6)' : 'Unisex'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredGarments.map(g => {
                const isSelected = config.garmentType === g.id;
                const getGarmentThumbnail = (typeId: string) => {
                  switch (typeId) {
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

                return (
                  <button
                    key={g.id}
                    id={`garment-type-${g.id}`}
                    onClick={() => {
                      onChange({
                        garmentType: g.id,
                        title: `Custom ${g.name}`
                      });
                    }}
                    className={`relative rounded-xl text-left border transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'border-[#c9365e] bg-gradient-to-br from-[#28131b] to-[#171319] shadow-lg shadow-[#7a152d]/20 ring-1 ring-[#c9365e]'
                        : 'border-[#2d2630] bg-[#171518] hover:border-[#4d3f52] hover:bg-[#1f1b21]'
                    }`}
                  >
                    {/* Realistic Garment Silhouette Thumbnail */}
                    <div className="relative w-full h-24 overflow-hidden bg-stone-950">
                      <img
                        src={getGarmentThumbnail(g.id)}
                        alt={g.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171518] via-[#171518]/30 to-transparent" />
                      
                      {/* Department Tag */}
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-stone-300 border border-white/10">
                        {g.gender === 'men' ? 'Men' : g.gender === 'women' ? 'Women' : 'Unisex'}
                      </span>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#c9365e] flex items-center justify-center text-white shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1">
                      <span className="text-xs font-semibold text-[#fbf9f6] group-hover:text-white block line-clamp-1">
                        {g.name}
                      </span>
                      <p className="text-[10px] text-[#8c8588] line-clamp-1 leading-tight">
                        {g.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#dfd8cb]/80 border-t border-[#29222c] pt-1 mt-1">
                        <span className="font-mono text-[#c9365e] font-semibold">₹{g.basePrice}</span>
                        <span>{g.baseDays}d lead</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 2. SIZE & MEASUREMENTS ================= */}
        {activeSection === 'size' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Standard vs Custom Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#fbf9f6] uppercase tracking-wider">
                    Sizing Mode
                  </h3>
                  <p className="text-xs text-[#8c8588]">Choose a standard prêt-à-porter scale or precision bespoke measurements.</p>
                </div>

                <button
                  id="btn-edit-measurements"
                  onClick={onOpenMeasurementModal}
                  className="px-3 py-1.5 rounded-lg bg-[#7a152d]/30 text-[#c9365e] hover:bg-[#7a152d]/50 border border-[#7a152d]/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  {config.size === 'Custom' ? 'Edit Measurements' : 'Use Custom Profile'}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {STANDARD_SIZES.map(s => {
                  const isSelected = config.size === s;
                  return (
                    <button
                      key={s}
                      id={`size-btn-${s}`}
                      onClick={() => onChange({ size: s })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#7a152d] text-[#fbf9f6] border border-[#c9365e] shadow-md'
                          : 'bg-[#1a171d] text-[#8c8588] border border-[#2d2630] hover:text-[#fbf9f6] hover:bg-[#252029]'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {config.size === 'Custom' && (
                <div className="p-3.5 rounded-xl bg-[#20151c] border border-[#7a152d]/50 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#fbf9f6] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c9365e]" />
                      Bespoke Master Tailor Sizing Active
                    </span>
                    <p className="text-[11px] text-[#dfd8cb]/80 mt-0.5">
                      Chest: {config.measurements.chest}cm • Waist: {config.measurements.waist}cm • Shoulders: {config.measurements.shoulder}cm
                    </p>
                  </div>
                  <button
                    onClick={onOpenMeasurementModal}
                    className="text-[#c9365e] underline text-[11px] font-medium"
                  >
                    Adjust
                  </button>
                </div>
              )}
            </div>

            {/* Fit Preference Silhouette */}
            <div className="space-y-3 pt-4 border-t border-[#241f27]">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Silhouette & Body Ease (Fit)
                </h4>
                <p className="text-[11px] text-[#8c8588]">Controls garment circumference allowance beyond skin measurements.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'ultra_slim', label: 'Ultra Slim', desc: 'Sartorial Italian razor cut, zero body ease' },
                  { id: 'slim', label: 'Slim Fit', desc: 'Contoured tailoring with waist darts' },
                  { id: 'regular', label: 'Regular Fit', desc: 'Classic balance of elegance & comfort' },
                  { id: 'athletic', label: 'Athletic Cut', desc: 'Wider chest & broad shoulders, tapered waist' },
                  { id: 'relaxed', label: 'Relaxed Fit', desc: 'Gentle drape with ease around chest' },
                  { id: 'oversized', label: 'Oversized', desc: 'Modern dropped shoulder streetwear boxy' }
                ].map(f => {
                  const isSelected = config.fit === f.id;
                  return (
                    <button
                      key={f.id}
                      id={`fit-option-${f.id}`}
                      onClick={() => onChange({ fit: f.id as FitSilhouette })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] text-white shadow-sm'
                          : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#fbf9f6]">{f.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                      </div>
                      <p className="text-[10px] text-[#8c8588] mt-1 leading-snug">{f.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. STRUCTURE (Sleeves, Neckline, Length) ================= */}
        {activeSection === 'structure' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Sleeves (if applicable to top) */}
            {config.garmentType !== 'trousers' && config.garmentType !== 'skirt' && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Sleeve Architecture ({config.sleeve.replace('_', ' ')})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'sleeveless', label: 'Sleeveless', desc: 'Clean armscye binding' },
                    { id: 'cap', label: 'Cap Sleeve', desc: 'Delicate shoulder cap contour' },
                    { id: 'short', label: 'Short Sleeve', desc: 'Mid-bicep tailored cuff' },
                    { id: 'elbow', label: 'Elbow Length', desc: 'Sleek mid-arm modern cut' },
                    { id: 'three_quarter', label: '3/4 Sleeve', desc: 'Graceful forearm cut' },
                    { id: 'long', label: 'Long Sleeve', desc: 'Double-button barrel cuff' },
                    { id: 'french_cuff', label: 'French Cuffs', desc: 'Double fold-back for cufflinks' },
                    { id: 'puff', label: 'Puff Sleeve', desc: 'Sculpted romantic shoulder volume' },
                    { id: 'bell', label: 'Bell Sleeve', desc: 'Dramatic flowing wrist flare' },
                    { id: 'bishop', label: 'Bishop Sleeve', desc: 'Voluminous gathered wrist band' }
                  ].map(s => {
                    const isSelected = config.sleeve === s.id;
                    return (
                      <button
                        key={s.id}
                        id={`sleeve-${s.id}`}
                        onClick={() => onChange({ sleeve: s.id as SleeveType })}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'border-[#c9365e] bg-[#24131b] text-white shadow-sm ring-1 ring-[#c9365e]'
                            : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#fbf9f6]">{s.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                        </div>
                        <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Neckline / Collar */}
            {config.garmentType !== 'trousers' && config.garmentType !== 'skirt' && (
              <div className="space-y-3 pt-4 border-t border-[#241f27]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Neckline & Collar ({config.neckline.replace('_', ' ')})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'collar', label: 'Tailored Collar', desc: 'Italian spread collar leaf' },
                    { id: 'spread_collar', label: 'Spread Collar', desc: 'Wide stance formal collar' },
                    { id: 'cutaway_collar', label: 'Cutaway Collar', desc: 'Extreme modern cutaway angle' },
                    { id: 'mandarin', label: 'Mandarin Stand', desc: 'Clean grandad band collar' },
                    { id: 'round', label: 'Crew Round Neck', desc: 'Soft ribbed tubular edge' },
                    { id: 'v_neck', label: 'Sculpted V-Neck', desc: 'Elongating neckline with placket' },
                    { id: 'sweetheart', label: 'Sweetheart', desc: 'Romantic curved decollete' },
                    { id: 'cowl', label: 'Draped Cowl', desc: 'Fluid cascading drape folds' },
                    { id: 'square', label: 'Square Neck', desc: 'Architectural clean frame' },
                    { id: 'boat', label: 'Bateau / Boat', desc: 'Classic French boat neckline' },
                    { id: 'off_shoulder', label: 'Off-Shoulder', desc: 'Clavicle framing bardot cut' },
                    { id: 'halter', label: 'Halter Tie', desc: 'Backless high halter neck' },
                    { id: 'high_neck', label: 'Mock High Neck', desc: 'Sophisticated minimalist band' },
                    { id: 'turtleneck', label: 'Roll Turtleneck', desc: 'Full fold-over knit roll' }
                  ].map(n => {
                    const isSelected = config.neckline === n.id;
                    return (
                      <button
                        key={n.id}
                        id={`neckline-${n.id}`}
                        onClick={() => onChange({ neckline: n.id as NecklineType })}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'border-[#c9365e] bg-[#24131b] text-white shadow-sm ring-1 ring-[#c9365e]'
                            : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#fbf9f6]">{n.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                        </div>
                        <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{n.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Garment Length */}
            <div className="space-y-3 pt-4 border-t border-[#241f27]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                Garment Hem Length
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'cropped', label: 'Cropped', desc: 'Above natural waist / hip' },
                  { id: 'standard', label: 'Standard', desc: 'Classic hip / baseline length' },
                  { id: 'long', label: 'Elongated / Maxi', desc: 'Extended tunic or coat hem' }
                ].map(l => {
                  const isSelected = config.length === l.id;
                  return (
                    <button
                      key={l.id}
                      id={`length-${l.id}`}
                      onClick={() => onChange({ length: l.id as LengthType })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] text-white'
                          : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#fbf9f6]">{l.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                      </div>
                      <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{l.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ================= 4. FABRIC & COLOR ================= */}
        {activeSection === 'fabric' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Fabric Material Selection with Realistic Textile Photos */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Fabric Type & Textile Weave
                </h4>
                <p className="text-[11px] text-[#8c8588]">Selected textiles determine breathability, drape, and weight.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FABRICS_DATABASE.map(f => {
                  const isSelected = config.fabric === f.id;
                  return (
                    <button
                      key={f.id}
                      id={`fabric-btn-${f.id}`}
                      onClick={() => onChange({ fabric: f.id })}
                      className={`rounded-xl text-left border transition-all overflow-hidden flex flex-col group ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] shadow-md ring-1 ring-[#c9365e]'
                          : 'border-[#2d2630] bg-[#171518] hover:border-[#423746]'
                      }`}
                    >
                      {/* Realistic Textile Texture Header */}
                      <div className="relative w-full h-16 overflow-hidden bg-stone-950">
                        <img
                          src={f.imageUrl || ATELIER_IMAGES.fabrics.cotton}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171518] via-transparent to-transparent" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-amber-300 border border-white/20">
                          {f.weight}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#c9365e] text-white text-[9px] font-bold uppercase flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-1">
                        <span className="text-xs font-bold text-[#fbf9f6] group-hover:text-[#c9365e] transition-colors block">
                          {f.name}
                        </span>
                        <p className="text-[11px] text-[#dfd8cb]/80 leading-snug">{f.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#8c8588] pt-1.5 border-t border-[#29222c]">
                          <span>Drape: <strong className="text-[#dfd8cb]">{f.drape}</strong></span>
                          <span>Breathability: <strong className="text-emerald-400">{f.breathability}</strong></span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Curated Color Palettes with Grouped Vibrant Tones */}
            <div className="space-y-4 pt-4 border-t border-[#241f27]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                    Color & Dye Tone
                  </h4>
                  <p className="text-[11px] text-[#8c8588]">Selected: <strong className="text-[#ede8dd]" style={{ color: config.color.hex }}>{config.color.name}</strong></p>
                </div>

                {/* Custom Hex Picker input */}
                <div className="flex items-center gap-2 bg-[#1b171d] px-2.5 py-1 rounded-lg border border-[#352e39]">
                  <span className="text-[11px] text-[#8c8588]">Custom:</span>
                  <input
                    type="color"
                    value={config.color.hex}
                    onChange={(e) => {
                      onChange({
                        color: {
                          name: 'Custom Atelier Dye',
                          hex: e.target.value,
                          category: 'statement'
                        }
                      });
                    }}
                    className="w-6 h-6 rounded-md border border-[#352e39] cursor-pointer bg-transparent"
                    title="Pick custom color"
                  />
                  <span className="text-[10px] font-mono text-[#dfd8cb] uppercase">{config.color.hex}</span>
                </div>
              </div>

              {/* Vibrant & Jewel Tones */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Vibrant & Jewel Tones
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {COLOR_PALETTES.filter(c => c.category === 'jewel' || c.category === 'vibrant').map(c => {
                    const isSelected = config.color.hex.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        id={`color-swatch-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onChange({ color: c })}
                        className={`group flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#c9365e] bg-[#221319] ring-1 ring-[#c9365e]'
                            : 'border-[#2d2630] bg-[#171518] hover:border-[#4a3e50]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[9px] text-[#dfd8cb] text-center mt-1 line-clamp-1 group-hover:text-white">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resort, Warm & Earthy */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Resort & Earthy Warmth
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {COLOR_PALETTES.filter(c => c.category === 'earthy').map(c => {
                    const isSelected = config.color.hex.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        id={`color-swatch-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onChange({ color: c })}
                        className={`group flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-[#221319] ring-1 ring-amber-500'
                            : 'border-[#2d2630] bg-[#171518] hover:border-[#4a3e50]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[9px] text-[#dfd8cb] text-center mt-1 line-clamp-1 group-hover:text-white">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pastels & Soft Hues */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Pastels & Fresh Soft Tones
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {COLOR_PALETTES.filter(c => c.category === 'pastels').map(c => {
                    const isSelected = config.color.hex.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        id={`color-swatch-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onChange({ color: c })}
                        className={`group flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-teal-400 bg-[#221319] ring-1 ring-teal-400'
                            : 'border-[#2d2630] bg-[#171518] hover:border-[#4a3e50]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[9px] text-[#dfd8cb] text-center mt-1 line-clamp-1 group-hover:text-white">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atelier Luxury Wine & Neutrals */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  Atelier Luxury Wine & Classic Neutrals
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {COLOR_PALETTES.filter(c => c.category === 'wine_burgundy' || c.category === 'neutrals').map(c => {
                    const isSelected = config.color.hex.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        id={`color-swatch-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onChange({ color: c })}
                        className={`group flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#c9365e] bg-[#221319] ring-1 ring-[#c9365e]'
                            : 'border-[#2d2630] bg-[#171518] hover:border-[#4a3e50]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[9px] text-[#dfd8cb] text-center mt-1 line-clamp-1 group-hover:text-white">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= 5. ATELIER DETAILS (Pockets, Closures, Monogram) ================= */}
        {activeSection === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Pockets */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                Pocket Placement
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'none', label: 'No Pockets', desc: 'Minimalist sleek uninterrupted profile' },
                  { id: 'chest', label: 'Chest Welt Pocket', desc: 'Single tailored left chest pocket' },
                  { id: 'side', label: 'Side Seam Pockets', desc: 'Concealed slash hip pockets' },
                  { id: 'front', label: 'Dual Front Patches', desc: 'Workwear or classic patch pockets' },
                  { id: 'multiple', label: 'Multiple Utility', desc: 'Chest welt + dual lower pockets' }
                ].map(p => {
                  const isSelected = config.pockets === p.id;
                  return (
                    <button
                      key={p.id}
                      id={`pocket-option-${p.id}`}
                      onClick={() => onChange({ pockets: p.id as PocketType })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] text-white'
                          : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#fbf9f6]">{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                      </div>
                      <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Closures */}
            <div className="space-y-3 pt-4 border-t border-[#241f27]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                Closure Fastenings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'buttons', label: 'Mother-of-Pearl Buttons', desc: 'Classic center front placket' },
                  { id: 'zipper', label: 'Tailored Metal Zipper', desc: 'YKK brass slider & teeth' },
                  { id: 'snap_buttons', label: 'Press Snap Studs', desc: 'Brushed gunmetal snaps' },
                  { id: 'tie', label: 'Wrap & Tie Ribbon', desc: 'Flowing sash knot closure' },
                  { id: 'hook_eye', label: 'Hook & Eye Fasteners', desc: 'Invisible couture closure' }
                ].map(c => {
                  const isSelected = config.closure === c.id;
                  return (
                    <button
                      key={c.id}
                      id={`closure-option-${c.id}`}
                      onClick={() => onChange({ closure: c.id as ClosureType })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] text-white'
                          : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#fbf9f6]">{c.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                      </div>
                      <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{c.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stitching & Lining */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#241f27]">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Seam Stitching
                </h4>
                <div className="flex gap-2">
                  {[
                    { id: 'matching', label: 'Tone-on-Tone' },
                    { id: 'contrast', label: 'Contrast Topstitch' },
                    { id: 'reinforced', label: 'Double French Seam' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => onChange({ details: { ...config.details, stitching: st.id as any } })}
                      className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-medium border transition-colors ${
                        config.details?.stitching === st.id
                          ? 'bg-[#7a152d] text-white border-[#c9365e]'
                          : 'bg-[#171518] text-[#8c8588] border-[#2d2630] hover:text-[#fbf9f6]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Garment Lining
                </h4>
                <div className="flex gap-2">
                  {[
                    { id: 'unlined', label: 'Unlined (Light)' },
                    { id: 'half', label: 'Half Bemberg' },
                    { id: 'full', label: 'Full Cupro Lining' }
                  ].map(li => (
                    <button
                      key={li.id}
                      onClick={() => onChange({ details: { ...config.details, lining: li.id as any } })}
                      className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-medium border transition-colors ${
                        config.details?.lining === li.id
                          ? 'bg-[#7a152d] text-white border-[#c9365e]'
                          : 'bg-[#171518] text-[#8c8588] border-[#2d2630] hover:text-[#fbf9f6]'
                      }`}
                    >
                      {li.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Button & Hardware Material */}
            <div className="space-y-3 pt-4 border-t border-[#241f27]">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Button & Hardware Craftsmanship
                </h4>
                <p className="text-[11px] text-[#8c8588]">Finishing fasteners sourced from heritage European ateliers.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'pearl', label: 'Mother-of-Pearl', desc: 'Luminous natural trocas shell' },
                  { id: 'horn', label: 'Dark Buffalo Horn', desc: 'Matte marbled genuine horn' },
                  { id: 'brass', label: 'Antique Brass', desc: 'Solid brass with hand-brushed patina' },
                  { id: 'onyx', label: 'Smoked Onyx', desc: 'Glossy pitch-black resin' },
                  { id: 'silk', label: 'Silk Self-Covered', desc: 'Matching fabric wrapped dome buttons' }
                ].map(bMat => {
                  const isSelected = (config.details?.buttonMaterial || 'pearl') === bMat.id;
                  return (
                    <button
                      key={bMat.id}
                      onClick={() => onChange({ details: { ...config.details, buttonMaterial: bMat.id as any } })}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#c9365e] bg-[#24131b] text-white ring-1 ring-[#c9365e]'
                          : 'border-[#2d2630] bg-[#171518] text-[#8c8588] hover:text-[#fbf9f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#fbf9f6]">{bMat.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#c9365e]" />}
                      </div>
                      <p className="text-[10px] text-[#8c8588] mt-0.5 leading-snug">{bMat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bespoke Monogram / Initials */}
            <div className="space-y-3 pt-4 border-t border-[#241f27]">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fbf9f6]">
                  Personal Monogram Embroidery (+₹250)
                </h4>
                <p className="text-[11px] text-[#8c8588]">Add your initials delicately hand-embroidered by atelier needleworkers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#8c8588] block mb-1">Initials (1-4 letters)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={config.details?.monogramText || ''}
                    onChange={(e) => onChange({ details: { ...config.details, monogramText: e.target.value } })}
                    placeholder="e.g. CFA"
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] uppercase tracking-widest focus:outline-none focus:border-[#c9365e]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8c8588] block mb-1">Placement</label>
                  <select
                    value={config.details?.monogramPlacement || 'cuff'}
                    onChange={(e) => onChange({ details: { ...config.details, monogramPlacement: e.target.value as any } })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  >
                    <option value="cuff">Left Sleeve Cuff</option>
                    <option value="chest">Inside Chest Flap</option>
                    <option value="hem">Lower Waist Hem</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#8c8588] block mb-1">Thread Color</label>
                  <select
                    value={config.details?.monogramColor || '#f0ece1'}
                    onChange={(e) => onChange({ details: { ...config.details, monogramColor: e.target.value } })}
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  >
                    <option value="#f0ece1">Champagne Gold</option>
                    <option value="#7a152d">Imperial Wine</option>
                    <option value="#121214">Jet Midnight</option>
                    <option value="#ffffff">Pure Pearl White</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
