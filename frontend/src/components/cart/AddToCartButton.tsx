'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { Product } from '@/types';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  showIcon?: boolean;
}

export function AddToCartButton({ product, className = '', showIcon = true }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-sm ${
        justAdded
          ? 'bg-[#2E8B57] text-white shadow-md'
          : 'jt-btn-primary'
      } ${className}`}
      aria-live="polite"
    >
      {justAdded ? (
        <>
          <Check className="w-4 h-4 animate-bounce" />
          <span>Ajouté au panier !</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="w-4 h-4" />}
          <span>Ajouter au panier</span>
        </>
      )}
    </button>
  );
}
