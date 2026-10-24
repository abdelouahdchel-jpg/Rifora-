import React from 'react';
import { Language } from '../types';
import { translations, EUROPEAN_COUNTRIES } from '../data/translations';
import { getStoredPolicies } from '../services/storage';
import { Truck, PackageCheck, Clock, ShieldAlert, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

interface ShippingViewProps {
  lang: Language;
}

export const ShippingView: React.FC<ShippingViewProps> = ({ lang }) => {
  const t = translations[lang].shipping;
  const policies = getStoredPolicies();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#E8DFD3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block mb-1">
          {lang === 'en' ? 'Logistics & Care' : 'Logistique & Soin'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#282421] font-normal mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-[#6E6358] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Prominent Unverified Logistical Estimates Notice */}
      <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xs text-xs space-y-1 text-[#92400E]">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
          <span>{lang === 'en' ? 'Logistical Disclaimers & Unverified Estimates' : 'Avertissement Logistique & Estimations Non Vérifiées'}</span>
        </div>
        <p className="leading-relaxed text-[#78350F]">
          {t.unverifiedAlert}
        </p>
      </div>

      {/* Dynamic 5 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Destinations */}
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-[#F4EFE6] flex items-center justify-center text-[#C06548]">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#282421]">
            {t.card1Title}
          </h3>
          <p className="text-xs text-[#5C534B] leading-relaxed">
            {policies.shippingZonesNotice[lang]}
          </p>
        </div>

        {/* Card 2: Packaging */}
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-[#F4EFE6] flex items-center justify-center text-[#4A5844]">
            <PackageCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#282421]">
            {t.card2Title}
          </h3>
          <p className="text-xs text-[#5C534B] leading-relaxed">
            {policies.packagingNotice[lang]}
          </p>
        </div>

        {/* Card 3: Transit Times */}
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-[#F4EFE6] flex items-center justify-center text-[#3B4438]">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#282421]">
            {t.card3Title}
          </h3>
          <p className="text-xs text-[#5C534B] leading-relaxed">
            {policies.transitTimeNotice[lang]}
          </p>
        </div>

        {/* Card 4: Damage Protection */}
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-[#F4EFE6] flex items-center justify-center text-[#9E4A31]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#282421]">
            {t.card4Title}
          </h3>
          <p className="text-xs text-[#5C534B] leading-relaxed">
            {policies.damagePolicy[lang]}
          </p>
        </div>
      </div>

      {/* Return Policy Card */}
      <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
        <div className="flex items-center gap-2 font-serif text-lg text-[#282421]">
          <RotateCcw className="w-4 h-4 text-[#C06548]" />
          <span>{t.card5Title}</span>
        </div>
        <p className="text-xs text-[#5C534B] leading-relaxed">
          {policies.returnPolicy[lang]}
        </p>
      </div>

      {/* European Countries list */}
      <div className="p-6 bg-[#F7F2EA] border border-[#DDD2C1] rounded-xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#38332E] mb-3">
          {lang === 'en' ? 'Target European Service Zones (To Be Confirmed Per Order)' : 'Zones Cibles en Europe (À Confirmer Par Commande)'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs text-[#5C534B]">
          {EUROPEAN_COUNTRIES.map((country, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5844] shrink-0" />
              <span>{country}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
