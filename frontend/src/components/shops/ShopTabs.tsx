'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shop } from '@/types';
import { formatPrice } from '@/lib/utils';
import { productImage, shopImage } from '@/lib/images';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';

interface ShopTabsProps {
  shop: Shop;
  products: any[];
}

export function ShopTabs({ shop, products }: ShopTabsProps) {
  const [tab, setTab] = useState<'products' | 'info' | 'reviews'>('products');

  const productItems = products.map((p) => {
    const hasPromo =
      p.promotionalPrice != null &&
      Number(p.promotionalPrice) > 0 &&
      Number(p.promotionalPrice) < Number(p.price);

    return (
      <div key={p.id} className="group flex flex-col overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={productImage(p)}
            alt={p.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {Number(p.stock) <= 0 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-red-500/90 text-xs text-white px-2 py-0.5">Épuisé</span>
          )}
        </div>
        <div className="p-3">
          <Link href={`/products/${p.slug}`} className="block mb-1">
            <h3 className="font-semibold line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              {p.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {p.shortDescription || 'Produit local'}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-base font-bold text-green-600">
              {formatPrice(Number(p.price))}
            </span>
            {hasPromo && (
              <span suppressHydrationWarning className="text-xs text-gray-400 line-through">
                {formatPrice(Number(p.promotionalPrice))}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  });

  const activeProductsCount = products.filter((p: any) => p.rating).length;

  const openingHours = shop.openingHours || {};
  const defaultHours = {
    monday: { open: '8h', close: '18h' },
    tuesday: { open: '8h', close: '18h' },
    wednesday: { open: '8h', close: '18h' },
    thursday: { open: '8h', close: '18h' },
    friday: { open: '8h', close: '18h' },
    saturday: { open: '9h', close: '16h' },
    sunday: { open: null, close: null },
  };
  const hours = { ...defaultHours, ...openingHours };
  const daysOfWeek = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
      <div className="relative h-80 lg:h-[420px] bg-gray-100 dark:bg-gray-900">
        <Image
          src={shopImage(shop)}
          alt={shop.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
            <p className="text-gray-100 mt-2 line-clamp-2">{shop.shortDescription || shop.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant={shop.status === 'ACTIVE' ? 'success' : 'outline'} className="text-sm">
                {shop.status === 'ACTIVE' ? 'Ouvert' : 'Fermé'}
              </Badge>
              <span className="text-sm text-gray-100">
                {shop.publicAddress?.split(',').pop() || 'Thiès'}
              </span>
              {(shop.whatsapp || shop.phone) && (
                <a
                  href={`https://wa.me/${(shop.whatsapp || shop.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Salam aleikoum ${shop.name}, j'ai vu votre boutique sur JëndCiThiès !`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <span>💬 Contacter sur WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const g = (window as any).gtag;
                if (g) g('event', 'toggle_favorite', { shop_id: shop.id });
              }
            }}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
            aria-label="Ajouter aux favoris"
          >
            <svg className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.293a.45.45 0 0 0 .121.885l-.321.78l1.27 1.35a.3.3 0 0 0 .05.178l-.321.9a.42.42 0 0 0-.12.68l-.9 1.005a.46.46 0 0 0-.12.212l-1.07-3.293a.45.45 0 0 0-.121-.885l1.07-3.293zM14.798 2.927c-.3-.921-1.603-.921-1.902 0l-1.07 3.293a.45.45 0 0 0 .121.885l-.321.78l-1.27 1.35a.3.3 0 0 0-.05.178l.321.9a.42.42 0 0 0-.12.68l.9-1.005a.46.46 0 0 0 .12.212l1.07 3.293a.45.45 0 0 0 .121.885l-1.07 3.293zM9.049 15.773c.3.921 1.603.921 1.902 0l1.07-3.293a.45.45 0 0 0 .121-.885l-.321-.78l-1.27-1.35a.3.3 0 0 0-.05-.178l.321-.9a.42.42 0 0 0-.12-.68l.9-1.005a.46.46 0 0 0 .12-.212l1.07 3.293a.45.45 0 0 0 .121.885l-1.07 3.293zM9.049 15.773c.3.921 1.603.921 1.902 0l1.07-3.293a.45.45 0 0 0 .121-.885l-.321-.78l-1.27-1.35a.3.3 0 0 0-.05-.178l.321-.9a.42.42 0 0 0-.12-.68l.9-1.005a.46.46 0 0 0 .12-.212l1.07 3.293a.45.45 0 0 0 .121.885l-1.07 3.293z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setTab('products')}
            className={cn(
              'col-span-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-b-2 border-transparent',
              tab === 'products' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-400' : ''
            )}
          >
            Produits <span className="font-bold">({products.length})</span>
          </button>
          <button
            onClick={() => setTab('info')}
            className={cn(
              'py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-b-2 border-transparent',
              tab === 'info' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-400' : ''
            )}
          >
            Infos
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={cn(
              'py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-b-2 border-transparent',
              tab === 'reviews' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-400' : ''
            )}
          >
            Avis <span className="font-bold">({activeProductsCount})</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {tab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((p: any) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#E2D6C4] p-12 text-center text-[#6B625A]">
                Aucun produit publié dans cette boutique pour le moment.
              </div>
            )}
          </div>
        )}
        {tab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-green-900 dark:text-white mb-4">Informations de la boutique</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>Adresse :</strong> {shop.publicAddress || 'Thiès, Sénégal'}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>Téléphone :</strong> {shop.phone || 'Non indiqué'}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>Email :</strong> {shop.email || 'Non indiqué'}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>Site web :</strong> {shop.website || 'Non indiqué'}</p>
              {shop.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-2">{shop.description}</p>
              )}
              <div className="mt-4 p-3 bg-green-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-green-700">Modes de paiement :</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {shop.acceptedPaymentMethods && shop.acceptedPaymentMethods.length > 0
                    ? shop.acceptedPaymentMethods.join(', ')
                    : 'PayDunya, Wave, Espèces, Carte bancaire'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 dark:text-white mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2">
                {daysOfWeek.map((day) => {
                  const dayHours = (hours as any)[day.key];
                  const isOpen = dayHours?.open && dayHours?.close;
                  return (
                    <div key={day.key} className="flex justify-between">
                      <p className="font-medium text-gray-600 dark:text-gray-400">{day.label}</p>
                      <p className={isOpen ? "text-green-600" : "text-gray-400"}>
                        {isOpen ? `${dayHours.open} - ${dayHours.close}` : 'Fermé'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {tab === 'reviews' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Avis clients</h3>
            <p className="text-gray-600 mb-4">Les avis sont actuellement indisponibles. Veuillez revenir plus tard.</p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-500">Soyez le premier à laisser un avis !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

