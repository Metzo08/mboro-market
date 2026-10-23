import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, PackageCheck, ShieldCheck, Store, Truck } from 'lucide-react';
import type { Product } from '@/types';
import { fetchJson } from '@/lib/server';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const AVAILABILITY: Record<string, { label: string; schema: string; tone: 'success' | 'gold' | 'danger' | 'neutral' }> = {
  in_stock: { label: 'En stock', schema: 'https://schema.org/InStock', tone: 'success' },
  made_to_order: { label: 'Sur commande', schema: 'https://schema.org/PreOrder', tone: 'gold' },
  preorder: { label: 'Précommande', schema: 'https://schema.org/PreOrder', tone: 'gold' },
  out_of_stock: { label: 'Épuisé', schema: 'https://schema.org/OutOfStock', tone: 'danger' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchJson<Product>(`/products/slug/${slug}`);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.shortDescription || product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchJson<Product>(`/products/slug/${slug}`);
  if (!product) notFound();

  const hasPromo =
    product.promotionalPrice !== null &&
    product.promotionalPrice !== undefined &&
    Number(product.promotionalPrice) < Number(product.price);
  const displayPrice = hasPromo ? Number(product.promotionalPrice) : Number(product.price);
  const availability = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock;
  const imageUrl = product.media?.[0]?.url || product.image;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.shortDescription,
    sku: product.id,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      price: displayPrice,
      priceCurrency: 'XOF',
      availability: availability.schema,
      seller: product.shop ? { '@type': 'Organization', name: product.shop.name } : undefined,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Fil d’Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-caption text-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link href="/products" className="hover:text-ink">Produits</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-line bg-sand">
          <div className="relative aspect-square w-full">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="motif-bogolan flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-[#ecdcc6]">
                <span className="font-display text-7xl font-semibold text-terracotta/50">
                  {product.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {hasPromo && (
              <div className="absolute left-3 top-3">
                <Badge tone="terracotta">Promotion</Badge>
              </div>
            )}
          </div>
          {!imageUrl && (
            <p className="border-t border-line px-3 py-2 text-caption text-muted">
              Photo non fournie par le commerçant.
            </p>
          )}
        </div>

        <div>
          <h1 className="text-h1 font-semibold leading-tight">{product.title}</h1>
          {product.shop && (
            <Link
              href={`/shops/${product.shop.slug}`}
              className="mt-2 inline-flex items-center gap-1.5 text-small font-medium text-teal hover:text-terracotta-dark"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              {product.shop.name}
              {product.shop.verificationStatus === 'verified' && (
                <ShieldCheck className="h-3.5 w-3.5 text-teal" aria-label="Boutique vérifiée" />
              )}
            </Link>
          )}

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="numbers font-display text-3xl font-semibold text-terracotta-dark">
              {formatPrice(displayPrice)}
            </span>
            {hasPromo && (
              <span className="numbers text-small text-muted line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={availability.tone} icon={<PackageCheck className="h-3 w-3" aria-hidden="true" />}>
              {availability.label}
            </Badge>
            {product.trackInventory !== false && (
              <Badge tone="outline">
                {product.stock > 0 ? `${product.stock} disponible${product.stock > 1 ? 's' : ''}` : 'Stock épuisé'}
              </Badge>
            )}
            {product.leadTime && (
              <Badge tone="gold" icon={<Clock className="h-3 w-3" aria-hidden="true" />}>
                {product.leadTime}
              </Badge>
            )}
          </div>

          {(product.shortDescription || product.description) && (
            <p className="mt-4 text-body text-muted">{product.description || product.shortDescription}</p>
          )}

          <div className="mt-6 max-w-xs">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-6 space-y-2 rounded-lg border border-line bg-white p-4 text-small text-muted">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
              Livraison et retrait : les frais exacts sont confirmés à l’étape livraison, selon la zone
              desservie par la boutique.
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              Paiement à la livraison, Wave ou Orange Money. Aucun paiement n’est validé sans
              confirmation du prestataire.
            </p>
          </div>
        </div>
      </div>

      <FloatingCartBar />
    </div>
  );
}
