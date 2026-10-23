import Link from 'next/link';
import { MapPin, ShieldCheck, Store } from 'lucide-react';
import type { Shop } from '@/types';
import { shopInitial, shopLocality, shopTypeLabel } from '@/lib/shop';
import { Badge } from '@/components/ui/Badge';
import { OpenStatus } from '@/components/shop/OpenStatus';

export function ShopCard({ shop, compact = false }: { shop: Shop; compact?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-raised">
      <Link href={`/shops/${shop.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-teal">
          {shop.settings && typeof shop.settings === 'object' && (shop.settings as any).bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(shop.settings as any).bannerUrl}
              alt={`Bannière de ${shop.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="motif-bogolan flex h-full w-full items-center justify-center bg-gradient-to-br from-teal via-teal to-teal-light">
              <span className="font-display text-5xl font-semibold text-white/80">{shopInitial(shop.name)}</span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge tone="neutral" className="bg-white/95 text-ink">
              {shopTypeLabel(shop.type)}
            </Badge>
          </div>
        </div>

        <div className="relative px-4 pb-4 pt-9">
          <div className="absolute -top-7 left-4 flex h-14 w-14 items-center justify-center rounded-md border-4 border-white bg-terracotta font-display text-xl font-semibold text-white shadow-card">
            {shopInitial(shop.name)}
          </div>
          <h3 className="font-display text-h3 font-semibold text-ink group-hover:text-terracotta-dark">
            {shop.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-small text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {shopLocality(shop)}
          </p>
          {!compact && shop.shortDescription && (
            <p className="mt-2 line-clamp-2 text-small text-muted">{shop.shortDescription}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {shop.verificationStatus === 'verified' && (
              <Badge tone="teal" icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}>
                Vérifiée
              </Badge>
            )}
            <OpenStatus hours={shop.openingHours} />
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-caption text-muted">
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            {shop._count?.products ?? shop.products?.length ?? 0} produit
            {(shop._count?.products ?? shop.products?.length ?? 0) > 1 ? 's' : ''} en ligne
          </p>
        </div>
      </Link>
    </article>
  );
}
