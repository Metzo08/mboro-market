import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products: Product[] = await getProducts();

  return (
    <div className="space-y-12">
      <section className="py-12 bg-green-50 rounded-xl border border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Mboro Market
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre place de marché locale à Mboro et Thiès. Découvrez les produits frais, les artisans et les commerçants de votre région.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Voir les produits
            </Link>
            <Link href="/shops" className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
              Voir les boutiques
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Produits populaires</h2>
            <Link href="/products" className="text-sm font-medium text-green-600 hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{product.shortDescription || 'Image produit'}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/products/${product.slug}`} className="block mb-2">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-green-600 font-bold">{formatPrice(Number(product.price))}</p>
                      {product.promotionalPrice && (
                        <p className="text-sm text-gray-500 line-through">{formatPrice(Number(product.promotionalPrice))}</p>
                      )}
                    </Link>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucun produit disponible pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Nos boutiques partenaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Boutique partenaire {i}</h3>
                <p className="text-sm text-gray-600 mb-4">Produits locaux et frais de Thiès</p>
                <Link href="/shops" className="text-sm font-medium text-green-600 hover:underline">
                  Voir la boutique →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
