'use client';

import { api, getToken } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ActivityCarousel, ActivitySlide } from '@/components/carousel/ActivityCarousel';
import {
  Shield,
  CreditCard,
  Smartphone,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  TrendingUp,
  Zap,
  Store,
} from 'lucide-react';

interface PaymentSettings {
  waveApiKey: string;
  waveSecretKey: string;
  paydunyaApiKey: string;
  paydunyaApiToken: string;
  acceptedPaymentMethods: string[];
  /** Drapeaux renvoyés par l'API : le secret est configuré mais jamais révélé. */
  hasWaveSecretKey?: boolean;
  hasPaydunyaApiToken?: boolean;
}

interface Shop {
  id: string;
  name: string;
  settings?: {
    paymentSettings?: PaymentSettings;
  };
}

const ACTIVITES_SASS: ActivitySlide[] = [
  {
    id: 'activation',
    title: 'Activation boutique',
    description: "Choisissez le forfait qui correspond à votre activité (5 000 FCFA d'activation + 2 500 FCFA/mois par boutique).",
    icon: Zap,
    color: 'bg-green-100 text-green-700',
  },
  {
    id: 'paiements',
    title: 'Paiements en ligne',
    description: "Ajoutez les moyens de paiement acceptés par votre boutique : Wave, PayDunya, espèces et retrait en magasin.",
    icon: CreditCard,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'assistant-ia',
    title: 'Assistant IA local',
    description: "Un assistant français-wolof vous aide à gérer vos produits, commandes et clients en temps réel.",
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'seo',
    title: 'SEO & visibilité',
    description: "Votre boutique est optimisée pour Google grâce au SSR et au prérendu des pages publiques.",
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-700',
  },
];

