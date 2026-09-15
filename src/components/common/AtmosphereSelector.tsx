import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sparkles, Check, ChevronDown } from 'lucide-react';
import { AtelierThemeId, ATELIER_THEMES } from '../../types/theme';

interface AtmosphereSelectorProps {
  currentTheme: AtelierThemeId;
  onSelectTheme: (themeId: AtelierThemeId) => void;
  compact?: boolean;
}

export const AtmosphereSelector: React.FC<AtmosphereSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTheme = ATELIER_THEMES[currentTheme] || ATELIER_THEMES.bordeaux;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="theme-atmosphere-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-full bg-[#18141b]/90 hover:bg-[#261f2c] border border-[#3b3142] text-[#fbf9f6] transition-all shadow-md ${
          compact ? 'px-2.5' : 'px-3.5'
        }`}
        title="Change Atelier Background Atmosphere"
      >
        <div 
          className="w-3.5 h-3.5 rounded-full ring-2 ring-white/30 flex-shrink-0 animate-pulse"
          style={{ backgroundColor: activeTheme.dotColor }}
        />
        {!compact && (
          <span className="text-xs font-semibold tracking-wide hidden sm:inline text-[#dfd8cb]">
            {activeTheme.name.split(' ')[0]}
          </span>
        )}
        <Palette className="w-3.5 h-3.5 text-[#c9365e]" />
        <ChevronDown className={`w-3.5 h-3.5 text-[#8c8588] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#130f17]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="px-2 py-1.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Atelier Background Atmosphere
              </span>
            </div>
            <span className="text-[10px] text-stone-400">7 Haute Palettes</span>
          </div>

          <div className="space-y-1.5 pt-1 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {(Object.keys(ATELIER_THEMES) as AtelierThemeId[]).map((themeKey) => {
              const theme = ATELIER_THEMES[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    onSelectTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group relative overflow-hidden ${
                    isSelected
                      ? 'bg-white/10 border-rose-500/80 text-white shadow-lg ring-1 ring-rose-500/50'
                      : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.07] text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div 
                      className="w-5 h-5 rounded-full shadow-md flex-shrink-0 ring-2 ring-white/30 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: theme.dotColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold block text-white">
                          {theme.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300 font-mono">
                          {theme.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5 line-clamp-1">
                        {theme.tagline}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-rose-400 flex-shrink-0 relative z-10" />
                  ) : (
                    <div 
                      className="w-2 h-2 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" 
                      style={{ backgroundColor: theme.dotColor }} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 px-2 border-t border-white/10 text-[10px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Luminous Ambient Mesh Active
            </span>
            <span className="text-amber-300 font-medium">Fine Silk Weave</span>
          </div>
        </div>
      )}
    </div>
  );
};
