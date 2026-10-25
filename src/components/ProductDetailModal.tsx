import React, { useState } from 'react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { generateWhatsAppLink, getStoredOwnerSettings } from '../services/storage';
import { X, MessageSquareQuote, MessageCircle, Truck, Sparkles, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  lang: Language;
  onClose: () => void;
  onInquire: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  lang,
  onClose,
  onInquire
}) => {
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const t = translations[lang].productDetail;
  const settings = getStoredOwnerSettings();
  const categoryName = translations[lang].categories[product.category];

  const handleWhatsApp = () => {
    const priceInfo = product.priceMAD != null && product.priceMAD > 0
      ? `${product.priceMAD} MAD`
      : (lang === 'en' ? 'Price to be confirmed' : 'Prix à confirmer');
    const message = translations[lang].whatsApp.productMessage
      .replace('{productName}', product.name[lang])
      .replace('{productId}', product.id)
      .replace('{priceInfo}', priceInfo)
      .replace('~€{priceEUR}', priceInfo)
      .replace('{priceEUR}', product.priceEUR ? product.priceEUR.toString() : '')
      .replace('{country}', lang === 'en' ? 'Europe' : 'l’Europe');
    const url = generateWhatsAppLink(settings.whatsappNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#FBF8F3] border border-[#DDD2C1] shadow-2xl rounded-xs overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-[#282421] rounded-full transition-colors cursor-pointer border border-[#DDD2C1]"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Imagery */}
          <div className="relative bg-[#F4EFE6] min-h-[300px] md:min-h-[500px]">
            {!imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name[lang]}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#7A6F64]">
                <Sparkles className="w-12 h-12 text-[#C06548] mb-3" />
                <p className="font-serif text-lg">{product.name[lang]}</p>
                <p className="text-xs text-[#8A7F73] mt-1">{categoryName}</p>
              </div>
            )}
            
            {/* Origin & Category Tag */}
            <div className="absolute bottom-4 left-4 bg-[#FBF8F3]/95 text-[#3E3833] text-xs px-3 py-1 border border-[#DDD2C1]">
              <span className="font-medium">{categoryName}</span>
              <span className="mx-1.5 text-[#C06548]">·</span>
              <span>{product.isSampleData ? (lang === 'en' ? 'Workshop Specimen' : 'Spécimen d’Atelier') : 'Moroccan Ceramic'}</span>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Specification Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Product Reference & Category */}
              <div className="flex items-center gap-2 text-xs text-[#7A7067] tracking-wider uppercase mb-2">
                <span>Ref: {product.id}</span>
                <span aria-hidden="true">·</span>
                <span>{categoryName}</span>
                {product.isSampleData && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#C06548] font-semibold">{lang === 'en' ? 'Workshop Specimen' : 'Spécimen Atelier'}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl text-[#282421] font-normal leading-tight mb-4">
                {product.name[lang]}
              </h2>

              {/* MAD Selling Price & Shipping Separation Block */}
              <div className="mb-6 pb-4 border-b border-[#E8DFD3]">
                {product.priceMAD != null && product.priceMAD > 0 ? (
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-3xl font-semibold text-[#282421] tabular-nums">
                        {product.priceMAD} MAD
                      </span>
                      <span className="text-xs uppercase tracking-wider text-[#7A7067]">
                        {lang === 'en' ? 'Moroccan Dirham (MAD)' : 'Dirhams Marocains (MAD)'}
                      </span>
                    </div>
                    {product.shippingCostMAD != null && product.shippingCostMAD > 0 ? (
                      <p className="text-xs font-mono text-[#5C534B] mt-1.5">
                        + {product.shippingCostMAD} MAD {lang === 'en' ? 'shipping (calculated separately)' : 'livraison (calculée séparément)'}
                      </p>
                    ) : (
                      <p className="text-xs text-[#7A7067] mt-1.5 leading-relaxed">
                        {t.shippingSeparateNote || (lang === 'en' ? 'Shipping is calculated separately per destination address.' : 'Frais de transport calculés séparément selon destination.')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-medium text-[#C06548] italic font-serif">
                        {t.priceToBeAdded}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-[#7A7067]">
                        {lang === 'en' ? 'Selling Price Pending' : 'Prix en attente'}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7067] mt-2 leading-relaxed">
                      {t.pricePendingNotice}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Specifications Grid */}
              <div className="space-y-2.5 text-xs text-[#575048] mb-6">
                <div className="flex justify-between py-1.5 border-b border-[#F0E8DC]">
                  <span className="font-medium text-[#7A7067]">{t.dimensions}</span>
                  <span className="font-mono tabular-nums text-[#282421] font-semibold">{product.dimensions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0E8DC]">
                  <span className="font-medium text-[#7A7067]">{t.weight}</span>
                  <span className="font-mono tabular-nums text-[#282421] font-semibold">{product.weight}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0E8DC]">
                  <span className="font-medium text-[#7A7067]">{t.material}</span>
                  <span className="text-right text-[#282421] max-w-[60%]">{product.material[lang]}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0E8DC]">
                  <span className="font-medium text-[#7A7067]">{t.availability}</span>
                  <span className="text-right text-[#4A5844] font-semibold">{product.availability[lang]}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A7067] mb-2">
                  {lang === 'en' ? 'Piece Overview' : 'Présentation de la Pièce'}
                </h4>
                <p className="text-sm text-[#443E38] leading-relaxed">
                  {product.description[lang]}
                </p>
              </div>

              {/* Key Craftsmanship Features */}
              {product.details[lang] && product.details[lang].length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A7067] mb-2">
                    {t.keyFeatures}
                  </h4>
                  <ul className="text-xs text-[#575048] space-y-1.5 list-disc list-inside">
                    {product.details[lang].map((detail, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Artisan Transparency Card (No fake reviews or fake details) */}
              <div className="p-4 bg-[#F5EFE6] border border-[#E2D6C5] rounded-xs text-xs text-[#5C534B] mb-6">
                <div className="flex items-center gap-2 font-semibold text-[#3C3631] mb-1">
                  <AlertCircle className="w-4 h-4 text-[#C06548] shrink-0" />
                  <span>{t.artisanTransparencyTitle}</span>
                </div>
                <p className="leading-relaxed text-[#6E6358]">
                  {t.artisanTransparencyText}
                </p>
              </div>

              {/* Safe European Packaging Protocol */}
              <div className="flex items-center gap-2 text-xs text-[#4A5844] font-medium mb-6">
                <Truck className="w-4 h-4 shrink-0" />
                <span>{t.safeDeliveryEurope}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2 border-t border-[#E8DFD3]">
              <button
                onClick={() => {
                  onInquire(product);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs shadow-sm cursor-pointer"
              >
                <MessageSquareQuote className="w-4 h-4" />
                <span>{t.inquireAboutItem}</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-[#1B5E20] bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] transition-colors rounded-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
                <span>{t.chatOnWhatsApp}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
