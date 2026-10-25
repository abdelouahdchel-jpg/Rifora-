import React, { useState } from 'react';
import { Product, Language } from '../types';
import { translations, EUROPEAN_COUNTRIES } from '../data/translations';
import { generateWhatsAppLink, getStoredOwnerSettings, addInquiryToStorage, isValidEmail } from '../services/storage';
import { MessageCircle, Mail, MapPin, Clock, Database, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ContactViewProps {
  products: Product[];
  lang: Language;
}

export const ContactView: React.FC<ContactViewProps> = ({ products, lang }) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('France');
  const [selectedProductId, setSelectedProductId] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const t = translations[lang].contact;
  const formT = translations[lang].inquiryForm;
  const settings = getStoredOwnerSettings();

  const handleWhatsApp = () => {
    const url = generateWhatsAppLink(settings.whatsappNumber, translations[lang].whatsApp.defaultMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveError(null);

    const trimmedName = customerName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage(formT.validationErrors.name);
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage(formT.validationErrors.email);
      return;
    }
    if (quantity < 1) {
      setErrorMessage(formT.validationErrors.quantity);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProd = products.find(p => p.id === selectedProductId);
      const prodName = selectedProd ? selectedProd.name[lang] : (lang === 'en' ? 'General Inquiry' : 'Demande générale');

      const result = addInquiryToStorage({
        customerName: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        destinationCountry,
        productId: selectedProductId,
        productName: prodName,
        quantity,
        notes: notes.trim() || undefined
      });

      if (!result.success) {
        // Never claim success when failed
        setSaveError(result.error || formT.saveErrorMessage);
        setIsSuccess(false);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(formT.saveErrorMessage);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppFromForm = () => {
    const selectedProd = products.find(p => p.id === selectedProductId);
    const prodName = selectedProd ? selectedProd.name[lang] : (lang === 'en' ? 'General Collection Inquiry' : 'Demande générale sur la collection');
    const text = lang === 'en'
      ? `Hello RIFORA! My name is ${customerName}. I would like to inquire about reserving ${quantity}x "${prodName}" for delivery to ${destinationCountry}. My email is ${email}.${phone ? ` Phone: ${phone}.` : ''}${notes ? ` Notes: ${notes}` : ''} Thank you!`
      : `Bonjour RIFORA ! Je m'appelle ${customerName}. Je souhaite me renseigner pour réserver ${quantity}x "${prodName}" pour une livraison en ${destinationCountry}. Mon email est ${email}.${phone ? ` Téléphone : ${phone}.` : ''}${notes ? ` Précisions : ${notes}` : ''} Merci !`;
    const url = generateWhatsAppLink(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#E8DFD3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C06548] block mb-1">
          {lang === 'en' ? 'Direct Communication' : 'Communication Directe'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#282421] font-normal mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-[#6E6358] leading-relaxed max-w-2xl">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Direct Contact Methods & Storage Transparency */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WhatsApp Direct Card */}
          <div className="p-6 bg-[#EBF7EE] border border-[#BDE5C5] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <MessageCircle className="w-5 h-5 fill-current" />
              <h3 className="font-serif text-lg font-medium text-[#1B5E20]">
                {t.whatsAppDirect}
              </h3>
            </div>
            <p className="text-xs text-[#264D2B] leading-relaxed">
              {t.whatsAppText}
            </p>
            <button
              onClick={handleWhatsApp}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20BD5A] transition-colors rounded-xs shadow-xs cursor-pointer"
            >
              <span>WhatsApp: {settings.whatsappNumber}</span>
            </button>
          </div>

          {/* Email Direct Card */}
          <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-[#C06548]">
              <Mail className="w-5 h-5" />
              <h3 className="font-serif text-lg font-medium text-[#282421]">
                {t.emailDirect}
              </h3>
            </div>
            <p className="text-xs text-[#5C534B]">
              <a href={`mailto:${settings.contactEmail}`} className="font-mono text-sm font-semibold text-[#282421] hover:text-[#C06548] underline">
                {settings.contactEmail}
              </a>
            </p>
            <p className="text-xs text-[#7A7067]">
              {t.responseTime}
            </p>
          </div>

          {/* Location & Workshop Base */}
          <div className="p-6 bg-white border border-[#E8DFD3] rounded-xs space-y-3 text-xs text-[#5C534B]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C06548] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#282421] block">Artisan Workshop Connections</span>
                <span>{t.moroccoBase}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-2 border-t border-[#F5EFE6]">
              <Clock className="w-4 h-4 text-[#4A5844] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#282421] block">European Logistics Hub</span>
                <span>{t.europeBase}</span>
              </div>
            </div>
          </div>

          {/* Transparency: Where Are Inquiries Stored? */}
          <div className="p-5 bg-[#F4EFE6] border border-[#DDD2C1] rounded-xs text-xs text-[#4E473F] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#282421]">
              <Database className="w-4 h-4 text-[#4A5844]" />
              <span>{formT.whereStoredTitle}</span>
            </div>
            <p className="leading-relaxed text-[#6E6358]">
              {formT.whereStoredText}
            </p>
          </div>
        </div>

        {/* Right Column: Embedded Inquiry Form */}
        <div className="lg:col-span-7 bg-white border border-[#E8DFD3] p-6 sm:p-8 rounded-xs shadow-xs">
          <div className="mb-6 pb-4 border-b border-[#E8DFD3]">
            <h2 className="font-serif text-2xl text-[#282421]">
              {formT.modalTitle}
            </h2>
            <p className="text-xs text-[#7A7067] mt-1">
              {formT.subtitle}
            </p>
          </div>

          {/* Storage Error Banner */}
          {saveError && (
            <div className="mb-4 p-3.5 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xs text-xs space-y-2 text-[#9B1C1C]">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formT.saveErrorTitle}</span>
              </div>
              <p>{saveError}</p>
              <button
                type="button"
                onClick={handleWhatsAppFromForm}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#25D366] text-white rounded-xs font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send via WhatsApp instead</span>
              </button>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl text-[#282421]">
                {formT.successTitle}
              </h3>
              <p className="text-xs text-[#5C534B] max-w-md mx-auto leading-relaxed">
                {formT.successMessage}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppFromForm}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold rounded-xs shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{formT.sendWhatsAppOption}</span>
                </button>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2 text-xs font-medium text-[#C06548] border border-[#C06548] hover:bg-[#C06548] hover:text-white rounded-xs transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Submit another inquiry' : 'Envoyer une autre demande'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] rounded-xs">
                  {errorMessage}
                </div>
              )}

              {/* Product selector */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {formT.productName} <span className="text-[#C06548]">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                >
                  <option value="general">
                    {lang === 'en' ? 'General Inquiry / Custom Piece' : 'Demande générale / Pièce sur mesure'}
                  </option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name[lang]} (~€{p.priceEUR})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="w-32">
                <label className="block font-medium text-[#443E38] mb-1">
                  {formT.quantity} <span className="text-[#C06548]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs font-mono tabular-nums text-[#282421] focus:outline-none focus:border-[#C06548]"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {formT.fullName} <span className="text-[#C06548]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder={formT.fullNamePlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#443E38] mb-1">
                    {formT.email} <span className="text-[#C06548]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={100}
                    placeholder={formT.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#443E38] mb-1">
                    {formT.phone}
                  </label>
                  <input
                    type="tel"
                    maxLength={30}
                    placeholder={formT.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                  />
                </div>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {formT.destinationCountry} <span className="text-[#C06548]">*</span>
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548]"
                >
                  {EUROPEAN_COUNTRIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-[#443E38] mb-1">
                  {formT.notes}
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder={formT.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#DDD2C1] rounded-xs text-xs text-[#282421] focus:outline-none focus:border-[#C06548] resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#C06548] hover:bg-[#9E4A31] transition-colors rounded-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? formT.submitting : formT.submitBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
