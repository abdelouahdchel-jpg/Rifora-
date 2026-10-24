import React, { useState } from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { Menu, X, MessageSquareQuote, Wrench } from 'lucide-react';

interface HeaderProps {
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenInquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  onOpenInquiry
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const handleNavClick = (view: PageView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#E8DFD3] transition-colors">
      {/* Strict 1-row, 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group cursor-pointer shrink-0"
        >
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-[#282421] group-hover:text-[#C06548] transition-colors">
            RIFORA
          </span>
          <span className="sr-only">RIFORA Moroccan Pottery</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
          <button
            onClick={() => handleNavClick('shop')}
            className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C06548] ${
              currentView === 'shop' ? 'text-[#C06548] font-semibold underline underline-offset-8 decoration-1 decoration-[#C06548]' : ''
            }`}
          >
            {t.nav.shop}
          </button>
          
          <button
            onClick={() => handleNavClick('about')}
            className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C06548] ${
              currentView === 'about' ? 'text-[#C06548] font-semibold underline underline-offset-8 decoration-1 decoration-[#C06548]' : ''
            }`}
          >
            {t.nav.about}
          </button>
          
          <button
            onClick={() => handleNavClick('shipping')}
            className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C06548] ${
              currentView === 'shipping' ? 'text-[#C06548] font-semibold underline underline-offset-8 decoration-1 decoration-[#C06548]' : ''
            }`}
          >
            {t.nav.shipping}
          </button>
          
          <button
            onClick={() => handleNavClick('contact')}
            className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C06548] ${
              currentView === 'contact' ? 'text-[#C06548] font-semibold underline underline-offset-8 decoration-1 decoration-[#C06548]' : ''
            }`}
          >
            {t.nav.contact}
          </button>
        </nav>

        {/* Zone 3: Language Selector & 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher (Segmented button control) */}
          <div className="inline-flex items-center border border-[#DDD2C1] rounded-sm p-0.5 bg-[#F4EFE6] text-xs font-medium">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-[#282421] shadow-xs font-semibold'
                  : 'text-[#6E645C] hover:text-[#282421]'
              }`}
              title="English language"
            >
              EN
            </button>
            <button
              onClick={() => setLang('fr')}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                lang === 'fr'
                  ? 'bg-white text-[#282421] shadow-xs font-semibold'
                  : 'text-[#6E645C] hover:text-[#282421]'
              }`}
              title="Langue française"
            >
              FR
            </button>
          </div>

          {/* Primary CTA: Make an Inquiry */}
          <button
            onClick={onOpenInquiry}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-sm cursor-pointer shadow-xs whitespace-nowrap shrink-0"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t.nav.inquireNow}</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#57534E] hover:text-[#282421] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD3] bg-[#FBF8F3] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-base font-medium text-[#443D36]">
            <button
              onClick={() => handleNavClick('shop')}
              className="text-left py-2 hover:text-[#C06548] transition-colors"
            >
              {t.nav.shop}
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 hover:text-[#C06548] transition-colors"
            >
              {t.nav.about}
            </button>
            <button
              onClick={() => handleNavClick('shipping')}
              className="text-left py-2 hover:text-[#C06548] transition-colors"
            >
              {t.nav.shipping}
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 hover:text-[#C06548] transition-colors"
            >
              {t.nav.contact}
            </button>
            <button
              onClick={() => handleNavClick('owner')}
              className="text-left py-2 text-xs text-[#8C8074] flex items-center gap-2 pt-2 border-t border-[#E8DFD3]"
            >
              <Wrench className="w-3.5 h-3.5 text-[#C06548]" />
              <span>{t.nav.ownerPortal}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInquiry();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] rounded-sm"
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>{t.nav.inquireNow}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
