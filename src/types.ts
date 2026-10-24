export type Language = 'en' | 'fr';

export type Category = 'all' | 'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor';

export interface Product {
  id: string;
  name: {
    en: string;
    fr: string;
  };
  category: 'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor';
  priceEUR: number;
  dimensions: string; // e.g. "H 32 × Ø 22 cm"
  weight: string;     // e.g. "2.4 kg"
  material: {
    en: string;
    fr: string;
  };
  availability: {
    en: string;
    fr: string;
  };
  artisanPlaceholder: boolean; // True until real artisan profile is officially verified
  isSampleData: boolean;       // Clearly flags demo/prototype items
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
  storeCurrency: string;
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
