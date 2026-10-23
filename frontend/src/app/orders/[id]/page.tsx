'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Phone } from 'lucide-react';
import { api, getToken } from '@/lib/api';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { orderStatusMeta, paymentStatusMeta } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusStepper } from '@/components/orders/OrderStatusStepper';
import { buttonVariants } from '@/components/ui/Button';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  deliveryFeeStatus?: string;
  createdAt: string;
  customerNote?: string;
  pickupPoint?: string;
  deliveryAddress?: Record<string, string>;
  shop?: { name: string; slug: string; phone?: string };
  items: Array<{ id: string; name: string; quantity: number; unitPrice: string | number; totalPrice: string | number }>;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      window.location.href = `/login?callback=/orders/${id}`;
      return;
    }
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Commande introuvable.'));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-h2 font-semibold">Commande indisponible</h1>
        <p className="mt-2 text-body text-muted">{error}</p>
        <Link href="/orders" className={buttonVariants({ className: 'mt-5' })}>
          Mes commandes
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" aria-label="Chargement" />
      </div>
    );
  }

  const status = orderStatusMeta(order.status);
  const payment = paymentStatusMeta(order.paymentStatus);
  const address = order.deliveryAddress ?? {};

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="inline-flex items-center gap-1 text-small font-medium text-teal hover:text-terracotta-dark">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mes commandes
      </Link>

      <header className="mt-4 rounded-lg border border-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="numbers text-h2 font-semibold">{order.orderNumber}</h1>
          <div className="flex gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <Badge tone={payment.tone}>{payment.label}</Badge>
          </div>
        </div>
        <p className="mt-1 text-small text-muted">
          {order.shop?.name} · {formatDateTime(order.createdAt)}
        </p>
        <div className="mt-5">
          <OrderStatusStepper status={order.status} />
        </div>
      </header>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-h3 font-semibold">Articles</h2>
        <ul className="mt-3 space-y-2 text-small">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-line/60 pb-2 last:border-0">
              <span className="text-muted">{item.quantity} × {item.name}</span>
              <span className="numbers font-medium text-ink">{formatPrice(item.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 text-small">
          <div className="flex justify-between text-muted">
            <dt>Sous-total</dt>
            <dd className="numbers">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Livraison</dt>
            <dd className="numbers">
              {order.deliveryFeeStatus === 'to_confirm'
                ? 'À confirmer'
                : Number(order.deliveryFee) === 0
                  ? 'Gratuit'
                  : formatPrice(order.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-body font-semibold text-ink">
            <dt>Total</dt>
            <dd className="numbers">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5 text-small">
        <h2 className="text-h3 font-semibold">Livraison / retrait</h2>
        {order.pickupPoint && (
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <MapPin className="h-4 w-4 text-terracotta" aria-hidden="true" /> {order.pickupPoint}
          </p>
        )}
        {(address.district || address.landmark) && (
          <p className="mt-2 text-muted">
            {[address.district, address.landmark, address.locality].filter(Boolean).join(' · ')}
          </p>
        )}
        {address.phone && (
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <Phone className="h-4 w-4 text-terracotta" aria-hidden="true" /> {address.phone}
          </p>
        )}
        {order.customerNote && <p className="mt-2 text-muted">Note : {order.customerNote}</p>}
      </section>

      {order.shop?.slug && (
        <Link href={`/shops/${order.shop.slug}`} className={buttonVariants({ variant: 'tertiary', className: 'mt-4 w-full' })}>
          Revoir la boutique
        </Link>
      )}
    </div>
  );
}
