/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, fetchUserDesigns, fetchUserOrders, saveDesignToFirestore, deleteDesignFromDb } from './lib/firebase';
import { CustomGarmentConfig, OrderRecord, BodyMeasurements } from './types/garment';
import { DEFAULT_GARMENT_CONFIG, DEFAULT_MEASUREMENTS } from './lib/garmentData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CustomizerStudio } from './components/customizer/CustomizerStudio';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { MeasurementsModal } from './components/modals/MeasurementsModal';
import { OccasionModal } from './components/modals/OccasionModal';
import { TechPackModal } from './components/modals/TechPackModal';
import { AuthModal } from './components/modals/AuthModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { BargainModal } from './components/modals/BargainModal';
import { ThreeDFittingRoomModal } from './components/customizer/3d/ThreeDFittingRoomModal';
import { NegotiatedDiscount } from './types/garment';
import { AtelierThemeId, ATELIER_THEMES } from './types/theme';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'customizer' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);

  // Background Atmosphere Theme state
  const [currentTheme, setCurrentTheme] = useState<AtelierThemeId>(() => {
    try {
      const saved = localStorage.getItem('customfit_atelier_theme') as AtelierThemeId;
      if (saved && ATELIER_THEMES[saved]) return saved;
    } catch (e) {
      // fallback
    }
    return 'bordeaux';
  });

  const handleSelectTheme = (themeId: AtelierThemeId) => {
    setCurrentTheme(themeId);
    try {
      localStorage.setItem('customfit_atelier_theme', themeId);
    } catch (e) {}
    showToast(`Atmosphere set to ${ATELIER_THEMES[themeId].name}`);
  };

  // Active Garment Design in Customizer
  const [currentConfig, setCurrentConfig] = useState<CustomGarmentConfig>({ ...DEFAULT_GARMENT_CONFIG });

  // User Saved Designs & Orders
  const [savedDesigns, setSavedDesigns] = useState<CustomGarmentConfig[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [cart, setCart] = useState<CustomGarmentConfig[]>([]);

  // Modals state
  const [measurementsModalOpen, setMeasurementsModalOpen] = useState(false);
  const [occasionModalOpen, setOccasionModalOpen] = useState(false);
  const [techPackModalOpen, setTechPackModalOpen] = useState(false);
  const [techPackTargetConfig, setTechPackTargetConfig] = useState<CustomGarmentConfig>(currentConfig);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [bargainTargetConfig, setBargainTargetConfig] = useState<CustomGarmentConfig>(currentConfig);
  const [bargainCallback, setBargainCallback] = useState<((discount: NegotiatedDiscount) => void) | null>(null);
  const [fittingRoomModalOpen, setFittingRoomModalOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await loadUserData(firebaseUser?.uid);
    });
    return () => unsubscribe();
  }, []);

  // Initial load of local or user data
  useEffect(() => {
    loadUserData();
    // Load cart from localStorage
    try {
      const savedCart = localStorage.getItem('customfit_local_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Cart load warning', e);
    }
  }, []);

  const loadUserData = async (uid?: string) => {
    try {
      const userDesigns = await fetchUserDesigns(uid);
      setSavedDesigns(userDesigns);
      const userOrders = await fetchUserOrders(uid);
      setOrders(userOrders);
    } catch (err) {
      console.warn('Error loading user data', err);
    }
  };

  const handleUpdateConfig = (updates: Partial<CustomGarmentConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      ...updates,
      details: {
        ...prev.details,
        ...(updates.details || {})
      },
      measurements: {
        ...prev.measurements,
        ...(updates.measurements || {})
      }
    }));
  };

  // Start new blank design
  const handleStartNewDesign = () => {
    setCurrentConfig({
      ...DEFAULT_GARMENT_CONFIG,
      id: 'design_' + Date.now(),
      createdAt: new Date().toISOString()
    });
    setCurrentTab('customizer');
  };

  // Load curated inspiration design
  const handleSelectCuratedDesign = (partial: Partial<CustomGarmentConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      ...partial,
      id: 'design_' + Date.now(),
      createdAt: new Date().toISOString()
    }));
    setCurrentTab('customizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save current design to Firestore & localStorage
  const handleSaveDesign = async () => {
    const designId = await saveDesignToFirestore(currentConfig, user?.uid);
    showToast('Bespoke design saved to your atelier collection.');
    await loadUserData(user?.uid);
  };

  // Duplicate an existing design
  const handleDuplicateDesign = async (design: CustomGarmentConfig) => {
    const copy: CustomGarmentConfig = {
      ...design,
      id: 'design_' + Date.now(),
      title: `${design.title || 'Custom Garment'} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDesignToFirestore(copy, user?.uid);
    await loadUserData(user?.uid);
    showToast('Design duplicated successfully.');
  };

  // Delete design
  const handleDeleteDesign = async (id: string) => {
    await deleteDesignFromDb(id);
    await loadUserData(user?.uid);
    showToast('Design removed from atelier.');
  };

  // Add to Shopping Bag
  const handleAddToCart = () => {
    const updated = [...cart, { ...currentConfig, id: 'item_' + Date.now() }];
    setCart(updated);
    try {
      localStorage.setItem('customfit_local_cart', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showToast('Garment added to your atelier shopping bag.');
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    try {
      localStorage.setItem('customfit_local_cart', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Checkout handlers
  const handleProceedCheckout = (targetConfig?: CustomGarmentConfig) => {
    if (targetConfig) {
      setCurrentConfig(targetConfig);
    }
    setCheckoutModalOpen(true);
  };

  // Bargaining Chamber handlers
  const handleOpenBargain = (target?: CustomGarmentConfig, onDealCallback?: (discount: NegotiatedDiscount) => void) => {
    const chosen = target || currentConfig;
    setBargainTargetConfig(chosen);
    setBargainCallback(onDealCallback ? () => onDealCallback : null);
    setBargainModalOpen(true);
  };

  const handleApplyNegotiatedPrice = (discount: NegotiatedDiscount) => {
    if (bargainCallback) {
      bargainCallback(discount);
    }

    if (!bargainCallback || bargainTargetConfig.id === currentConfig.id) {
      setCurrentConfig(prev => ({
        ...prev,
        negotiatedDiscount: discount
      }));
    }

    // Also reflect in cart items if matching
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === bargainTargetConfig.id) {
          return { ...item, negotiatedDiscount: discount };
        }
        return item;
      });
      try {
        localStorage.setItem('customfit_local_cart', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    showToast(`🤝 Handshake sealed! Concession applied: -₹${discount.savings} (${discount.percentage}% off)`);
  };

  const handleResetBargain = () => {
    setCurrentConfig(prev => {
      const next = { ...prev };
      delete next.negotiatedDiscount;
      return next;
    });
    showToast('Negotiation reset to standard atelier pricing.');
  };

  const handleOrderCompleted = async (order: OrderRecord) => {
    await loadUserData(user?.uid);
    // Remove completed item from cart if it matched
    const updatedCart = cart.filter(c => c.id !== order.designConfig.id);
    setCart(updatedCart);
    localStorage.setItem('customfit_local_cart', JSON.stringify(updatedCart));
    showToast(`Order ${order.id} confirmed! Master tailor cutting assigned.`);
  };

  // Tech Pack open
  const handleOpenTechPack = (target?: CustomGarmentConfig) => {
    setTechPackTargetConfig(target || currentConfig);
    setTechPackModalOpen(true);
  };

  // Measurement updates
  const handleSaveMeasurements = (measurements: BodyMeasurements) => {
    handleUpdateConfig({ measurements, size: 'Custom' });
    showToast('Custom measurement profile applied to garment geometry.');
  };

  const activeTheme = ATELIER_THEMES[currentTheme] || ATELIER_THEMES.bordeaux;

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} text-[#fbf9f6] flex flex-col font-sans-fashion selection:bg-[#7a152d] selection:text-white relative transition-colors duration-700`}>
      
      {/* Subtle Atelier Silk Jacquard Texture Overlay */}
      <div className="fixed inset-0 atelier-silk-weave-overlay pointer-events-none opacity-45 z-0" />

      {/* Colorful, radiant ambient background glows */}
      <div className={`fixed -top-20 left-1/4 w-[560px] h-[560px] ${activeTheme.orb1} blur-[120px] pointer-events-none opacity-70 z-0 animate-glow-slow`} />
      <div className={`fixed top-1/4 -right-16 w-[500px] h-[500px] ${activeTheme.orb2} blur-[130px] pointer-events-none opacity-60 z-0 animate-glow-alt`} />
      <div className={`fixed bottom-10 -left-16 w-[480px] h-[480px] ${activeTheme.orb3} blur-[120px] pointer-events-none opacity-55 z-0 animate-glow-slow`} />
      <div className={`fixed bottom-1/4 right-1/4 w-[420px] h-[420px] ${activeTheme.orb4} blur-[110px] pointer-events-none opacity-50 z-0 animate-glow-alt`} />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1820]/95 backdrop-blur-md text-[#fbf9f6] px-5 py-3 rounded-2xl border border-[#7a152d]/80 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c9365e] animate-ping" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cart.length}
        savedCount={savedDesigns.length}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onStartNewDesign={handleStartNewDesign}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && (
          <LandingPage
            onStartCustomizing={() => {
              setCurrentTab('customizer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCuratedDesign={handleSelectCuratedDesign}
            onQuickOrder={(partial) => {
              const fullConfig: CustomGarmentConfig = {
                ...DEFAULT_GARMENT_CONFIG,
                ...partial,
                id: 'order_' + Date.now(),
                createdAt: new Date().toISOString()
              };
              setCurrentConfig(fullConfig);
              setCheckoutModalOpen(true);
            }}
            onOpenLogin={() => setAuthModalOpen(true)}
            currentTheme={currentTheme}
            onSelectTheme={handleSelectTheme}
          />
        )}

        {currentTab === 'customizer' && (
          <CustomizerStudio
            config={currentConfig}
            onChangeConfig={handleUpdateConfig}
            onSaveDesign={handleSaveDesign}
            onAddToCart={handleAddToCart}
            onProceedCheckout={() => handleProceedCheckout(currentConfig)}
            onOpenTechPack={() => handleOpenTechPack(currentConfig)}
            onOpenMeasurementsModal={() => setMeasurementsModalOpen(true)}
            onOpenOccasionModal={() => setOccasionModalOpen(true)}
            onOpenBargainModal={() => handleOpenBargain(currentConfig)}
            onOpen3DFittingRoom={() => setFittingRoomModalOpen(true)}
            onBackToHome={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboard
            user={user}
            savedDesigns={savedDesigns}
            orders={orders}
            currentMeasurements={currentConfig.measurements}
            onOpenDesign={(design) => {
              setCurrentConfig(design);
              setCurrentTab('customizer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDuplicateDesign={handleDuplicateDesign}
            onDeleteDesign={handleDeleteDesign}
            onOpenTechPack={handleOpenTechPack}
            onOpenMeasurementsModal={() => setMeasurementsModalOpen(true)}
            onStartNewDesign={handleStartNewDesign}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectGarment={(type) => {
          setCurrentConfig(prev => ({
            ...prev,
            garmentType: type,
            title: `Custom ${type.charAt(0).toUpperCase() + type.slice(1)}`
          }));
          setCurrentTab('customizer');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateTab={(tab) => {
          setCurrentTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ================= MODALS ================= */}

      {/* 1. Bespoke Measurements Modal */}
      <MeasurementsModal
        isOpen={measurementsModalOpen}
        onClose={() => setMeasurementsModalOpen(false)}
        measurements={currentConfig.measurements}
        onSave={handleSaveMeasurements}
      />

      {/* 2. Occasion & Climate Context Modal */}
      <OccasionModal
        isOpen={occasionModalOpen}
        onClose={() => setOccasionModalOpen(false)}
        config={currentConfig}
        onSave={handleUpdateConfig}
      />

      {/* 3. Tech Pack Specification Modal */}
      <TechPackModal
        isOpen={techPackModalOpen}
        onClose={() => setTechPackModalOpen(false)}
        config={techPackTargetConfig}
      />

      {/* 4. Client Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Welcome to your CustomFit Atelier Portal.');
          loadUserData(auth.currentUser?.uid);
        }}
      />

      {/* 5. Bespoke Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        config={currentConfig}
        user={user}
        onOrderCompleted={handleOrderCompleted}
        onOpenBargainModal={(target) => {
          handleOpenBargain(target || currentConfig, (discount) => {
            setCurrentConfig(prev => ({ ...prev, negotiatedDiscount: discount }));
          });
        }}
        onApplyNegotiatedPrice={(discount) => {
          setCurrentConfig(prev => ({ ...prev, negotiatedDiscount: discount }));
        }}
        onResetBargain={handleResetBargain}
      />

      {/* 6. Shopping Bag Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckoutItem={(item) => handleProceedCheckout(item)}
        onOpenItemInCustomizer={(item) => {
          setCurrentConfig(item);
          setCurrentTab('customizer');
        }}
        onUpdateCartItem={(index, updates) => {
          setCart(prev => {
            const updated = prev.map((c, i) => i === index ? { ...c, ...updates } : c);
            try {
              localStorage.setItem('customfit_local_cart', JSON.stringify(updated));
            } catch (e) {
              // ignore
            }
            return updated;
          });
        }}
        onOpenBargainModal={(item) => {
          handleOpenBargain(item, (discount) => {
            setCart(prev => {
              const updated = prev.map(c => c.id === item.id ? { ...c, negotiatedDiscount: discount } : c);
              try {
                localStorage.setItem('customfit_local_cart', JSON.stringify(updated));
              } catch (e) {
                // ignore
              }
              return updated;
            });
          });
        }}
      />

      {/* 7. Master Tailor Bargaining Chamber Modal */}
      <BargainModal
        isOpen={bargainModalOpen}
        onClose={() => {
          setBargainModalOpen(false);
          setBargainCallback(null);
        }}
        config={bargainTargetConfig}
        onApplyNegotiatedPrice={handleApplyNegotiatedPrice}
      />

      {/* 8. 3D Virtual Fitting Room Salon Modal */}
      <ThreeDFittingRoomModal
        isOpen={fittingRoomModalOpen}
        onClose={() => setFittingRoomModalOpen(false)}
        config={currentConfig}
        onUpdateConfig={handleUpdateConfig}
      />

    </div>
  );
}
