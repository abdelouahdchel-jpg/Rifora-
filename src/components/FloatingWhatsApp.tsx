import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { generateWhatsAppLink, getStoredOwnerSettings } from '../services/storage';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  lang: Language;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ lang }) => {
  const t = translations[lang].whatsApp;
  const settings = getStoredOwnerSettings();

  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink(settings.whatsappNumber, t.defaultMessage);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={handleWhatsAppClick}
        aria-label={t.floatingLabel}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide pr-1">
          WhatsApp
        </span>
      </button>
    </div>
  );
};
