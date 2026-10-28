'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { productImage } from '@/lib/images';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [tab, setTab] = useState<'description' | 'details'>('description');

  const shareViaWhatsApp = () => {
    const message = `Je recommande le produit ${product.title} de JëndCiThiès. Prix : ${formatPrice(Number(product.price))}. Vérifiez-le : ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <nav className="bg-gray-50 py-2 px-4 dark:bg-gray-800">
          <ol className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/" className="hover:text-green-700 transition-colors">Accueil</Link></li>
            <li className="separator mx-1 text-gray-300 dark:text-gray-600">/</li>
            <li><Link href="/products" className="hover:text-green-700 transition-colors">Produits</Link></li>
            <li className="separator mx-1 text-gray-300 dark:text-gray-600">/</li>
            <li className="font-medium text-gray-900 dark:text-white">{product.title}</li>
          </ol>
        </nav>

        <div className="h-64 lg:h-[400px] relative">
          <Image
            src={productImage(product)}
            alt={product.title}
            className="object-cover w-full h-full rounded-t-lg"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-gray-500 mb-3">{product.shortDescription || product.description}</p>

          <div className="flex items-center gap-3 mb-4">
            <span suppressHydrationWarning className="text-2xl font-bold text-green-600">
              {formatPrice(Number(product.price))}
            </span>
            {product.promotionalPrice && (
              <span suppressHydrationWarning className="text-lg text-gray-500 line-through">
                {formatPrice(Number(product.promotionalPrice))}
              </span>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <AddToCartButton product={product} />
            <a href="/cart" className="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors">
              Acheter maintenant
            </a>
            <button
              onClick={shareViaWhatsApp}
              className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Partager sur WhatsApp"
            >
              Partager
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setTab('description')}
                className={cn(
                  'py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-b-2 border-transparent',
                  tab === 'description' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-400' : ''
                )}
              >
                Description
              </button>
              <button
                onClick={() => setTab('details')}
                className={cn(
                  'py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-b-2 border-transparent',
                  tab === 'details' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-400' : ''
                )}
              >
                Détails
              </button>
            </div>
          </div>

          {tab === 'description' && (
            <div>
              <p className="text-gray-600 mb-4">{product.description || product.shortDescription}</p>
              {product.leadTime && (
                <p className="text-gray-600 mt-4">
                  <strong>Délai de livraison :</strong> {product.leadTime}
                </p>
              )}
            </div>
          )}

          {tab === 'details' && (
            <div>
              <dl className="grid grid-cols-2 gap-4">
                <dt className="font-medium text-gray-600 dark:text-gray-400">SKU</dt>
                <dd className="text-gray-900 dark:text-white">{(product as any).sku || 'Non spécifié'}</dd>
                <dt className="font-medium text-gray-600 dark:text-gray-400">Disponibilité</dt>
                <dd className="text-gray-900 dark:text-white">{product.availability || 'Non spécifié'}</dd>
                <dt className="font-medium text-gray-600 dark:text-gray-400">Délai</dt>
                <dd className="text-gray-900 dark:text-white">{product.leadTime || 'Non spécifié'}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
