'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useCart } from './CartProvider';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  product: Product;
  full?: boolean;
}

export function AddToCartButton({ product, full = true }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const outOfStock =
    product.availability === 'out_of_stock' ||
    (product.trackInventory !== false && product.stock <= 0);

  if (outOfStock) {
    return (
      <Button variant="tertiary" size="sm" className={full ? 'w-full' : ''} disabled>
        Épuisé
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={added ? 'secondary' : 'primary'}
      className={full ? 'w-full' : ''}
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" /> Ajouté
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter
        </>
      )}
    </Button>
  );
}
