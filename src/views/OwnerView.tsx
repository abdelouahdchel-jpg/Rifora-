import React, { useState, useEffect } from 'react';
import { Product, Language, Inquiry, OwnerSettings, StorePolicies } from '../types';
import { translations } from '../data/translations';
import {
  exportInquiriesToCSV,
  exportFullDatabaseJSON,
  compressImage,
  sanitizeString,
  DEFAULT_POLICIES
} from '../services/storage';
import {
  fetchAdminProducts,
  saveAdminProduct,
  deleteAdminProduct,
  resetAdminProducts,
  uploadAdminImage,
  fetchAdminInquiries,
  updateAdminInquiryStatus,
  clearAdminInquiries,
  fetchStoreSettings,
  saveAdminSettings,
  fetchStorePolicies,
  saveAdminPolicies
} from '../services/api';
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  HelpCircle,
  Save,
  X,
  FileText,
  Sliders,
  Eye,
  CheckSquare,
  LogOut,
  ArrowLeft
} from 'lucide-react';

interface OwnerViewProps {
  products: Product[];
  lang: Language;
  onProductsUpdated: (updated: Product[]) => void;
  currentUserEmail?: string;
  databaseType?: 'postgres' | 'local_file';
  databaseProvider?: string;
  blobStorageConfigured?: boolean;
  onLogout?: () => void;
  onBackToStore?: () => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  products,
  lang,
  onProductsUpdated,
  currentUserEmail = 'abdelouahdchel@gmail.com',
  databaseType,
  databaseProvider,
  blobStorageConfigured,
  onLogout,
  onBackToStore
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'inquiries' | 'policies' | 'settings'>('products');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<OwnerSettings>({
    whatsappNumber: '+212638194995',
    contactEmail: 'abdelouahdchel@gmail.com',
    storeCurrency: 'MAD'
  });
  const [policies, setPolicies] = useState<StorePolicies>(DEFAULT_POLICIES);
  const [isLoading, setIsLoading] = useState(false);

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Quick Price Modal State (Optimized for quick phone entry)
  const [quickPriceProduct, setQuickPriceProduct] = useState<Product | null>(null);
  const [quickPriceMAD, setQuickPriceMAD] = useState<string>('');
  const [quickCostMAD, setQuickCostMAD] = useState<string>('');
  const [quickShippingMAD, setQuickShippingMAD] = useState<string>('');

