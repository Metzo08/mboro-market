'use client';

import Image from 'next/image';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export default function AdminPage() {
  const [stats, setStats] = useState({
    shops: 0,
    users: 0,
    orders: 0,
    revenue: 0,
    subscriptions: 0,
  });
  const [shops, setShops] = useState<{ id: string; name: string; city?: string; isActive: boolean; slug: string }[]>([]);
  const [orders, setOrders] = useState<{ id: string; customer: { name: string; email?: string }; total: number; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch stats
        const statsRes = await api.get('/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);

        // Fetch recent shops
        const shopsRes = await api.get('/admin/shops-recent', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 },
        });
        setShops(shopsRes.data.shops || []);

        // Fetch recent orders
        const ordersRes = await api.get('/admin/orders-recent', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 },
        });
        setOrders(ordersRes.data.orders || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="border-b bg-white dark:bg-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-900 dark:text-white">
            Tableau de bord Super Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Super Admin</span>
            <a href="/settings" className="text-green-600 hover:underline font-medium">Paramètres</a>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="5.5"/>
                <polyline points="21 16 16 21 9 3"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Boutiques</p>
              <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.shops}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <line x1="3" y1="5" x2="21" y2="5"/>
                <line x1="3" y1="21" x2="21" y2="21"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</p>
              <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h16"/>
                <circle cx="8.5" cy="8.5" r="3.5"/>
                <path d="M21 16l-4.95-4.593V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2l4.95 4.593M4.236 5.764L5.64 7.17a1 1 0 0 1 1.414 1.414l-2.12 2.12a1 1 0 0 1-1.414 0L4.236 6.944zm0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Commandes</p>
              <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.939-2.83"></path>
                <path d="M8.08 2.14a9.16 9.16 0 0 1 1.517-1.827.84.84 0 0 0 .178-.518A7.02 7.02 0 0 1 8 2.14a7.02 7.02 0 0 1 1.517 1.827L8.08 2.14z"/>
                <path d="M10.82 4.36a2.42 2.42 0 0 1 2.17 2.17L13.98 7.85"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Abonnements</p>
              <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.subscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shops */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-green-900 dark:text-white mb-4">Boutiques récentes</h2>
        {shops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl">
              <thead>
                <tr className="text-left text-xs text-gray-600 uppercase border-b dark:border-gray-700">
                  <th className="py-3 px-4">Boutique</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id} className="border-b dark-border-gray-700">
                    <td className="py-4 px-4 font-medium text-green-900 dark:text-white">{shop.name}</td>
                    <td className="py-4 px-4 text-green-600 dark:text-green-400">{shop.city || 'Non spécifiée'}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-800 text-xs font-medium rounded px-2.5 py-0.5">{shop.isActive ? 'Actif' : 'Inactif'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <a href={`/shops/${shop.slug}`} className="text-green-600 dark:text-green-400 hover:underline">Voir</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucune boutique pour le moment.</p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-green-900 dark:text-white mb-4">Dernières commandes</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl">
              <thead>
                <tr className="text-left text-xs text-gray-600 uppercase border-b dark:border-gray-700">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b dark-border-gray-700">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-gray-700 flex items-center justify-center text-green-700 font-bold">
                          {order.customer?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.customer?.name || 'Client anonyme'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Voir détails</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-800 text-xs font-medium rounded px-2.5 py-0.5">{order.status}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}