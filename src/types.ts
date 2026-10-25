export type Language = 'en' | 'fr';

export type Category = 'all' | 'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor';

export interface Product {
  id: string;
  name: {
    en: string;
    fr: string;
  };
  category: 'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor';
  priceMAD?: number | null; // Customer-facing selling price in MAD (null when not yet set)
  purchaseCostMAD?: number | null; // PRIVATE owner supplier cost in MAD (hidden from customer storefront)
  shippingCostMAD?: number | null; // Separate shipping fee in MAD (never bundled or invented)
  priceEUR?: number | null; // Optional legacy field
  dimensions: string; // e.g. "To be measured" / "À mesurer"
  weight: string;     // e.g. "To be measured" / "À mesurer"
  material: {
    en: string;
    fr: string;
  };
  availability: {
    en: string;
    fr: string;
  };
  artisanPlaceholder: boolean; // True until real artisan profile is officially verified
  isSampleData: boolean;       // Clearly flags prototype items
  needsReview?: boolean;       // Marked for owner review
  description: {
    en: string;
    fr: string;
  };
  details: {
    en: string[];
    fr: string[];
  };
  imageUrl: string;
  featured?: boolean;
}

export interface Inquiry {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  destinationCountry: string;
  productId: string;
  productName: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'completed';
}

export interface OwnerSettings {
  whatsappNumber: string;
  contactEmail: string;
  storeCurrency: string; // Defaults to 'MAD'
  defaultShippingCostMAD?: number | null;
}

export interface StorePolicies {
  shippingZonesNotice: {
    en: string;
    fr: string;
  };
  transitTimeNotice: {
    en: string;
    fr: string;
  };
  packagingNotice: {
    en: string;
    fr: string;
  };
  damagePolicy: {
    en: string;
    fr: string;
  };
  returnPolicy: {
    en: string;
    fr: string;
  };
  privacyNotice: {
    en: string;
    fr: string;
  };
  termsNotice: {
    en: string;
    fr: string;
  };
  gdprChecklist: {
    en: string[];
    fr: string[];
  };
}

export type PageView = 
  | 'home' 
  | 'shop' 
  | 'product-detail'
  | 'about' 
  | 'contact' 
  | 'shipping' 
  | 'privacy' 
  | 'terms'
  | 'owner';
