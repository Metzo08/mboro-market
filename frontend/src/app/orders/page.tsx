'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { api, getToken } from '@/lib/api';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { orderStatusMeta, paymentStatusMeta } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonVariants } from '@/components/ui/Button';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login?callback=/orders';
      return;
    }

    api
      .get('/orders')
      .then((res) => {
        setOrders(res.data.items ?? res.data ?? []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Impossible de charger vos commandes.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-5">
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
          Mon compte
        </p>
        <h1 className="text-h1 font-semibold">Mes commandes</h1>
      </header>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-danger/10 p-3 text-small text-danger">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" aria-hidden="true" />}
          title="Aucune commande pour le moment"
          description="Vos commandes apparaîtront ici avec leur statut, sans avoir à appeler la boutique."
          action={
            <Link href="/products" className={buttonVariants()}>
              Découvrir les produits
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const status = orderStatusMeta(order.status);
            const payment = paymentStatusMeta(order.paymentStatus);
            return (
              <li key={order.id} className="rounded-lg border border-line bg-white shadow-card">
                <Link href={`/orders/${order.id}`} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="numbers text-small font-semibold text-ink">{order.orderNumber}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <Badge tone={payment.tone}>{payment.label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-small text-muted">
                      {order.shop?.name ?? 'Boutique'} · {formatDateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 text-caption text-muted">
                      {(order.items ?? []).map((item) => `${item.quantity} × ${item.name}`).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="numbers text-small font-bold text-ink">{formatPrice(order.total)}</p>
                    <ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
