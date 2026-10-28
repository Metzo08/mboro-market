'use client';

import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des produits pour commencer vos achats.</p>
          <Link href="/products" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre panier ({itemCount})</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id + (item.variantId || '')} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div className="h-32 w-32 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-xs">{item.product.shortDescription || 'Produit'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                  <p className="text-gray-600 text-sm">{item.product.shortDescription || ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id, item.variantId)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé de la commande</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold border-t pt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => {
              window.location.href = '/checkout';
            }}>
              Passer la commande →
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2 text-xs text-gray-500 hover:text-red-600"
              onClick={() => clear()}
            >
              Vider le panier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
