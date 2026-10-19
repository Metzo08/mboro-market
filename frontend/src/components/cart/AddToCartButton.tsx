'use client';

import { useCart } from './CartProvider';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, itemCount } = useCart();

  return (
    <button
      onClick={() => addItem(product, 1)}
      className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-1"><path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4z"></path><circle cx="15.5" cy="19" r="1.5"></circle><circle cx="7.5" cy="19" r="1.5"></circle></svg>
      Ajouter au panier
    </button>
  );
}