export default function MerchantSettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [settings, setSettings] = useState<PaymentSettings>({
    waveApiKey: '',
    waveSecretKey: '',
    paydunyaApiKey: '',
    paydunyaApiToken: '',
    acceptedPaymentMethods: ['wave', 'paydunya', 'cod', 'pickup'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  // Les secrets (clé secrète Wave, token PayDunya) ne sont jamais renvoyés par l'API.
  // On mémorise uniquement le fait qu'ils sont déjà configurés.
  const [secretConfigured, setSecretConfigured] = useState({
    waveSecretKey: false,
    paydunyaApiToken: false,
  });

  const loadSettings = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const shopRes = await api.get('/shops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = shopRes.data;
      setShop(shopData);
      const ps = shopData.settings?.paymentSettings || {};
      setSecretConfigured({
        waveSecretKey: Boolean(ps.hasWaveSecretKey),
        paydunyaApiToken: Boolean(ps.hasPaydunyaApiToken),
      });
      setSettings({
        waveApiKey: ps.waveApiKey || '',
        waveSecretKey: '',
        paydunyaApiKey: ps.paydunyaApiKey || '',
        paydunyaApiToken: '',
        acceptedPaymentMethods:
          ps.acceptedPaymentMethods?.length
            ? ps.acceptedPaymentMethods
            : ['wave', 'paydunya', 'cod', 'pickup'],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réglages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !shop) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.patch(
        `/shops/${shop.id}`,
        { paymentSettings: settings },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Le secret vient d'être enregistré : on le masque et on affiche l'indicateur.
      if (settings.waveSecretKey.trim() !== '') {
        setSecretConfigured((prev) => ({ ...prev, waveSecretKey: true }));
        setSettings((prev) => ({ ...prev, waveSecretKey: '' }));
      }
      if (settings.paydunyaApiToken.trim() !== '') {
        setSecretConfigured((prev) => ({ ...prev, paydunyaApiToken: true }));
        setSettings((prev) => ({ ...prev, paydunyaApiToken: '' }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (method: string) => {
    setSettings((prev: PaymentSettings) => ({
      ...prev,
      acceptedPaymentMethods: prev.acceptedPaymentMethods.includes(method)
        ? prev.acceptedPaymentMethods.filter((m: string) => m !== method)
        : [...prev.acceptedPaymentMethods, method],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            <span className="ml-3 text-sm text-[#5b6b60]">Chargement des réglages…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm p-8 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-amber-700" />
            </div>
            <h1 className="text-xl font-bold text-[#1a2e22] mb-2">Boutique non définie</h1>
            <p className="text-sm text-[#5b6b60] mb-6">
              {error ||
                'Aucune boutique n’est associée à votre compte. Créez votre boutique pour configurer vos moyens de paiement.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="jt-btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                Créer ma boutique
              </Link>
              <Link
                href="/merchant/dashboard"
                className="px-6 py-3 border border-[#E8E4D9] rounded-lg font-medium text-[#1a2e22] hover:bg-[#F0FDF4]"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/merchant/dashboard"
          className="inline-flex items-center gap-2 text-sm text-green-700 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Colonne gauche : carrousel d'activités SaaS */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a2e22]">JëndCiThiès</h2>
                  <p className="text-xs text-[#5b6b60]">SaaS — Activités disponibles</p>
                </div>
              </div>

              <ActivityCarousel slides={ACTIVITES_SASS} ariaLabel="Activités SaaS JëndCiThiès" />

              <div className="mt-6 pt-6 border-t border-[#E8E4D9]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#1a2e22]">Information importante</h3>
                  <span className="text-xs text-[#5b6b60]">Faites-vous accompagner</span>
                </div>
                <p className="text-xs text-[#5b6b60] leading-relaxed">
                  L'activation s'effectue en 3 étapes : création du compte, validation
                  du coffre, puis authentification de la boutique.
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite : configuration paiement */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#E8E4D9] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2e22]">Règlements de paiement</h1>
                  <p className="text-[#5b6b60]">
                    Configurez les moyens de paiement acceptés par votre boutique
                    <strong>{shop?.name || 'votre boutique'}</strong>.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  Les réglages ont été enregistrés avec succès.
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#5b6b60] mb-2">
                      Wave - Clé API
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: wave-sandbox_xxx"
                      value={settings.waveApiKey}
                      onChange={(e) => setSettings({ ...settings, waveApiKey: e.target.value })}
                      disabled={saving}
                    />
                    <p className="text-xs text-[#5b6b60] mt-1">
                      Clé publique Wave (mode sandbox si commence par "wave-sandbox_").
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5b6b60] mb-2">
                      Wave - Clé secrète
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder={
                          secretConfigured.waveSecretKey
                            ? 'Déjà enregistrée — laissez vide pour conserver'
                            : 'Ex: wave-sandbox_yyy'
                        }
                        value={settings.waveSecretKey}
                        onChange={(e) =>
                          setSettings({ ...settings, waveSecretKey: e.target.value })
                        }
                        disabled={saving}
                        className="font-mono pr-24"
                      />
                      {secretConfigured.waveSecretKey && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Configurée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5b6b60] mt-1">
                      Clé secrète Wave (nécessaire pour les webhooks et les initialisations).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5b6b60] mb-2">
                      PayDunya - Clé API
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: test_abc ou live_abc"
                      value={settings.paydunyaApiKey}
                      onChange={(e) => setSettings({ ...settings, paydunyaApiKey: e.target.value })}
                      disabled={saving}
                    />
                    <p className="text-xs text-[#5b6b60] mt-1">
                      Clé publique PayDunya (mode sandbox si commence par "test_").
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5b6b60] mb-2">
                      PayDunya - Token API
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder={
                          secretConfigured.paydunyaApiToken
                            ? 'Déjà enregistré — laissez vide pour conserver'
                            : 'Token API PayDunya'
                        }
                        value={settings.paydunyaApiToken}
                        onChange={(e) =>
                          setSettings({ ...settings, paydunyaApiToken: e.target.value })
                        }
                        disabled={saving}
                        className="font-mono pr-24"
                      />
                      {secretConfigured.paydunyaApiToken && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Configuré
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5b6b60] mt-1">
                      Token secret PayDunya pour l'initialisation de paiement.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E8E4D9] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#1a2e22] mb-6 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-[#1B7A3D]" />
                    Moyens de paiement acceptés
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { v: 'wave', label: 'Wave', desc: 'Paiement mobile instantané' },
                      { v: 'paydunya', label: 'PayDunya', desc: 'Carte / Mobile Money' },
                      { v: 'cod', label: 'A la livraison', desc: 'Espèces a la reception' },
                      { v: 'pickup', label: 'Retrait boutique', desc: 'Payez sur place' },
                    ].map((m) => (
                      <label
                        key={m.v}
                        className="flex items-center gap-3 p-4 rounded-lg border border-[#E8E4D9] transition-colors cursor-pointer hover:bg-[#F0FDF4]"
                      >
                        <input
                          type="checkbox"
                          checked={settings.acceptedPaymentMethods.includes(m.v)}
                          onChange={() => toggleMethod(m.v)}
                          className="rounded border-[#D1D5DB] text-[#1B7A3D] focus:ring-[#1B7A3D] focus:ring-2"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#1a2e22]">{m.label}</p>
                          <p className="text-xs text-[#5b6b60]">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-[#5b6b60] mt-3">
                    Au moins un moyen de paiement doit être sélectionné.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto py-3 text-lg bg-[#1B7A3D] hover:bg-[#14532d] text-white"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer les réglages'}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-[#F5F5F5] rounded-xl border border-[#E8E4D9] text-sm text-[#5b6b60]">
                <p className="font-semibold text-[#1a2e22] mb-1">Sécurité</p>
                <p className="text-[#5b6b60]">
                  Les clés API sont stockées de manière chiffrée et utilisées uniquement côté
                  serveur pour initialiser les paiements. Ne les partagez jamais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

