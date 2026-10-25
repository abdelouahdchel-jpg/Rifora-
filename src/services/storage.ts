import { Product, Inquiry, OwnerSettings, StorePolicies } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_STORAGE_KEY = 'rifora_products_v2';
const INQUIRIES_STORAGE_KEY = 'rifora_inquiries_v1';
const SETTINGS_STORAGE_KEY = 'rifora_settings_v1';
const POLICIES_STORAGE_KEY = 'rifora_policies_v1';

const DEFAULT_SETTINGS: OwnerSettings = {
  whatsappNumber: '+212638194995', // Official owner WhatsApp number (International format)
  contactEmail: 'abdelouahdchel@gmail.com',
  storeCurrency: 'MAD'
};

export const DEFAULT_POLICIES: StorePolicies = {
  shippingZonesNotice: {
    en: 'Target European Union destinations include France, Germany, Belgium, Switzerland, Spain, Italy, the Netherlands, and Austria. Exact carrier delivery coverage will be confirmed per destination address.',
    fr: 'Les destinations cibles en Union Européenne incluent la France, l’Allemagne, la Belgique, la Suisse, l’Espagne, l’Italie, les Pays-Bas et l’Autriche. La couverture exacte du transporteur sera confirmée selon l’adresse de livraison.'
  },
  transitTimeNotice: {
    en: 'ESTIMATED / UNVERIFIED: Standard estimated transit after artisan batch packing is 5 to 10 business days. Transit schedules are unverified estimates subject to final carrier agreement.',
    fr: 'ESTIMATION NON VÉRIFIÉE : Le délai moyen indicatif après emballage en atelier est de 5 à 10 jours ouvrés. Ces délais sont des estimations sujettes à finalisation du contrat transporteur.'
  },
  packagingNotice: {
    en: 'Delicate pottery and brass lanterns are double-boxed using reinforced biodegradable impact cushioning and corner protectors for heavy terracotta pieces.',
    fr: 'Les poteries délicates et lanternes sont conditionnées en double carton avec calage amortisseur biodégradable et cornières rigides pour la terre cuite.'
  },
  damagePolicy: {
    en: 'If any pottery piece arrives cracked or damaged during European transit, report within 48 hours of receipt with clear photographic proof for a direct replacement piece or mutual resolution.',
    fr: 'Si une pièce arrive fissurée ou endommagée durant le transport européen, signalez-le dans les 48h suivant la réception avec photos à l’appui pour un remplacement ou accord mutuel.'
  },
  returnPolicy: {
    en: 'Standard 14-day return window from physical receipt for non-custom handcrafted pieces in original packaging. Return shipping costs to our staging hub apply.',
    fr: 'Délai de rétractation de 14 jours à compter de la réception physique pour les pièces artisanales standard non personnalisées dans leur emballage d’origine. Frais de retour à la charge du client.'
  },
  privacyNotice: {
    en: 'Customer contact details submitted through our inquiry forms are used strictly to reply to product requests and calculate freight options. Data is stored on your local device session during this pilot phase and is not sold or shared with third-party advertising trackers.',
    fr: 'Les coordonnées transmises via nos formulaires de demande sont utilisées exclusivement pour répondre à vos demandes et estimer les frais de port. Les données sont stockées dans la session de votre appareil durant cette phase pilote sans aucun partage publicitaire.'
  },
  termsNotice: {
    en: 'Submitting an inquiry constitutes a non-binding reservation request and does not form a financial contract. Indicative prices in EUR will be finalized with individual shipping quotes upon confirmation.',
    fr: 'L’envoi d’une demande constitue une manifestation d’intérêt sans engagement financier. Les tarifs indicatifs en EUR seront finalisés avec le devis de transport lors de la confirmation.'
  },
  gdprChecklist: {
    en: [
      'Store Owner / Legal Entity: Formal corporate registration name and registered address to be published prior to commercial sales.',
      'Data Controller Contact: Dedicated privacy contact email must be assigned and monitored.',
      'Hosting & Storage Architecture: Formal migration to an encrypted server-side database (e.g. Cloud SQL / Firestore) required for real production multi-user access.',
      'Cookie Audit: No tracking cookies are used currently; an ePrivacy cookie banner is required if external analytics are added.',
      'Right to Erasure: Store manager must honor deletion requests within 30 days.'
    ],
    fr: [
      'Gérant / Entité juridique : Raison sociale enregistrée et adresse du siège à publier avant toute vente commerciale.',
      'Contact responsable de traitement : Une adresse email dédiée doit être désignée et suivie.',
      'Architecture d’hébergement : Migration obligatoire vers une base de données serveur sécurisée (Cloud SQL / Firestore) pour le passage en production multi-utilisateurs.',
      'Audit cookies : Aucun cookie tiers n’est utilisé actuellement ; un bandeau de consentement sera requis en cas d’ajout d’outils d’analyse.',
      'Droit à l’effacement : Les demandes de suppression de coordonnées doivent être traitées sous 30 jours.'
    ]
  }
};

