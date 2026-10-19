import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/products?slug=${slug}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.items || [];
    return items[0] || null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return [];
}

export const metadata = async ({ params }: ProductDetailPageProps): Promise<{ title: string; description?: string }> => {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.title,
    description: product.seoDescription || product.shortDescription,
  };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product: Product | null = await getProduct(params.slug);

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
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-lg">{product.shortDescription || 'Image du produit'}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description || product.shortDescription}</p>
          <div className="mb-6">
            <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
            {product.promotionalPrice && (
              <span className="text-lg text-gray-500 line-through ml-2">{formatPrice(product.promotionalPrice)}</span>
            )}
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
              <span>Ajouter au panier</span>
            </button>
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
