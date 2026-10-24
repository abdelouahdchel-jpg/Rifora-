import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { getStoredPolicies } from '../services/storage';
import { Scale, CheckCircle2 } from 'lucide-react';

interface TermsViewProps {
  lang: Language;
}

export const TermsView: React.FC<TermsViewProps> = ({ lang }) => {
  const t = translations[lang].terms;
  const policies = getStoredPolicies();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#E8DFD3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block mb-1">
          {lang === 'en' ? 'Pilot Framework' : 'Cadre du Projet'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#282421] font-normal mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-[#6E6358] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#443E38] leading-relaxed">
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <Scale className="w-4 h-4 text-[#C06548]" />
            <span>{lang === 'en' ? '1. Scope of Inquiry Reservations' : '1. Portée des Demandes de Réservation'}</span>
          </div>
          <p>{policies.termsNotice[lang]}</p>
        </div>

        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#4A5844]" />
            <span>{lang === 'en' ? '2. EUR Reference Pricing' : '2. Tarification de Référence en EUR'}</span>
          </div>
          <p>{t.point2}</p>
        </div>

        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#4A5844]" />
            <span>{lang === 'en' ? '3. Handcrafted Clay & Mineral Variations' : '3. Variations Artisanales & Émaux Minéraux'}</span>
          </div>
          <p>{t.point3}</p>
        </div>
      </div>
    </div>
  );
};
