import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { getStoredPolicies } from '../services/storage';
import { ShieldAlert, CheckSquare, Lock, FileText, AlertCircle } from 'lucide-react';

interface PrivacyViewProps {
  lang: Language;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ lang }) => {
  const t = translations[lang].privacy;
  const policies = getStoredPolicies();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#E8DFD3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block mb-1">
          {lang === 'en' ? 'Data Protection & Transparency' : 'Protection des Données & Transparence'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#282421] font-normal mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-[#6E6358] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* GDPR Readiness Disclaimer (Prompt requirement: Do NOT claim GDPR compliance automatically) */}
      <div className="p-5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xs text-xs space-y-2 text-[#92400E]">
        <div className="flex items-center gap-2 font-semibold text-[#B45309]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.gdprDisclaimerTitle}</span>
        </div>
        <p className="leading-relaxed text-[#78350F]">
          {t.gdprDisclaimerText}
        </p>
      </div>

      {/* GDPR Owner Verification Checklist */}
      <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-4">
        <div className="flex items-center gap-2 font-serif text-lg text-[#282421]">
          <CheckSquare className="w-5 h-5 text-[#4A5844]" />
          <span>{t.checklistTitle}</span>
        </div>
        <p className="text-xs text-[#7A7067]">
          {lang === 'en'
            ? 'Before transitioning this store from a demand validation pilot to a commercial production store handling payments, the following legal and infrastructure items must be configured by the owner:'
            : 'Avant le passage de ce projet pilote en boutique commerciale avec paiements en ligne, les points juridiques et techniques suivants doivent être validés par le gérant :'}
        </p>
        <ul className="space-y-2.5 text-xs text-[#443E38]">
          {policies.gdprChecklist[lang].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2.5 bg-[#FBF8F3] border border-[#EFE8DC] rounded-xs">
              <span className="font-mono text-[#C06548] font-bold">[{idx + 1}]</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Policy Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-[#443E38] leading-relaxed">
        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <ShieldAlert className="w-4 h-4 text-[#4A5844]" />
            <span>{lang === 'en' ? '1. Information Collected Voluntarily' : '1. Informations Transmises Volontairement'}</span>
          </div>
          <p>{t.text1}</p>
        </div>

        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <Lock className="w-4 h-4 text-[#4A5844]" />
            <span>{lang === 'en' ? '2. Local Device Storage Notice' : '2. Notice sur le Stockage Local'}</span>
          </div>
          <p>{policies.privacyNotice[lang]}</p>
        </div>

        <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#282421] text-sm mb-1">
            <FileText className="w-4 h-4 text-[#4A5844]" />
            <span>{lang === 'en' ? '3. Data Erasure & Inquiries' : '3. Suppression des Données & Demandes'}</span>
          </div>
          <p>{t.text3}</p>
        </div>
      </div>
    </div>
  );
};
