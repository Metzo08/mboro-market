import Link from 'next/link';
import { BadgeCheck, ShoppingBasket, Truck } from 'lucide-react';
import type { Product, Shop } from '@/types';
import { formatPrice } from '@/lib/utils';
import { shopInitial, shopTypeLabel } from '@/lib/shop';
import { Badge } from '@/components/ui/Badge';
import { OpenStatus } from '@/components/shop/OpenStatus';

/**
 * Visuel du héro construit avec les VRAIES données de la base
 * (aucune fausse boutique, aucun faux avis).
 */
export function HeroShowcase({
  shop,
  product,
}: {
  shop?: Shop;
  product?: Product;
}) {
  if (!shop) return null;

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md" >
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 shadow-float backdrop-blur" />

      {/* Carte boutique principale */}
      <div className="absolute left-4 right-8 top-6 rotate-[-2deg] overflow-hidden rounded-3xl border border-line bg-white shadow-raised">
        <div className="motif-bogolan relative flex h-32 items-center justify-center bg-gradient-to-br from-teal via-teal to-teal-light">
          <span className="font-display text-5xl font-semibold text-white/85">{shopInitial(shop.name)}</span>
          <Badge tone="neutral" className="absolute left-3 top-3 bg-white/95 text-ink">
            {shopTypeLabel(shop.type)}
          </Badge>
        </div>
        <div className="p-4">
          <p className="font-display text-h3 font-semibold leading-tight text-ink">{shop.name}</p>
          <p className="mt-1 flex items-center gap-1 text-caption text-muted">
            <BadgeCheck className="h-3.5 w-3.5 text-teal" />
            {shop.publicAddress ?? 'Thiès, Sénégal'}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <OpenStatus hours={shop.openingHours} />
            <span className="flex items-center gap-1 text-caption font-medium text-teal">
              <BadgeCheck className="h-3.5 w-3.5" />
              Vérifiée
            </span>
          </div>
        </div>
      </div>

      {/* Mini carte produit */}
      {product && (
        <div className="absolute bottom-16 left-0 w-56 rotate-[3deg] rounded-2xl border border-line bg-white p-3 shadow-float">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand font-display text-lg font-semibold text-terracotta-dark">
              {product.title.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-ink">{product.title}</p>
              <p className="numbers text-caption font-bold text-terracotta-dark">
                {formatPrice(product.promotionalPrice ?? product.price)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge paiement */}
      <div className="absolute bottom-6 right-4 flex items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-float">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
          <Truck className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-caption font-semibold text-ink">Livraison locale</p>
          <p className="text-[11px] text-muted">Paiement à la réception</p>
        </div>
      </div>

      <div className="absolute -right-6 top-24 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />
      <div className="absolute -left-8 bottom-10 h-32 w-32 rounded-full bg-terracotta/20 blur-2xl" />

      <Link
        href={`/shops/${shop.slug}`}
       
        className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-caption font-semibold text-white shadow-raised"
      >
        <ShoppingBasket className="h-3.5 w-3.5" />
        Voir la boutique
      </Link>
    </div>
  );
}
