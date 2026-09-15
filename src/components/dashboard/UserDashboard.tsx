import React, { useState } from 'react';
import { 
  Bookmark, 
  Package, 
  Ruler, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Scissors, 
  Sparkles, 
  ChevronRight,
  Handshake,
  Zap
} from 'lucide-react';
import { CustomGarmentConfig, OrderRecord, BodyMeasurements } from '../../types/garment';
import { formatINR, calculateGarmentEstimates } from '../../lib/pricing';
import { deleteDesignFromDb } from '../../lib/firebase';
import { User } from 'firebase/auth';

interface UserDashboardProps {
  user: User | null;
  savedDesigns: CustomGarmentConfig[];
  orders: OrderRecord[];
  onOpenDesign: (design: CustomGarmentConfig) => void;
  onDuplicateDesign: (design: CustomGarmentConfig) => void;
  onDeleteDesign: (id: string) => void;
  onOpenTechPack: (design: CustomGarmentConfig) => void;
  onOpenMeasurementsModal: () => void;
  onStartNewDesign: () => void;
  currentMeasurements: BodyMeasurements;
}

const ORDER_STEPS = [
  { id: 'submitted', label: 'Order Received' },
  { id: 'cutting', label: 'Laser Cutting' },
  { id: 'tailoring', label: 'Atelier Stitching' },
  { id: 'quality_check', label: 'Quality Check' },
  { id: 'dispatched', label: 'Dispatched' },
  { id: 'delivered', label: 'Delivered' }
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  savedDesigns,
  orders,
  onOpenDesign,
  onDuplicateDesign,
  onDeleteDesign,
  onOpenTechPack,
  onOpenMeasurementsModal,
  onStartNewDesign,
  currentMeasurements
}) => {
  const [activeTab, setActiveTab] = useState<'designs' | 'orders' | 'measurements'>('designs');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Top Hero */}
      <div className="bg-gradient-to-r from-[#17131a] via-[#1f1620] to-[#17131a] p-8 rounded-3xl border border-[#352a38] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#c9365e] font-semibold">
              Client Atelier Workspace
            </span>
          </div>
          <h1 className="font-serif-fashion text-3xl sm:text-4xl font-bold text-[#fbf9f6] tracking-tight">
            {user ? `${user.displayName || user.email?.split('@')[0]}'s Atelier` : 'Guest Bespoke Atelier'}
          </h1>
          <p className="text-xs sm:text-sm text-[#dfd8cb]/80 max-w-xl leading-relaxed">
            Manage your personalized designs, production tech-packs, anatomical measurement profiles, and active garment commissions.
          </p>
        </div>

        <button
          onClick={onStartNewDesign}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider shadow-lg shadow-[#7a152d]/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Garment Design</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#29222c] space-x-8 text-sm">
        <button
          onClick={() => setActiveTab('designs')}
          className={`pb-3 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'designs'
              ? 'border-[#c9365e] text-[#fbf9f6]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#c9365e]" />
          Saved Silhouettes ({savedDesigns.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-[#c9365e] text-[#fbf9f6]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Package className="w-4 h-4 text-[#c9365e]" />
          Commissioned Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`pb-3 font-semibold uppercase tracking-wider text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'measurements'
              ? 'border-[#c9365e] text-[#fbf9f6]'
              : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
          }`}
        >
          <Ruler className="w-4 h-4 text-[#c9365e]" />
          Measurement Profiles
        </button>
      </div>

      {/* ================= TAB 1: SAVED DESIGNS ================= */}
      {activeTab === 'designs' && (
        <div className="space-y-6">
          {savedDesigns.length === 0 ? (
            <div className="text-center py-20 bg-[#141215] rounded-3xl border border-[#2b252d] space-y-4">
              <Bookmark className="w-12 h-12 text-[#4d4452] mx-auto stroke-1" />
              <h3 className="font-serif-fashion text-2xl font-bold text-[#fbf9f6]">No Saved Designs Yet</h3>
              <p className="text-xs text-[#8c8588] max-w-sm mx-auto leading-relaxed">
                Configure your unique garment in the Customizer Studio and tap "Save Design" to store your bespoke blueprints here.
              </p>
              <button
                onClick={onStartNewDesign}
                className="px-6 py-2.5 rounded-full bg-[#7a152d] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider hover:bg-[#9e1d3d] transition-colors"
              >
                Launch Customizer Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDesigns.map((design) => {
                const est = calculateGarmentEstimates(design);
                return (
                  <div
                    key={design.id}
                    className="bg-[#141215] rounded-2xl border border-[#2d2630] overflow-hidden shadow-xl hover:border-[#4d3c52] transition-all flex flex-col justify-between"
                  >
                    {/* Visual Card Banner */}
                    <div 
                      className="h-32 relative flex items-center justify-center p-4"
                      style={{
                        background: `linear-gradient(135deg, ${design.color.hex}88 0%, #171319 100%)`
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-2xl border border-white/30 shadow-2xl flex items-center justify-center"
                        style={{ backgroundColor: design.color.hex }}
                      >
                        <Scissors className="w-7 h-7 text-white drop-shadow" />
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => onDuplicateDesign(design)}
                          className="p-1.5 rounded-lg bg-black/50 text-[#dfd8cb] hover:text-[#fbf9f6] transition-colors"
                          title="Duplicate Design"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDesign(design.id!)}
                          className="p-1.5 rounded-lg bg-black/50 text-[#dfd8cb] hover:text-red-400 transition-colors"
                          title="Delete Design"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-[#dfd8cb]">
                          {design.garmentType}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif-fashion text-lg font-bold text-[#fbf9f6]">
                          {design.title || `Custom ${design.garmentType}`}
                        </h4>
                        <p className="text-xs text-[#dfd8cb]/80 mt-1">
                          {design.fabric} weave • {design.color.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8c8588]">
                          <span>Fit: <strong className="text-[#dfd8cb]">{design.fit}</strong></span>
                          <span>•</span>
                          <span>Size: <strong className="text-[#dfd8cb]">{design.size}</strong></span>
                          <span>•</span>
                          <span>Sleeve: <strong className="text-[#dfd8cb]">{design.sleeve}</strong></span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#252028] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase text-[#8c8588] block">Price Estimate</span>
                          <span className="font-serif-fashion text-lg font-bold text-[#fbf9f6]">
                            {formatINR(est.priceINR)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenTechPack(design)}
                            className="p-2 rounded-xl bg-[#1d1920] hover:bg-[#28222d] text-[#dfd8cb] text-xs border border-[#332b38] transition-colors"
                            title="View Tech Pack"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenDesign(design)}
                            className="px-3.5 py-2 rounded-xl bg-[#7a152d] hover:bg-[#9e1d3d] text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <span>Open in Studio</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: COMMISSIONED ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-[#141215] rounded-3xl border border-[#2b252d] space-y-4">
              <Package className="w-12 h-12 text-[#4d4452] mx-auto stroke-1" />
              <h3 className="font-serif-fashion text-2xl font-bold text-[#fbf9f6]">No Active Commissions</h3>
              <p className="text-xs text-[#8c8588] max-w-sm mx-auto leading-relaxed">
                When you commission a custom-fitted garment, real-time tailoring progress and logistics tracking will appear here.
              </p>
              <button
                onClick={onStartNewDesign}
                className="px-6 py-2.5 rounded-full bg-[#7a152d] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider hover:bg-[#9e1d3d] transition-colors"
              >
                Design Your First Garment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStepIdx = ORDER_STEPS.findIndex(s => s.id === order.status);
                const activeIdx = currentStepIdx === -1 ? 1 : currentStepIdx;

                return (
                  <div 
                    key={order.id}
                    className="bg-[#141215] rounded-2xl border border-[#2d2630] p-6 space-y-6 shadow-xl"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#252028] gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#c9365e] px-2.5 py-1 rounded bg-[#7a152d]/20 border border-[#7a152d]/40">
                            {order.id}
                          </span>
                          {order.deliveryTier === 'instant' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded">
                              <Zap className="w-3 h-3 text-amber-400" />
                              ⚡ Instant Priority
                            </span>
                          )}
                          {order.deliveryTier === 'express' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/40 px-2 py-0.5 rounded">
                              Express Priority
                            </span>
                          )}
                          <span className="text-xs text-[#8c8588]">
                            Commissioned on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] mt-1.5">
                          {order.designConfig.title || `Custom ${order.designConfig.garmentType}`}
                        </h4>
                        {order.designConfig.negotiatedDiscount && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/50 text-[11px] font-bold text-emerald-400">
                              <Handshake className="w-3.5 h-3.5" />
                              Handshake Deal ({order.designConfig.negotiatedDiscount.dealCode}): Saved {formatINR(order.designConfig.negotiatedDiscount.savings)} ({order.designConfig.negotiatedDiscount.percentage}% off)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#8c8588] block">Total Commission</span>
                        <span className="font-serif-fashion text-2xl font-bold text-[#fbf9f6]">
                          {formatINR(order.totalPriceINR)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase tracking-wider text-[#8c8588] text-[11px] font-semibold">
                          Production Timeline Status:
                        </span>
                        <span className="text-[#c9365e] font-bold">
                          {ORDER_STEPS[activeIdx]?.label}
                        </span>
                      </div>

                      {/* 6 Step Nodes */}
                      <div className="grid grid-cols-6 gap-2">
                        {ORDER_STEPS.map((stepNode, idx) => {
                          const isDone = idx <= activeIdx;
                          const isCurrent = idx === activeIdx;
                          return (
                            <div key={stepNode.id} className="space-y-1.5 text-center">
                              <div className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-gradient-to-r from-[#7a152d] to-[#c9365e]' : 'bg-[#252028]'
                              } ${isCurrent ? 'ring-2 ring-[#c9365e]/50 animate-pulse' : ''}`} />
                              <span className={`text-[10px] block leading-tight ${
                                isCurrent ? 'text-[#fbf9f6] font-bold' : (isDone ? 'text-[#dfd8cb]' : 'text-[#8c8588]')
                              }`}>
                                {stepNode.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Details Footer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#252028] text-xs text-[#dfd8cb]">
                      <div>
                        <span className="text-[10px] uppercase text-[#8c8588] block">Delivery Recipient</span>
                        <p className="font-semibold text-[#fbf9f6] mt-0.5">{order.shippingAddress.fullName}</p>
                        <p className="text-[11px] text-[#8c8588]">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#8c8588] block">Production Estimate</span>
                        <p className="font-semibold text-[#fbf9f6] mt-0.5">{order.productionDaysEstimate}</p>
                        <p className="text-[11px] text-[#8c8588]">Master Tailor Assignment active</p>
                      </div>

                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        <button
                          onClick={() => onOpenTechPack(order.designConfig)}
                          className="px-3.5 py-2 rounded-xl bg-[#1b171e] hover:bg-[#252028] text-[#dfd8cb] border border-[#332b38] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Tech Pack</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: MEASUREMENT PROFILES ================= */}
      {activeTab === 'measurements' && (
        <div className="space-y-6">
          <div className="bg-[#141215] rounded-3xl border border-[#2d2630] p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#252028] pb-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#c9365e] font-semibold">Active Biometric Profile</span>
                <h3 className="font-serif-fashion text-2xl font-bold text-[#fbf9f6] mt-1">
                  Master Tailor Pattern Grading Dimensions
                </h3>
                <p className="text-xs text-[#8c8588] mt-1">
                  Units: {currentMeasurements.unit || 'cm'} • Used across all bespoke garment cuts
                </p>
              </div>

              <button
                onClick={onOpenMeasurementsModal}
                className="px-5 py-2.5 rounded-xl bg-[#7a152d] hover:bg-[#9e1d3d] text-[#fbf9f6] text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Measurements</span>
              </button>
            </div>

            {/* Dimensional Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-[#19151c] border border-[#2d2630]">
                <span className="text-[11px] text-[#8c8588] block">Chest / Bust</span>
                <span className="font-mono text-lg font-bold text-[#fbf9f6] mt-1 block">
                  {currentMeasurements.chest} {currentMeasurements.unit || 'cm'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#19151c] border border-[#2d2630]">
                <span className="text-[11px] text-[#8c8588] block">Natural Waist</span>
                <span className="font-mono text-lg font-bold text-[#fbf9f6] mt-1 block">
                  {currentMeasurements.waist} {currentMeasurements.unit || 'cm'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#19151c] border border-[#2d2630]">
                <span className="text-[11px] text-[#8c8588] block">Full Hip</span>
                <span className="font-mono text-lg font-bold text-[#fbf9f6] mt-1 block">
                  {currentMeasurements.hip} {currentMeasurements.unit || 'cm'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#19151c] border border-[#2d2630]">
                <span className="text-[11px] text-[#8c8588] block">Shoulder Width</span>
                <span className="font-mono text-lg font-bold text-[#fbf9f6] mt-1 block">
                  {currentMeasurements.shoulder} {currentMeasurements.unit || 'cm'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#19151c] border border-[#2d2630]">
                <span className="text-[11px] text-[#8c8588] block">Arm / Sleeve</span>
                <span className="font-mono text-lg font-bold text-[#fbf9f6] mt-1 block">
                  {currentMeasurements.armLength} {currentMeasurements.unit || 'cm'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a131b] border border-[#7a152d]/40 text-xs text-[#dfd8cb] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#c9365e] flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-[#fbf9f6]">Bespoke Machine Calibration</h5>
                <p className="text-[11px] text-[#8c8588] mt-0.5 leading-relaxed">
                  Your biometric dimensions are transformed into vector curves via parameterized Bézier equations, accounting for fabric shrinkage and posture tilt.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
