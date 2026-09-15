import React from 'react';
import { X, Printer, Download, Scissors, ShieldCheck, QrCode, FileText } from 'lucide-react';
import { CustomGarmentConfig } from '../../types/garment';
import { calculateGarmentEstimates, formatINR } from '../../lib/pricing';
import { FABRICS_DATABASE, GARMENT_TYPES } from '../../lib/garmentData';

interface TechPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomGarmentConfig;
}

export const TechPackModal: React.FC<TechPackModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  if (!isOpen) return null;

  const estimates = calculateGarmentEstimates(config);
  const garment = GARMENT_TYPES.find(g => g.id === config.garmentType) || GARMENT_TYPES[0];
  const fabric = FABRICS_DATABASE.find(f => f.id === config.fabric) || FABRICS_DATABASE[0];

  const handlePrint = () => {
    window.print();
  };

  const techPackId = `CAD-SPEC-${(config.id || 'CFA').slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#121013] border border-[#352e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-4 border-b border-[#262029] flex items-center justify-between bg-[#171419] no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7a152d]/30 text-[#c9365e] border border-[#7a152d]/50">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                Atelier Production Tech Pack
              </h3>
              <p className="text-xs text-[#8c8588]">
                Standard master tailoring specification sheet for laser-cutting & hand assembly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="print-allow px-4 py-2 rounded-xl bg-[#7a152d] hover:bg-[#9e1d3d] text-[#fbf9f6] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8c8588] hover:text-[#fbf9f6] hover:bg-[#231e26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tech Pack Sheet Content */}
        <div className="print-page flex-1 overflow-y-auto custom-scrollbar p-8 text-[#dfd8cb] space-y-8 bg-[#121013]">
          
          {/* Header Block */}
          <div className="border-b-2 border-[#7a152d] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-fashion text-2xl font-bold tracking-widest text-[#fbf9f6] uppercase">
                  CustomFit AI Atelier
                </span>
                <span className="px-2 py-0.5 rounded bg-[#450c18] text-[#c9365e] text-[11px] font-mono font-bold border border-[#7a152d]">
                  TECH PACK
                </span>
              </div>
              <p className="text-xs text-[#8c8588] mt-1">Computerized Pattern Grading & Individual Manufacturing Specification</p>
              <p className="text-xs font-mono text-[#c9365e] mt-1">SPEC ID: {techPackId}</p>
            </div>

            <div className="text-right text-xs space-y-1">
              <p><strong className="text-[#fbf9f6]">Date Generated:</strong> {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              <p><strong className="text-[#fbf9f6]">Target Lead Time:</strong> {estimates.productionTimeStr}</p>
              <p><strong className="text-[#fbf9f6]">Base Silhouette:</strong> {garment.name} ({config.garmentType.toUpperCase()})</p>
            </div>
          </div>

          {/* Core Garment Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Structural Architecture */}
            <div className="bg-[#18151b] p-4 rounded-xl border border-[#2b2530] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9365e] border-b border-[#2b2530] pb-1.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" />
                1. Silhouette & Cuts
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-[#8c8588]">Garment Category:</span> <span className="font-semibold text-[#fbf9f6]">{garment.name}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Sizing Mode:</span> <span className="font-semibold text-[#fbf9f6]">{config.size}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Ease / Fit:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.fit}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Hem Length:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.length}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Sleeve Style:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.sleeve.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Neckline / Collar:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.neckline.replace('_', ' ')}</span></div>
              </div>
            </div>

            {/* 2. Textile & Dyes */}
            <div className="bg-[#18151b] p-4 rounded-xl border border-[#2b2530] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9365e] border-b border-[#2b2530] pb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                2. Material Bill of Goods
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-[#8c8588]">Fabric Weave:</span> <span className="font-semibold text-[#fbf9f6]">{fabric.name}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Fabric Weight:</span> <span className="font-semibold text-[#fbf9f6]">{fabric.weight}</span></div>
                <div className="flex justify-between">
                  <span className="text-[#8c8588]">Color Dye:</span> 
                  <span className="font-semibold text-[#fbf9f6] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ backgroundColor: config.color.hex }} />
                    {config.color.name} ({config.color.hex})
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Yield Required:</span> <span className="font-semibold text-[#c9365e]">{estimates.materialMetersStr}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Lining:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.details?.lining || 'unlined'}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Stitching Spec:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.details?.stitching || 'matching'}</span></div>
              </div>
            </div>

            {/* 3. Hardware & Fastenings */}
            <div className="bg-[#18151b] p-4 rounded-xl border border-[#2b2530] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9365e] border-b border-[#2b2530] pb-1.5">
                3. Hardware & Finishing
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-[#8c8588]">Closure Type:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.closure.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Pocket Configuration:</span> <span className="font-semibold text-[#fbf9f6] capitalize">{config.pockets}</span></div>
                <div className="flex justify-between">
                  <span className="text-[#8c8588]">Monogram:</span> 
                  <span className="font-semibold text-[#fbf9f6]">
                    {config.details?.monogramText ? `"${config.details.monogramText}" (${config.details.monogramPlacement})` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Thread Spec:</span> <span className="font-semibold text-[#fbf9f6]">{config.details?.monogramColor || 'Matching Gutermann 100% Cotton'}</span></div>
                <div className="flex justify-between"><span className="text-[#8c8588]">Commercial Value:</span> <span className="font-semibold text-[#c9365e]">{formatINR(estimates.priceINR)}</span></div>
              </div>
            </div>

          </div>

          {/* Anatomical CAD Cutting Measurements Table */}
          <div className="bg-[#18151b] rounded-xl border border-[#2b2530] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2b2530] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9365e]">
                Anatomical Cutting Measurements Matrix
              </h4>
              <span className="text-xs font-mono text-[#8c8588]">Units: {config.measurements.unit || 'cm'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Chest / Bust</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.chest} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Natural Waist</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.waist} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Full Hip</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.hip} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Shoulder Width</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.shoulder} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Sleeve Length</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.armLength} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Neck Circumference</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.neck || 39} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Torso Vertical</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">{config.measurements.torsoLength || 49} {config.measurements.unit || 'cm'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141215] border border-[#262029]">
                <span className="text-[11px] text-[#8c8588] block">Inseam / Outseam</span>
                <span className="font-mono text-sm font-bold text-[#fbf9f6]">
                  {config.measurements.inseam || 78} / {config.measurements.outseam || 102} {config.measurements.unit || 'cm'}
                </span>
              </div>
            </div>
          </div>

          {/* Tailor Sign-Off & Quality Control Footer */}
          <div className="border-t border-[#29222c] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c8588] gap-4">
            <div>
              <p className="font-semibold text-[#fbf9f6]">CustomFit AI Bespoke Engineering Guarantee</p>
              <p className="text-[11px]">Strict laser tolerance of ±0.3cm across all graded seam allowances. Hand inspected prior to shipping.</p>
            </div>
            <div className="border border-[#352e39] px-4 py-2 rounded-lg text-center">
              <span className="text-[10px] uppercase text-[#8c8588] block">Master Tailor Inspection</span>
              <span className="font-serif-fashion italic text-[#fbf9f6] text-sm">Verified & Approved</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
