/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Language, PageView, Inquiry } from './types';
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

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedProducts = getStoredProducts();
    setProducts(loadedProducts);
  }, []);

  const handleOpenGeneralInquiry = () => {
    setSelectedProductForInquiry(null);
    setIsInquiryModalOpen(true);
  };

  const handleOpenProductInquiry = (product: Product | null) => {
    setSelectedProductForInquiry(product);
    setIsInquiryModalOpen(true);
  };

  const handleInquiryAdded = (_newInquiry: Inquiry) => {
    // Inquiry recorded in local storage
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
          setCurrentView('about');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Top Bar Navigation (Strict 3-Zone Contract) */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
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
            setCurrentView={setCurrentView}
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

        {currentView === 'owner' && (
          <OwnerView
            products={products}
            lang={lang}
            onProductsUpdated={handleProductsUpdated}
          />
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
        setCurrentView={setCurrentView}
      />
    </div>
  );
}
