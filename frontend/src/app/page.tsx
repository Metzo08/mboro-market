import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Hammer,
  MapPin,
  ShoppingBasket,
  Store,
  Utensils,
  Wrench,
} from 'lucide-react';
import type { Category, Product, Shop } from '@/types';
import { fetchJson } from '@/lib/server';
import { ShopCard } from '@/components/shop/ShopCard';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonVariants } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export const revalidate = 60;

const QUICK_LINKS = [
  { label: 'Restaurants', href: '/shops?type=RESTAURANT', icon: Utensils },
  { label: 'Artisans', href: '/shops?type=ARTISAN', icon: Hammer },
  { label: 'Acheter', href: '/products', icon: ShoppingBasket },
  { label: 'Services', href: '/shops?type=SERVICE', icon: Wrench },
];

interface PublicConfig {
  pricing?: { activationFee?: number; monthlyFee?: number };
  locations?: Array<{ name: string }>;
}

export default async function HomePage() {
  const [shopsData, productsData, categoriesData, config] = await Promise.all([
    fetchJson<{ items: Shop[]; total: number }>('/shops?limit=6'),
    fetchJson<{ items: Product[]; total: number }>('/products?limit=8'),
    fetchJson<Category[]>('/categories'),
    fetchJson<PublicConfig>('/config/public'),
  ]);

  const shops = shopsData?.items ?? [];
  const products = productsData?.items ?? [];
  const shopsTotal = shopsData?.total ?? shops.length;
  const productsTotal = productsData?.total ?? products.length;
  const categories = (categoriesData ?? []).slice(0, 8);
  const promos = products.filter(
    (product) =>
      product.promotionalPrice !== null &&
      product.promotionalPrice !== undefined &&
      Number(product.promotionalPrice) < Number(product.price),
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JëndCiThiès',
    legalName: 'Sen-E-Carte',
    url: siteUrl,
    description:
      'Plateforme de commerce local pour les commerçants, restaurants et artisans de Mboro, Thiès et sa région.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Thiès',
      addressRegion: 'Thiès',
      addressCountry: 'SN',
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JëndCiThiès',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/recherche?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="space-y-12 pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-sand/80 via-canvas to-canvas">
        <div className="halo -left-24 top-0 h-72 w-72 bg-terracotta/25" />
        <div className="halo right-0 top-10 h-80 w-80 bg-teal/20" />
        <div className="halo bottom-0 left-1/3 h-64 w-64 bg-gold/25" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-16">
          <div className="reveal text-center lg:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1 text-caption font-semibold uppercase tracking-[0.12em] text-teal shadow-card">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Mboro · Thiès · Sénégal
            </p>
            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Les commerces et services de Thiès,
              <span className="block text-terracotta-dark">à portée de main.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-body text-muted lg:mx-0">
              Trouvez ce qui est vendu près de chez vous, commandez en quelques clics et suivez
              votre commande sans appeler. Paiement à la livraison ou au retrait en boutique.
            </p>

            <div className="mx-auto mt-7 max-w-xl lg:mx-0">
              <SearchBar />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-3.5 py-2 text-small font-medium text-ink shadow-card transition-all hover:-translate-y-0.5 hover:border-terracotta hover:text-terracotta-dark"
                  >
                    <Icon className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <dl className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start">
              <div>
                <dt className="text-caption uppercase tracking-wide text-muted">Boutiques en ligne</dt>
                <dd className="numbers font-display text-2xl font-semibold text-ink">{shopsTotal}</dd>
              </div>
              <div className="border-l border-line pl-6">
                <dt className="text-caption uppercase tracking-wide text-muted">Produits publiés</dt>
                <dd className="numbers font-display text-2xl font-semibold text-ink">{productsTotal}</dd>
              </div>
              <div className="border-l border-line pl-6">
                <dt className="text-caption uppercase tracking-wide text-muted">Paiement</dt>
                <dd className="text-2xl font-semibold text-ink">à la livraison</dd>
              </div>
            </dl>
          </div>

          <div className="reveal reveal-delay-2 hidden lg:block">
            <HeroShowcase shop={shops[0]} product={promos[0] ?? products[0]} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {categories.length > 0 && (
          <section aria-labelledby="categories-titre">
            <h2 id="categories-titre" className="mb-4 font-display text-h3 font-semibold">
              Catégories populaires
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="flex min-w-[6.5rem] flex-col items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-center shadow-card lift hover:border-teal hover:text-teal"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand font-display text-lg font-semibold text-terracotta-dark">
                    {category.name.charAt(0)}
                  </span>
                  <span className="text-caption font-medium leading-tight text-ink">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="boutiques-titre">
          <div id="boutiques-titre">
            <SectionHeading title="Près de chez vous" eyebrow="Boutiques & services" href="/shops" />
          </div>
          {shops.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shops.slice(0, 6).map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Store className="h-6 w-6" aria-hidden="true" />}
              title="Aucune boutique publiée pour le moment"
              description="Les premières boutiques de Mboro et Thiès apparaîtront ici dès leur mise en ligne."
              action={
                <Link href="/register" className={buttonVariants({ variant: 'secondary' })}>
                  Créer ma boutique
                </Link>
              }
            />
          )}
        </section>

        {promos.length > 0 && (
          <section aria-labelledby="offres-titre">
            <div id="offres-titre">
              <SectionHeading title="Offres du moment" eyebrow="Promotions" href="/products" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {promos.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="produits-titre">
          <div id="produits-titre">
            <SectionHeading title="À découvrir aujourd’hui" eyebrow="Catalogue" href="/products" />
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBasket className="h-6 w-6" aria-hidden="true" />}
              title="Le catalogue arrive bientôt"
              description="Aucun produit n’est publié pour l’instant. Les commerçants préparent leurs fiches."
            />
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-teal text-white">
          <div className="motif-bogolan grid gap-6 px-6 py-8 md:grid-cols-[1.4fr_1fr] md:items-center md:px-10">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.14em] text-gold">
                Vous êtes commerçant, restaurateur ou artisan ?
              </p>
              <h2 className="mt-2 font-display text-h2 font-semibold text-white">
                Créez votre boutique en 10 minutes, soyez visible sur Google.
              </h2>
              <p className="mt-2 max-w-xl text-small text-white/80">
                Une vitrine professionnelle, vos commandes centralisées et un assistant en français
                et en wolof. Sans compétences informatiques.
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-5 backdrop-blur">
              <p className="text-small text-white/80">À partir de</p>
              <p className="numbers mt-1 font-display text-3xl font-semibold text-white">
                {formatPrice(config?.pricing?.monthlyFee ?? 2500)}
                <span className="text-base font-normal text-white/70"> / mois</span>
              </p>
              <p className="mt-1 text-caption text-white/70">
                + {formatPrice(config?.pricing?.activationFee ?? 5000)} d’activation unique par boutique
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-terracotta px-4 py-3 text-small font-semibold text-white transition-colors hover:bg-terracotta-dark"
              >
                Ouvrir ma boutique
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-1.5 pb-4 text-caption text-muted">
          <Flame className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
          Mises en avant sponsorisées toujours signalées comme telles.
          <Link href="/shops" className="inline-flex items-center gap-0.5 font-medium text-teal">
            Explorer <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  );
}
