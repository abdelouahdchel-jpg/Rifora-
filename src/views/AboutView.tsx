import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, HeartHandshake, Sparkles, MapPin } from 'lucide-react';

interface AboutViewProps {
  lang: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang }) => {
  const t = translations[lang].about;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block">
          {t.eyebrow}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#282421] font-normal leading-tight">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-[#635A52] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Hero Visual Banner */}
      <div className="aspect-16/9 w-full bg-[#EFE8DC] rounded-xs overflow-hidden border border-[#DDD2C1] shadow-sm">
        <img
          src="/assets/aistudio/20261025_111421_728c64cc.jpg"
          alt="Terracotta Pottery Drying in Artisan Workshop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Regional Pillars Grid */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#282421] text-center">
          {lang === 'en' ? 'Three Centuries of Living Tradition' : 'Trois Siècles de Tradition Vivante'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Safi */}
          <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C06548] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Safi & Atlantic Coast</span>
            </div>
            <h3 className="font-serif text-lg text-[#282421]">
              {t.pillar1Title}
            </h3>
            <p className="text-xs text-[#5C534B] leading-relaxed">
              {t.pillar1Text}
            </p>
          </div>

          {/* Pillar 2: Tamegroute */}
          <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5844] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Draa Valley & Sahara</span>
            </div>
            <h3 className="font-serif text-lg text-[#282421]">
              {t.pillar2Title}
            </h3>
            <p className="text-xs text-[#5C534B] leading-relaxed">
              {t.pillar2Text}
            </p>
          </div>

          {/* Pillar 3: Validation */}
          <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9E4A31] uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Direct Bridge to Europe</span>
            </div>
            <h3 className="font-serif text-lg text-[#282421]">
              {t.pillar3Title}
            </h3>
            <p className="text-xs text-[#5C534B] leading-relaxed">
              {t.pillar3Text}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Transparency & Anti-Slop Charter */}
      <div className="p-8 sm:p-10 bg-[#F4EFE6] border border-[#DDD2C1] rounded-xs space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4A5844]">
            Ethical Commerce
          </span>
          <h3 className="font-serif text-2xl text-[#282421]">
            {t.honestyTitle}
          </h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#443E38]">
          {t.honestyPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white border border-[#E8DFD3] rounded-xs">
              <ShieldCheck className="w-4 h-4 text-[#4A5844] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
