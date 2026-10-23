import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';
import type { Shop } from '@/types';
import { fetchJson } from '@/lib/server';
import {
  formatOpeningHours,
  paymentLabels,
  shopInitial,
  shopTypeLabel,
  structuredOpeningHours,
} from '@/lib/shop';
import { Badge } from '@/components/ui/Badge';
import { OpenStatus } from '@/components/shop/OpenStatus';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';
import { ShareButton } from '@/components/shop/ShareButton';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: string | number;
  estimatedMin?: number;
  estimatedMax?: number;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await fetchJson<Shop>(`/shops/slug/${slug}`);
  if (!shop) return { title: 'Boutique introuvable' };
  return {
    title: shop.seoTitle || `${shop.name} — ${shopTypeLabel(shop.type)} à ${shop.publicAddress ?? 'Thiès'}`,
    description: shop.seoDescription || shop.shortDescription || shop.description,
    alternates: { canonical: `/shops/${shop.slug}` },
    openGraph: {
      title: shop.name,
      description: shop.shortDescription || shop.description,
      type: 'website',
    },
  };
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params;
  const shop = await fetchJson<Shop>(`/shops/slug/${slug}`);
  if (!shop) notFound();

  const zones = (await fetchJson<DeliveryZone[]>(`/delivery/zones/shop/${shop.id}`)) ?? [];
  const products = shop.products ?? [];
  const hours = formatOpeningHours(shop.openingHours);
  const structuredHours = structuredOpeningHours(shop.openingHours);
  const payments = paymentLabels(shop.settings);
  const whatsapp = shop.whatsapp?.replace(/[^0-9]/g, '');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': shop.type === 'RESTAURANT' ? 'Restaurant' : 'LocalBusiness',
    name: shop.name,
    description: shop.description || shop.shortDescription,
    url: `${siteUrl}/shops/${shop.slug}`,
    telephone: shop.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: shop.publicAddress,
      addressLocality: 'Thiès',
      addressCountry: 'SN',
    },
    ...(structuredHours.length
      ? {
          openingHoursSpecification: structuredHours.map((entry) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: entry.dayOfWeek,
            opens: entry.opens,
            closes: entry.closes,
          })),
        }
      : {}),
  };

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Bannière + médaillon */}
      <div className="relative h-44 w-full overflow-hidden bg-teal sm:h-60">
        <div className="motif-bogolan h-full w-full bg-gradient-to-br from-teal via-teal to-teal-light" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Link
            href="/shops"
            className="rounded-full bg-white/95 px-3 py-1.5 text-caption font-semibold text-ink shadow-card"
          >
            ← Toutes les boutiques
          </Link>
        </div>
        <div className="absolute right-4 top-4">
          <ShareButton title={shop.name} />
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-terracotta font-display text-2xl font-semibold text-white shadow-card">
                {shopInitial(shop.name)}
              </div>
              <div>
                <h1 className="text-h1 font-semibold leading-tight text-ink">{shop.name}</h1>
                <p className="mt-1 text-small text-muted">
                  {shopTypeLabel(shop.type)} • {shop.publicAddress ?? 'Localisation non précisée'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shop.verificationStatus === 'verified' && (
                    <Badge tone="teal" icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}>
                      Vérifiée par Sen-E-Carte
                    </Badge>
                  )}
                  <OpenStatus hours={shop.openingHours} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-teal px-3.5 py-2.5 text-small font-semibold text-white hover:bg-teal/90"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> Appeler
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-success px-3.5 py-2.5 text-small font-semibold text-white hover:bg-success/90"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                </a>
              )}
              {shop.publicAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.publicAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2.5 text-small font-semibold text-ink hover:border-teal hover:text-teal"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Itinéraire
                </a>
              )}
            </div>
          </div>

          {shop.shortDescription && <p className="mt-4 text-body text-muted">{shop.shortDescription}</p>}

          <nav aria-label="Sections de la boutique" className="mt-5 flex gap-4 border-t border-line pt-4 text-small font-medium">
            <a href="#catalogue" className="text-terracotta-dark hover:underline">
              Catalogue ({products.length})
            </a>
            <a href="#infos" className="text-muted hover:text-ink">
              Infos pratiques
            </a>
            <a href="#avis" className="text-muted hover:text-ink">
              Avis
            </a>
          </nav>
        </div>

        <section id="catalogue" className="mt-8 scroll-mt-24">
          <h2 className="mb-4 text-h2 font-semibold">Catalogue</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={{ ...product, shop }} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun produit publié"
              description="Cette boutique n’a pas encore publié de catalogue. Contactez-la directement pour connaître ses disponibilités."
            />
          )}
        </section>

        <section id="infos" className="mt-10 grid gap-4 scroll-mt-24 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-h3 font-semibold">
              <Clock className="h-5 w-5 text-terracotta" aria-hidden="true" /> Horaires
            </h2>
            {hours.length > 0 ? (
              <dl className="mt-3 space-y-1.5 text-small">
                {hours.map((entry) => (
                  <div key={entry.day} className="flex justify-between gap-4 border-b border-line/60 pb-1.5 last:border-0">
                    <dt className="text-muted">{entry.day}</dt>
                    <dd className="numbers font-medium text-ink">{entry.text}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-small text-muted">
                Horaires non renseignés. Appelez la boutique pour confirmer.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-h3 font-semibold">
                <MapPin className="h-5 w-5 text-terracotta" aria-hidden="true" /> Adresse
              </h2>
              <p className="mt-2 text-small text-muted">
                {shop.publicAddress ?? 'Adresse non précisée — contactez la boutique.'}
              </p>
              <p className="mt-1 text-caption text-muted">
                Repères locaux (marché, mosquée, école) plutôt que numéros de rue.
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-h3 font-semibold">
                <Truck className="h-5 w-5 text-terracotta" aria-hidden="true" /> Livraison
              </h2>
              {zones.length > 0 ? (
                <ul className="mt-2 space-y-1.5 text-small text-muted">
                  {zones.map((zone) => (
                    <li key={zone.id} className="flex justify-between gap-4">
                      <span>{zone.name}</span>
                      <span className="numbers font-medium text-ink">
                        {Number(zone.deliveryFee) === 0 ? 'Gratuit' : `${Number(zone.deliveryFee)} FCFA`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-small text-muted">
                  Frais de livraison à confirmer avec la boutique. Retrait possible sur place.
                </p>
              )}
            </div>

            {payments.length > 0 && (
              <div className="rounded-lg border border-line bg-white p-5">
                <h2 className="flex items-center gap-2 text-h3 font-semibold">
                  <Wallet className="h-5 w-5 text-terracotta" aria-hidden="true" /> Paiement
                </h2>
                <p className="mt-2 text-small text-muted">{payments.join(' · ')}</p>
              </div>
            )}
          </div>
        </section>

        <section id="avis" className="mt-10 scroll-mt-24">
          <h2 className="text-h2 font-semibold">Avis</h2>
          <div className="mt-3 rounded-lg border border-dashed border-line bg-sand/40 p-5 text-small text-muted">
            <p className="flex items-center gap-2 font-medium text-ink">
              <BadgeCheck className="h-4 w-4 text-teal" aria-hidden="true" />
              Aucun avis vérifié pour le moment
            </p>
            <p className="mt-1">
              Les avis sont publiés uniquement après une commande réellement effectuée sur
              JëndCiThiès. Aucun avis n’est généré automatiquement.
            </p>
          </div>
        </section>
      </div>

      <FloatingCartBar />
    </div>
  );
}
