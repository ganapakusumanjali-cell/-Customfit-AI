import React from 'react';
import { Scissors, ShieldCheck, Sparkles, RefreshCw, Heart, Send } from 'lucide-react';

interface FooterProps {
  onSelectGarment: (type: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectGarment, onNavigateTab }) => {
  return (
    <footer className="bg-[#0b0a0c] border-t border-[#241f26] text-[#8c8588] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-16 border-b border-[#241f26]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1f1b22] text-[#c9365e] border border-[#352e39]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#fbf9f6] text-sm font-semibold tracking-wide">Individual Pattern Drafting</h4>
              <p className="text-xs text-[#8c8588] mt-1 leading-relaxed">Each garment begins with an algorithmic bespoke 2D pattern generated directly from your exact dimensions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1f1b22] text-[#c9365e] border border-[#352e39]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#fbf9f6] text-sm font-semibold tracking-wide">AI Ergonomic Recommendations</h4>
              <p className="text-xs text-[#8c8588] mt-1 leading-relaxed">Neural intelligence factors your climate, skin comfort, and occasion to advise on fabric tension and weave breathability.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1f1b22] text-[#c9365e] border border-[#352e39]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#fbf9f6] text-sm font-semibold tracking-wide">Zero Overproduction Guarantee</h4>
              <p className="text-xs text-[#8c8588] mt-1 leading-relaxed">We manufacture purely on demand. Zero discarded deadstock, organic botanical dyes, and ethically certified ateliers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1f1b22] text-[#c9365e] border border-[#352e39]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#fbf9f6] text-sm font-semibold tracking-wide">Bespoke Fit Guarantee</h4>
              <p className="text-xs text-[#8c8588] mt-1 leading-relaxed">Complimentary local master tailor adjustments or full remake if your garment deviates by more than 0.5 cm.</p>
            </div>
          </div>
        </div>

        {/* Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7a152d] flex items-center justify-center text-[#fbf9f6]">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="font-serif-fashion text-xl font-bold tracking-widest text-[#fbf9f6] uppercase">
                CustomFit AI
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-[#dfd8cb]/80">
              Reinventing modern luxury fashion through generative tailoring and precision ergonomics. Clothes engineered to honor real human diversity, individual proportions, and effortless self-expression.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-widest text-[#c9365e] font-semibold">Atelier Locations</span>
              <p className="text-xs text-[#8c8588] mt-1">Milan • Mumbai • Paris • Tokyo • London</p>
            </div>
          </div>

          {/* Garments Quick Links */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fbf9f6] mb-4">Garment Silhouettes</h5>
            <ul className="space-y-2.5 text-xs">
              {['shirt', 'tshirt', 'blouse', 'dress', 'jacket', 'trousers', 'skirt'].map(type => (
                <li key={type}>
                  <button
                    onClick={() => {
                      onSelectGarment(type);
                      onNavigateTab('customizer');
                    }}
                    className="hover:text-[#fbf9f6] capitalize transition-colors"
                  >
                    Custom {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology & Tech-Pack */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fbf9f6] mb-4">Atelier Engineering</h5>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigateTab('customizer')} className="hover:text-[#fbf9f6] transition-colors">3D Garment Studio</button></li>
              <li><button onClick={() => onNavigateTab('customizer')} className="hover:text-[#fbf9f6] transition-colors">Gemini AI Stylist</button></li>
              <li><button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#fbf9f6] transition-colors">Digital Tech Packs</button></li>
              <li><button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#fbf9f6] transition-colors">Custom Measurement Profiles</button></li>
              <li><span className="text-[#dfd8cb]/60">Fabric Science Matrix</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fbf9f6] mb-4">Private Atelier Dispatch</h5>
            <p className="text-xs text-[#8c8588] mb-3">Seasonal fabric releases, limited-run Italian textiles, and bespoke styling insights.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to CustomFit AI Atelier Dispatches.'); }} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#171518] border border-[#352e39] rounded-xl px-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-[#7a152d] text-[#fbf9f6] hover:bg-[#9e1d3d] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#8c8588]/80">No spam. Private invitations only.</p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#241f26] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c8588] gap-4">
          <p>© {new Date().getFullYear()} CustomFit AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#fbf9f6] cursor-pointer">Privacy Charter</span>
            <span className="hover:text-[#fbf9f6] cursor-pointer">Ethical Sourcing</span>
            <span className="hover:text-[#fbf9f6] cursor-pointer">Master Tailor Network</span>
            <span className="flex items-center gap-1 text-[#dfd8cb]">
              Crafted with <Heart className="w-3.5 h-3.5 text-[#c9365e] inline fill-[#c9365e]" /> for human proportions
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
