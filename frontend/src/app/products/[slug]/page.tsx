import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { productImage } from '@/lib/images';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products?slug=${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.items || [];
    return items[0] || null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((p: Product) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<{ title: string; description?: string }> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.title,
    description: product.seoDescription || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product: Product | null = await getProduct(slug);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
          <p className="text-gray-600 mb-6">Le produit demandé n'existe pas.</p>
          <a href="/products" className="text-green-600 hover:underline font-medium">
            Retour aux produits
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description || product.shortDescription,
            image: product.image || 'http://localhost:3001/favicon.ico',
            offers: {
              '@type': 'Offer',
              price: Number(product.price),
              priceCurrency: 'XOF',
              availability: product.availability === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: 'JëndCiThiès',
              },
            },
          }),
        }}
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-80 lg:h-[420px] bg-gray-100 rounded-xl overflow-hidden relative">
          <Image
            src={productImage(product)}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description || product.shortDescription}</p>
          <div className="mb-6">
            <span className="text-2xl font-bold text-green-600">{formatPrice(Number(product.price))}</span>
            {product.promotionalPrice && (
              <span className="text-lg text-gray-500 line-through ml-2">{formatPrice(Number(product.promotionalPrice))}</span>
            )}
          </div>
          <div className="flex gap-4">
            <AddToCartButton product={product} />
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
              Acheter maintenant
            </button>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails</h3>
            <p className="text-gray-600">
              Disponibilité : {product.availability} | Stock : {product.stock}
            </p>
            {product.leadTime && (
              <p className="text-gray-600 mt-2">Délai : {product.leadTime}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
