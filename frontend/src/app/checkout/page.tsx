'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CreditCard, Loader2, Store, Truck, Wallet } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { api, getToken, removeToken } from '@/lib/api';
import { formatPrice, newIdempotencyKey } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: string | number;
  estimatedMin?: number;
  estimatedMax?: number;
}

interface Quote {
  lines: Array<{ productId: string; name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  deliveryFee: number | null;
  deliveryFeeStatus: 'confirmed' | 'to_confirm';
  total: number;
  currency: string;
}

interface Me {
  id: string;
  phone: string;
  role: string;
}

export default function CheckoutPage() {
  const { items, clear, shopId } = useCart();
  const [me, setMe] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [order, setOrder] = useState<Order | null>(null);

  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zoneId, setZoneId] = useState('');
  const [locality, setLocality] = useState('Mboro');
  const [district, setDistrict] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => newIdempotencyKey());

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    [items],
  );

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login?callback=/checkout';
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        const user: Me = res.data.user ?? res.data;
        setMe(user);
        setPhone((current) => current || user.phone || '');
      })
      .catch(() => {
        removeToken();
        window.location.href = '/login?callback=/checkout';
      })
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!shopId) return;
    api
      .get(`/delivery/zones/shop/${shopId}`)
      .then((res) => {
        const list: DeliveryZone[] = res.data ?? [];
        setZones(list);
        if (list.length === 0) setFulfillment('pickup');
      })
      .catch(() => setZones([]));
  }, [shopId]);

  const refreshQuote = useCallback(async () => {
    if (!shopId || orderItems.length === 0) return;
    setLoadingQuote(true);
    setQuoteError('');
    try {
      const res = await api.post('/orders/quote', {
        shopId,
        items: orderItems,
        fulfillment,
        ...(fulfillment === 'delivery' && zoneId ? { deliveryZoneId: zoneId } : {}),
      });
      setQuote(res.data);
    } catch (err: any) {
      setQuote(null);
      setQuoteError(err.response?.data?.message || 'Impossible de calculer le total.');
    } finally {
      setLoadingQuote(false);
    }
  }, [shopId, orderItems, fulfillment, zoneId]);

  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  function validateStepOne(): string | null {
    if (!phone.trim()) return 'Le téléphone est obligatoire pour vous joindre.';
    if (fulfillment === 'delivery') {
      if (zones.length > 0 && !zoneId) return 'Choisissez une zone de livraison.';
      if (!district.trim()) return 'Indiquez votre quartier ou village.';
      if (!landmark.trim()) return 'Indiquez un repère (marché, mosquée, école…).';
    }
    return null;
  }

  async function submitOrder() {
    if (!accepted) {
      setError('Vous devez accepter les conditions de vente.');
      return;
    }
    if (quoteError || !quote) {
      setError('Le total n’a pas pu être validé. Revenez à l’étape précédente.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        shopId,
        items: orderItems,
        fulfillment,
        ...(fulfillment === 'delivery' && zoneId ? { deliveryZoneId: zoneId } : {}),
        deliveryAddress: {
          locality,
          district: district || undefined,
          landmark: landmark || undefined,
          phone,
          instructions: note || undefined,
        },
        paymentMethod: 'cash',
        customerNote: note || undefined,
        idempotencyKey,
      });
      setOrder(res.data);
      clear();
    } catch (err: any) {
      setError(err.response?.data?.message || 'La commande n’a pas pu être créée.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" aria-label="Chargement" />
      </div>
    );
  }

  if (!me) return null;

  if (order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-h1 font-semibold">Commande {order.orderNumber} confirmée</h1>
        <p className="mt-2 text-body text-muted">
          La boutique a été notifiée. Elle vous contactera au {phone} pour confirmer le délai.
          {order.deliveryFeeStatus === 'to_confirm' && (
            <span className="mt-2 block text-small text-gold">
              Les frais de livraison restent à confirmer avec la boutique.
            </span>
          )}
        </p>
        <p className="numbers mt-4 text-2xl font-semibold text-terracotta-dark">
          {formatPrice(order.total)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/orders" className={buttonVariants()}>
            Suivre ma commande
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'tertiary' })}>
            Retour à l’accueil
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Votre panier est vide"
          description="Ajoutez des produits avant de passer commande."
          action={
            <Link href="/products" className={buttonVariants()}>
              Voir les produits
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-h1 font-semibold">Finaliser la commande</h1>
        <ol className="mt-3 flex flex-wrap items-center gap-2 text-caption font-medium">
          {['Livraison', 'Paiement', 'Confirmation'].map((label, index) => {
            const number = (index + 1) as 1 | 2 | 3;
            const active = step === number;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    active ? 'bg-terracotta text-white' : 'bg-sand text-muted',
                  )}
                >
                  {number}
                </span>
                <span className={active ? 'text-ink' : 'text-muted'}>{label}</span>
                {index < 2 && <span className="text-line">—</span>}
              </li>
            );
          })}
        </ol>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          {step === 1 && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-h3 font-semibold">Mode de réception</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className={cn('flex cursor-pointer items-start gap-2 rounded-md border p-3', fulfillment === 'pickup' ? 'border-teal bg-teal/5' : 'border-line')}>
                    <input type="radio" name="fulfillment" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} className="mt-1" />
                    <span>
                      <span className="flex items-center gap-1.5 text-small font-semibold"><Store className="h-4 w-4" aria-hidden="true" /> Retrait en boutique</span>
                      <span className="mt-0.5 block text-caption text-muted">Gratuit — l’adresse est affichée sur la fiche boutique.</span>
                    </span>
                  </label>
                  <label className={cn('flex cursor-pointer items-start gap-2 rounded-md border p-3', fulfillment === 'delivery' ? 'border-teal bg-teal/5' : 'border-line', zones.length === 0 && 'opacity-60')}>
                    <input type="radio" name="fulfillment" checked={fulfillment === 'delivery'} disabled={zones.length === 0} onChange={() => setFulfillment('delivery')} className="mt-1" />
                    <span>
                      <span className="flex items-center gap-1.5 text-small font-semibold"><Truck className="h-4 w-4" aria-hidden="true" /> Livraison à domicile</span>
                      <span className="mt-0.5 block text-caption text-muted">{zones.length === 0 ? 'Zone non desservie — contactez la boutique.' : 'Frais calculés selon votre zone.'}</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {fulfillment === 'delivery' && zones.length > 0 && (
                <Field label="Zone de livraison" required htmlFor="zone">
                  <select id="zone" value={zoneId} onChange={(event) => setZoneId(event.target.value)} className="h-11 w-full rounded-sm border border-line bg-white px-3 text-body">
                    <option value="">Choisir une zone…</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {Number(zone.deliveryFee) === 0 ? 'gratuit' : `${Number(zone.deliveryFee)} FCFA`}
                        {zone.estimatedMin ? ` (${zone.estimatedMin}-${zone.estimatedMax} min)` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quartier / village" required={fulfillment === 'delivery'} htmlFor="district">
                  <Input id="district" value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Ex : Mboro Centre" />
                </Field>
                <Field label="Repère" required={fulfillment === 'delivery'} htmlFor="landmark" hint="Près de… (marché, mosquée, école)">
                  <Input id="landmark" value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Ex : derrière la mosquée" />
                </Field>
                <Field label="Téléphone" required htmlFor="phone">
                  <Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221 77 000 00 00" />
                </Field>
                <Field label="Localité" htmlFor="locality">
                  <Input id="locality" value={locality} onChange={(event) => setLocality(event.target.value)} />
                </Field>
              </div>

              <Field label="Instructions (facultatif)" htmlFor="note">
                <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ex : appeler en arrivant" />
              </Field>

              {quoteError && <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{quoteError}</p>}

              <Button
                className="w-full"
                onClick={() => {
                  const validation = validateStepOne();
                  if (validation) {
                    setError(validation);
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
              >
                Continuer vers le paiement
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-h3 font-semibold">Mode de paiement</legend>
                <div className="mt-3 space-y-2">
                  <label className="flex cursor-pointer items-start gap-2 rounded-md border border-teal bg-teal/5 p-3">
                    <input type="radio" name="payment" defaultChecked className="mt-1" />
                    <span>
                      <span className="flex items-center gap-1.5 text-small font-semibold"><Wallet className="h-4 w-4" aria-hidden="true" /> Paiement à la livraison / au retrait</span>
                      <span className="mt-0.5 block text-caption text-muted">Vous payez en espèces à la remise de la commande.</span>
                    </span>
                  </label>
                  <div className="rounded-md border border-line bg-sand/40 p-3 text-caption text-muted">
                    <p className="flex items-center gap-1.5 font-medium text-ink"><CreditCard className="h-4 w-4" aria-hidden="true" /> Wave et Orange Money</p>
                    <p className="mt-1">
                      Le paiement en ligne n’est pas encore activé sur cette installation. Aucun
                      paiement n’est simulé : utilisez le paiement à la livraison ou contactez la
                      boutique.
                    </p>
                  </div>
                </div>
              </fieldset>

              <div className="rounded-md bg-sand/50 p-3 text-small">
                <p className="font-medium text-ink">Récapitulatif</p>
                <ul className="mt-2 space-y-1 text-muted">
                  {(quote?.lines ?? []).map((line) => (
                    <li key={`${line.productId}-${line.name}`} className="flex justify-between gap-3">
                      <span>{line.quantity} × {line.name}</span>
                      <span className="numbers">{formatPrice(line.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
                  <span>Total</span>
                  <span className="numbers">{quote ? formatPrice(quote.total) : '—'}</span>
                </div>
                {quote?.deliveryFeeStatus === 'to_confirm' && (
                  <p className="mt-1 text-caption text-gold">Frais de livraison à confirmer par la boutique.</p>
                )}
              </div>

              <label className="flex items-start gap-2 text-small text-muted">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" />
                <span>
                  J’accepte les conditions de vente et la politique de confidentialité. Les prix et
                  disponibilités sont confirmés par le serveur au moment de la commande.
                </span>
              </label>

              {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>}

              <div className="flex flex-wrap gap-2">
                <Button variant="tertiary" onClick={() => setStep(1)} disabled={submitting}>
                  Retour
                </Button>
                <Button className="flex-1" onClick={submitOrder} loading={submitting}>
                  {submitting ? 'Envoi de la commande…' : 'Confirmer la commande'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-line bg-white p-5 shadow-card lg:sticky lg:top-20">
          <h2 className="text-h3 font-semibold">Votre commande</h2>
          {loadingQuote && (
            <p className="mt-3 flex items-center gap-2 text-small text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Calcul du total…
            </p>
          )}
          <dl className="mt-3 space-y-2 text-small">
            <div className="flex justify-between text-muted">
              <dt>Sous-total</dt>
              <dd className="numbers text-ink">{quote ? formatPrice(quote.subtotal) : '—'}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Livraison</dt>
              <dd className="numbers text-ink">
                {fulfillment === 'pickup'
                  ? 'Gratuit'
                  : quote?.deliveryFee === null
                    ? 'À confirmer'
                    : quote
                      ? formatPrice(quote.deliveryFee)
                      : '—'}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-body font-semibold">
              <dt>Total</dt>
              <dd className="numbers text-terracotta-dark">{quote ? formatPrice(quote.total) : '—'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-caption text-muted">
            Total calculé par le serveur à partir des prix et stocks réels. Aucune donnée de
            paiement n’est stockée sur cet appareil.
          </p>
        </aside>
      </div>
    </div>
  );
}
