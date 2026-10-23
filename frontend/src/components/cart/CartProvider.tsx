'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Product } from '@/types';

export interface CartItem {
  product: Product;
  variantId?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
  shopId?: string;
  unitPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setHydrated(true);
  }, []);

  // On n'écrit qu'après la lecture initiale : évite d'écraser le panier
  // sauvegardé par un tableau vide au premier rendu.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity: number = 1, variantId?: string) => {
    setItems((prev) => {
      // MVP : commande mono-boutique. On demande confirmation avant de vider
      // un panier appartenant à une autre boutique (§1.3 / ORD-001).
      const otherShop = prev.find((i) => i.product.shopId !== product.shopId);
      if (otherShop && typeof window !== 'undefined') {
        const confirmed = window.confirm(
          'Votre panier contient des articles d’une autre boutique. Voulez-vous le remplacer ?',
        );
        if (!confirmed) return prev;
        prev = [];
      }

      const existing = prev.find(
        (i) => i.product.id === product.id && i.variantId === variantId,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.variantId === variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, variantId }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => i.product.id !== productId || i.variantId !== variantId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const unitPrice = (item: CartItem) =>
    Number(
      item.product.promotionalPrice !== null &&
        item.product.promotionalPrice !== undefined &&
        Number(item.product.promotionalPrice) < Number(item.product.price)
        ? item.product.promotionalPrice
        : item.product.price,
    );

  const total = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const shopId = items[0]?.product.shopId;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, total, itemCount, shopId, unitPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
