import React, { useState } from 'react';
import { Language } from '../types';
import { setupOwnerAccount, loginOwner } from '../services/api';
import { Lock, ShieldCheck, ArrowRight, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AdminLoginViewProps {
  lang: Language;
  isInitialized: boolean;
  defaultEmail: string;
  requiresSetupSecret?: boolean;
  onSuccess: (email: string) => void;
  onBackToStore: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  lang,
  isInitialized,
  defaultEmail,
  requiresSetupSecret = false,
  onSuccess,
  onBackToStore
}) => {
  const [isSetupMode, setIsSetupMode] = useState(!isInitialized);
  const [email, setEmail] = useState(defaultEmail || 'abdelouahdchel@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const isEn = lang === 'en';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage(isEn ? 'Please enter your email and password.' : 'Veuillez saisir votre email et mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginOwner({ email, password });
      if (res.success) {
        onSuccess(res.email || email);
      } else {
        setErrorMessage(res.error || (isEn ? 'Invalid credentials.' : 'Identifiants invalides.'));
        if (res.attemptsRemaining !== undefined) {
          setAttemptsRemaining(res.attemptsRemaining);
        }
      }
    } catch {
      setErrorMessage(isEn ? 'Connection error. Please try again.' : 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password || password.length < 8) {
      setErrorMessage(
        isEn
          ? 'Password must be at least 8 characters long for security.'
          : 'Le mot de passe doit comporter au moins 8 caractères pour votre sécurité.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        isEn ? 'Passwords do not match.' : 'Les mots de passe ne correspondent pas.'
      );
      return;
    }

    if (requiresSetupSecret && !setupSecret.trim()) {
      setErrorMessage(
        isEn
          ? 'Owner Setup Secret Key is required to verify authorization.'
          : 'La clé secrète de configuration est obligatoire pour valider l’autorisation.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await setupOwnerAccount({
        email,
        password,
        setupSecret: setupSecret.trim() || undefined
      });
      if (res.success) {
        onSuccess(res.email || email);
      } else {
        setErrorMessage(res.error || (isEn ? 'Initial setup failed.' : 'Échec de la configuration initiale.'));
      }
    } catch {
      setErrorMessage(isEn ? 'Connection error during setup.' : 'Erreur de connexion lors de la configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back navigation */}
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#7A7067] hover:text-[#C06548] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? 'Return to RIFORA Storefront' : 'Retour à la boutique RIFORA'}</span>
        </button>

        {/* Card Box */}
        <div className="bg-white border border-[#E8DFD3] rounded-sm p-6 sm:p-8 shadow-xs">
          {/* Header Badge & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F4EFE6] text-[#C06548] mb-3">
              {isSetupMode ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h1 className="font-serif text-2xl text-[#282421]">
              {isSetupMode
                ? (isEn ? 'First-Time Owner Setup' : 'Configuration Initiale Propriétaire')
                : (isEn ? 'Store Owner Sign In' : 'Espace Propriétaire RIFORA')}
            </h1>
            <p className="mt-1 text-xs text-[#7A7067]">
              {isSetupMode
                ? (isEn
                    ? 'Initialize your private credentials to manage RIFORA products, pricing, and orders on Vercel.'
                    : 'Initialisez vos identifiants privés pour gérer les produits, prix et commandes RIFORA sur Vercel.')
                : (isEn
                    ? 'Authenticate to access product catalog pricing, private supplier costs, and settings.'
                    : 'Authentifiez-vous pour gérer les prix, coûts fournisseurs privés et paramètres.')}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xs flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{errorMessage}</p>
                {attemptsRemaining !== null && attemptsRemaining < 3 && attemptsRemaining > 0 && (
                  <p className="mt-1 text-[11px] text-red-700">
                    {isEn
                      ? `Warning: ${attemptsRemaining} attempt(s) remaining before temporary security lockout.`
                      : `Attention : ${attemptsRemaining} tentative(s) restante(s) avant verrouillage temporaire.`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          {isSetupMode ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  {isEn ? 'Authorized Owner Email' : 'Email Propriétaire Autorisé'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548]"
                />
                <span className="text-[11px] text-[#7A7067] mt-1 block">
                  {isEn ? 'Must match OWNER_EMAIL in Vercel environment.' : 'Doit correspondre à OWNER_EMAIL dans Vercel.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  {isEn ? 'Setup Secret Key (from Vercel Settings)' : 'Clé Secrète de Configuration (depuis Vercel)'}
                </label>
                <input
                  type="password"
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  placeholder={isEn ? 'Enter ADMIN_SETUP_SECRET from Vercel' : 'Saisir ADMIN_SETUP_SECRET de Vercel'}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548]"
                />
                <span className="text-[11px] text-[#7A7067] mt-1 block">
                  {isEn
                    ? 'Security secret set privately in Vercel to prove authorized store ownership.'
                    : 'Secret privé configuré dans Vercel pour prouver la propriété de la boutique.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  {isEn ? 'Create Strong Password' : 'Créer un mot de passe sécurisé'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEn ? 'Minimum 8 characters' : 'Minimum 8 caractères'}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7A7067] hover:text-[#282421]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  {isEn ? 'Confirm Password' : 'Confirmer le mot de passe'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#C06548] hover:bg-[#A85237] text-white text-xs font-semibold uppercase tracking-wider rounded-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>{isEn ? 'Setting up...' : 'Configuration...'}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isEn ? 'Complete Setup & Sign In' : 'Finaliser & Se Connecter'}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  {isEn ? 'Owner Email' : 'Email Propriétaire'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                    {isEn ? 'Password' : 'Mot de passe'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#DDD2C1] rounded-xs bg-[#FBF8F3] focus:bg-white focus:outline-none focus:border-[#C06548] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7A7067] hover:text-[#282421]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#C06548] hover:bg-[#A85237] text-white text-xs font-semibold uppercase tracking-wider rounded-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>{isEn ? 'Verifying...' : 'Vérification...'}</span>
                ) : (
                  <>
                    <span>{isEn ? 'Sign In to Admin Portal' : 'Se connecter à l’administration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice Footer */}
          <div className="mt-6 pt-5 border-t border-[#E8DFD3] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#7A7067]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C06548]" />
              <span>
                {isEn
                  ? 'Server-side scrypt hashing & HMAC stateless session tokens'
                  : 'Chiffrement scrypt et sessions signées HMAC sans état'}
              </span>
            </div>
            {!isInitialized && !isSetupMode && (
              <button
                type="button"
                onClick={() => setIsSetupMode(true)}
                className="mt-2 block mx-auto text-xs text-[#C06548] hover:underline cursor-pointer"
              >
                {isEn ? 'Need to run initial owner setup?' : 'Effectuer la configuration initiale ?'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
