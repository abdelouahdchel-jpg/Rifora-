import React from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { Lock, MessageCircle, Mail } from 'lucide-react';
import { generateWhatsAppLink, getStoredOwnerSettings } from '../services/storage';

interface FooterProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setCurrentView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, setLang, setCurrentView }) => {
  const t = translations[lang].footer;
  const nav = translations[lang].nav;
  const settings = getStoredOwnerSettings();

  const handleNav = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    const url = generateWhatsAppLink(settings.whatsappNumber, translations[lang].whatsApp.defaultMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-[#24201D] text-[#ECE6DD] border-t border-[#38322D] pt-14 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#38322D]">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-white block">
              RIFORA
            </span>
            <p className="text-xs text-[#A89E92] leading-relaxed">
              {t.brandDesc}
            </p>
            <div className="pt-2 space-y-2">
              <div>
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#25D366] hover:text-[#42E67F] transition-colors cursor-pointer"
                  aria-label={`WhatsApp: ${settings.whatsappNumber}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {settings.whatsappNumber}</span>
                </button>
              </div>
              <div>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-flex items-center gap-2 text-xs text-[#D1C6B7] hover:text-white transition-colors cursor-pointer"
                  aria-label={`Email: ${settings.contactEmail}`}
                >
                  <Mail className="w-4 h-4 text-[#C06548]" />
                  <span>{settings.contactEmail}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D1C6B7]">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#A89E92]">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('shop')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.shop}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.about}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Confidence & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D1C6B7]">
              {t.legal}
            </h4>
            <ul className="space-y-2 text-xs text-[#A89E92]">
              <li>
                <button onClick={() => handleNav('shipping')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.shipping}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.privacy}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors cursor-pointer">
                  {nav.terms}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('owner')} className="inline-flex items-center gap-1.5 text-[#C06548] hover:text-[#D97D61] transition-colors cursor-pointer pt-1 text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.ownerLink}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* European Destinations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D1C6B7]">
              {t.destinations}
            </h4>
            <p className="text-xs text-[#A89E92] leading-relaxed">
              {t.europeanCountries}
            </p>
            <div className="pt-2">
              <span className="block text-[11px] uppercase tracking-wider text-[#7A7067] mb-1">
                Language
              </span>
              <div className="inline-flex border border-[#443E38] rounded-xs text-xs">
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#C06548] text-white' : 'text-[#A89E92] hover:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('fr')}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${lang === 'fr' ? 'bg-[#C06548] text-white' : 'text-[#A89E92] hover:text-white'}`}
                >
                  Français
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Pilot Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8074]">
          <p>
            © {new Date().getFullYear()} RIFORA. Moroccan pottery & handcrafted home decor.
          </p>
          <p className="text-center sm:text-right text-[11px] text-[#A89E92]/80">
            {t.pilotDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
};
