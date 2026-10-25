import React, { useState } from 'react';
import { Product, Language, Inquiry } from '../types';
import { translations, EUROPEAN_COUNTRIES } from '../data/translations';
import { addInquiryToStorage, generateWhatsAppLink, getStoredOwnerSettings, isValidEmail } from '../services/storage';
import { X, CheckCircle, MessageCircle, AlertTriangle, ShieldAlert, Mail, Send, ExternalLink } from 'lucide-react';

interface InquiryModalProps {
  product: Product | null;
  allProducts: Product[];
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onInquiryAdded?: (inquiry: Inquiry) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  product,
  allProducts,
  lang,
  isOpen,
  onClose,
  onInquiryAdded
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(product ? product.id : (allProducts[0]?.id || 'general'));
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('France');
  const [customCountry, setCustomCountry] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdInquiry, setCreatedInquiry] = useState<Inquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const t = translations[lang].inquiryForm;
  const settings = getStoredOwnerSettings();

  // Selected product object
  const currentProduct = allProducts.find(p => p.id === (product?.id || selectedProductId)) || product;
  const productName = currentProduct ? currentProduct.name[lang] : (lang === 'en' ? 'General Collection Inquiry' : 'Demande générale sur la collection');
  const finalCountry = destinationCountry === 'Other European Destination' && customCountry.trim() ? customCountry.trim() : destinationCountry;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveError(null);

    // Validation
    const trimmedName = customerName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage(t.validationErrors.name);
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage(t.validationErrors.email);
      return;
    }
    if (!finalCountry) {
      setErrorMessage(t.validationErrors.country);
      return;
    }
    if (quantity < 1) {
      setErrorMessage(t.validationErrors.quantity);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = addInquiryToStorage({
        customerName: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        destinationCountry: finalCountry,
        productId: currentProduct ? currentProduct.id : 'general',
        productName: productName,
        quantity: Number(quantity),
        notes: notes.trim() || undefined
      });

      if (!result.success || !result.inquiry) {
        // NEVER show fake success if storage fails
        setSaveError(result.error || t.saveErrorMessage);
        setIsSuccess(false);
        setIsSubmitting(false);
        return;
      }

      setCreatedInquiry(result.inquiry);
      setIsSuccess(true);
      if (onInquiryAdded) {
        onInquiryAdded(result.inquiry);
      }
    } catch (err: any) {
      console.error('Storage write error', err);
      // NEVER show fake success
      setSaveError(t.saveErrorMessage);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const priceText = currentProduct?.priceMAD != null && currentProduct.priceMAD > 0
      ? `${currentProduct.priceMAD} MAD`
      : (lang === 'en' ? 'Price to be confirmed' : 'Prix à confirmer');
    const text = lang === 'en'
      ? `Hello RIFORA! My name is ${customerName}. I would like to inquire about reserving ${quantity}x "${productName}" (Ref: ${currentProduct?.id || 'general'}, ${priceText}) for delivery to ${finalCountry}. My email is ${email}.${phone ? ` Phone: ${phone}.` : ''}${notes ? ` Notes: ${notes}` : ''} Could you please confirm piece availability and shipping options? Thank you!`
      : `Bonjour RIFORA ! Je m'appelle ${customerName}. Je souhaite me renseigner pour réserver ${quantity}x "${productName}" (Réf : ${currentProduct?.id || 'general'}, ${priceText}) pour une livraison en ${finalCountry}. Mon email est ${email}.${phone ? ` Téléphone : ${phone}.` : ''}${notes ? ` Précisions : ${notes}` : ''} Pourriez-vous me confirmer la disponibilité et les options de livraison ? Merci !`;
    const url = generateWhatsAppLink(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(`RIFORA Inquiry: ${productName} - ${customerName}`);
    const body = encodeURIComponent(
      `Hello RIFORA Team,\n\nI would like to inquire about reserving:\n` +
      `- Product: ${productName} (Ref: ${currentProduct?.id || 'general'})\n` +
      `- Quantity: ${quantity}\n` +
      `- Destination: ${finalCountry}\n` +
      `- Customer Name: ${customerName}\n` +
      `- Email: ${email}\n` +
      `- Phone: ${phone || 'N/A'}\n` +
      `- Notes: ${notes || 'None'}\n\n` +
      `Thank you!`
    );
    window.location.href = `mailto:${settings.contactEmail}?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSaveError(null);
    setCreatedInquiry(null);
    setCustomerName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#FBF8F3] border border-[#DDD2C1] shadow-2xl rounded-xs overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD3] bg-[#F7F2EA]">
          <div>
            <h3 className="font-serif text-xl text-[#282421] font-medium">
              {t.modalTitle}
            </h3>
            <p className="text-xs text-[#7A7067] mt-0.5">
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-[#7A7067] hover:text-[#282421] rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* Storage Error State: Never fake success */}
          {saveError && (
            <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xs text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold text-[#9B1C1C]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t.saveErrorTitle}</span>
              </div>
              <p className="text-[#771D1D] leading-relaxed">
                {saveError}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleWhatsAppSend}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#25D366] text-white font-medium rounded-xs hover:bg-[#20BD5A] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  onClick={handleEmailSend}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-white border border-[#DDD2C1] text-[#282421] font-medium rounded-xs hover:bg-[#F4EFE6] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email</span>
                </button>
              </div>
            </div>
          )}

          {isSuccess && createdInquiry ? (
            /* Success State */
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF5E9] flex items-center justify-center text-[#2E7D32]">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif text-2xl text-[#282421] mb-2">
                  {t.successTitle}
                </h4>
                <p className="text-sm text-[#5C534B] leading-relaxed max-w-md mx-auto">
                  {t.successMessage}
                </p>
              </div>

              {/* Inquiry Summary Box */}
              <div className="bg-[#F5EFE6] border border-[#E2D6C5] rounded-xs p-4 text-left text-xs text-[#443E38] space-y-2">
                <div className="flex justify-between border-b border-[#E8DFC9] pb-1.5">
                  <span className="text-[#7A7067]">Inquiry Ref:</span>
                  <span className="font-mono font-medium text-[#282421]">{createdInquiry.id}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8DFC9] pb-1.5">
                  <span className="text-[#7A7067]">Item:</span>
                  <span className="font-medium text-[#282421] text-right truncate max-w-[60%]">{createdInquiry.productName} (x{createdInquiry.quantity})</span>
                </div>
                <div className="flex justify-between border-b border-[#E8DFC9] pb-1.5">
                  <span className="text-[#7A7067]">Customer:</span>
                  <span className="text-[#282421]">{createdInquiry.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8DFC9] pb-1.5">
                  <span className="text-[#7A7067]">Destination:</span>
                  <span className="text-[#282421]">{createdInquiry.destinationCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7067]">Email:</span>
                  <span className="text-[#282421]">{createdInquiry.email}</span>
                </div>
              </div>

              {/* Honest Explanation of Where It Is Stored */}
              <div className="bg-[#EFE8DC]/70 border border-[#DDD2C1] rounded-xs p-3.5 text-left text-xs text-[#524B44] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#4A5844] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#282421] block mb-0.5">
                    {t.whereStoredTitle}
                  </span>
                  <span className="text-[#696057] leading-relaxed">
                    {t.whereStoredText}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleWhatsAppSend}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#25D366] hover:bg-[#20BD5A] rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.sendWhatsAppOption}</span>
                </button>

                <button
                  onClick={handleEmailSend}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-[#282421] bg-white border border-[#DDD2C1] hover:bg-[#F4EFE6] rounded-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#C06548]" />
                  <span>{t.sendEmailOption}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 text-xs font-medium text-[#57534E] hover:text-[#282421] transition-colors cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] rounded-xs text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Product Selector / Pre-filled */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {t.productName} <span className="text-[#C06548]">*</span>
                </label>
                {product ? (
                  <div className="p-3 bg-[#F4EFE6] border border-[#E8DFD3] rounded-xs flex items-center justify-between">
                    <div>
                      <span className="font-serif text-sm font-medium text-[#282421] block">
                        {product.name[lang]}
                      </span>
                      <span className="text-[11px] text-[#7A7067]">
                        Ref: {product.id} · {product.dimensions} · {product.priceMAD != null && product.priceMAD > 0 ? `${product.priceMAD} MAD` : (lang === 'en' ? 'Price to be added' : 'Prix à renseigner')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  >
                    <option value="general">
                      {lang === 'en' ? 'General Inquiry / Custom Piece' : 'Demande générale / Pièce sur mesure'}
                    </option>
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name[lang]} {p.priceMAD != null && p.priceMAD > 0 ? `(${p.priceMAD} MAD)` : `(${lang === 'en' ? 'Price to be added' : 'Prix à renseigner'})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity */}
              <div className="w-32">
                <label className="block font-medium text-[#443E38] mb-1">
                  {t.quantity} <span className="text-[#C06548]">*</span>
                </label>
                <div className="flex items-center border border-[#DDD2C1] bg-white rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-[#7A7067] hover:bg-[#F4EFE6] cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 text-xs font-mono tabular-nums text-[#282421] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-[#7A7067] hover:bg-[#F4EFE6] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {t.fullName} <span className="text-[#C06548]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder={t.fullNamePlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                />
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#443E38] mb-1">
                    {t.email} <span className="text-[#C06548]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={100}
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#443E38] mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    maxLength={30}
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  />
                </div>
              </div>

              {/* Destination Country in Europe */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {t.destinationCountry} <span className="text-[#C06548]">*</span>
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                >
                  {EUROPEAN_COUNTRIES.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {destinationCountry === 'Other European Destination' && (
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder={lang === 'en' ? 'Specify your European country or city' : 'Précisez votre pays ou ville en Europe'}
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="mt-2 w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  />
                )}
              </div>

              {/* Notes / Special requests */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder={t.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548] resize-none"
                />
              </div>

              {/* Explicit Explanation of Where Inquiries Are Stored */}
              <div className="p-3 bg-[#F4EFE6] border border-[#E8DFD3] rounded-xs text-[11px] text-[#696057]">
                <div className="flex items-center gap-1.5 font-semibold text-[#3D3731] mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#4A5844]" />
                  <span>{t.whereStoredTitle}</span>
                </div>
                <p className="leading-relaxed">
                  {t.whereStoredText}
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
