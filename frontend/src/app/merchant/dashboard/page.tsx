'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Lightbulb,
  Package,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useMerchantShop } from '@/lib/useMerchantShop';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { orderStatusMeta } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonVariants } from '@/components/ui/Button';
import type { Order, Product } from '@/types';

export default function MerchantDashboard() {
  const { shop, loading: shopLoading, error: shopError } = useMerchantShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shop) return;
    Promise.all([
      api.get('/orders', { params: { shopId: shop.id } }),
      api.get('/products', { params: { shopId: shop.id, limit: 60 } }),
    ])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data.items ?? ordersRes.data ?? []);
        setProducts(productsRes.data.items ?? productsRes.data ?? []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Impossible de charger les données.');
      })
      .finally(() => setLoading(false));
  }, [shop]);

  const stats = useMemo(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekOrders = orders.filter(
      (order) => new Date(order.createdAt).getTime() >= since && order.status !== 'CANCELLED',
    );
    return {
      weekRevenue: weekOrders.reduce((sum, order) => sum + Number(order.total), 0),
      weekOrders: weekOrders.length,
      pending: orders.filter((order) => order.status === 'PENDING').length,
      settled: orders
        .filter((order) => order.paymentStatus === 'SUCCEEDED')
        .reduce((sum, order) => sum + Number(order.total), 0),
      lowStock: products.filter(
        (product) => product.trackInventory !== false && product.stock <= 5,
      ),
    };
  }, [orders, products]);

  const subscription = shop?.subscription;
  const subscriptionTone =
    subscription?.status === 'ACTIVE'
      ? 'success'
      : subscription?.status === 'PAST_DUE' || subscription?.status === 'GRACE_PERIOD'
        ? 'danger'
        : 'neutral';

  const suggestions: Array<{ title: string; href: string; cta: string }> = [];
  if (stats.lowStock.length > 0) {
    suggestions.push({
      title: `${stats.lowStock.length} produit${stats.lowStock.length > 1 ? 's' : ''} à réapprovisionner (stock ≤ 5).`,
      href: '/merchant/products',
      cta: 'Mettre à jour le stock',
    });
  }
  if (!shop?.openingHours || Object.keys(shop.openingHours).length === 0) {
    suggestions.push({
      title: 'Vos horaires ne sont pas renseignés : les clients voient « Horaires non renseignés ».',
      href: '/merchant/products',
      cta: 'Compléter ma fiche',
    });
  }
  if (subscription && subscription.status !== 'ACTIVE') {
    suggestions.push({
      title: 'Votre abonnement n’est pas à jour : la visibilité de la boutique peut être limitée.',
      href: '/merchant/payments',
      cta: 'Voir ma facturation',
    });
  }

  if (shopLoading || (loading && shop)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="rounded-lg border border-line bg-white p-6">
        <h1 className="text-h2 font-semibold">Aucune boutique</h1>
        <p className="mt-2 text-body text-muted">{shopError || 'Créez votre boutique pour accéder au tableau de bord.'}</p>
        <Link href="/register" className={buttonVariants({ className: 'mt-4' })}>
          Créer ma boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
          Bonjour
        </p>
        <h1 className="text-h1 font-semibold">{shop.name}</h1>
        <p className="mt-1 text-small text-muted">
          {shop.status === 'ACTIVE' ? 'Boutique en ligne' : `Statut boutique : ${shop.status}`}
          {shop.publicAddress ? ` · ${shop.publicAddress}` : ''}
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">
          {error}
        </p>
      )}

      {stats.pending > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-terracotta p-4 text-white shadow-card">
          <p className="flex items-center gap-2 text-small font-semibold">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {stats.pending} nouvelle{stats.pending > 1 ? 's' : ''} commande{stats.pending > 1 ? 's' : ''} à traiter
          </p>
          <Link
            href="/merchant/orders"
            className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-caption font-semibold text-terracotta-dark"
          >
            Voir les commandes <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      <section aria-label="Indicateurs" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="flex items-center gap-1.5 text-caption font-medium text-muted">
            <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Commandé (7 jours)
          </p>
          <p className="numbers mt-2 font-display text-2xl font-semibold text-ink">
            {formatPrice(stats.weekRevenue)}
          </p>
          <p className="mt-1 text-caption text-muted">Commandes non annulées</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="flex items-center gap-1.5 text-caption font-medium text-muted">
            <Package className="h-3.5 w-3.5" aria-hidden="true" /> Commandes (7 jours)
          </p>
          <p className="numbers mt-2 font-display text-2xl font-semibold text-ink">{stats.weekOrders}</p>
          <p className="mt-1 text-caption text-muted">{stats.pending} en attente au total</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="flex items-center gap-1.5 text-caption font-medium text-muted">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Encaissé
          </p>
          <p className="numbers mt-2 font-display text-2xl font-semibold text-success">
            {formatPrice(stats.settled)}
          </p>
          <p className="mt-1 text-caption text-muted">Paiements confirmés uniquement</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="flex items-center gap-1.5 text-caption font-medium text-muted">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Abonnement
          </p>
          <div className="mt-2">
            <Badge tone={subscriptionTone as any}>
              {subscription ? subscription.status : 'Non configuré'}
            </Badge>
          </div>
          <p className="mt-1 text-caption text-muted">
            {subscription?.nextDueAt ? `Échéance ${formatDateTime(subscription.nextDueAt)}` : 'Voir la facturation'}
          </p>
        </div>
      </section>

      {suggestions.length > 0 && (
        <section aria-labelledby="suggestions-titre" className="rounded-lg border border-line bg-sand/50 p-4">
          <h2 id="suggestions-titre" className="flex items-center gap-1.5 text-h3 font-semibold">
            <Lightbulb className="mr-1.5 inline h-4 w-4 text-gold" aria-hidden="true" /> Actions suggérées
          </h2>
          <ul className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.title}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-3 text-small"
              >
                <span className="text-ink">{suggestion.title}</span>
                <Link href={suggestion.href} className="text-caption font-semibold text-teal hover:text-terracotta-dark">
                  {suggestion.cta} →
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-muted">
            Règles simples appliquées à vos données réelles — l’assistant IA bilingue arrive en phase 4.
          </p>
        </section>
      )}

      <section aria-labelledby="commandes-recentes">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="commandes-recentes" className="text-h2 font-semibold">Commandes récentes</h2>
          <Link href="/merchant/orders" className="text-small font-medium text-teal hover:text-terracotta-dark">
            Tout voir
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-small text-muted">
            Aucune commande pour le moment. Partagez le lien de votre boutique pour commencer.
          </div>
        ) : (
          <ul className="space-y-2">
            {orders.slice(0, 5).map((order) => {
              const meta = orderStatusMeta(order.status);
              return (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-white p-3 text-small">
                  <div>
                    <p className="numbers font-semibold text-ink">{order.orderNumber}</p>
                    <p className="text-caption text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span className="numbers font-medium text-ink">{formatPrice(order.total)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
