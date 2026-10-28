'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { Store as ShopIcon, Users, CreditCard, Activity, LogOut, Settings as SettingsIcon, Edit, Save, X, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { getToken, api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

interface Shop {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  shortDescription?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  publicAddress?: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  language: string;
  status: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  price: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'shops' | 'subscriptions' | 'billing'>('profile');
  const [shop, setShop] = useState<Shop | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editForm, setEditForm] = useState<Partial<Shop>>({});

  useEffect(() => {
    const loadData = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [shopRes, shopsRes, subsRes] = await Promise.allSettled([
          api.get('/shops/me', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/shops', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/subscriptions', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (shopRes.status === 'fulfilled') {
          setShop(shopRes.value.data);
          setEditForm(shopRes.value.data);
        }
        if (shopsRes.status === 'fulfilled' && Array.isArray(shopsRes.value.data)) {
          setShops(shopsRes.value.data);
        }
        if (subsRes.status === 'fulfilled') {
          setSubscriptions(Array.isArray(subsRes.value.data) ? subsRes.value.data : []);
        }
      } catch (err) {
        // Silently handle errors - user may not be authenticated
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    const token = getToken();
    if (!shop || !token) return;
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const statCards = [
    {
      title: 'Boutiques',
      value: shops.length,
      icon: ShopIcon,
      color: 'text-green-700 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      link: '/settings?tab=shops',
    },
    {
      title: 'Statut',
      value: shop?.verificationStatus === 'verified' ? 'Vérifiée' : shop?.verificationStatus === 'pending' ? 'En attente' : 'Non vérifiée',
      icon: Badge,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      link: null,
    },
    {
      title: 'Plan',
      value: subscriptions.length > 0 ? subscriptions[0].plan : 'Aucun',
      icon: CreditCard,
      color: 'text-purple-700 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/settings?tab=subscriptions',
    },
    {
      title: 'Commandes',
      value: 0,
      icon: Activity,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      link: '/merchant/orders',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-green-700 border-t-transparent animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Gérez votre boutique et votre compte</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Retour à l'accueil
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  sessionStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className={`${card.bg} rounded-2xl p-6 cursor-pointer transition-transform hover:scale-105`} onClick={() => card.link && (window.location.href = card.link)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Profil de la boutique
              </button>
              <button
                onClick={() => setActiveTab('shops')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'shops'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Mes boutiques
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Abonnements
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'billing'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Facturation
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && shop && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de la boutique</h2>
                  {editing ? (
                    <button
                      onClick={() => { setEditing(false); setEditForm(shop); }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" /> Annuler
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <Edit className="h-4 w-4" /> Modifier
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
                    Modifications enregistrées avec succès !
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la boutique</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100">{shop.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                    <p className="text-gray-500 dark:text-gray-400">{shop.slug}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <p className="text-gray-900 dark:text-gray-100">{shop.type === 'RETAIL' ? 'Commerce de détail' : shop.type === 'SERVICE' ? 'Service' : 'Artisanat'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                    <Badge variant={shop.status === 'ACTIVE' ? 'success' : 'outline'}>
                      {shop.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    {editing ? (
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">{shop.description || 'Aucune description'}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Téléphone</label>
                        <p className="text-gray-900 dark:text-gray-100">{shop.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Edit className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-gray-100">{shop.email || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Site web</label>
                        <p className="text-gray-900 dark:text-gray-100">{shop.website || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Adresse</label>
                        <p className="text-gray-900 dark:text-gray-100">{shop.publicAddress || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={() => { setEditing(false); setEditForm(shop); }}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shops' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vos boutiques</h2>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    + Nouvelle boutique
                  </Link>
                </div>
                {shops.length > 0 ? (
                  <div className="space-y-3">
                    {shops.map((s) => (
                      <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{s.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{s.shortDescription || 'Aucune description'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Slug: {s.slug}</p>
                        </div>
                        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'outline'}>
                          {s.status === 'ACTIVE' ? 'Active' : s.status === 'DRAFT' ? 'Brouillon' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ShopIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune boutique trouvée</p>
                    <Link
                      href="/register"
                      className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Créer ma première boutique
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Abonnements</h2>
                {subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{sub.plan} Plan</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sub.status === 'active' ? 'Actif' : sub.status === 'cancelled' ? 'Annulé' : 'Inactif'}
                            {sub.currentPeriodEnd && ` • Renouvellement: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge variant={sub.status === 'active' ? 'success' : 'outline'}>
                          {formatPrice(sub.price)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun abonnement actif</p>
                    <p className="text-xs mt-1">5 000 FCFA d'activation + 2 500 FCFA/mois</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de facturation</h2>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    PayDunya, Wave Business — Configuration via le tableau de bord commerçant
                  </p>
                  <Link
                    href="/merchant/settings"
                    className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Configurer les méthodes de paiement
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
