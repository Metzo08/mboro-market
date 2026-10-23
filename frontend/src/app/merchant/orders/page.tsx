'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { useMerchantShop } from '@/lib/useMerchantShop';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, orderStatusMeta } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatusStepper } from '@/components/orders/OrderStatusStepper';
import { cn } from '@/lib/utils';

interface ShopOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string | number;
  createdAt: string;
  customerNote?: string;
  deliveryAddress?: Record<string, string>;
  pickupPoint?: string;
  items: Array<{ id: string; name: string; quantity: number; totalPrice: string | number }>;
}

const NEXT_ACTIONS: Record<string, Array<{ status: string; label: string; variant?: 'primary' | 'secondary' | 'danger' | 'tertiary' }>> = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Accepter', variant: 'primary' },
    { status: 'CANCELLED', label: 'Refuser', variant: 'tertiary' },
  ],
  CONFIRMED: [{ status: 'PREPARING', label: 'Lancer la préparation', variant: 'primary' }],
  PREPARING: [{ status: 'READY', label: 'Marquer prête', variant: 'primary' }],
  READY: [
    { status: 'DELIVERED', label: 'Marquer livrée', variant: 'primary' },
    { status: 'COMPLETED', label: 'Retirée par le client', variant: 'secondary' },
  ],
  SHIPPED: [{ status: 'DELIVERED', label: 'Marquer livrée', variant: 'primary' }],
  DELIVERED: [{ status: 'COMPLETED', label: 'Clôturer', variant: 'secondary' }],
};

const FILTERS = ['Toutes', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function MerchantOrders() {
  const { shop, loading: shopLoading } = useMerchantShop();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Toutes');
  const [updating, setUpdating] = useState<string | null>(null);

  async function loadOrders(shopId: string) {
    try {
      const res = await api.get('/orders', { params: { shopId } });
      setOrders(res.data.items ?? res.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shop) loadOrders(shop.id);
  }, [shop]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    setError('');
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      if (shop) await loadOrders(shop.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Changement de statut impossible.');
    } finally {
      setUpdating(null);
    }
  }

  const filtered = useMemo(
    () => (filter === 'Toutes' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  if (shopLoading || loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-h1 font-semibold">Commandes</h1>
        <p className="mt-1 text-small text-muted">
          Chaque changement de statut est horodaté et visible par le client.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
      )}

      <nav aria-label="Filtrer les commandes" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => {
          const active = filter === item;
          const label = item === 'Toutes' ? 'Toutes' : orderStatusMeta(item).label;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={active}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-caption font-semibold',
                active ? 'bg-teal text-white' : 'border border-line bg-white text-ink hover:border-teal',
              )}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-small text-muted">
          Aucune commande dans ce filtre.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => {
            const meta = orderStatusMeta(order.status);
            const address = order.deliveryAddress ?? {};
            const actions = NEXT_ACTIONS[order.status] ?? [];
            return (
              <li key={order.id} className="rounded-lg border border-line bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="numbers text-small font-semibold text-ink">{order.orderNumber}</p>
                    <p className="text-caption text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span className="numbers text-small font-bold text-ink">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <OrderStatusStepper status={order.status} />
                </div>

                <ul className="mt-3 space-y-1 text-small text-muted">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span>{item.quantity} × {item.name}</span>
                      <span className="numbers">{formatPrice(item.totalPrice)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 text-caption text-muted">
                  {order.pickupPoint ?? [address.district, address.landmark, address.locality].filter(Boolean).join(' · ')}
                  {address.phone && (
                    <a href={`tel:${address.phone}`} className="ml-2 inline-flex items-center gap-1 font-medium text-teal">
                      <Phone className="h-3 w-3" aria-hidden="true" /> {address.phone}
                    </a>
                  )}
                </p>
                {order.customerNote && (
                  <p className="mt-1 rounded-sm bg-sand/60 px-2 py-1 text-caption text-ink">
                    Note client : {order.customerNote}
                  </p>
                )}

                {actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <Button
                        key={action.status}
                        size="sm"
                        variant={action.variant ?? 'primary'}
                        loading={updating === order.id}
                        onClick={() => updateStatus(order.id, action.status)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                {updating === order.id && (
                  <p className="mt-2 flex items-center gap-1.5 text-caption text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Mise à jour…
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
