'use client';

import { useCart } from '@/components/cart/CartProvider';
import { api, removeToken, getToken } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  SenegalAddressPicker,
  SenegalAddressValue,
} from '@/components/checkout/SenegalAddressPicker';
import { buildWhatsAppOrderMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { MessageCircle, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);

  // Mode de livraison
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  // Adressage sénégalais contextuel
  const [address, setAddress] = useState<SenegalAddressValue>({
    commune: 'Mboro',
    quarter: 'Centre-Ville / Marché',
    landmark: 'Près du Marché Central',
    phone: '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'paydunya' | 'cod' | 'whatsapp'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = `/login?callback=/checkout`;
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        const u = res.data.user || res.data;
        setUser(u);
        if (u.phone) {
          setAddress((prev) => ({ ...prev, phone: prev.phone || u.phone }));
        }
      })
      .catch(() => {
        removeToken();
        window.location.href = `/login?callback=/checkout`;
      });
  }, []);

  // Charger les informations de la boutique (notamment le numéro WhatsApp)
  useEffect(() => {
    if (items.length > 0 && items[0].product?.shopId) {
      api.get(`/shops/${items[0].product.shopId}`)
        .then((res) => setShop(res.data))
        .catch(() => {});
    }
  }, [items]);

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

  if (success && createdOrder) {
    const shopWhatsapp = shop?.whatsapp || shop?.phone || '+221771234567';
    const waMessage = buildWhatsAppOrderMessage({
      shopName: shop?.name || 'Commerçant',
      items,
      total,
      deliveryMethod: deliveryMode,
      address,
      customerName: user.name || user.email || 'Client',
      customerPhone: address.phone || user.phone,
      orderNumber: createdOrder.orderNumber,
    });
    const waUrl = buildWhatsAppLink(shopWhatsapp, waMessage);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande enregistrée !</h2>
          <p className="text-sm text-gray-500 mb-1">
            Référence : <span className="font-mono font-bold text-gray-800">{createdOrder.orderNumber}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Montant total : <strong className="text-gray-900">{formatPrice(createdOrder.total || total)}</strong>
          </p>

          {/* Bannière WhatsApp en avant */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-5 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-950 text-base mb-1">
                  Finalisez en direct avec le commerçant sur WhatsApp
                </h3>
                <p className="text-xs text-emerald-800 mb-3">
                  Un message préformaté contenant votre commande, votre adresse et vos repères a été préparé pour <strong>{shop?.name || 'la boutique'}</strong>.
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Envoyer ma commande sur WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200">
              Voir mes commandes
            </Link>
            <Link href="/products" className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              Continuer mes achats
            </Link>
          </div>
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

  if (paymentUrl) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg border border-gray-200 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiement</h2>
          <p className="text-gray-600 mb-6">Montant à payer : {formatPrice(total)}</p>
          <div className="space-y-4">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Payer avec Wave / PayDunya
            </a>
            <div className="text-xs text-gray-500 text-center">
              Vous serez redirigé vers la passerelle sécurisée pour finaliser.
            </div>
          </div>
          <Button onClick={() => setPaymentUrl(null)} variant="outline" className="w-full mt-4">
            Annuler et revenir à la commande
          </Button>
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

      // Construction de l'adresse sénégalaise complète
      const formattedAddress = deliveryMode === 'pickup'
        ? { mode: 'PICKUP', shopId: items[0].product.shopId, phone: address.phone }
        : {
            mode: 'DELIVERY',
            commune: address.commune,
            quarter: address.quarter,
            landmark: address.landmark,
            phone: address.phone,
            instructions: address.instructions,
            fullText: `${address.commune}, ${address.quarter} — Repère: ${address.landmark}`,
          };

      const orderRes = await api.post('/orders', {
        shopId: items[0].product.shopId,
        items: orderItems,
        deliveryAddress: formattedAddress,
        customerNote: address.instructions || '',
        idempotencyKey: `CK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        paymentMethod:
          paymentMethod === 'whatsapp' || paymentMethod === 'cod'
            ? 'CASH_ON_DELIVERY'
            : deliveryMode === 'pickup'
            ? 'PICKUP'
            : 'ONLINE',
      });

      setCreatedOrder(orderRes.data);

      // Si le client a choisi le paiement en ligne direct
      if (paymentMethod === 'wave' || paymentMethod === 'paydunya') {
        const payRes = await api.post('/payments/initialize', {
          orderId: orderRes.data.id,
          provider: paymentMethod === 'wave' ? 'wave' : 'paydunya',
          paymentMethod: 'ONLINE',
          phone: address.phone,
        });

        const url = payRes.data.checkoutUrl || payRes.data.checkout_url || null;
        if (url) {
          setPaymentUrl(url);
          return;
        }
      }

      // Mode WhatsApp ou Cash : commande validée directement
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-700" />
            <span>Finaliser votre commande</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
            {/* 1. Mode de livraison */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">1. Mode de réception</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('delivery')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    deliveryMode === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>🛵</span>
                    <span>Livraison à domicile</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">À Mboro, Thiès et environs avec repère visuel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('pickup')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    deliveryMode === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>🏪</span>
                    <span>Retrait en boutique</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Gratuit — récupérez votre commande sur place</p>
                </button>
              </div>
            </div>

            {/* 2. Adressage sénégalais (si livraison) */}
            {deliveryMode === 'delivery' ? (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">2. Adresse de livraison au Sénégal</h3>
                <SenegalAddressPicker value={address} onChange={setAddress} disabled={loading} />
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Point de retrait : {shop?.name || 'Boutique'}
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  {shop?.publicAddress || 'Thiès / Mboro, Sénégal'}
                </p>
                <label className="block text-xs font-medium text-gray-700 mb-1">Votre téléphone pour vous prévenir *</label>
                <input
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  required
                  className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
            )}

            {/* 3. Moyen de validation / paiement */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">3. Mode de validation & paiement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1 : WhatsApp Recommandée */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp (Recommandé)</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Populaire
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Enregistre la commande et vous met en relation directe avec le commerçant sur WhatsApp.
                  </p>
                </button>

                {/* Option 2 : Wave */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'wave'
                      ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Wave</p>
                  <p className="text-xs text-gray-500">Paiement mobile instantané sécurisé</p>
                </button>

                {/* Option 3 : À la livraison */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">À la livraison (Espèces)</p>
                  <p className="text-xs text-gray-500">Payez en mains propres au livreur</p>
                </button>

                {/* Option 4 : PayDunya */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paydunya')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'paydunya'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">PayDunya</p>
                  <p className="text-xs text-gray-500">Carte bancaire & autres Mobile Money</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all"
              disabled={loading}
            >
              {loading
                ? 'Traitement en cours...'
                : paymentMethod === 'whatsapp'
                ? 'Confirmer & Ouvrir WhatsApp →'
                : 'Valider la commande'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Plateforme sécurisée par Sen-E-Carte · Mboro, Thiès</span>
            </div>
          </form>
        </div>

        {/* Colonne latérale récapitulatif */}
        <div className="lg:w-1/4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-24">
            <h3 className="text-base font-bold text-gray-900 mb-4">Votre panier ({items.length})</h3>
            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id + (item.variantId || '')} className="flex items-center justify-between text-sm py-1 border-b border-gray-200/60 last:border-0">
                  <div className="flex-1 pr-2">
                    <p className="text-gray-800 font-medium line-clamp-1">{item.product.title}</p>
                    <p className="text-xs text-gray-500">{item.quantity}x {formatPrice(Number(item.product.price))}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-emerald-700 font-medium">
                  {deliveryMode === 'pickup' ? 'Gratuit' : 'À régler au livreur'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-3 text-base">
                <span>Total articles</span>
                <span className="text-emerald-700">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
