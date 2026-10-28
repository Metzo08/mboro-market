'use client';

import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils';
import { productImage } from '@/lib/images';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-[#FFFBF5]">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl border border-[#E2D6C4] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EDE1] text-[#E8632C] flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#2B2420] mb-2">Votre panier est vide</h1>
          <p className="text-sm text-[#6B625A] mb-8">
            Découvrez les produits frais et artisans de Mboro et Thiès pour commencer vos achats.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 jt-btn-primary px-8 py-3.5 text-sm font-bold shadow-md"
          >
            <span>Voir les produits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFBF5]">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2420] mb-6 flex items-center gap-2">
            <span>Votre panier</span>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#115E59] text-white">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
          </h1>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id + (item.variantId || '')}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2D6C4] shadow-xs"
              >
                {/* Image réelle du produit */}
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-[#F5EDE1] flex-shrink-0 border border-[#E2D6C4]">
                  <Image
                    src={productImage(item.product)}
                    alt={item.product.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="hover:underline">
                    <h2 className="font-bold text-base text-[#2B2420] truncate">
                      {item.product.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#6B625A] line-clamp-1 mt-0.5">
                    {item.product.shortDescription || 'Produit local'}
                  </p>
                  <p className="text-sm font-bold text-[#E8632C] mt-1 sm:hidden">
                    {formatPrice(Number(item.product.price))}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Sélecteur quantité */}
                  <div className="flex items-center rounded-xl border border-[#E2D6C4] bg-[#FFFBF5] overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
                      className="w-8 h-8 flex items-center justify-center text-[#2B2420] hover:bg-[#F5EDE1] font-bold text-sm transition-colors"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#2B2420]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}
                      className="w-8 h-8 flex items-center justify-center text-[#2B2420] hover:bg-[#F5EDE1] font-bold text-sm transition-colors"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>

                  {/* Prix total de ligne */}
                  <p suppressHydrationWarning className="font-black text-base text-[#2B2420] min-w-[90px] text-right">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeItem(item.product.id, item.variantId)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer l'article"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif commande */}
        <div className="lg:w-1/4">
          <div className="bg-white p-6 rounded-3xl border border-[#E2D6C4] shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-[#2B2420] mb-4">Résumé</h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#6B625A]">
                <span>Sous-total</span>
                <span suppressHydrationWarning className="font-bold text-[#2B2420]">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between text-[#6B625A]">
                <span>Livraison</span>
                <span className="text-[#115E59] font-semibold text-xs">
                  Retrait gratuit / À domicile
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#2B2420] border-t border-[#E2D6C4] pt-4">
                <span>Total</span>
                <span suppressHydrationWarning className="text-[#E8632C] text-lg font-black">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 text-center jt-btn-primary rounded-xl text-sm font-bold shadow-md transition-all mb-2"
            >
              Passer la commande →
            </Link>

            <button
              onClick={() => clear()}
              className="w-full py-2 text-center text-xs font-semibold text-[#6B625A] hover:text-red-600 transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
