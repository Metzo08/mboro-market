import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import type { Product, Shop } from '@/types';
import { fetchJson } from '@/lib/server';
import { SearchBar } from '@/components/search/SearchBar';
import { ShopCard } from '@/components/shop/ShopCard';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'Recherche',
  description: 'Recherchez un produit, une boutique ou un service à Mboro, Thiès et alentours.',
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const [shopsData, productsData] = query
    ? await Promise.all([
        fetchJson<{ items: Shop[]; total: number }>(`/shops?q=${encodeURIComponent(query)}&limit=12`),
        fetchJson<{ items: Product[]; total: number }>(`/products?q=${encodeURIComponent(query)}&limit=24`),
      ])
    : [null, null];

  const shops = shopsData?.items ?? [];
  const products = productsData?.items ?? [];
  const hasResults = shops.length > 0 || products.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
          Recherche locale
        </p>
        <h1 className="mt-1 text-h1 font-semibold">Que cherchez-vous ?</h1>
        <div className="mt-5">
          <SearchBar defaultValue={query} id="recherche-principale" />
        </div>
      </header>

      {!query && (
        <div className="rounded-lg border border-dashed border-line bg-sand/40 p-6 text-small text-muted">
          <p className="font-medium text-ink">Exemples de recherches</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['dibi', 'mangues', 'riz', 'menuiserie', 'restaurant'].map((suggestion) => (
              <Link
                key={suggestion}
                href={`/recherche?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-small hover:border-teal hover:text-teal"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && !hasResults && (
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
          title={`Aucun résultat pour « ${query} »`}
          description="Vérifiez l’orthographe, essayez un mot plus simple, ou explorez les boutiques de votre localité."
          action={
            <Link href="/shops" className="rounded-md bg-terracotta px-4 py-2.5 text-small font-semibold text-white hover:bg-terracotta-dark">
              Parcourir les boutiques
            </Link>
          }
        />
      )}

      {shops.length > 0 && (
        <section className="mb-10" aria-labelledby="resultats-boutiques">
          <h2 id="resultats-boutiques" className="mb-4 text-h2 font-semibold">
            Boutiques ({shopsData?.total ?? shops.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} compact />
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section aria-labelledby="resultats-produits">
          <h2 id="resultats-produits" className="mb-4 text-h2 font-semibold">
            Produits ({productsData?.total ?? products.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