/**
 * Data Sanitization Utilities
 */
export const sanitizeString = (input: string, maxLength = 250): string => {
  if (!input) return '';
  // Strip HTML tags and script fragments
  const stripped = input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '');
  return stripped.trim().slice(0, maxLength);
};

export const isValidEmail = (email: string): boolean => {
  if (!email || email.length > 120) return false;
  // Strict standard email regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
};

/**
 * Image compression utility to ensure images safely fit in localStorage
 * without crashing browser quota (~5MB). Resizes to max 800px at 75% quality.
 */
export const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image in canvas'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};

/**
 * Products Storage
 */
export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load products from storage', e);
    return INITIAL_PRODUCTS;
  }
};

export const saveProductToStorage = (product: Product): { success: boolean; products: Product[]; error?: string } => {
  try {
    const current = getStoredProducts();
    const index = current.findIndex(p => p.id === product.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = product;
    } else {
      updated = [product, ...current];
    }
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, products: updated };
  } catch (e: any) {
    console.error('Failed to save product to storage', e);
    return {
      success: false,
      products: getStoredProducts(),
      error: e?.name === 'QuotaExceededError'
        ? 'Storage quota exceeded. Please use a smaller image file or image URL.'
        : 'Failed to write product to browser storage.'
    };
  }
};

export const deleteProductFromStorage = (productId: string): Product[] => {
  const current = getStoredProducts();
  const updated = current.filter(p => p.id !== productId);
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete product from storage', e);
  }
  return updated;
};

export const resetProductsToDefault = (): Product[] => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  } catch (e) {
    console.error('Failed to reset products', e);
  }
  return INITIAL_PRODUCTS;
};

/**
 * Inquiries Storage
 */
export const getStoredInquiries = (): Inquiry[] => {
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load inquiries from storage', e);
    return [];
  }
};

export interface AddInquiryResult {
  success: boolean;
  inquiry?: Inquiry;
  error?: string;
}

export const addInquiryToStorage = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): AddInquiryResult => {
  // 1. Sanitize & Validate inputs
  const sanitizedName = sanitizeString(inquiryData.customerName, 80);
  const sanitizedEmail = sanitizeString(inquiryData.email, 100);
  const sanitizedPhone = inquiryData.phone ? sanitizeString(inquiryData.phone, 30) : undefined;
  const sanitizedCountry = sanitizeString(inquiryData.destinationCountry, 60);
  const sanitizedProduct = sanitizeString(inquiryData.productName, 120);
  const sanitizedNotes = inquiryData.notes ? sanitizeString(inquiryData.notes, 500) : undefined;
  const quantity = Math.max(1, Math.min(100, Math.floor(Number(inquiryData.quantity) || 1)));

  if (!sanitizedName) {
    return { success: false, error: 'Customer name is required.' };
  }
  if (!isValidEmail(sanitizedEmail)) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!sanitizedCountry) {
    return { success: false, error: 'Destination country is required.' };
  }

  const newInquiry: Inquiry = {
    id: 'inq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    customerName: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    destinationCountry: sanitizedCountry,
    productId: sanitizeString(inquiryData.productId, 40) || 'general',
    productName: sanitizedProduct,
    quantity,
    notes: sanitizedNotes,
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  try {
    const current = getStoredInquiries();
    const updated = [newInquiry, ...current];
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, inquiry: newInquiry };
  } catch (e: any) {
    console.error('Failed to persist inquiry in browser storage', e);
    return {
      success: false,
      error: e?.name === 'QuotaExceededError'
        ? 'Browser local storage is full. Please send your inquiry directly via WhatsApp or Email.'
        : 'Browser storage is currently unavailable or disabled on this device. Please send your inquiry directly via WhatsApp or Email.'
    };
  }
};

