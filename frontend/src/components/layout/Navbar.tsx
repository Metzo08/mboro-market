'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { getToken, removeToken } from '@/lib/api';
import Cookies from 'js-cookie';

function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  const token = Cookies.get('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch {
    return null;
  }
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount } = useCart();
  const role = getUserRole();
  const isMerchant = role === 'MERCHANT' || role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isLoggedIn = !!getToken();

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-[#FFFBF5]/95 border-b border-[#E2D6C4] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-[#115E59] flex items-center justify-center text-white font-black text-lg shadow-md border border-[#0D4A46]">
                J
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#115E59]">
                  JëndCiThiès
                </span>
                <span className="text-[10px] font-bold text-[#E8632C] uppercase tracking-wider">
                  by Sen-E-Carte
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className={cn(
                'text-sm font-semibold transition-colors',
                pathname === '/products' ? 'text-[#E8632C] font-bold' : 'text-[#2B2420] hover:text-[#E8632C]',
              )}
            >
              Produits
            </Link>
            <Link
              href="/shops"
              className={cn(
                'text-sm font-semibold transition-colors',
                pathname?.startsWith('/shops') ? 'text-[#E8632C] font-bold' : 'text-[#2B2420] hover:text-[#E8632C]',
              )}
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              className={cn(
                'flex items-center gap-2 text-sm font-semibold transition-colors',
                pathname === '/cart' ? 'text-[#E8632C] font-bold' : 'text-[#2B2420] hover:text-[#E8632C]',
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              Panier
              {itemCount > 0 && (
                <span className="ml-1 min-w-[1.5rem] h-[1.5rem] px-1.5 inline-flex items-center justify-center rounded-full bg-[#E8632C] text-white text-[10px] font-bold shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <>
                {isMerchant ? (
                  <Link
                    href="/mon-commerce"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#115E59] text-white text-sm font-semibold hover:bg-[#0D4A46] transition-colors shadow-sm"
                  >
                    <User className="h-4 w-4" /> Mon commerce
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2D6C4] bg-white text-[#115E59] text-sm font-semibold hover:bg-[#F5EDE1] transition-colors"
                  >
                    Mes commandes
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl border border-[#E2D6C4] bg-white text-[#2B2420] text-sm font-semibold hover:bg-[#F5EDE1] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="jt-btn-primary px-5 py-2.5 text-sm font-bold"
                >
                  Devenir commerçant
                </Link>
              </>
            )}
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
        <div className="md:hidden border-b bg-white/95 backdrop-blur">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              Produits
            </Link>
            <Link
              href="/shops"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-xl text-base font-medium transition-colors',
                itemCount > 0 ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              Panier {itemCount > 0 && <span className="ml-2 text-xs font-bold text-green-600">{itemCount}</span>}
            </Link>
            <hr className="border-green-50 my-3" />
            {isLoggedIn ? (
              <>
                {isMerchant ? (
                  <Link
                    href="/mon-commerce"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    Mon commerce
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    Mes commandes
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 text-center transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-3 rounded-xl text-base font-medium text-white bg-amber-500 hover:bg-amber-600 text-center transition-colors"
                >
                  Devenir commerçant
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
