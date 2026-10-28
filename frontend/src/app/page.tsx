import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { shopImage } from '@/lib/images';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getProducts, getShops } from '@/lib/server-api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JëndCiThiès',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: "JëndCiThiès by Sen-E-Carte : place de marché locale pour Mboro et Thiès, Sénégal",
  telephone: '+221771234567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Marché de Mboro',
    addressLocality: 'Mboro',
    addressRegion: 'Thiès',
    addressCountry: 'SN',
  },
};

type StatItem = { label: string; value: string | number };

const howItWorks = [
  { step: 1, title: 'Cherchez', desc: 'Trouvez des produits frais, artisanat et services près de chez vous à Mboro et Thiès.' },
  { step: 2, title: 'Commandez', desc: 'Ajoutez au panier et payez en toute sécurité avec PayDunya, Wave ou carte bancaire.' },
  { step: 3, title: 'Recevez', desc: 'Livraison rapide à domicile ou retrait en boutique chez votre commerçant local.' },
];

async function HomeData() {
  const [productsRes, shopsRes] = await Promise.allSettled([
    getProducts({ limit: '8' }),
    getShops({ limit: '8' }),
  ]);

  const productsData = productsRes.status === 'fulfilled' ? productsRes.value : { items: [] };
  const shopsData = shopsRes.status === 'fulfilled' ? shopsRes.value : { items: [] };

  const products: Product[] = productsData.items || productsData || [];
  const shops = shopsData.items || shopsData || [];

  return (
    <div className="space-y-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80"
            alt="Marché local à Mboro, Sénégal"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-900/60 to-green-950/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 pt-20 pb-24">
          <Badge variant="accent" className="inline-block mb-4 animate-fade-in-up">
            By Sen-E-Carte — Mboro · Thiès
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-6xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            JëndCiThiès<br />
            <span className="block text-amber-300 mt-2">Jënd ci kaw, jënd ci sa wetu</span>
          </h1>
          <p className="mb-8 max-w-2xl mx-auto text-lg text-green-100/90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Produits frais, artisans et restaurants près de chez vous. Commandez en 3 clics.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <form action="/products" method="get" className="w-full sm:w-96 flex gap-2">
              <input name="q" placeholder="Tapez : ceeb, mangues, yapp, thieb, soble…" className="flex-1 rounded-xl border-0 bg-white/90 dark:bg-gray-800 px-5 py-3.5 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-green-950 outline-none transition-all" />
              <Button variant="accent" className="shrink-0 py-3.5 px-6 text-lg">Chercher</Button>
            </form>
            <Link href="/shops" className="jt-btn-primary px-6 py-3.5 text-lg shrink-0 rounded-xl hover:bg-green-800 transition-colors flex items-center gap-2">
              Voir les boutiques <span className="text-green-200">→</span>
            </Link>
            <a href="/register" className="jt-btn-secondary px-6 py-3.5 text-lg shrink-0 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2">
              Ouvrir ma boutique →
            </a>
          </div>

          {/* Raccourcis de recherche Wolof/Français */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-green-100/80 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span className="font-semibold text-amber-300">🇸🇳 Essais rapides en Wolof :</span>
            {[
              { label: 'ceeb (riz)', q: 'ceeb' },
              { label: 'yapp (viande)', q: 'yapp' },
              { label: 'soble (oignon)', q: 'soble' },
              { label: 'kaani (piment)', q: 'kaani' },
              { label: 'dibi (grillade)', q: 'dibi' },
            ].map((chip) => (
              <Link
                key={chip.q}
                href={`/products?q=${chip.q}`}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors border border-white/20"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bannière d'innovations locales (WhatsApp, Adressage sans rue, Wave) */}
        <div className="relative z-10 border-t border-white/10 bg-black/25 backdrop-blur-md py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">💬</span>
                <span className="text-xs sm:text-sm font-medium">Commande sur WhatsApp</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📍</span>
                <span className="text-xs sm:text-sm font-medium">Livraison par repères locaux</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📱</span>
                <span className="text-xs sm:text-sm font-medium">Wave, PayDunya & Cash</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🖨️</span>
                <span className="text-xs sm:text-sm font-medium">Affiches QR Code de comptoir</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-white tracking-tight">Catégories populaires</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Parcourez par type de produit</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Aliments', href: '/products?category=aliments', emoji: '🍎' },
              { name: 'Artisanat', href: '/products?category=artisanat', emoji: '🎨' },
              { name: 'Restaurant', href: '/products?category=restaurant', emoji: '🍽️' },
              { name: 'Fruits', href: '/products?category=fruits', emoji: '🥭' },
              { name: 'Légumes', href: '/products?category=legumes', emoji: '🥬' },
              { name: 'Services', href: '/products?category=services', emoji: '🧺' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border bg-white dark:bg-gray-800 p-4 text-center shadow-sm transition-all hover:scale-105 hover:shadow-md border-gray-200 dark:border-gray-700"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-green-900 dark:text-white tracking-tight">Boutiques partenaires</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Découvrez les commerçants de Mboro et Thiès</p>
            </div>
            <Link href="/shops" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-600 transition-colors">
              Voir toutes <span className="text-green-500 dark:text-green-400">→</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <div className="scrolling-container scrollbar-hidden flex items-center gap-6 flex-nowrap" style={{ animation: 'scrollShops 30s linear infinite' }}>
              {shops.length > 0 ? (
                shops.map((s: any, i: number) => (
                  <div key={i} className="min-w-48 flex-shrink-0">
                    <Link href={`/shops/${s.slug}`} className="group block overflow-hidden rounded-2xl border border-green-50 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm jt-card-hover">
                      <div className="relative h-40 overflow-hidden bg-green-50 dark:bg-gray-700">
                        <Image
                          src={shopImage(s)}
                          alt={s.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute left-3 top-3 z-20" variant={s.status === 'ACTIVE' ? 'success' : 'outline'}>
                          {s.status === 'ACTIVE' ? 'Ouvert' : s.status}
                        </Badge>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity duration-300" />
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 font-bold text-sm">
                            {(s.name || 'J')[0].toUpperCase()}
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{s.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{s.shortDescription || 'Commerçant local à Thiès'}</p>
                        <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {s.status === 'ACTIVE' ? 'Ouvert maintenant' : 'Fermé'}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-green-200 dark:border-gray-700 bg-green-50 dark:bg-gray-800 p-16 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Aucune boutique pour le moment.</p>
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes scrollShops {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </section>

      <section className="jt-sand-bg dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-green-900 dark:text-white tracking-tight">Produits populaires</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Les meilleures offres de nos commerçants</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-600 transition-colors">
              Voir tous les produits <span className="text-green-500 dark:text-green-400">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} theme="light" />)
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-amber-200 dark:border-gray-700 bg-amber-50 dark:bg-gray-800 p-16 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucun produit disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-900 dark:text-white tracking-tight">Comment ça marche</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Commandez en toute simplicité chez vos commerçants locaux</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="p-8 rounded-2xl border border-green-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-center jt-card-hover group">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 group-hover:bg-green-700 dark:group-hover:bg-green-800 group-hover:text-white dark:group-hover:text-white transition-colors">
                  <span className="text-2xl font-bold">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-900 dark:text-white tracking-tight">Ce que disent nos commerçants</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Restez informé des dernières actualités</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.length > 0 ? (
              shops.slice(0, 3).map((s: any) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 jt-card-hover">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                      {(s.name || 'J')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "{s.shortDescription || 'Boutique locale active sur JëndCiThiès.'}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Aucun témoignage disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-900/10 dark:bg-amber-950/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="lg:w-1/2">
                <h2 className="text-2xl font-bold text-green-900 dark:text-white leading-tight mb-4">Inscrivez-vous</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">Recevez les nouveautés, offres spéciales et actualités de JëndCiThiès directement dans votre boîte mail.</p>
                <form
                  action="/subscribe"
                  method="POST"
                  className="flex gap-3 w-full"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    required
                    className="flex-1 rounded-lg border border-gray-300 dark:bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-gray-100 dark:placeholder-text-gray-400 transition-colors"
                  />
                  <Button type="submit" variant="accent" className="px-6 py-3 text-lg">
                    S'inscrire
                  </Button>
                </form>
              </div>
              <div className="lg:w-1/2 flex items-center justify-center pt-6 lg:pt-0">
                <div className="h-40 w-40 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shadow-lg">
                  <div className="h-36 w-36 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center border-4 border-white dark:border-gray-800">
                    <svg className="h-16 w-16 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const pageClass = (theme: 'light' | 'dark') =>
  `min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`;

export default async function HomePage() {
  return (
    <div className={pageClass('light')}>
      <HomeData />
    </div>
  );
}
