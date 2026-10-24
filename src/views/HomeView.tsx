import React, { useState } from 'react';
import { Product, Language, PageView } from '../types';
import { translations } from '../data/translations';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Compass, Shield, Award, MessageCircle, Truck, Check } from 'lucide-react';
import { generateWhatsAppLink, getStoredOwnerSettings } from '../services/storage';

interface HomeViewProps {
  products: Product[];
  lang: Language;
  setCurrentView: (view: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onInquireProduct: (product: Product | null) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  lang,
  setCurrentView,
  onSelectProduct,
  onInquireProduct
}) => {
  const [heroImageError, setHeroImageError] = useState(false);
  const [craftImageError, setCraftImageError] = useState(false);
  const t = translations[lang];
  const settings = getStoredOwnerSettings();

  const featuredProducts = products.filter(p => p.featured).slice(0, 3);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  const handleWhatsApp = () => {
    const url = generateWhatsAppLink(settings.whatsappNumber, t.whatsApp.defaultMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Unboxed eyebrow */}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548]">
                <span>{t.hero.eyebrow}</span>
                <span aria-hidden="true" className="text-[#DDD2C1]">/</span>
                <span className="text-[#7A7067]">Direct to Europe</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] leading-[1.12] text-[#282421] tracking-tight font-normal text-balance">
                {t.hero.title}
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-[#5C534B] leading-relaxed max-w-xl">
                {t.hero.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setCurrentView('shop')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span>{t.hero.exploreCatalog}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onInquireProduct(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold tracking-wider uppercase text-[#38332E] hover:text-[#C06548] bg-white hover:bg-[#F4EFE6] border border-[#DDD2C1] transition-colors rounded-xs cursor-pointer whitespace-nowrap"
                >
                  <span>{t.nav.inquireNow}</span>
                </button>
              </div>

              {/* Honest Pilot Pledge line */}
              <div className="pt-2 text-xs text-[#7A7067] border-t border-[#E8DFD3] flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4A5844] shrink-0" />
                <span>{t.hero.pilotPledge}</span>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-6">
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-[#EFE8DC] rounded-xs overflow-hidden shadow-lg border border-[#DDD2C1]">
                {!heroImageError ? (
                  <img
                    src="/src/assets/images/hero_moroccan_pottery_1792840896413.jpg"
                    alt="Handcrafted Moroccan Pottery on Travertine"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#EFE8DC] to-[#DDD2C1] text-[#6E6358]">
                    <span className="font-serif text-2xl mb-1">RIFORA</span>
                    <span className="text-xs uppercase tracking-wider">Moroccan Handcrafted Pottery</span>
                  </div>
                )}
                
                {/* Visual Label */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FBF8F3]/90 backdrop-blur-xs p-3 border border-[#DDD2C1] flex items-center justify-between text-xs text-[#3C3631]">
                  <div>
                    <span className="font-serif font-medium text-sm block">Safi Terracotta & Tamegroute Greens</span>
                    <span className="text-[11px] text-[#7A7067]">Hand-thrown in wood-fired Moroccan kilns</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#C06548] hidden sm:inline">EUR Reference Catalog</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Column Proof & Specifications Bar */}
      <section className="border-y border-[#E8DFD3] bg-[#F7F2EA] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#C06548]">
                01. True Dimensions
              </span>
              <p className="text-xs text-[#5C534B]">
                Precise heights, diameters, and net weights in kilograms verified on sample pieces.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#C06548]">
                02. Mineral Glazes
              </span>
              <p className="text-xs text-[#5C534B]">
                Authentic copper, magnesium, and natural clay with non-toxic lead-free food finishes.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#C06548]">
                03. European Dispatch
              </span>
              <p className="text-xs text-[#5C534B]">
                Reinforced shock-absorbing double boxes delivered across EU, Switzerland & UK.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#C06548]">
                04. Direct Inquiries
              </span>
              <p className="text-xs text-[#5C534B]">
                No payment forms upfront. Direct consultation on piece availability and custom freight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E8DFD3]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block mb-1">
              {lang === 'en' ? 'Curated Selection' : 'Sélection Précieuse'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#282421] font-normal">
              {lang === 'en' ? 'Signature Moroccan Ceramic Pieces' : 'Pièces Signatures en Céramique Marocaine'}
            </h2>
          </div>

          <button
            onClick={() => setCurrentView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#C06548] hover:text-[#9E4A31] transition-colors cursor-pointer"
          >
            <span>{t.hero.exploreCatalog}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              onSelect={onSelectProduct}
              onInquire={onInquireProduct}
            />
          ))}
        </div>
      </section>

      {/* Artisan Heritage & Story Rest Section */}
      <section className="bg-[#F4EFE6] border-y border-[#E8DFD3] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-4/3 w-full bg-[#E2D8C7] rounded-xs overflow-hidden shadow-md border border-[#DDD2C1]">
                {!craftImageError ? (
                  <img
                    src="/src/assets/images/craft_potter_hands_1792840957701.jpg"
                    alt="Master Potter in Safi Courtyard"
                    referrerPolicy="no-referrer"
                    onError={() => setCraftImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6 text-center text-[#786E64]">
                    <span className="font-serif text-lg">Moroccan Master Potters</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block">
                {t.about.eyebrow}
              </span>

              <h2 className="font-serif text-2xl sm:text-4xl text-[#282421] font-normal leading-snug">
                {t.about.title}
              </h2>

              <p className="text-sm sm:text-base text-[#575048] leading-relaxed">
                {t.about.subtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#575048]">
                <div className="p-4 bg-white border border-[#E8DFD3] rounded-xs">
                  <span className="font-semibold text-[#282421] block mb-1">
                    {t.about.pillar1Title}
                  </span>
                  <p className="leading-relaxed text-[#6E6358]">
                    {t.about.pillar1Text}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E8DFD3] rounded-xs">
                  <span className="font-semibold text-[#282421] block mb-1">
                    {t.about.pillar2Title}
                  </span>
                  <p className="leading-relaxed text-[#6E6358]">
                    {t.about.pillar2Text}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('about')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#C06548] hover:text-[#9E4A31] cursor-pointer"
                >
                  <span>{t.hero.artisanStory}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Transparency & No-Slop Guarantee Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E8DFD3] p-8 sm:p-12 rounded-xs shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A5844]">
              {lang === 'en' ? 'Direct European Validation' : 'Validation Directe en Europe'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#282421]">
              {t.about.honestyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6358] leading-relaxed">
              {lang === 'en'
                ? 'We believe premium craftsmanship requires absolute honesty. Our pilot allows European connoisseurs to reserve authentic pieces before mass commercial rollout.'
                : 'L’artisanat d’exception exige une transparence totale. Ce projet pilote permet aux amateurs d’objets d’art en Europe de réserver de vraies pièces artisanales avant le lancement commercial.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#443E38]">
            {t.about.honestyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-[#FBF8F3] border border-[#EFE8DC] rounded-xs">
                <Check className="w-4 h-4 text-[#4A5844] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#7A7067]">
              <span>{t.contact.responseTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1B5E20] bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] rounded-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => onInquireProduct(null)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs cursor-pointer"
              >
                <span>{t.nav.inquireNow}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