export const updateInquiryStatusInStorage = (inquiryId: string, status: 'new' | 'contacted' | 'completed'): Inquiry[] => {
  const current = getStoredInquiries();
  const updated = current.map(item => item.id === inquiryId ? { ...item, status } : item);
  try {
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update inquiry status', e);
  }
  return updated;
};

export const clearStoredInquiries = (): void => {
  try {
    localStorage.removeItem(INQUIRIES_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear inquiries', e);
  }
};

/**
 * Settings Storage
 */
export const getStoredOwnerSettings = (): OwnerSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    // Automatically migrate placeholder phone or emails to confirmed official details
    if (!parsed.whatsappNumber || parsed.whatsappNumber === '+212600000000' || parsed.whatsappNumber.includes('600000000')) {
      parsed.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
    }
    if (!parsed.contactEmail || parsed.contactEmail.includes('rifora-pottery.com')) {
      parsed.contactEmail = DEFAULT_SETTINGS.contactEmail;
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredOwnerSettings = (settings: OwnerSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

/**
 * Editable Store Policies Storage
 */
export const getStoredPolicies = (): StorePolicies => {
  try {
    const raw = localStorage.getItem(POLICIES_STORAGE_KEY);
    if (!raw) return DEFAULT_POLICIES;
    return { ...DEFAULT_POLICIES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_POLICIES;
  }
};

export const saveStoredPolicies = (policies: StorePolicies): void => {
  try {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies));
  } catch (e) {
    console.error('Failed to save policies', e);
  }
};

export const resetStoredPolicies = (): StorePolicies => {
  try {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(DEFAULT_POLICIES));
  } catch (e) {
    console.error('Failed to reset policies', e);
  }
  return DEFAULT_POLICIES;
};

/**
 * WhatsApp Link Generator
 */
export const generateWhatsAppLink = (phone: string, text: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * CSV / JSON Exports
 */
export const exportInquiriesToCSV = (): boolean => {
  const inquiries = getStoredInquiries();
  if (inquiries.length === 0) return false;

  const headers = [
    'ID',
    'Date (UTC)',
    'Customer Name',
    'Email',
    'Phone',
    'Destination Country',
    'Product ID',
    'Product Name',
    'Quantity',
    'Notes',
    'Status'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = inquiries.map(inq => [
    escapeCSV(inq.id),
    escapeCSV(inq.createdAt),
    escapeCSV(inq.customerName),
    escapeCSV(inq.email),
    escapeCSV(inq.phone || ''),
    escapeCSV(inq.destinationCountry),
    escapeCSV(inq.productId),
    escapeCSV(inq.productName),
    escapeCSV(inq.quantity),
    escapeCSV(inq.notes || ''),
    escapeCSV(inq.status)
  ]);

  // Include UTF-8 BOM \uFEFF for seamless Excel & Google Sheets rendering of French accents
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rifora_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

export const exportFullDatabaseJSON = (): boolean => {
  const data = {
    exportDate: new Date().toISOString(),
    store: 'RIFORA Moroccan Pottery & Home Decor',
    environmentNotice: 'Exported from browser local storage session. Contains local products, inquiries, settings, and store policies.',
    products: getStoredProducts(),
    inquiries: getStoredInquiries(),
    settings: getStoredOwnerSettings(),
    policies: getStoredPolicies()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rifora_store_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
