'use client';

import { useCart } from '@/components/cart/CartProvider';
import { api, setToken, removeToken, getToken } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?callback=/checkout`;
      return;
    }
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        removeToken();
        window.location.href = `/login?callback=/checkout`;
      });
  }, []);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-8">Vous devez être connecté pour passer une commande.</p>
          <Link href="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande confirmée !</h2>
          <p className="text-gray-600 mb-8">Merci pour votre achat chez Mboro Market.</p>
          <Link href="/orders" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Voir mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des produits avant de passer commande.</p>
          <Link href="/products" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
        options: {},
      }));

      const res = await api.post('/orders', {
        userId: user.id,
        shopId: items[0].product.shopId,
        items: orderItems,
        deliveryAddress: address,
        customerNote: '',
      });

      clear();
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Passer la commande</h2>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Adresse de livraison</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adresse complète</label>
                <Input
                  placeholder="Ex: Rue X, Quartier Y, Mboro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <Input
                  type="tel"
                  placeholder="+221 70 xxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8">Récapitulatif</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{item.quantity}x</span>
                    <span className="font-medium">{item.product.title}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-4 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Commande en cours...' : 'Valider la commande'}
            </Button>
          </form>
        </div>

        <div className="lg:w-1/4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Votre panier ({items.length})</h3>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.product.title}</span>
                  <span className="font-medium">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
