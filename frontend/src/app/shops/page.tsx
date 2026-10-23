import type { Metadata } from 'next';
import Link from 'next/link';
import { Store } from 'lucide-react';
import type { Shop } from '@/types';
import { fetchJson } from '@/lib/server';
import { ShopCard } from '@/components/shop/ShopCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/search/SearchBar';

interface ShopsPageProps {
  searchParams: Promise<{ q?: string; type?: string; locality?: string }>;
}

export const metadata: Metadata = {
  title: 'Boutiques et commerçants de Mboro et Thiès',
  description:
    'Annuaire des commerçants, restaurants et artisans de Mboro, Thiès et sa région. Horaires, contacts et catalogue en ligne.',
  alternates: { canonical: '/shops' },
};

const TYPES = [
  { value: '', label: 'Tout' },
  { value: 'RETAIL', label: 'Commerces' },
  { value: 'RESTAURANT', label: 'Restaurants' },
  { value: 'ARTISAN', label: 'Artisans' },
  { value: 'SERVICE', label: 'Services' },
];

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  const { q, type, locality } = await searchParams;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (type) params.set('type', type);
  if (locality) params.set('locality', locality);
  params.set('limit', '60');

  const data = await fetchJson<{ items: Shop[]; total: number }>(`/shops?${params.toString()}`);
  const shops = data?.items ?? [];
  const total = data?.total ?? shops.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">
          Annuaire local
        </p>
        <h1 className="mt-1 text-h1 font-semibold">Boutiques et commerçants</h1>
        <p className="mt-2 max-w-2xl text-body text-muted">
          {total > 0 ? `${total} boutique${total > 1 ? 's' : ''} publient leur catalogue à Mboro, Thiès et alentours.` : 'Les commerçants de votre région, réunis au même endroit.'}
        </p>
        <div className="mt-5 max-w-2xl">
          <SearchBar defaultValue={q} size="md" placeholder="Nom de boutique, produit ou spécialité…" id="recherche-boutiques" />
        </div>
      </header>

      <nav aria-label="Filtrer par activité" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((item) => {
          const href = item.value ? `/shops?type=${item.value}${q ? `&q=${encodeURIComponent(q)}` : ''}` : `/shops${q ? `?q=${encodeURIComponent(q)}` : ''}`;
          const active = (type ?? '') === item.value;
          return (
            <Link
              key={item.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'whitespace-nowrap rounded-full bg-teal px-4 py-2 text-small font-medium text-white'
                  : 'whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-small font-medium text-ink hover:border-teal hover:text-teal'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {q && (
        <p className="mb-4 text-small text-muted">
          Résultats pour « <span className="font-medium text-ink">{q}</span> » —{' '}
          <Link href="/shops" className="text-teal underline underline-offset-2">
            effacer la recherche
          </Link>
        </p>
      )}

      {shops.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Store className="h-6 w-6" aria-hidden="true" />}
          title="Aucune boutique trouvée"
          description="Essayez un autre mot-clé, une autre activité, ou créez votre boutique si vous êtes commerçant."
          action={
            <Link href="/register" className="rounded-md bg-terracotta px-4 py-2.5 text-small font-semibold text-white hover:bg-terracotta-dark">
              Devenir commerçant
            </Link>
          }
        />
      )}
    </div>
  );
}
