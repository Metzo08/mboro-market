'use client';

import { api, getToken } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function MerchantOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?callback=/merchant/orders`;
      return;
    }
    api.get('/orders', { params: { shopId: '8e0b526e-e8d1-455f-8eac-245f0d4aa84c' } })
      .then((res) => {
        setOrders(res.data.items || res.data || []);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
        setLoading(false);
      });
  }, []);

  if (!getToken()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <Link href="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Numéro</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Client</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Statut</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{o.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{o.userId?.substring(0, 8) || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(Number(o.total))}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
