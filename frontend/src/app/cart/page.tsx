'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, buttonVariants } from '@/components/ui/Button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, total, itemCount, unitPrice } = useCart();
  const shopName = items[0]?.product.shop?.name;
  const shopSlug = items[0]?.product.shop?.slug;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={<ShoppingBasket className="h-6 w-6" aria-hidden="true" />}
          title="Votre panier est vide"
          description="Parcourez les boutiques et produits de votre localité pour commencer."
          action={
            <Link href="/products" className={buttonVariants({ variant: 'primary' })}>
              Voir les produits
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
            Étape 1 sur 3
          </p>
          <h1 className="text-h1 font-semibold">Mon panier ({itemCount})</h1>
          {shopName && (
            <p className="mt-1 text-small text-muted">
              Boutique :{' '}
              {shopSlug ? (
                <Link href={`/shops/${shopSlug}`} className="font-medium text-teal hover:text-terracotta-dark">
                  {shopName}
                </Link>
              ) : (
                shopName
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-small font-medium text-muted underline underline-offset-2 hover:text-danger"
        >
          Vider le panier
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.product.id + (item.variantId ?? '')}
              className="flex gap-3 rounded-lg border border-line bg-white p-3 shadow-card"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-sand font-display text-2xl font-semibold text-terracotta/60">
                {item.product.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="line-clamp-2 text-small font-semibold text-ink hover:text-terracotta-dark"
                >
                  {item.product.title}
                </Link>
                <p className="numbers mt-1 text-caption text-muted">
                  {formatPrice(unitPrice(item))} l’unité
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-sm border border-line">
                    <button
                      type="button"
                      aria-label={`Diminuer la quantité de ${item.product.title}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
                      className="flex h-9 w-9 items-center justify-center text-ink hover:bg-sand"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="numbers w-9 text-center text-small font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Augmenter la quantité de ${item.product.title}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}
                      className="flex h-9 w-9 items-center justify-center text-ink hover:bg-sand"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="numbers text-small font-bold text-ink">
                      {formatPrice(unitPrice(item) * item.quantity)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Retirer ${item.product.title}`}
                      onClick={() => removeItem(item.product.id, item.variantId)}
                      className="text-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-line bg-white p-5 shadow-card lg:sticky lg:top-20">
          <h2 className="text-h3 font-semibold">Résumé</h2>
          <dl className="mt-4 space-y-2 text-small">
            <div className="flex justify-between text-muted">
              <dt>Sous-total</dt>
              <dd className="numbers font-medium text-ink">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Livraison</dt>
              <dd>Calculée à l’étape suivante</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-body font-semibold">
              <dt>Total provisoire</dt>
              <dd className="numbers text-terracotta-dark">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-caption text-muted">
            Le montant final est recalculé par le serveur (prix, stock et frais de livraison).
          </p>
          <Link href="/checkout" className={buttonVariants({ className: 'mt-4 w-full' })}>
            Continuer vers la livraison
          </Link>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => window.history.back()}
          >
            Continuer mes achats
          </Button>
        </aside>
      </div>
    </div>
  );
}
