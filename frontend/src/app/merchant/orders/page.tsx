'use client';

import { api, getToken } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Clock, Loader2, Package, Truck, XCircle } from 'lucide-react';

// Transitions autorisées côté serveur (ORD-010) — miroir pour l'UI
const NEXT_STATUS: Record<string, Array<{ value: string; label: string }>> = {
  PENDING: [
    { value: 'CONFIRMED', label: 'Confirmer' },
    { value: 'CANCELLED', label: 'Refuser' },
  ],
  CONFIRMED: [
    { value: 'PREPARING', label: 'En préparation' },
    { value: 'CANCELLED', label: 'Annuler' },
  ],
  PREPARING: [
    { value: 'READY', label: 'Prête' },
    { value: 'CANCELLED', label: 'Annuler' },
  ],
  READY: [
    { value: 'SHIPPED', label: 'Expédier' },
    { value: 'COMPLETED', label: 'Retirée' },
    { value: 'CANCELLED', label: 'Annuler' },
  ],
  SHIPPED: [
    { value: 'DELIVERED', label: 'Livrée' },
    { value: 'CANCELLED', label: 'Annuler' },
  ],
  DELIVERED: [{ value: 'COMPLETED', label: 'Clôturer' }],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PREPARING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    READY: 'bg-purple-100 text-purple-800 border-purple-200',
    SHIPPED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    COMPLETED: 'bg-[#115E59]/10 text-[#115E59] border-[#115E59]/20',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusAction({
  orderId,
  current,
  onUpdated,
}: {
  orderId: string;
  current: string;
  onUpdated: (id: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const nexts = NEXT_STATUS[current] || [];
  if (nexts.length === 0) return <span className="text-xs text-gray-400">—</span>;

  const doTransition = async (status: string) => {
    setBusy(status);
    setErr('');
    try {
      await api.patch(`/orders/${orderId}/status`, { status, actorType: 'merchant' });
      onUpdated(orderId, status);
      setOpen(false);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Transition refusée');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#115E59] hover:bg-[#0D4A46] text-white text-xs font-bold shadow-sm transition-colors"
      >
        Action
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 rounded-xl border border-[#E2D6C4] bg-white shadow-lg z-20 py-1">
            {nexts.map((n) => (
              <button
                key={n.value}
                onClick={() => doTransition(n.value)}
                disabled={busy !== null}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-[#F5EDE1] disabled:opacity-50 ${
                  n.value === 'CANCELLED' ? 'text-red-600' : 'text-[#2B2420]'
                }`}
              >
                {busy === n.value ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : n.value === 'CANCELLED' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#115E59]" />
                )}
                {n.label}
              </button>
            ))}
            {err && <p className="px-3 py-1.5 text-[11px] text-red-600">{err}</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const shopRes = await api.get(`/shops/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(shopRes.data);
      const ordersRes = await api.get('/orders', { params: { shopId: shopRes.data.id } });
      setOrders(ordersRes.data.items || ordersRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?callback=/merchant/orders`;
      return;
    }
    load().finally(() => setLoading(false));
  }, [load]);

  const onUpdated = useCallback((id: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
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

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const activeCount = orders.filter((o) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-sm text-gray-500">{shop?.name} — {activeCount} active(s) sur {orders.length}</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-[#E2D6C4] bg-white px-3 py-2 text-sm font-semibold text-[#2B2420]"
        >
          <option value="ALL">Toutes les commandes</option>
          {Object.keys(NEXT_STATUS).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-[#E2D6C4] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F5EDE1]">
            <tr>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase">Numéro</th>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase">Date</th>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase">Articles</th>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase">Statut</th>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase text-right">Total</th>
              <th className="px-5 py-3 text-xs font-bold text-[#6B625A] uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2D6C4]">
            {filtered.length > 0 ? (
              filtered.map((o: any) => (
                <tr key={o.id} className="hover:bg-[#FFFBF5]">
                  <td className="px-5 py-3">
                    <div className="text-sm font-bold text-gray-900">{o.orderNumber}</div>
                    {o.paymentMethod && (
                      <div className="text-[11px] text-gray-400">{o.paymentMethod.replace(/_/g, ' ').toLowerCase()}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">
                    {(o.items || []).slice(0, 2).map((it: any, i: number) => (
                      <div key={i} className="truncate max-w-[160px]">{it.quantity}× {it.name}</div>
                    ))}
                    {(o.items || []).length > 2 && <div className="text-gray-400">+{o.items.length - 2}...</div>}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatPrice(Number(o.total))}</td>
                  <td className="px-5 py-3 text-right">
                    <StatusAction orderId={o.id} current={o.status} onUpdated={onUpdated} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Aucune commande {filter !== 'ALL' ? `avec le statut « ${STATUS_LABELS[filter]} »` : 'pour le moment'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
