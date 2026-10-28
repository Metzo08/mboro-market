'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { productImage } from '@/lib/images';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

export function ProductCard({ product, theme = 'light' }: { product: Product; theme?: 'light' | 'dark' }) {
  const hasPromo =
    product.promotionalPrice != null &&
    Number(product.promotionalPrice) > 0 &&
    Number(product.promotionalPrice) < Number(product.price);

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl shadow-sm jt-card-hover ${theme === 'dark' ? 'border-gray-800 bg-gray-800' : 'border-green-50 bg-white'}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className={`relative h-48 overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Image
            src={productImage(product)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {hasPromo && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 12m6 0v6m4.5-6.75a2.25 2.25 0 0 1-1.121 2.066m-5.25-4.131a2.25 2.25 0 0 0 .354 4.459l.63.63a2.25 2.25 0 0 1-3.182 3.182l-.63-.63a2.25 2.25 0 0 0-4.459.354M10.5 18.75V21m-3-3h6" />
              </svg>
              Promo
            </span>
          )}
          {Number(product.stock) <= 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-bold text-white">
              Épuisé
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-grow p-5">
        <Link href={`/products/${product.slug}`} className="block mb-1.5">
          <h3 className={`font-semibold line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {product.title}
          </h3>
        </Link>
        <p className={`truncate text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {product.shortDescription || 'Produit local — Mboro · Thiès'}
        </p>

        <div className="mt-2 flex items-baseline gap-2.5">
          <p suppressHydrationWarning className={`text-base font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{formatPrice(Number(product.price))}</p>
          {hasPromo && (
            <p suppressHydrationWarning className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} line-through`}>{formatPrice(Number(product.promotionalPrice))}</p>
          )}
        </div>

        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