  // Form Fields for Products
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameFr, setFormNameFr] = useState('');
  const [formCategory, setFormCategory] = useState<'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor'>('pottery');
  const [formPriceMAD, setFormPriceMAD] = useState<string>('');
  const [formPurchaseCostMAD, setFormPurchaseCostMAD] = useState<string>('');
  const [formShippingCostMAD, setFormShippingCostMAD] = useState<string>('');
  const [formDimensions, setFormDimensions] = useState('To be measured');
  const [formWeight, setFormWeight] = useState('To be measured');
  const [formMaterialEn, setFormMaterialEn] = useState('Natural Moroccan clay');
  const [formMaterialFr, setFormMaterialFr] = useState('Argile marocaine naturelle');
  const [formAvailabilityEn, setFormAvailabilityEn] = useState('Available on Request');
  const [formAvailabilityFr, setFormAvailabilityFr] = useState('Disponible sur demande');
  const [formIsSampleData, setFormIsSampleData] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescFr, setFormDescFr] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const t = translations[lang].owner;

  // Fetch verified backend data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      setIsLoading(true);
      try {
        const [prodRes, inqRes, settRes, polRes] = await Promise.all([
          fetchAdminProducts(),
          fetchAdminInquiries(),
          fetchStoreSettings(),
          fetchStorePolicies()
        ]);

        if (!isMounted) return;

        if (prodRes.success && prodRes.products) {
          onProductsUpdated(prodRes.products);
        }
        if (inqRes.success && inqRes.inquiries) {
          setInquiries(inqRes.inquiries);
        }
        if (settRes) {
          setSettings(settRes);
        }
        if (polRes) {
          setPolicies(polRes);
        }
      } catch (err: any) {
        console.error('Error loading admin backend data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'completed') => {
    try {
      const res = await updateAdminInquiryStatus(id, newStatus);
      if (res.success && res.inquiries) {
        setInquiries(res.inquiries);
      }
    } catch {
      setErrorMessage(lang === 'en' ? 'Failed to update status on server.' : 'Échec de la mise à jour du statut.');
    }
  };

  const handleClearInquiries = async () => {
    if (window.confirm(lang === 'en' ? 'Clear all inquiries stored on the server?' : 'Supprimer toutes les demandes enregistrées sur le serveur ?')) {
      const res = await clearAdminInquiries();
      if (res.success) {
        setInquiries([]);
        setFeedbackNotice(lang === 'en' ? 'Inquiries cleared on server.' : 'Demandes effacées sur le serveur.');
        setTimeout(() => setFeedbackNotice(''), 3000);
      }
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNew(false);
    setFormNameEn(prod.name.en);
    setFormNameFr(prod.name.fr);
    setFormCategory(prod.category);
    setFormPriceMAD(prod.priceMAD != null && prod.priceMAD > 0 ? prod.priceMAD.toString() : '');
    setFormPurchaseCostMAD(prod.purchaseCostMAD != null && prod.purchaseCostMAD > 0 ? prod.purchaseCostMAD.toString() : '');
    setFormShippingCostMAD(prod.shippingCostMAD != null && prod.shippingCostMAD > 0 ? prod.shippingCostMAD.toString() : '');
    setFormDimensions(prod.dimensions || 'To be measured');
    setFormWeight(prod.weight || 'To be measured');
    setFormMaterialEn(prod.material.en);
    setFormMaterialFr(prod.material.fr);
    setFormAvailabilityEn(prod.availability.en);
    setFormAvailabilityFr(prod.availability.fr);
    setFormIsSampleData(prod.isSampleData);
    setFormImageUrl(prod.imageUrl);
    setFormDescEn(prod.description.en);
    setFormDescFr(prod.description.fr);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const startAddNewProduct = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormNameEn('');
    setFormNameFr('');
    setFormCategory('pottery');
    setFormPriceMAD('');
    setFormPurchaseCostMAD('');
    setFormShippingCostMAD('');
    setFormDimensions('To be measured');
    setFormWeight('To be measured');
    setFormMaterialEn('Natural Moroccan earthenware');
    setFormMaterialFr('Terre cuite naturelle du Maroc');
    setFormAvailabilityEn('Available on Request');
    setFormAvailabilityFr('Disponible sur demande');
    setFormIsSampleData(true);
    setFormImageUrl('/assets/aistudio/20261025_111600_f22b7ef1.jpg');
    setFormDescEn('');
    setFormDescFr('');
  };

  const openQuickPriceModal = (prod: Product) => {
    setQuickPriceProduct(prod);
    setQuickPriceMAD(prod.priceMAD != null && prod.priceMAD > 0 ? prod.priceMAD.toString() : '');
    setQuickCostMAD(prod.purchaseCostMAD != null && prod.purchaseCostMAD > 0 ? prod.purchaseCostMAD.toString() : '');
    setQuickShippingMAD(prod.shippingCostMAD != null && prod.shippingCostMAD > 0 ? prod.shippingCostMAD.toString() : '');
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceProduct) return;

    const parsedPrice = quickPriceMAD.trim() !== '' ? Math.max(1, Math.round(Number(quickPriceMAD))) : null;
    const parsedCost = quickCostMAD.trim() !== '' ? Math.max(0, Math.round(Number(quickCostMAD))) : null;
    const parsedShipping = quickShippingMAD.trim() !== '' ? Math.max(0, Math.round(Number(quickShippingMAD))) : null;

    const updatedProduct: Product = {
      ...quickPriceProduct,
      priceMAD: parsedPrice,
      purchaseCostMAD: parsedCost,
      shippingCostMAD: parsedShipping
    };

    setIsLoading(true);
    const result = await saveAdminProduct(updatedProduct);
    setIsLoading(false);

    if (result.success && result.products) {
      onProductsUpdated(result.products);
      setQuickPriceProduct(null);
      setFeedbackNotice(lang === 'en' ? 'Product prices saved persistently on server!' : 'Prix enregistrés de manière persistante sur le serveur !');
      setTimeout(() => setFeedbackNotice(''), 3000);
    } else {
      setErrorMessage(result.error || 'Failed to save price.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setErrorMessage('');
      try {
        const compressedBase64 = await compressImage(file, 900, 900, 0.8);
        const uploadRes = await uploadAdminImage(compressedBase64, file.name);
        if (uploadRes.success && uploadRes.url) {
          setFormImageUrl(uploadRes.url);
          setFeedbackNotice(lang === 'en' ? 'Photo uploaded to server successfully!' : 'Photo téléversée sur le serveur avec succès !');
        } else {
          // Fall back to compressed base64 if server upload endpoint fallback
          setFormImageUrl(compressedBase64);
          setFeedbackNotice(lang === 'en' ? 'Photo compressed and ready to save.' : 'Photo prête à être enregistrée.');
        }
        setTimeout(() => setFeedbackNotice(''), 3000);
      } catch (err: any) {
        console.error('Image upload error', err);
        setErrorMessage(lang === 'en' ? 'Could not process image file.' : 'Impossible de traiter le fichier image.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const sanitizedNameEn = sanitizeString(formNameEn, 120);
    const sanitizedNameFr = sanitizeString(formNameFr, 120);
    if (!sanitizedNameEn) {
      setErrorMessage(lang === 'en' ? 'Product name (English) is required' : 'Le nom en anglais est requis');
      return;
    }

    const productId = editingProduct ? editingProduct.id : `rifora-${Date.now().toString(36)}`;
    const parsedPriceMAD = formPriceMAD.trim() !== '' ? Math.max(1, Math.round(Number(formPriceMAD))) : null;
    const parsedPurchaseCostMAD = formPurchaseCostMAD.trim() !== '' ? Math.max(0, Math.round(Number(formPurchaseCostMAD))) : null;
    const parsedShippingCostMAD = formShippingCostMAD.trim() !== '' ? Math.max(0, Math.round(Number(formShippingCostMAD))) : null;

    const productToSave: Product = {
      id: productId,
      name: {
        en: sanitizedNameEn,
        fr: sanitizedNameFr || sanitizedNameEn
      },
      category: formCategory,
      priceMAD: parsedPriceMAD,
      purchaseCostMAD: parsedPurchaseCostMAD,
      shippingCostMAD: parsedShippingCostMAD,
      priceEUR: null,
      dimensions: sanitizeString(formDimensions, 50) || 'To be measured',
      weight: sanitizeString(formWeight, 30) || 'To be measured',
      material: {
        en: sanitizeString(formMaterialEn, 150),
        fr: sanitizeString(formMaterialFr, 150)
      },
      availability: {
        en: sanitizeString(formAvailabilityEn, 80),
        fr: sanitizeString(formAvailabilityFr, 80)
      },
      artisanPlaceholder: formIsSampleData,
      isSampleData: formIsSampleData,
      needsReview: parsedPriceMAD === null,
      description: {
        en: sanitizeString(formDescEn, 800),
        fr: sanitizeString(formDescFr, 800)
      },
      details: editingProduct ? editingProduct.details : {
        en: ['Handcrafted according to ancestral traditions', 'Measured and inspected before packing'],
        fr: ['Façonné selon les traditions ancestrales', 'Vérifié et inspecté avant emballage']
      },
      imageUrl: formImageUrl.trim() || '/assets/aistudio/20261025_111600_f22b7ef1.jpg',
      featured: editingProduct ? editingProduct.featured : false
    };

    setIsLoading(true);
    const result = await saveAdminProduct(productToSave);
    setIsLoading(false);

    if (!result.success || !result.products) {
      setErrorMessage(result.error || 'Failed to save product to server.');
      return;
    }

    onProductsUpdated(result.products);
    setEditingProduct(null);
    setIsAddingNew(false);
    setFeedbackNotice(lang === 'en' ? 'Product saved persistently on server!' : 'Produit enregistré de manière persistante sur le serveur !');
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(lang === 'en' ? 'Delete this product permanently from the server catalog?' : 'Supprimer définitivement ce produit du catalogue serveur ?')) {
      setIsLoading(true);
      const res = await deleteAdminProduct(productId);
      setIsLoading(false);
      if (res.success && res.products) {
        onProductsUpdated(res.products);
        setFeedbackNotice(lang === 'en' ? 'Product deleted from server.' : 'Produit supprimé du serveur.');
        setTimeout(() => setFeedbackNotice(''), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to delete product.');
      }
    }
  };

  const handleResetCatalog = async () => {
    if (window.confirm(lang === 'en' ? 'Reset catalog to the 10 real workshop pieces with empty prices?' : 'Réinitialiser le catalogue aux 10 pièces réelles d’atelier avec prix à renseigner ?')) {
      setIsLoading(true);
      const res = await resetAdminProducts();
      setIsLoading(false);
      if (res.success && res.products) {
        onProductsUpdated(res.products);
        setFeedbackNotice(lang === 'en' ? 'Catalog restored to 10 workshop items.' : 'Catalogue restauré aux 10 pièces d’atelier.');
        setTimeout(() => setFeedbackNotice(''), 3000);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await saveAdminSettings(settings);
    setIsLoading(false);
    if (res.success) {
      setFeedbackNotice(lang === 'en' ? 'WhatsApp & Store settings saved to server!' : 'Paramètres WhatsApp et boutique enregistrés sur le serveur !');
      setTimeout(() => setFeedbackNotice(''), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to save settings.');
    }
  };

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await saveAdminPolicies(policies);
    setIsLoading(false);
    if (res.success) {
      setFeedbackNotice(lang === 'en' ? 'Store policies saved to server!' : 'Politiques enregistrées sur le serveur !');
      setTimeout(() => setFeedbackNotice(''), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to save policies.');
    }
  };

  const handleResetPolicies = () => {
    if (window.confirm(lang === 'en' ? 'Reset all store policies to default texts?' : 'Réinitialiser toutes les politiques aux textes par défaut ?')) {
      setPolicies(DEFAULT_POLICIES);
      saveAdminPolicies(DEFAULT_POLICIES);
      setFeedbackNotice(lang === 'en' ? 'Policies reset to defaults.' : 'Politiques réinitialisées.');
      setTimeout(() => setFeedbackNotice(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Authenticated Owner Top Bar */}
      <div className="bg-white border border-[#E8DFD3] rounded-sm p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-200 rounded-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Server-Verified Owner Session</span>
            </span>
            <span className="text-xs text-[#7A7067]">
              Signed in as <strong className="text-[#282421]">{currentUserEmail}</strong>
            </span>
          </div>
          <h1 className="font-serif text-2xl text-[#282421]">
            {t.title}
          </h1>
          <p className="text-xs text-[#7A7067] mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#57534E] hover:text-[#282421] border border-[#DDD2C1] hover:bg-[#FBF8F3] rounded-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Storefront' : 'Boutique'}</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-red-700 hover:text-red-800 border border-red-200 hover:bg-red-50 rounded-xs transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'Déconnexion'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Persistence confirmation banner */}
      <div className="p-3.5 bg-[#FBF8F3] border border-[#E8DFD3] rounded-xs text-xs space-y-2 text-[#57534E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#C06548]" />
            <span>
              <strong>Vercel Serverless Architecture:</strong> Stateless HMAC authentication & server-enforced private pricing.
            </span>
          </div>
          {isLoading && (
            <span className="text-[11px] text-[#C06548] animate-pulse font-medium">Syncing backend...</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E8DFD3] text-[11px]">
          <span className="text-[#7A7067]">Active Storage Engine:</span>
          <span className={`px-2 py-0.5 rounded-xs font-medium ${
            databaseType === 'postgres'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {databaseType === 'postgres' ? `Database: ${databaseProvider || 'Vercel Postgres (Connected)'}` : 'Database: Local Dev Store (Add POSTGRES_URL in Vercel for production)'}
          </span>
          <span className={`px-2 py-0.5 rounded-xs font-medium ${
            blobStorageConfigured
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}>
            {blobStorageConfigured ? 'Media: Vercel Blob (CDN Active)' : 'Media: Local / Inline (Add BLOB_READ_WRITE_TOKEN in Vercel)'}
          </span>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-[#EBF7EE] border border-[#BDE5C5] text-[#1B5E20] rounded-xs text-xs flex items-center justify-between">
          <span>{feedbackNotice}</span>
          <button onClick={() => setFeedbackNotice('')} className="text-[#1B5E20]">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] rounded-xs text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-[#9B1C1C]">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DFD3] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#C06548] text-[#C06548]'
              : 'border-transparent text-[#6E6358] hover:text-[#282421]'
          }`}
        >
          {t.tabs.products} ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'border-[#C06548] text-[#C06548]'
              : 'border-transparent text-[#6E6358] hover:text-[#282421]'
          }`}
        >
          {t.tabs.inquiries} ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'policies'
              ? 'border-[#C06548] text-[#C06548]'
              : 'border-transparent text-[#6E6358] hover:text-[#282421]'
          }`}
        >
          {t.tabs.policies}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#C06548] text-[#C06548]'
              : 'border-transparent text-[#6E6358] hover:text-[#282421]'
          }`}
        >
          {t.tabs.settings}
        </button>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-[#6E6358]">
              {t.productMgmt.totalProducts}: <strong className="font-mono">{products.length}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={startAddNewProduct}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.productMgmt.addNew}</span>
              </button>

              <button
                onClick={handleResetCatalog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#7A7067] hover:text-[#282421] bg-white border border-[#DDD2C1] hover:bg-[#F4EFE6] rounded-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.productMgmt.resetDefault}</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Form Modal or In-Page Drawer */}
          {(isAddingNew || editingProduct) && (
            <div className="bg-white border-2 border-[#C06548] p-6 rounded-xs shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <h3 className="font-serif text-xl text-[#282421]">
                  {editingProduct
                    ? (lang === 'en' ? `Edit Product: ${editingProduct.name.en}` : `Modifier : ${editingProduct.name.fr}`)
                    : (lang === 'en' ? 'Add New Moroccan Product' : 'Ajouter une nouvelle pièce')}
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingNew(false);
                  }}
                  className="text-[#7A7067] hover:text-[#282421]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Sample vs Verified Toggle */}
                <div className="p-3 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#282421] block">
                      {lang === 'en' ? 'Data Verification Status' : 'Statut de Vérification des Données'}
                    </span>
                    <span className="text-[11px] text-[#7A7067]">
                      {formIsSampleData 
                        ? (lang === 'en' ? 'Marked as Sample Prototype / Unverified Workshop' : 'Marqué comme Prototype / Atelier non formalisé')
                        : (lang === 'en' ? 'Verified Artisan Piece (Actual measurements and pricing)' : 'Pièce artisanale vérifiée')}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#282421]">
                    <input
                      type="checkbox"
                      checked={formIsSampleData}
                      onChange={(e) => setFormIsSampleData(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C06548]"
                    />
                    <span>{lang === 'en' ? 'Is Prototype Specimen' : 'Est un échantillon'}</span>
                  </label>
                </div>

                {/* Names in EN and FR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.nameEn} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.nameFr} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNameFr}
                      onChange={(e) => setFormNameFr(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                </div>

                {/* Category & MAD Pricing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.category} *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    >
                      <option value="pottery">Pottery</option>
                      <option value="vases">Decorative Vases</option>
                      <option value="bowls">Ceramic Bowls</option>
                      <option value="lanterns">Lanterns</option>
                      <option value="decor">Moroccan Decor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.priceMAD}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formPriceMAD}
                      onChange={(e) => setFormPriceMAD(e.target.value)}
                      placeholder={lang === 'en' ? 'Leave empty for "Price to be added"' : 'Laisser vide pour "Prix à renseigner"'}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                    />
                    <span className="block text-[10px] text-[#7A7067] mt-0.5">
                      {lang === 'en' ? 'Default store currency is MAD (Moroccan dirham).' : 'Devise par défaut de la boutique : MAD.'}
                    </span>
                  </div>
                </div>

                {/* Private Cost & Separate Shipping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#FBF8F3] border border-[#E8DFD3] rounded-xs">
                  <div>
                    <label className="block font-medium text-[#38332E] mb-1">
                      {t.form.purchaseCostMAD}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formPurchaseCostMAD}
                      onChange={(e) => setFormPurchaseCostMAD(e.target.value)}
                      placeholder={lang === 'en' ? 'e.g. 50 (Private workshop cost)' : 'ex. 50 (Prix d’achat atelier)'}
                      className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                    />
                    <span className="block text-[10px] text-[#8C8074] mt-0.5">
                      {lang === 'en' ? 'Confidential: Hidden from customer storefront' : 'Confidentiel : Masqué aux visiteurs'}
                    </span>
                  </div>
                  <div>
                    <label className="block font-medium text-[#38332E] mb-1">
                      {t.form.shippingCostMAD}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formShippingCostMAD}
                      onChange={(e) => setFormShippingCostMAD(e.target.value)}
                      placeholder={lang === 'en' ? 'Leave empty if calculated per destination' : 'Laisser vide si devis par destination'}
                      className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                    />
                    <span className="block text-[10px] text-[#8C8074] mt-0.5">
                      {lang === 'en' ? 'Kept separate from product price (never bundled)' : 'Distinct du prix de l’article'}
                    </span>
                  </div>
                </div>

                {/* Dimensions & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.dimensions}
                    </label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      placeholder="To be measured"
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.weight}
                    </label>
                    <input
                      type="text"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      placeholder="To be measured"
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                </div>

                {/* Materials EN & FR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.materialEn} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formMaterialEn}
                      onChange={(e) => setFormMaterialEn(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.materialFr} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formMaterialFr}
                      onChange={(e) => setFormMaterialFr(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                </div>

                {/* Availability EN & FR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.availabilityEn}
                    </label>
                    <input
                      type="text"
                      value={formAvailabilityEn}
                      onChange={(e) => setFormAvailabilityEn(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.availabilityFr}
                    </label>
                    <input
                      type="text"
                      value={formAvailabilityFr}
                      onChange={(e) => setFormAvailabilityFr(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                </div>

                {/* Photo Upload with Compression */}
                <div className="p-4 bg-[#F7F2EA] border border-[#DDD2C1] rounded-xs space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-[#282421]">
                    <ImageIcon className="w-4 h-4 text-[#C06548]" />
                    <span>Product Photo & Client-Side Canvas Compression</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <label className="block font-medium text-[#443E38]">
                        {t.form.imageUrl}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /src/assets/images/... or https://..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="w-full p-2 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                      />
                      
                      <div className="pt-1">
                        <label className="block font-medium text-[#443E38] mb-1">
                          {t.form.orUpload}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploadingImage}
                          className="text-xs text-[#5C534B] file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-medium file:bg-[#C06548] file:text-white hover:file:bg-[#9E4A31] cursor-pointer disabled:opacity-50"
                        />
                        {isUploadingImage && (
                          <span className="text-[11px] text-[#C06548] block mt-1">Compressing image for browser storage...</span>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-[#EFE8DC] border border-[#DDD2C1] rounded-xs overflow-hidden flex items-center justify-center">
                        {formImageUrl ? (
                          <img
                            src={formImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-[#8C8074]">No image</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7A7067] mt-1">Live Preview</span>
                    </div>
                  </div>
                </div>

                {/* Description EN & FR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.descriptionEn}
                    </label>
                    <textarea
                      rows={3}
                      value={formDescEn}
                      onChange={(e) => setFormDescEn(e.target.value)}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.descriptionFr}
                    </label>
                    <textarea
                      rows={3}
                      value={formDescFr}
                      onChange={(e) => setFormDescFr(e.target.value)}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] resize-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#6E6358] hover:text-[#282421] border border-[#DDD2C1] rounded-xs"
                  >
                    {t.form.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs transition-colors cursor-pointer shadow-xs"
                  >
                    {t.form.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Phone Quick Editing & Price Management Reminder */}
          <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xs text-xs text-[#92400E] flex items-start gap-2">
            <Sliders className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">
                {lang === 'en' ? 'Mobile Price Management (MAD)' : 'Gestion des prix sur mobile (MAD)'}
              </span>
              <p className="text-[11px] text-[#B45309] mt-0.5 leading-relaxed">
                {lang === 'en'
                  ? 'All 10 Moroccan products start with empty prices ("Price to be added"). Tap the "Edit Price (MAD)" button on any product below to enter or update the selling price, confidential supplier cost, or shipping fee directly from your phone.'
                  : 'Les 10 produits débutent sans prix (« Prix à renseigner »). Cliquez sur « Modifier Prix (MAD) » sur n’importe quel article ci-dessous pour renseigner le prix de vente, coût fournisseur ou frais d’envoi depuis votre mobile.'}
              </p>
            </div>
          </div>

          {/* Mobile Card Layout (< 768px screens) for effortless touch editing */}
          <div className="md:hidden space-y-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-[#E8DFD3] rounded-xs p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-[#F4EFE6] rounded-xs overflow-hidden border border-[#DDD2C1] shrink-0">
                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-serif text-sm font-medium text-[#282421] block truncate">
                      {p.name[lang]}
                    </span>
                    <span className="text-[10px] text-[#7A7067] font-mono block">
                      Ref: {p.id} · {p.category}
                    </span>
                    <div className="mt-1">
                      {p.priceMAD != null && p.priceMAD > 0 ? (
                        <span className="font-mono text-sm font-bold text-[#282421]">
                          {p.priceMAD} MAD
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#C06548] italic bg-[#FDF2F0] px-2 py-0.5 border border-[#F8D7DA] rounded-xs inline-block">
                          {t.productMgmt.sampleBadge ? 'Price to be added' : 'Prix à renseigner'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Private Cost and Shipping summary */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FBF8F3] p-2.5 rounded-xs border border-[#F0E8DC]">
                  <div>
                    <span className="text-[#8C8074] block text-[10px] uppercase">Cost (Private):</span>
                    <span className="font-mono font-medium text-[#38332E]">
                      {p.purchaseCostMAD != null && p.purchaseCostMAD > 0 ? `${p.purchaseCostMAD} MAD` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8074] block text-[10px] uppercase">Shipping:</span>
                    <span className="font-mono font-medium text-[#38332E]">
                      {p.shippingCostMAD != null && p.shippingCostMAD > 0 ? `${p.shippingCostMAD} MAD` : 'Per quote'}
                    </span>
                  </div>
                </div>

                {/* Mobile Touch Action Buttons (High tap targets >= 44px) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openQuickPriceModal(p)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs cursor-pointer shadow-xs"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Edit Price (MAD)' : 'Modifier Prix (MAD)'}</span>
                  </button>
                  <button
                    onClick={() => startEditProduct(p)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-[#5C534B] hover:text-[#282421] border border-[#DDD2C1] bg-white rounded-xs"
                    title="Full Edit"
                    aria-label="Full Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-[#9B1C1C] hover:bg-[#FDF2F2] border border-[#DDD2C1] bg-white rounded-xs"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px screens) */}
          <div className="hidden md:block bg-white border border-[#E8DFD3] rounded-xs overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F2EA] border-b border-[#E8DFD3] text-[#5C534B] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Photo</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Selling Price (MAD)</th>
                  <th className="p-3">Workshop Cost (Private)</th>
                  <th className="p-3">Shipping (Separate)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FBF8F3] transition-colors">
                    <td className="p-3 w-16">
                      <div className="w-12 h-12 bg-[#F4EFE6] rounded-xs overflow-hidden border border-[#DDD2C1]">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-medium text-[#282421]">
                      <span>{p.name[lang]}</span>
                      <span className="block text-[10px] text-[#7A7067] font-mono">Ref: {p.id} · {p.category}</span>
                    </td>
                    <td className="p-3">
                      {p.priceMAD != null && p.priceMAD > 0 ? (
                        <span className="font-mono font-semibold text-sm text-[#282421]">
                          {p.priceMAD} MAD
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A3523B] bg-[#FDF2F0] px-2 py-0.5 border border-[#F8D7DA] rounded-xs uppercase font-medium italic">
                          Price to be added
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-[#38332E]">
                      {p.purchaseCostMAD != null && p.purchaseCostMAD > 0 ? (
                        <span>{p.purchaseCostMAD} MAD <span className="text-[10px] text-[#8C8074]">(Private)</span></span>
                      ) : (
                        <span className="text-[#8C8074]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-[#6E6358] font-mono">
                      {p.shippingCostMAD != null && p.shippingCostMAD > 0 ? `${p.shippingCostMAD} MAD` : 'Per inquiry quote'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openQuickPriceModal(p)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#C06548] border border-[#C06548] hover:bg-[#C06548] hover:text-white rounded-xs transition-colors cursor-pointer"
                          title="Quick Price Editor"
                        >
                          Edit Price (MAD)
                        </button>
                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 text-[#5C534B] hover:text-[#C06548] border border-[#DDD2C1] hover:bg-white rounded-xs transition-colors cursor-pointer"
                          title="Edit Full Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-[#9B1C1C] hover:bg-[#FDF2F2] border border-[#DDD2C1] rounded-xs transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Inquiries Management */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-xs text-[#6E6358]">
              {lang === 'en'
                ? 'Inquiries recorded on this browser device session for local validation testing.'
                : 'Demandes enregistrées sur la session locale de ce navigateur.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={exportInquiriesToCSV}
                disabled={inquiries.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#282421] bg-white border border-[#DDD2C1] hover:bg-[#F4EFE6] rounded-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#4A5844]" />
                <span>{t.inquiryTable.exportCSV}</span>
              </button>
              <button
                onClick={exportFullDatabaseJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#282421] bg-white border border-[#DDD2C1] hover:bg-[#F4EFE6] rounded-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C06548]" />
                <span>{t.inquiryTable.exportJSON}</span>
              </button>
              {inquiries.length > 0 && (
                <button
                  onClick={handleClearInquiries}
                  className="px-3 py-1.5 text-xs font-medium text-[#9B1C1C] bg-white border border-[#F8B4B4] hover:bg-[#FDF2F2] rounded-xs transition-colors cursor-pointer"
                >
                  {t.inquiryTable.clearInquiries}
                </button>
              )}
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E8DFD3] rounded-xs text-[#7A7067] text-xs">
              <p>{t.inquiryTable.noInquiries}</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD3] rounded-xs overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F2EA] border-b border-[#E8DFD3] text-[#5C534B] uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Ref & Date</th>
                    <th className="p-3">{t.inquiryTable.customer}</th>
                    <th className="p-3">{t.inquiryTable.country}</th>
                    <th className="p-3">{t.inquiryTable.product}</th>
                    <th className="p-3 text-center">{t.inquiryTable.qty}</th>
                    <th className="p-3">{t.inquiryTable.status}</th>
                    <th className="p-3 text-right">{t.inquiryTable.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8DC]">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-[#FBF8F3] transition-colors">
                      <td className="p-3 text-[#38332E]">
                        <span className="font-mono text-[11px] block">{inq.id}</span>
                        <span className="text-[10px] text-[#8C8074]">
                          {new Date(inq.createdAt).toLocaleDateString()} {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-[#282421] block">{inq.customerName}</span>
                        <a href={`mailto:${inq.email}`} className="text-[11px] text-[#6E6358] hover:text-[#C06548] flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{inq.email}</span>
                        </a>
                        {inq.phone && (
                          <span className="text-[10px] text-[#8C8074] flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{inq.phone}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-[#282421] font-medium">
                        {inq.destinationCountry}
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-[#282421] block">{inq.productName}</span>
                        {inq.notes && (
                          <span className="text-[10px] text-[#7A7067] italic block mt-0.5 truncate max-w-xs" title={inq.notes}>
                            "{inq.notes}"
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono tabular-nums text-center text-[#282421] font-semibold">
                        {inq.quantity}
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold rounded-xs ${
                          inq.status === 'completed'
                            ? 'bg-[#EBF7EE] text-[#1B5E20]'
                            : inq.status === 'contacted'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F4EFE6] text-[#78350F]'
                        }`}>
                          {inq.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inq.status !== 'contacted' && (
                            <button
                              onClick={() => handleStatusChange(inq.id, 'contacted')}
                              className="px-2 py-1 text-[10px] font-medium bg-[#F4EFE6] hover:bg-[#E8DFC9] text-[#282421] rounded-xs cursor-pointer"
                            >
                              {t.inquiryTable.markContacted}
                            </button>
                          )}
                          {inq.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusChange(inq.id, 'completed')}
                              className="px-2 py-1 text-[10px] font-medium bg-[#EBF7EE] hover:bg-[#D4EDDA] text-[#155724] rounded-xs cursor-pointer"
                            >
                              {t.inquiryTable.markCompleted}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Data Persistence Explanation Box */}
          <div className="p-5 bg-[#F4EFE6] border border-[#DDD2C1] rounded-xs text-xs text-[#524B44] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#282421]">
              <HelpCircle className="w-4 h-4 text-[#4A5844]" />
              <span>{t.storageExplanation.title}</span>
            </div>
            <p className="leading-relaxed text-[#6E6358]">{t.storageExplanation.p1}</p>
            <p className="leading-relaxed text-[#6E6358]">{t.storageExplanation.p2}</p>
            <p className="leading-relaxed text-[#6E6358]">{t.storageExplanation.p3}</p>
          </div>
        </div>
      )}

      {/* Tab 3: Editable Policies & Legal Texts */}
      {activeTab === 'policies' && (
        <div className="max-w-4xl bg-white border border-[#E8DFD3] p-6 sm:p-8 rounded-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8DFD3] pb-4">
            <div>
              <h3 className="font-serif text-xl text-[#282421]">
                Editable Store Policies & Legal Disclaimers
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Edit European shipping terms, transit estimates, damage policy, and privacy notices without editing source code.
              </p>
            </div>
            <button
              onClick={handleResetPolicies}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#7A7067] hover:text-[#282421] border border-[#DDD2C1] rounded-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <form onSubmit={handleSavePolicies} className="space-y-6 text-xs">
            {/* Shipping Transit Notice */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#282421]">
                Shipping Transit Time Notice (EN & FR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={3}
                  value={policies.transitTimeNotice.en}
                  onChange={(e) => setPolicies({ ...policies, transitTimeNotice: { ...policies.transitTimeNotice, en: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                  placeholder="Transit time notice (EN)"
                />
                <textarea
                  rows={3}
                  value={policies.transitTimeNotice.fr}
                  onChange={(e) => setPolicies({ ...policies, transitTimeNotice: { ...policies.transitTimeNotice, fr: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                  placeholder="Transit time notice (FR)"
                />
              </div>
            </div>

            {/* Damage & Claims Policy */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#282421]">
                Ceramic Damage & Transit Protection Policy (EN & FR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={3}
                  value={policies.damagePolicy.en}
                  onChange={(e) => setPolicies({ ...policies, damagePolicy: { ...policies.damagePolicy, en: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
                <textarea
                  rows={3}
                  value={policies.damagePolicy.fr}
                  onChange={(e) => setPolicies({ ...policies, damagePolicy: { ...policies.damagePolicy, fr: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
              </div>
            </div>

            {/* Returns Policy */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#282421]">
                Return Window & Policy (EN & FR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={3}
                  value={policies.returnPolicy.en}
                  onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, en: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
                <textarea
                  rows={3}
                  value={policies.returnPolicy.fr}
                  onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, fr: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#282421]">
                Privacy Notice Text (EN & FR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={3}
                  value={policies.privacyNotice.en}
                  onChange={(e) => setPolicies({ ...policies, privacyNotice: { ...policies.privacyNotice, en: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
                <textarea
                  rows={3}
                  value={policies.privacyNotice.fr}
                  onChange={(e) => setPolicies({ ...policies, privacyNotice: { ...policies.privacyNotice, fr: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
              </div>
            </div>

            {/* Terms of Service */}
            <div className="space-y-2">
              <label className="block font-semibold text-[#282421]">
                Pilot Terms Notice (EN & FR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={3}
                  value={policies.termsNotice.en}
                  onChange={(e) => setPolicies({ ...policies, termsNotice: { ...policies.termsNotice, en: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
                <textarea
                  rows={3}
                  value={policies.termsNotice.fr}
                  onChange={(e) => setPolicies({ ...policies, termsNotice: { ...policies.termsNotice, fr: e.target.value } })}
                  className="w-full p-2 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Policy Updates</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Store & WhatsApp Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white border border-[#E8DFD3] p-6 sm:p-8 rounded-xs space-y-6">
          <div className="border-b border-[#E8DFD3] pb-4">
            <h3 className="font-serif text-xl text-[#282421]">
              WhatsApp & Store Communication Settings
            </h3>
            <p className="text-xs text-[#7A7067] mt-0.5">
              Customize the phone number where European customers will reach you via WhatsApp buttons.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#443E38] mb-1">
                Store WhatsApp Number (International format with country code)
              </label>
              <input
                type="text"
                required
                placeholder="+212638194995"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs font-mono text-[#282421]"
              />
              <span className="text-[11px] text-[#8C8074] mt-1 block">
                Used in WhatsApp buttons on product cards, floating widget, and inquiry confirmation.
              </span>
            </div>

            <div>
              <label className="block font-medium text-[#443E38] mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                placeholder="abdelouahdchel@gmail.com"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Price Modal for Phone & Desktop */}
      {quickPriceProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-[#DDD2C1] rounded-xs p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C06548] font-semibold block">
                  {lang === 'en' ? 'Quick Price Manager (MAD)' : 'Gestion Rapide des Prix (MAD)'}
                </span>
                <h3 className="font-serif text-lg text-[#282421]">
                  {quickPriceProduct.name[lang]}
                </h3>
              </div>
              <button
                onClick={() => setQuickPriceProduct(null)}
                className="text-[#7A7067] hover:text-[#282421] p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="space-y-4 text-xs">
              {/* Selling Price */}
              <div>
                <label className="block font-medium text-[#282421] mb-1">
                  {lang === 'en' ? 'Selling Price (MAD)' : 'Prix de vente (MAD)'}
                </label>
                <input
                  type="number"
                  min="0"
                  autoFocus
                  value={quickPriceMAD}
                  onChange={(e) => setQuickPriceMAD(e.target.value)}
                  placeholder={lang === 'en' ? 'Leave empty for "Price to be added"' : 'Laisser vide pour "Prix à renseigner"'}
                  className="w-full p-3 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-sm font-mono tabular-nums text-[#282421] focus:outline-none focus:border-[#C06548]"
                />
                <span className="block text-[11px] text-[#7A7067] mt-1">
                  {lang === 'en'
                    ? 'Customer-facing selling price. If empty, displays "Price to be added".'
                    : 'Prix affiché en boutique. Si vide, affiche « Prix à renseigner ».'}
                </span>
              </div>

              {/* Purchase Cost (Confidential) */}
              <div className="p-3 bg-[#FBF8F3] border border-[#E8DFD3] rounded-xs">
                <label className="block font-medium text-[#282421] mb-1">
                  {lang === 'en' ? 'Purchase Cost (MAD) — PRIVATE' : 'Prix d’achat atelier (MAD) — PRIVÉ'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quickCostMAD}
                  onChange={(e) => setQuickCostMAD(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. 50 (Private workshop cost)' : 'ex. 50 (Coût d’achat atelier)'}
                  className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                />
                <span className="block text-[10px] text-[#8C8074] mt-0.5">
                  {lang === 'en' ? 'Confidential: Never exposed to visitors.' : 'Confidentiel : Jamais visible par les clients.'}
                </span>
              </div>

              {/* Shipping Fee */}
              <div>
                <label className="block font-medium text-[#282421] mb-1">
                  {lang === 'en' ? 'Shipping Cost (MAD) — Kept Separate' : 'Frais d’envoi (MAD) — Distincts'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quickShippingMAD}
                  onChange={(e) => setQuickShippingMAD(e.target.value)}
                  placeholder={lang === 'en' ? 'Leave empty if calculated per destination' : 'Laisser vide si devis par destination'}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                />
                <span className="block text-[10px] text-[#7A7067] mt-0.5">
                  {lang === 'en' ? 'Shipping fee remains separate from product price.' : 'Frais de port calculés séparément du prix de l’article.'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFD3]">
                <button
                  type="button"
                  onClick={() => setQuickPriceProduct(null)}
                  className="px-4 py-2.5 text-xs text-[#5C534B] hover:text-[#282421] border border-[#DDD2C1] rounded-xs cursor-pointer"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#C06548] hover:bg-[#9E4A31] rounded-xs cursor-pointer shadow-xs"
                >
                  {lang === 'en' ? 'Save Price' : 'Enregistrer le prix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
