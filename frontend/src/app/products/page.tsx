import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import type { Category, Product } from '@/types';
import { fetchJson } from '@/lib/server';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/search/SearchBar';

export const metadata: Metadata = {
  title: 'Produits et catalogues des commerçants de Thiès',
  description:
    'Découvrez les produits disponibles chez les commerçants de Mboro, Thiès et sa région. Prix affichés en FCFA, stock mis à jour par les boutiques.',
  alternates: { canonical: '/products' },
};

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; categoryId?: string; shopId?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q, categoryId, shopId, page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1));

  const params = new URLSearchParams();
  params.set('limit', '24');
  params.set('page', String(currentPage));
  if (q) params.set('q', q);
  if (categoryId) params.set('categoryId', categoryId);
  if (shopId) params.set('shopId', shopId);

  const [data, categories] = await Promise.all([
    fetchJson<{ items: Product[]; total: number }>(`/products?${params.toString()}`),
    fetchJson<Category[]>('/categories'),
  ]);

  const products = data?.items ?? [];
  const total = data?.total ?? products.length;
  const totalPages = Math.max(1, Math.ceil(total / 24));
  const activeCategory = (categories ?? []).find((category) => category.id === categoryId);

  function withPage(nextPage: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    return `/products?${next.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
          Catalogue
        </p>
        <h1 className="mt-1 text-h1 font-semibold">
          {activeCategory ? activeCategory.name : 'Tous les produits'}
        </h1>
        <p className="mt-2 text-body text-muted">
          {total > 0
            ? `${total} produit${total > 1 ? 's' : ''} publiés par les boutiques de la région.`
            : 'Les produits publiés par les commerçants apparaîtront ici.'}
        </p>
        <div className="mt-5 max-w-2xl">
          <SearchBar
            defaultValue={q}
            size="md"
            placeholder="Rechercher un produit…"
            id="recherche-produits"
          />
        </div>
      </header>

      {(categories ?? []).length > 0 && (
        <nav aria-label="Filtrer par catégorie" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          <Link
            href={q ? `/products?q=${encodeURIComponent(q)}` : '/products'}
            className={
              !categoryId
                ? 'whitespace-nowrap rounded-full bg-teal px-4 py-2 text-small font-medium text-white'
                : 'whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-small font-medium text-ink hover:border-teal hover:text-teal'
            }
          >
            Tout
          </Link>
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={
                categoryId === category.id
                  ? 'whitespace-nowrap rounded-full bg-teal px-4 py-2 text-small font-medium text-white'
                  : 'whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-small font-medium text-ink hover:border-teal hover:text-teal'
              }
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link href={withPage(currentPage - 1)} className="rounded-md border border-line px-3 py-2 text-small hover:border-teal">
                  ← Précédent
                </Link>
              )}
              <span className="numbers px-2 text-small text-muted">
                Page {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link href={withPage(currentPage + 1)} className="rounded-md border border-line px-3 py-2 text-small hover:border-teal">
                  Suivant →
                </Link>
              )}
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" aria-hidden="true" />}
          title="Aucun produit trouvé"
          description="Essayez un autre mot-clé ou parcourez les catégories disponibles."
          action={
            <Link href="/products" className="rounded-md bg-terracotta px-4 py-2.5 text-small font-semibold text-white hover:bg-terracotta-dark">
              Voir tout le catalogue
            </Link>
          }
        />
      )}
    </div>
  );
}
