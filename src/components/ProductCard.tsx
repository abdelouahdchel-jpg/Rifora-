import React, { useState } from 'react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, Eye, Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelect,
  onInquire
}) => {
  const [imageError, setImageError] = useState(false);
  const t = translations[lang].productCard;

  const categoryName = translations[lang].categories[product.category];

  return (
    <article className="group flex flex-col bg-white border border-[#EFE8DC] hover:border-[#D6C7B2] rounded-xs overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      {/* Product Image Slot with Fallback Container */}
      <div 
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 w-full bg-[#F4EFE6] overflow-hidden cursor-pointer"
      >
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name[lang]}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F5EFE6] to-[#ECE1D2] text-[#8C7E72]">
            <Layers className="w-10 h-10 mb-2 stroke-1 text-[#C06548]" />
            <span className="text-xs font-serif tracking-wider uppercase">{categoryName}</span>
          </div>
        )}

        {/* Quiet unboxed prototype sample indicator (no pill capsules!) */}
        {product.isSampleData && (
          <div className="absolute top-3 left-3 bg-[#FBF8F3]/95 backdrop-blur-xs text-[#5C534B] text-[10px] tracking-wider uppercase px-2 py-0.5 border border-[#E4DACD]">
            {t.artisanPlaceholderBadge}
          </div>
        )}

        {/* Quick view hover icon button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="absolute bottom-3 right-3 p-2 bg-white/95 text-[#282421] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs hover:bg-[#C06548] hover:text-white rounded-xs cursor-pointer"
          aria-label={t.viewDetails}
          title={t.viewDetails}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content & Metadata */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {/* Category & Origin Line (Unboxed text with typographic separator) */}
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#7A7067] mb-1.5">
          <span>{categoryName}</span>
          <span aria-hidden="true" className="text-[#CBBDB0]">·</span>
          <span>Morocco</span>
          {product.isSampleData && (
            <>
              <span aria-hidden="true" className="text-[#CBBDB0]">·</span>
              <span className="text-[#A3523B]">{t.sampleNotice}</span>
            </>
          )}
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onSelect(product)}
          className="font-serif text-lg font-medium text-[#282421] group-hover:text-[#C06548] transition-colors leading-snug mb-3 cursor-pointer"
        >
          {product.name[lang]}
        </h3>

        {/* Clean unboxed specifications list */}
        <div className="text-xs text-[#635A52] space-y-1 mb-4 flex-1">
          <div className="flex items-baseline justify-between gap-2 border-b border-[#F5EFE6] pb-1">
            <span className="text-[#8C7F73]">{t.dimensions}</span>
            <span className="font-mono text-[11px] tabular-nums text-[#38332E] text-right">{product.dimensions}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-b border-[#F5EFE6] pb-1">
            <span className="text-[#8C7F73]">{t.weight}</span>
            <span className="font-mono text-[11px] tabular-nums text-[#38332E] text-right">{product.weight}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-b border-[#F5EFE6] pb-1">
            <span className="text-[#8C7F73]">{t.material}</span>
            <span className="text-[11px] text-[#38332E] text-right truncate max-w-[55%]">{product.material[lang]}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 pt-0.5">
            <span className="text-[#8C7F73]">{t.availability}</span>
            <span className="text-[11px] text-[#4A5844] font-medium text-right truncate max-w-[55%]">{product.availability[lang]}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#EFE8DC] flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-[#8A7D71]">
              {t.price}
            </span>
            {product.priceMAD != null && product.priceMAD > 0 ? (
              <div className="flex flex-col">
                <span className="font-mono text-lg font-semibold tabular-nums text-[#282421]">
                  {product.priceMAD} {t.currency}
                </span>
                {product.shippingCostMAD != null && product.shippingCostMAD > 0 && (
                  <span className="text-[10px] text-[#7A7067] font-mono">
                    +{product.shippingCostMAD} {t.currency} shipping
                  </span>
                )}
              </div>
            ) : (
              <span className="inline-block text-xs font-medium text-[#C06548] italic py-0.5">
                {t.priceToBeAdded}
              </span>
            )}
          </div>

          <button
            onClick={() => onInquire(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>{t.inquireBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
