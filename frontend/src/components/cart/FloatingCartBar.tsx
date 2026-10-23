'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';

/** Barre panier flottante du wireframe §4.2. */
export function FloatingCartBar() {
  const { items, itemCount, total } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/cart"
          className="flex items-center justify-between gap-3 rounded-md bg-terracotta px-4 py-3.5 text-white shadow-float transition-colors hover:bg-terracotta-dark"
        >
          <span className="flex items-center gap-2 text-small font-semibold">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Voir le panier ({itemCount})
          </span>
          <span className="numbers font-display text-small font-bold">{formatPrice(total)}</span>
        </Link>
      </div>
    </div>
  );
}
