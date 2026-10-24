import Link from 'next/link';
import Image from 'next/image';
import { Product, Shop } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryGrid } from '@/components/products/CategoryGrid';
import { shopImage } from '@/lib/images';
import { HomeActivityCarousel } from '@/components/carousel/HomeActivityCarousel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JëndCiThiès',
  url: 'http://localhost:3001',
  logo: 'http://localhost:3001/favicon.ico',
  description: 'JëndCiThiès by Sen-E-Carte : place de marché locale pour Mboro et Thiès, Sénégal',
  telephone: '+221771234567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Marché de Mboro',
    addressLocality: 'Mboro',
    addressRegion: 'Thiès',
    addressCountry: 'SN',
  },
};

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

async function getShops(): Promise<Shop[]> {
  try {
    const res = await fetch(`${API_URL}/shops?limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, shops] = await Promise.all([getProducts(), getShops()]);

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#14532d] via-[#1B7A3D] to-[#2ca25c] p-6 sm:p-10 md:p-14">
        <Image
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80"
          alt="Marché local à Mboro, Sénégal"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-3">
            By Sen-E-Carte — Mboro · Thiès
          </Badge>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white md:text-5xl">
            JëndCiThiès — Jënd ci kaw, jënd ci sa wetu
          </h1>
          <p className="mb-6 max-w-2xl mx-auto text-base text-green-50/90">
            Produits frais, artisans et restaurants près de chez vous. Commandez en 3 clics.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <form action="/products" method="get" className="w-full max-w-xl flex gap-2">
              <input
                name="q"
                placeholder="Rechercher : mangues, thieboudienne, bazin…"
                className="w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-white"
              />
              <Button variant="accent" className="shrink-0">
                Chercher
              </Button>
            </form>
            <div className="flex w-full gap-3 sm:w-auto sm:justify-center">
              <Button as="a" href="/products" variant="outline" className="sm:w-full">
                Voir les produits
              </Button>
              <Button as="a" href="/shops" variant="secondary" className="sm:w-full">
                Voir les boutiques
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorer par categorie</h2>
          <CategoryGrid />
        </div>
      </section>

      <HomeActivityCarousel />

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produits populaires</h2>
              <p className="mt-1 text-sm text-gray-500">
                Les articles les plus demandés par la communauté.
              </p>
            </div>
            <Button as="a" href="/products" variant="ghost" size="sm">
              Voir tout →
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nos boutiques partenaires</h2>
            <Link href="/shops" className="text-sm font-medium text-green-700 hover:underline">
              Toutes les boutiques →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.length > 0 ? (
              shops.map((s) => (
                <Link
                  key={s.id}
                  href={`/shops/${s.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-36 overflow-hidden bg-gray-100">
                    <Image
                      src={shopImage(s)}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Badge
                      className="absolute left-3 top-3"
                      variant={s.status === 'ACTIVE' ? 'success' : 'outline'}
                    >
                      {s.status === 'ACTIVE' ? 'Ouvert' : s.status}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B7A3D] text-lg font-bold text-white ring-4 ring-white">
                        {(s.name || 'J')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900">{s.name}</h3>
                        <p className="text-xs text-gray-500">Boutique partenaire</p>
                      </div>
                    </div>
                    <p className="truncate text-sm text-gray-600">
                      {s.shortDescription || 'Commerçant local à Thiès'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">Aucune boutique pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="jt-sand flex flex-col items-center justify-center rounded-2xl border border-amber-200 p-8 text-center sm:p-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F59E0B]/10">
              <svg className="h-7 w-7 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Commerçant à Mboro ou Thiès ?</h2>
            <p className="mb-6 text-sm text-gray-600">
              Créez votre boutique en 10 minutes, soyez visible sur Google.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Activation 5 000 FCFA + 2 500 FCFA/mois.
            </p>
            <Button as="a" href="/register" variant="accent" size="lg">
              Créer ma boutique
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
