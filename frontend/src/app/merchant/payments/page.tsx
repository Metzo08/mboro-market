import { api, getToken } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function MerchantPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?callback=/merchant/payments`;
      return;
    }
    api.get('/payments', { params: { shopId: '8e0b526e-e8d1-455f-8eac-245f0d4aa84c' } })
      .then((res) => {
        setPayments(res.data.items || res.data || []);
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
          <a href="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <p className="text-gray-600">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  const total = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paiements</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Total encaissé</h3>
          <div className="text-2xl font-bold text-green-600">{formatPrice(total)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Référence</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Montant</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length > 0 ? (
              payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{p.transactionReference || p.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(Number(p.amount))}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Aucun paiement pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
