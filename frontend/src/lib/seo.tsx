/**
 * Génération de données structurées Schema.org (Cahier des charges §11.2).
 * Règle : n'inclure QUE des données réelles et valides — jamais de valeurs inventées.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jendcithies.sn';

/** LocalBusiness pour une boutique (exigence CDC : Restaurant / Store selon le type). */
export function shopJsonLd(shop: {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  shortDescription?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  publicAddress?: string;
  openingHours?: Record<string, { open?: string; close?: string }>;
  verificationStatus?: string;
}): Record<string, unknown> {
  // CDC §8.3 : Restaurant pour les restaurateurs, LocalBusiness pour les autres
  const shopType: Record<string, string> = {
    RESTAURANT: 'Restaurant',
    SERVICE: 'LocalBusiness',
    ARTISAN: 'HomeAndConstructionBusiness',
    RETAIL: 'Store',
  };
  const atType = shopType[shop.type] || 'LocalBusiness';

  const url = `${SITE_URL}/shops/${shop.slug}`;

  // Horaires d'ouverture réels uniquement (aucune valeur par défaut inventée)
  const openingHoursSpecification = shop.openingHours
    ? Object.entries(shop.openingHours)
        .filter(([, h]) => h?.open && h?.close)
        .map(([day, h]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: h.open,
          closes: h.close,
        }))
    : undefined;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': atType,
    '@id': `${SITE_URL}/shops/${shop.id}`,
    name: shop.name,
    description: shop.shortDescription || shop.description || undefined,
    url,
    telephone: shop.phone || undefined,
    address: shop.publicAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: shop.publicAddress,
          addressLocality: 'Mboro',
          addressRegion: 'Thiès',
          addressCountry: 'SN',
        }
      : undefined,
  };

  if (openingHoursSpecification?.length) {
    data.openingHoursSpecification = openingHoursSpecification;
  }

  if (shop.website) data.sameAs = [shop.website];

  // Badge "vérifiée" uniquement si le statut réel l'autorise (TRUST-001)
  if (shop.verificationStatus === 'verified') {
    data.additionalProperty = {
      '@type': 'PropertyValue',
      name: 'Boutique vérifiée par Sen-E-Carte',
      value: true,
    };
  }

  // Supprime les clés undefined pour un JSON propre
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
}

/** Product + Offer pour une fiche produit (CDC §11.2). */
export function productJsonLd(
  product: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    price: number | string;
    promotionalPrice?: number | string;
    stock: number;
    customFields?: Record<string, unknown>;
  },
  shop?: {
    id: string;
    name: string;
    slug: string;
  },
): Record<string, unknown> {
  const price = Math.round(Number(product.promotionalPrice ?? product.price) || 0);
  if (!price || price <= 0) return {}; // Pas de prix fiable → pas de données structurées (CDC: données réelles uniquement)

  const url = `${SITE_URL}/products/${product.slug}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${product.id}`,
    name: product.title,
    description: product.shortDescription || product.description || undefined,
    url,
    sku: (product.customFields?.sku as string) || undefined,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'XOF',
      availability:
        Number(product.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      // CDC §10 : le vendeur est la boutique réelle, jamais la plateforme
      seller: shop
        ? {
            '@type': 'Organization',
            name: shop.name,
            url: `${SITE_URL}/shops/${shop.slug}`,
          }
        : undefined,
    },
  };

  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
}

/** Composant injectable pour rendre un script JSON-LD côté serveur. */
export function JsonLdScript({ data }: { data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
