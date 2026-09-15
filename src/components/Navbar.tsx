import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Bookmark, User as UserIcon, LogOut, ChevronDown, Menu, X, Scissors } from 'lucide-react';
import { auth, logoutUser } from '../lib/firebase';
import { User } from 'firebase/auth';
import { AtelierThemeId, ATELIER_THEMES } from '../types/theme';
import { AtmosphereSelector } from './common/AtmosphereSelector';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartCount: number;
  savedCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onStartNewDesign: () => void;
  currentTheme: AtelierThemeId;
  onSelectTheme: (theme: AtelierThemeId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  savedCount,
  user,
  onOpenAuth,
  onOpenCart,
  onStartNewDesign,
  currentTheme,
  onSelectTheme
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black/45 backdrop-blur-2xl border-b border-white/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            id="brand-logo" 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7a152d] via-[#9e1d3d] to-[#450c18] flex items-center justify-center text-[#fbf9f6] shadow-lg shadow-[#7a152d]/25 group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-fashion text-2xl font-bold tracking-widest text-[#fbf9f6] uppercase flex items-center gap-1">
                CustomFit <span className="text-[#c9365e] text-xs font-sans-fashion tracking-normal px-1.5 py-0.5 rounded bg-[#450c18]/80 border border-[#7a152d]/40">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c8588]">
                Bespoke Atelier Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              id="nav-link-home"
              onClick={() => setCurrentTab('home')}
              className={`text-sm tracking-wider uppercase transition-colors duration-200 ${
                currentTab === 'home' ? 'text-[#c9365e] font-semibold' : 'text-[#dfd8cb] hover:text-[#fbf9f6]'
              }`}
            >
              Atelier
            </button>

            <button
              id="nav-link-customizer"
              onClick={() => setCurrentTab('customizer')}
              className={`text-sm tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200 ${
                currentTab === 'customizer' ? 'text-[#c9365e] font-semibold' : 'text-[#dfd8cb] hover:text-[#fbf9f6]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#c9365e]" />
              Customizer Studio
            </button>

            <button
              id="nav-link-gallery"
              onClick={() => {
                setCurrentTab('home');
                setTimeout(() => {
                  document.getElementById('explore-designs-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-sm tracking-wider uppercase text-[#dfd8cb] hover:text-[#fbf9f6] transition-colors duration-200"
            >
              Explore Silhouettes
            </button>

            <button
              id="nav-link-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`text-sm tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200 ${
                currentTab === 'dashboard' ? 'text-[#c9365e] font-semibold' : 'text-[#dfd8cb] hover:text-[#fbf9f6]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved Designs
              {savedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#7a152d] text-xs text-[#fbf9f6] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {/* Start New CTA button */}
            <button
              id="header-start-customize-btn"
              onClick={() => {
                onStartNewDesign();
                setCurrentTab('customizer');
              }}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-[#9e1d3d]/25 transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Design A Garment
            </button>

            {/* Atmosphere Quick Swatches & Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
              {/* Quick Dots on larger screens */}
              <div className="hidden xl:flex items-center gap-1 px-1.5">
                {(Object.keys(ATELIER_THEMES) as AtelierThemeId[]).slice(0, 5).map((themeKey) => {
                  const t = ATELIER_THEMES[themeKey];
                  const isSelected = currentTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => onSelectTheme(themeKey)}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 relative ${
                        isSelected 
                          ? 'scale-125 ring-2 ring-white shadow-md' 
                          : 'opacity-60 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{ backgroundColor: t.dotColor }}
                      title={`Atmosphere: ${t.name}`}
                    />
                  );
                })}
              </div>

              <AtmosphereSelector 
                currentTheme={currentTheme} 
                onSelectTheme={onSelectTheme} 
              />
            </div>

            {/* Cart Button */}
            <button
              id="navbar-cart-button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-[#1a171c] hover:bg-[#28232b] text-[#fbf9f6] border border-[#352e39] transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c9365e] text-[#fbf9f6] text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth Control */}
            {user ? (
              <div className="relative">
                <button
                  id="user-menu-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-[#1a171c] border border-[#352e39] text-sm text-[#fbf9f6] hover:bg-[#28232b] transition-colors"
                >
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#7a152d] flex items-center justify-center text-xs font-bold text-white">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#8c8588]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#171518] rounded-2xl border border-[#352e39] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#2a242c]">
                      <p className="text-xs text-[#8c8588]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#fbf9f6] truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#dfd8cb] hover:bg-[#2a242c] flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-[#c9365e]" />
                      My Atelier & Orders
                    </button>

                    <button
                      onClick={async () => {
                        await logoutUser();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 flex items-center gap-2 border-t border-[#2a242c]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="sign-in-nav-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a171c] hover:bg-[#28232b] text-[#fbf9f6] border border-[#352e39] text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#c9365e]" />
                <span className="hidden sm:inline">Client Portal</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#dfd8cb] hover:text-[#fbf9f6]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#2a242c] space-y-3">
            <button
              onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#dfd8cb] hover:bg-[#1a171c]"
            >
              Atelier Home
            </button>
            <button
              onClick={() => { setCurrentTab('customizer'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#c9365e] font-semibold hover:bg-[#1a171c]"
            >
              Customizer Studio
            </button>
            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#dfd8cb] hover:bg-[#1a171c]"
            >
              Saved Designs & Orders ({savedCount})
            </button>
            <div className="pt-2 border-t border-[#2a242c] flex items-center justify-between px-3">
              <span className="text-xs text-[#8c8588]">Background Atmosphere</span>
              <AtmosphereSelector 
                currentTheme={currentTheme} 
                onSelectTheme={onSelectTheme}
                compact
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
