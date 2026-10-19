'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount } = useCart();

  return (
    <nav className="fixed w-full z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold text-gray-900">Mboro Market</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/products' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Produits
            </Link>
            <Link
              href="/shops"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/shops' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/cart' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900',
                itemCount > 0 ? 'bg-green-50 px-3 py-2 rounded-lg' : '',
              )}
            >
              Panier <span className="ml-1 text-xs font-bold {itemCount > 0 ? 'text-green-600' : 'text-gray-400'}">{itemCount}</span>
            </Link>
            <Link
              href="/login"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/login' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Connexion
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Produits
            </Link>
            <Link
              href="/shops"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50',
                itemCount > 0 ? 'bg-green-50' : '',
              )}
            >
              Panier {itemCount > 0 && <span className="ml-2 text-xs font-bold text-green-600">{itemCount}</span>}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Connexion
            </Link>
            <button
              className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Devenir commerçant
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
