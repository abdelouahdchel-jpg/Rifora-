/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Language, PageView, Inquiry } from './types';
import { fetchPublicProducts, getAuthStatus, logoutOwner, AuthStatusResponse } from './services/api';
import { getStoredProducts } from './services/storage';
import { Header } from './components/Header';
import { PilotBanner } from './components/PilotBanner';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InquiryModal } from './components/InquiryModal';
import { Footer } from './components/Footer';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { AboutView } from './views/AboutView';
import { ShippingView } from './views/ShippingView';
import { ContactView } from './views/ContactView';
import { PrivacyView } from './views/PrivacyView';
import { TermsView } from './views/TermsView';
import { OwnerView } from './views/OwnerView';
import { AdminLoginView } from './views/AdminLoginView';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<PageView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') return 'owner';
    }
    return 'home';
  });
  const [products, setProducts] = useState<Product[]>([]);
  
  // Real Server-Side Owner Authentication State
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse>({
    initialized: false,
    isAuthenticated: false,
    ownerEmail: 'abdelouahdchel@gmail.com',
    currentUser: null,
    requiresSetupSecret: false
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    async function initApp() {
      // 1. Fetch public products from backend (without purchaseCostMAD)
      try {
        const serverProducts = await fetchPublicProducts();
        setProducts(serverProducts);
      } catch {
        setProducts(getStoredProducts());
      }

      // 2. Check server-side auth status
      try {
        const status = await getAuthStatus();
        setAuthStatus(status);
      } catch (err) {
        console.error('Failed to verify session with backend:', err);
      } finally {
        setAuthChecked(true);
      }
    }

    initApp();

    // Listen to browser navigation popstate
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentView('owner');
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'owner') {
        window.history.pushState(null, '', '/admin');
      } else if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleLoginSuccess = (email: string) => {
    setAuthStatus(prev => ({
      ...prev,
      initialized: true,
      isAuthenticated: true,
      currentUser: email
    }));
    setCurrentView('owner');
  };

  const handleLogout = async () => {
    await logoutOwner();
    setAuthStatus(prev => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null
    }));
    handleNavigate('home');
  };

  const handleOpenGeneralInquiry = () => {
    setSelectedProductForInquiry(null);
    setIsInquiryModalOpen(true);
  };

  const handleOpenProductInquiry = (product: Product | null) => {
    setSelectedProductForInquiry(product);
    setIsInquiryModalOpen(true);
  };

  const handleInquiryAdded = (_newInquiry: Inquiry) => {
    // Inquiry recorded
  };

  const handleProductsUpdated = (updated: Product[]) => {
    setProducts(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3] text-[#282421]">
      {/* 1. European Validation Pilot Banner */}
      <PilotBanner
        lang={lang}
        onLearnMore={() => {
          handleNavigate('about');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Top Bar Navigation (Strict 3-Zone Contract) */}
      <Header
        currentView={currentView}
        setCurrentView={handleNavigate}
        lang={lang}
        setLang={setLang}
        onOpenInquiry={handleOpenGeneralInquiry}
      />

      {/* 3. Main Dynamic Content View */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            lang={lang}
            setCurrentView={handleNavigate}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onInquireProduct={handleOpenProductInquiry}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={products}
            lang={lang}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onInquireProduct={handleOpenProductInquiry}
          />
        )}

        {currentView === 'about' && (
          <AboutView lang={lang} />
        )}

        {currentView === 'shipping' && (
          <ShippingView lang={lang} />
        )}

        {currentView === 'contact' && (
          <ContactView products={products} lang={lang} />
        )}

        {currentView === 'privacy' && (
          <PrivacyView lang={lang} />
        )}

        {currentView === 'terms' && (
          <TermsView lang={lang} />
        )}

        {/* Dedicated /admin route: Protected by server authentication */}
        {currentView === 'owner' && (
          authStatus.isAuthenticated ? (
            <OwnerView
              products={products}
              lang={lang}
              onProductsUpdated={handleProductsUpdated}
              currentUserEmail={authStatus.currentUser || authStatus.ownerEmail}
              databaseType={authStatus.databaseType}
              databaseProvider={authStatus.databaseProvider}
              blobStorageConfigured={authStatus.blobStorageConfigured}
              onLogout={handleLogout}
              onBackToStore={() => handleNavigate('home')}
            />
          ) : (
            <AdminLoginView
              lang={lang}
              isInitialized={authStatus.initialized}
              defaultEmail={authStatus.ownerEmail}
              requiresSetupSecret={authStatus.requiresSetupSecret}
              onSuccess={handleLoginSuccess}
              onBackToStore={() => handleNavigate('home')}
            />
          )
        )}
      </main>

      {/* 4. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        lang={lang}
        onClose={() => setSelectedProductForDetail(null)}
        onInquire={(p) => {
          setSelectedProductForDetail(null);
          handleOpenProductInquiry(p);
        }}
      />

      {/* 5. Product Inquiry & Reservation Modal */}
      <InquiryModal
        product={selectedProductForInquiry}
        allProducts={products}
        lang={lang}
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        onInquiryAdded={handleInquiryAdded}
      />

      {/* 6. Direct WhatsApp Button */}
      <FloatingWhatsApp lang={lang} />

      {/* 7. Footer */}
      <Footer
        lang={lang}
        setLang={setLang}
        setCurrentView={handleNavigate}
      />
    </div>
  );
}
