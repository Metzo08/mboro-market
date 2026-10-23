import Link from 'next/link';
import { Flame, Store } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  const hasPromo =
    product.promotionalPrice !== null &&
    product.promotionalPrice !== undefined &&
    Number(product.promotionalPrice) < Number(product.price);
  const displayPrice = hasPromo ? Number(product.promotionalPrice) : Number(product.price);
  const outOfStock = product.availability === 'out_of_stock' || (product.trackInventory !== false && product.stock <= 0);
  const imageUrl = product.media?.[0]?.url || product.image;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-raised">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="motif-bogolan flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-[#ecdcc6]">
              <span className="font-display text-4xl font-semibold text-terracotta/60">
                {product.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {hasPromo && (
              <Badge tone="terracotta" icon={<Flame className="h-3 w-3" aria-hidden="true" />}>
                Promo
              </Badge>
            )}
            {outOfStock && <Badge tone="danger">Épuisé</Badge>}
          </div>
        </div>

        <div className="px-3 pt-3">
          <h3 className="line-clamp-2 text-small font-semibold text-ink">{product.title}</h3>
          {product.shop && (
            <p className="mt-1 flex items-center gap-1 text-caption text-muted">
              <Store className="h-3 w-3" aria-hidden="true" />
              {product.shop.name}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="numbers font-display text-h3 font-semibold text-terracotta-dark">
              {formatPrice(displayPrice)}
            </span>
            {hasPromo && (
              <span className="numbers text-caption text-muted line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-auto p-3">
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
