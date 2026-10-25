import React, { useState, useEffect } from 'react';
import { Product, Language, Inquiry, OwnerSettings, StorePolicies } from '../types';
import { translations } from '../data/translations';
import {
  getStoredInquiries,
  updateInquiryStatusInStorage,
  clearStoredInquiries,
  saveProductToStorage,
  deleteProductFromStorage,
  resetProductsToDefault,
  exportInquiriesToCSV,
  exportFullDatabaseJSON,
  getStoredOwnerSettings,
  saveStoredOwnerSettings,
  getStoredPolicies,
  saveStoredPolicies,
  resetStoredPolicies,
  compressImage,
  sanitizeString
} from '../services/storage';
import {
  AlertTriangle,
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
  CheckSquare
} from 'lucide-react';

interface OwnerViewProps {
  products: Product[];
  lang: Language;
  onProductsUpdated: (updated: Product[]) => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  products,
  lang,
  onProductsUpdated
}) => {
  // Security & Mode State: Explicit dev environment acknowledgment, NO fake hardcoded passwords
  const [hasAcknowledgedDevMode, setHasAcknowledgedDevMode] = useState<boolean>(() => {
    return sessionStorage.getItem('rifora_dev_acknowledged') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'products' | 'inquiries' | 'policies' | 'settings'>('products');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<OwnerSettings>(getStoredOwnerSettings());
  const [policies, setPolicies] = useState<StorePolicies>(getStoredPolicies());

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form Fields for Products
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameFr, setFormNameFr] = useState('');
  const [formCategory, setFormCategory] = useState<'pottery' | 'vases' | 'bowls' | 'lanterns' | 'decor'>('pottery');
  const [formPriceEUR, setFormPriceEUR] = useState<number>(65);
  const [formDimensions, setFormDimensions] = useState('H 30 cm × Ø 20 cm');
  const [formWeight, setFormWeight] = useState('2.0 kg');
  const [formMaterialEn, setFormMaterialEn] = useState('Natural Moroccan clay');
  const [formMaterialFr, setFormMaterialFr] = useState('Argile marocaine naturelle');
  const [formAvailabilityEn, setFormAvailabilityEn] = useState('Available on Request');
  const [formAvailabilityFr, setFormAvailabilityFr] = useState('Disponible sur demande');
  const [formIsSampleData, setFormIsSampleData] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescFr, setFormDescFr] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const t = translations[lang].owner;

  useEffect(() => {
    if (hasAcknowledgedDevMode) {
      setInquiries(getStoredInquiries());
      setSettings(getStoredOwnerSettings());
      setPolicies(getStoredPolicies());
    }
  }, [hasAcknowledgedDevMode]);

  const handleAcknowledge = () => {
    sessionStorage.setItem('rifora_dev_acknowledged', 'true');
    setHasAcknowledgedDevMode(true);
  };

  const handleStatusChange = (id: string, newStatus: 'new' | 'contacted' | 'completed') => {
    const updated = updateInquiryStatusInStorage(id, newStatus);
    setInquiries(updated);
  };

  const handleClearInquiries = () => {
    if (window.confirm(lang === 'en' ? 'Clear all test inquiries recorded on this browser?' : 'Supprimer toutes les demandes de test sur ce navigateur ?')) {
      clearStoredInquiries();
      setInquiries([]);
      setFeedbackNotice(lang === 'en' ? 'Test inquiries cleared.' : 'Demandes de test effacées.');
      setTimeout(() => setFeedbackNotice(''), 3000);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNew(false);
    setFormNameEn(prod.name.en);
    setFormNameFr(prod.name.fr);
    setFormCategory(prod.category);
    setFormPriceEUR(prod.priceEUR);
    setFormDimensions(prod.dimensions);
    setFormWeight(prod.weight);
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
    setFormPriceEUR(75);
    setFormDimensions('H 32 cm × Ø 20 cm');
    setFormWeight('1.8 kg');
    setFormMaterialEn('Natural Moroccan earthenware');
    setFormMaterialFr('Terre cuite naturelle du Maroc');
    setFormAvailabilityEn('Available on Request');
    setFormAvailabilityFr('Disponible sur demande');
    setFormIsSampleData(false);
    setFormImageUrl('/src/assets/images/hero_moroccan_pottery_1792840896413.jpg');
    setFormDescEn('');
    setFormDescFr('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setErrorMessage('');
      try {
        // Compress image client-side to ensure it safely fits in localStorage without hitting quota
        const compressedBase64 = await compressImage(file, 800, 800, 0.75);
        setFormImageUrl(compressedBase64);
        setFeedbackNotice(lang === 'en' ? 'Photo compressed and ready to save.' : 'Photo compressée et prête à être enregistrée.');
        setTimeout(() => setFeedbackNotice(''), 3000);
      } catch (err: any) {
        console.error('Image compression error', err);
        setErrorMessage(lang === 'en' ? 'Could not process image file.' : 'Impossible de traiter le fichier image.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const sanitizedNameEn = sanitizeString(formNameEn, 120);
    const sanitizedNameFr = sanitizeString(formNameFr, 120);
    if (!sanitizedNameEn) {
      setErrorMessage(lang === 'en' ? 'Product name (English) is required' : 'Le nom en anglais est requis');
      return;
    }

    const productId = editingProduct ? editingProduct.id : `rifora-${Date.now().toString(36)}`;
    const productToSave: Product = {
      id: productId,
      name: {
        en: sanitizedNameEn,
        fr: sanitizedNameFr || sanitizedNameEn
      },
      category: formCategory,
      priceEUR: Math.max(1, Math.round(Number(formPriceEUR) || 60)),
      dimensions: sanitizeString(formDimensions, 50),
      weight: sanitizeString(formWeight, 30),
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
      description: {
        en: sanitizeString(formDescEn, 800),
        fr: sanitizeString(formDescFr, 800)
      },
      details: editingProduct ? editingProduct.details : {
        en: ['Handcrafted according to ancestral traditions', 'Measured and inspected before packing'],
        fr: ['Façonné selon les traditions ancestrales', 'Vérifié et inspecté avant emballage']
      },
      imageUrl: formImageUrl.trim() || '/src/assets/images/hero_moroccan_pottery_1792840896413.jpg',
      featured: editingProduct ? editingProduct.featured : false
    };

    const result = saveProductToStorage(productToSave);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to save product to storage.');
      return;
    }

    onProductsUpdated(result.products);
    setEditingProduct(null);
    setIsAddingNew(false);
    setFeedbackNotice(lang === 'en' ? 'Product saved successfully! Persisted on this device.' : 'Produit enregistré avec succès sur cet appareil !');
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm(lang === 'en' ? 'Delete this product from catalog?' : 'Supprimer ce produit du catalogue ?')) {
      const updatedCatalog = deleteProductFromStorage(productId);
      onProductsUpdated(updatedCatalog);
      setFeedbackNotice(lang === 'en' ? 'Product removed.' : 'Produit supprimé.');
      setTimeout(() => setFeedbackNotice(''), 3000);
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm(lang === 'en' ? 'Reset catalog to default sample pieces?' : 'Réinitialiser le catalogue aux échantillons par défaut ?')) {
      const defaultCatalog = resetProductsToDefault();
      onProductsUpdated(defaultCatalog);
      setFeedbackNotice(lang === 'en' ? 'Catalog restored to sample defaults.' : 'Catalogue restauré aux échantillons.');
      setTimeout(() => setFeedbackNotice(''), 3000);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredOwnerSettings(settings);
    setFeedbackNotice(lang === 'en' ? 'WhatsApp & Store settings saved!' : 'Paramètres WhatsApp et boutique enregistrés !');
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredPolicies(policies);
    setFeedbackNotice(lang === 'en' ? 'Store policies and legal texts updated and saved!' : 'Textes et politiques de la boutique mis à jour !');
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  const handleResetPolicies = () => {
    if (window.confirm(lang === 'en' ? 'Reset all store policies to default texts?' : 'Réinitialiser toutes les politiques aux textes par défaut ?')) {
      const def = resetStoredPolicies();
      setPolicies(def);
      setFeedbackNotice(lang === 'en' ? 'Policies reset to defaults.' : 'Politiques réinitialisées.');
      setTimeout(() => setFeedbackNotice(''), 3000);
    }
  };

  // If Dev Mode Not Yet Acknowledged: Transparent Environment Disclosure
  if (!hasAcknowledgedDevMode) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-[#DDD2C1] rounded-xs p-8 shadow-sm space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#B45309]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C06548] block">
              Development & Local Manager Tool
            </span>
            <h1 className="font-serif text-2xl text-[#282421]">
              {t.devNoticeTitle}
            </h1>
            <p className="text-xs text-[#6E6358] leading-relaxed text-left">
              {t.devNoticeText}
            </p>
          </div>

          <div className="p-4 bg-[#F7F2EA] border border-[#DDD2C1] rounded-xs text-xs text-[#524B44] space-y-2 text-left">
            <span className="font-semibold text-[#282421] block">Architectural Status:</span>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-[#6E6358]">
              <li><strong>Local Storage Only:</strong> Products, inquiries, and policies are stored in your current browser session.</li>
              <li><strong>No Secret in Client Code:</strong> No hardcoded passwords exist in JavaScript.</li>
              <li><strong>Production Requirement:</strong> To receive inquiries from remote European customers and protect administrative actions, configure a server API with backend authentication.</li>
            </ul>
          </div>

          <button
            onClick={handleAcknowledge}
            className="w-full py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs cursor-pointer shadow-xs"
          >
            I Understand — Open Local Dev Tool
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DFD3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#FFFBEB] text-[#92400E] px-2 py-0.5 border border-[#FDE68A] rounded-xs">
              Local Dev & Testing Mode
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#282421]">
            {t.title}
          </h1>
          <p className="text-xs text-[#7A7067] mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sessionStorage.removeItem('rifora_dev_acknowledged');
              setHasAcknowledgedDevMode(false);
            }}
            className="px-3 py-1.5 text-xs text-[#7A7067] hover:text-[#282421] border border-[#DDD2C1] hover:bg-white rounded-xs transition-colors cursor-pointer"
          >
            Exit Manager Mode
          </button>
        </div>
      </div>

      {/* Security Warning Strip */}
      <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xs text-xs flex items-center gap-2 text-[#92400E]">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
        <span>
          <strong>Local Device Scoped:</strong> Inquiries submitted on other visitors' browsers in Europe are not saved here. An authenticated server database is required for shared production storage.
        </span>
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

                {/* Category & EUR Price */}
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
                      {t.form.priceEUR} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPriceEUR}
                      onChange={(e) => setFormPriceEUR(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421]"
                    />
                  </div>
                </div>

                {/* Dimensions & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.dimensions} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#443E38] mb-1">
                      {t.form.weight} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
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

          {/* Product Items Table */}
          <div className="bg-white border border-[#E8DFD3] rounded-xs overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F2EA] border-b border-[#E8DFD3] text-[#5C534B] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Photo</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Price (EUR)</th>
                  <th className="p-3">Dimensions & Weight</th>
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
                      <span className="block text-[10px] text-[#7A7067] font-mono">Ref: {p.id}</span>
                    </td>
                    <td className="p-3">
                      {p.isSampleData ? (
                        <span className="text-[10px] text-[#A3523B] bg-[#FDF2F0] px-2 py-0.5 border border-[#F8D7DA] rounded-xs uppercase font-medium">
                          Prototype Sample
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#155724] bg-[#EBF7EE] px-2 py-0.5 border border-[#C3E6CB] rounded-xs uppercase font-medium">
                          Verified Item
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-semibold tabular-nums text-[#282421]">
                      €{p.priceEUR}
                    </td>
                    <td className="p-3 text-[11px] text-[#6E6358]">
                      <div>{p.dimensions}</div>
                      <div className="text-[#8C8074]">{p.weight}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 text-[#5C534B] hover:text-[#C06548] border border-[#DDD2C1] hover:bg-white rounded-xs transition-colors cursor-pointer"
                          title="Edit Product"
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

    </div>
  );
};
