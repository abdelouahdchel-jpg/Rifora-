import React, { useState, useMemo } from 'react';
import { Product, Language, Category } from '../types';
import { translations } from '../data/translations';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ShopViewProps {
  products: Product[];
  lang: Language;
  onSelectProduct: (product: Product) => void;
  onInquireProduct: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  lang,
  onSelectProduct,
  onInquireProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'weightAsc'>('default');

  const t = translations[lang].shop;
  const categories = translations[lang].categories;

  const categoryList: Category[] = ['all', 'pottery', 'vases', 'bowls', 'lanterns', 'decor'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          p.name[lang].toLowerCase().includes(query) ||
          p.material[lang].toLowerCase().includes(query) ||
          p.dimensions.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.priceEUR - b.priceEUR;
        if (sortBy === 'priceDesc') return b.priceEUR - a.priceEUR;
        if (sortBy === 'weightAsc') {
          const wA = parseFloat(a.weight) || 0;
          const wB = parseFloat(b.weight) || 0;
          return wA - wB;
        }
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header & Subtitle */}
      <div className="border-b border-[#E8DFD3] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#282421] font-normal tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-[#6E6358] max-w-2xl leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Control Bar: Category Tabs, Search & Sort */}
      <div className="space-y-4">
        {/* Category Segmented Tabs (Interactive Filter Controls conforming to Zero-Pill rule) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categoryList.map((catKey) => {
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors whitespace-nowrap cursor-pointer rounded-xs ${
                  isActive
                    ? 'bg-[#C06548] text-white shadow-xs'
                    : 'bg-[#F4EFE6] text-[#5C534B] hover:bg-[#EAE3D6] hover:text-[#282421]'
                }`}
              >
                {categories[catKey]}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8074]" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] placeholder-[#9C8F83] focus:outline-none focus:border-[#C06548]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8074] hover:text-[#282421]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-[#7A7067] whitespace-nowrap">
              {t.sortBy}:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548] cursor-pointer"
            >
              <option value="default">{lang === 'en' ? 'Curated Order' : 'Ordre recommandé'}</option>
              <option value="priceAsc">{t.sortPriceAsc}</option>
              <option value="priceDesc">{t.sortPriceDesc}</option>
              <option value="weightAsc">{t.sortWeightAsc}</option>
            </select>
          </div>
        </div>

        {/* Results Counter (Unboxed text with typographic separator) */}
        <div className="text-xs text-[#7A7067] flex items-center gap-2 pt-1">
          <span className="font-mono tabular-nums font-semibold text-[#282421]">
            {filteredProducts.length}
          </span>
          <span>{t.resultsCount}</span>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              onSelect={onSelectProduct}
              onInquire={onInquireProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E8DFD3] rounded-xs p-8 space-y-4">
          <p className="text-sm text-[#7A7067]">
            {t.noResults}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSortBy('default');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#C06548] hover:text-white hover:bg-[#C06548] border border-[#C06548] rounded-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      )}
    </div>
  );
};
