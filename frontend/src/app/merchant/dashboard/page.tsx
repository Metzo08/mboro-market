'use client';

import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function MerchantDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShopAndStats = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const shopRes = await api.get(`/shops/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShop(shopRes.data);
        const shopId = shopRes.data.id;

        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products', { params: { shopId } }).catch(() => ({ data: { items: [] } })),
          api.get('/orders', { params: { shopId } }).catch(() => ({ data: { items: [] } })),
        ]);
        const products = productsRes.data.items || [];
        const fetchedOrders = ordersRes.data.items || [];
        const revenue = fetchedOrders.reduce(
          (sum: number, o: any) => sum + Number(o.total),
          0,
        );
        setOrders(fetchedOrders);
        setStats({
          totalProducts: products.length,
          totalOrders: fetchedOrders.length,
          totalRevenue: revenue,
          pendingOrders: fetchedOrders.filter((o: any) => o.status === 'PENDING').length,
        });
      } catch (err: any) {
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadShopAndStats();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Gérez votre boutique {shop?.name || ''}</p>
        </div>
        <Link
          href="/merchant/poster"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <span>🖨️ Affiche QR Code de comptoir</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Produits actifs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Commandes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Chiffre d'affaires</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">En attente</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dernières commandes</h3>
              <Link href="/merchant/orders" className="text-sm font-medium text-green-600 hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">#{order.id.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">{formatPrice(Number(order.total))}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.status === 'PENDING' ? 'En attente' : order.status === 'PAID' ? 'Payée' : order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucune commande pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link href="/merchant/products" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-sm font-medium text-gray-900">Gérer les produits</span>
              <span className="text-sm text-green-600">→</span>
            </Link>
            <Link href="/merchant/orders" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-sm font-medium text-gray-900">Voir les commandes</span>
              <span className="text-sm text-blue-600">→</span>
            </Link>
            <Link href="/merchant/payments" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-sm font-medium text-gray-900">Voir les paiements</span>
              <span className="text-sm text-purple-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
