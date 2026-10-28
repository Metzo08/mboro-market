'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { productImage } from '@/lib/images';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useCart } from '@/components/cart/CartProvider';
import { MessageCircle, ShoppingBag, Share2, Check, ArrowRight } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [tab, setTab] = useState<'description' | 'details'>('description');
  const [copied, setCopied] = useState(false);

  const hasPromo =
    product.promotionalPrice != null &&
    Number(product.promotionalPrice) > 0 &&
    Number(product.promotionalPrice) < Number(product.price);

  const handleBuyNow = () => {
    addItem(product, 1);
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const rawPhone = product.shop?.whatsapp || product.shop?.phone || '+221771234567';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 9) cleanPhone = '221' + cleanPhone;
    const msg = encodeURIComponent(
      `Salam aleikoum ! Je souhaite commander : *${product.title}* (${formatPrice(Number(product.price))}) vu sur JëndCiThiès.\nLien : ${window.location.href}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Découvrez ${product.title} sur JëndCiThiès :`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFBF5]">
      <div className="bg-white rounded-3xl border border-[#E2D6C4] shadow-sm overflow-hidden">
        {/* Fil d'Ariane */}
        <nav className="bg-[#F5EDE1]/60 py-3 px-6 border-b border-[#E2D6C4]">
          <ol className="flex flex-wrap items-center text-xs text-[#6B625A]">
            <li><Link href="/" className="hover:text-[#E8632C] transition-colors">Accueil</Link></li>
            <li className="mx-2 text-gray-300">/</li>
            <li><Link href="/products" className="hover:text-[#E8632C] transition-colors">Produits</Link></li>
            <li className="mx-2 text-gray-300">/</li>
            <li className="font-bold text-[#2B2420] truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10">
          {/* Grande Image */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#F5EDE1] border border-[#E2D6C4]">
            <Image
              src={productImage(product)}
              alt={product.title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-[#F2A93B] text-gray-900 font-bold px-3 py-1 rounded-full text-xs shadow-md">
                Offre spéciale
              </span>
            )}
          </div>

          {/* Informations produit */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2B2420] mb-2">
                {product.title}
              </h1>
              <p className="text-sm text-[#6B625A] mb-5 leading-relaxed">
                {product.shortDescription || product.description || 'Produit local de qualité supérieure proposé par les commerçants de Thiès.'}
              </p>

              {/* Prix */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-[#FFFBF5] border border-[#E2D6C4]">
                <span suppressHydrationWarning className="text-3xl font-black text-[#E8632C]">
                  {formatPrice(Number(product.price))}
                </span>
                {hasPromo && (
                  <span suppressHydrationWarning className="text-base text-gray-400 line-through">
                    {formatPrice(Number(product.promotionalPrice))}
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  En stock
                </span>
              </div>
            </div>

            {/* Actions : Ajouter au panier, Acheter maintenant, WhatsApp */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddToCartButton product={product} className="py-3.5 text-sm" />
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-xl bg-[#115E59] hover:bg-[#0D4A46] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Acheter maintenant</span>
                </button>
              </div>

              {/* Bouton WhatsApp direct */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Commander directement sur WhatsApp</span>
              </button>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-xs font-semibold text-[#6B625A] hover:text-[#E8632C] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Lien copié !' : 'Partager ce produit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets Description & Détails */}
        <div className="border-t border-[#E2D6C4] px-6 sm:px-10 py-6 bg-[#FFFBF5]">
          <div className="flex gap-6 border-b border-[#E2D6C4] mb-4">
            <button
              onClick={() => setTab('description')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${tab === 'description'
                  ? 'border-[#E8632C] text-[#E8632C]'
                  : 'border-transparent text-[#6B625A] hover:text-[#2B2420]'
                }`}
            >
              Description détaillée
            </button>
            <button
              onClick={() => setTab('details')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${tab === 'details'
                  ? 'border-[#E8632C] text-[#E8632C]'
                  : 'border-transparent text-[#6B625A] hover:text-[#2B2420]'
                }`}
            >
              Informations & Livraison
            </button>
          </div>

          {tab === 'description' ? (
            <p className="text-sm text-[#6B625A] leading-relaxed max-w-3xl">
              {product.description || product.shortDescription || 'Produit local authentique sélectionné par JëndCiThiès pour Mboro et Thiès.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-xs text-[#6B625A]">
              <div className="p-3 rounded-xl bg-white border border-[#E2D6C4]">
                <p className="font-bold text-[#2B2420]">Zone desservie</p>
                <p className="mt-0.5">Mboro, Thiès et région</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E2D6C4]">
                <p className="font-bold text-[#2B2420]">Paiements acceptés</p>
                <p className="mt-0.5">Wave, PayDunya, Espèces à la livraison</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
