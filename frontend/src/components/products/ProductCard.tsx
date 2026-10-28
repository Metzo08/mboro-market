'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { productImage } from '@/lib/images';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { MessageCircle } from 'lucide-react';

export function ProductCard({ product, theme = 'light' }: { product: Product; theme?: 'light' | 'dark' }) {
  const hasPromo =
    product.promotionalPrice != null &&
    Number(product.promotionalPrice) > 0 &&
    Number(product.promotionalPrice) < Number(product.price);

  const waMsg = encodeURIComponent(
    `Salam aleikoum ! Je souhaite commander le produit *${product.title}* (${formatPrice(Number(product.price))}) vu sur JëndCiThiès. Est-il disponible ?`
  );
  const waUrl = `https://wa.me/221771234567?text=${waMsg}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2D6C4] bg-white shadow-sm jt-card-hover">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-48 overflow-hidden bg-[#F5EDE1]">
          <Image
            src={productImage(product)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {hasPromo && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#F2A93B] px-2.5 py-0.5 text-xs font-bold text-gray-900 shadow-sm">
              Promo
            </span>
          )}
          {Number(product.stock) <= 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[#C9432D] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              Épuisé
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-grow p-4 sm:p-5">
        <Link href={`/products/${product.slug}`} className="block mb-1">
          <h3 className="font-bold text-sm sm:text-base text-[#2B2420] line-clamp-2 group-hover:text-[#E8632C] transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="truncate text-xs text-[#6B625A] mb-3">
          {product.shortDescription || 'Produit local — Mboro · Thiès'}
        </p>

        <div className="mt-auto mb-3 flex items-baseline gap-2">
          <p suppressHydrationWarning className="text-base sm:text-lg font-black text-[#E8632C]">
            {formatPrice(Number(product.price))}
          </p>
          {hasPromo && (
            <p suppressHydrationWarning className="text-xs text-[#6B625A] line-through">
              {formatPrice(Number(product.promotionalPrice))}
            </p>
          )}
        </div>

        {/* Boutons d'action : Panier + WhatsApp direct */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3">
            <AddToCartButton product={product} />
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Commander directement sur WhatsApp"
            aria-label="Commander sur WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
