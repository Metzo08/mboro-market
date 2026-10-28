import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/products/ProductCard';
import { shopImage } from '@/lib/images';
import { getProducts, getShops } from '@/lib/server-api';
import { Search, MapPin, Utensils, Wrench, ShoppingBag, FileText, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JëndCiThiès',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: 'JëndCiThiès by Sen-E-Carte : plateforme SaaS de commerce local pour Mboro et Thiès, Sénégal',
  telephone: '+221771234567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Marché de Mboro',
    addressLocality: 'Mboro',
    addressRegion: 'Thiès',
    addressCountry: 'SN',
  },
};

const HOW_IT_WORKS = [
  { step: '1', title: 'Découvrez', desc: 'Trouvez produits frais, artisans et plats cuisinés de Mboro et Thiès près de vous.' },
  { step: '2', title: 'Commandez', desc: 'Validez votre panier en ligne ou finalisez directement en 1 clic sur WhatsApp.' },
  { step: '3', title: 'Recevez', desc: 'Livraison avec repères locaux (sans numéro de rue) ou retrait gratuit en boutique.' },
];

export default async function HomePage() {
  const [productsRes, shopsRes] = await Promise.allSettled([
    getProducts({ limit: '8' }),
    getShops({ limit: '8' }),
  ]);

  const productsData = productsRes.status === 'fulfilled' ? productsRes.value : { items: [] };
  const shopsData = shopsRes.status === 'fulfilled' ? shopsRes.value : { items: [] };

  const products: Product[] = productsData.items || productsData || [];
  const shops = shopsData.items || shopsData || [];

  return (
    <div className="space-y-0 bg-[#FFFBF5] text-[#2B2420]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* =========================================================================
          HERO SECTION — Conforme Wireframe §4.1 CDC v2.0
          « Chaleur du marché, clarté du digital » (Teal profond & Terracotta)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#115E59] via-[#0D4A46] to-[#115E59] text-white pt-12 pb-20">
        {/* Motif subtil d'arrière-plan */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F2A93B_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Pill Sélecteur de Localité (Wireframe §4.1) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-200 mb-6 shadow-sm">
            <MapPin className="w-4 h-4 text-[#F2A93B]" />
            <span>Mboro & Région de Thiès</span>
            <span className="text-white/60">▾</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 text-white">
            Les commerces et services de Thiès, <br className="hidden sm:inline" />
            <span className="text-[#F2A93B]">à portée de main</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8 font-medium">
            Jënd ci kaw, jënd ci sa wetu. Produits frais du marché, artisans locaux et restaurants livrés chez vous.
          </p>

          {/* Barre de Recherche Héro Pill Shape (Wireframe §4.1) */}
          <div className="max-w-2xl mx-auto mb-6">
            <form action="/products" method="get" className="relative flex items-center shadow-2xl rounded-full bg-white p-2 border-2 border-[#E2D6C4]">
              <Search className="w-6 h-6 text-[#115E59] ml-3 mr-2 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher : ceeb, mangues, yapp, thieb, soble, bazin…"
                className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-transparent outline-none pr-3"
              />
              <button
                type="submit"
                className="jt-btn-primary px-6 py-3 rounded-full text-sm font-bold shrink-0 flex items-center gap-1.5"
              >
                <span>Chercher</span>
              </button>
            </form>
          </div>

          {/* Raccourcis Rapides (Wireframe §4.1) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
            <Link
              href="/products?category=cuisine"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20 transition-all hover:scale-105"
            >
              <Utensils className="w-4 h-4 text-[#F2A93B]" />
              <span>🍽 Repas</span>
            </Link>
            <Link
              href="/products?category=services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20 transition-all hover:scale-105"
            >
              <Wrench className="w-4 h-4 text-[#F2A93B]" />
              <span>🔧 Artisan & Services</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4 text-[#F2A93B]" />
              <span>🛒 Acheter près de moi</span>
            </Link>
            <Link
              href="/shops"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs sm:text-sm font-semibold text-white border border-white/20 transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-[#F2A93B]" />
              <span>📋 Demander un devis</span>
            </Link>
          </div>

          {/* Puces de recherche Wolof/Français */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-emerald-100/80">
            <span className="font-bold text-[#F2A93B]">🇸🇳 Mots-clés en Wolof :</span>
            {[
              { label: 'ceeb (riz)', q: 'ceeb' },
              { label: 'yapp (viande)', q: 'yapp' },
              { label: 'soble (oignon)', q: 'soble' },
              { label: 'kaani (piment)', q: 'kaani' },
              { label: 'dibi (grillade)', q: 'dibi' },
            ].map((chip) => (
              <Link
                key={chip.q}
                href={`/products?q=${chip.q}`}
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bannière de réassurance des 4 innovations */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-black/20 backdrop-blur-sm py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-white text-xs sm:text-sm font-semibold">
              <div className="flex items-center justify-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Commande WhatsApp Hybride</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>Adressage sans numéro de rue</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Wave, PayDunya & Cash</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-sm">🖨️</span>
                <span>Affiches QR Code de comptoir</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION CATÉGORIES POPULAIRES (CDC §2.6)
          ========================================================================= */}
      <section className="py-12 bg-[#FFFBF5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2420] tracking-tight">
                Catégories populaires
              </h2>
              <p className="text-sm text-[#6B625A] mt-1">
                Explorez par famille de produits et métiers de proximité
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-[#E8632C] hover:text-[#B6481A] flex items-center gap-1"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Épicerie', href: '/products?q=riz', emoji: '🏠', count: '12 produits' },
              { name: 'Légumes & Fruits', href: '/products?q=mangue', emoji: '🥦', count: '15 produits' },
              { name: 'Plats & Repas', href: '/products?q=thieb', emoji: '🍲', count: 'Cuisine sénégalaise' },
              { name: 'Bazin & Wax', href: '/products?q=bazin', emoji: '🧵', count: 'Artisanat textile' },
              { name: 'Téléphonie', href: '/products?q=iphone', emoji: '📱', count: 'Smartphones & pièces' },
              { name: 'Matériaux', href: '/products?q=ciment', emoji: '🏗️', count: 'Ciment & chantier' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[#E2D6C4] bg-white text-center jt-card-hover shadow-xs"
              >
                <div className="w-14 h-14 rounded-full bg-[#F5EDE1] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:bg-[#FBECE4] transition-all">
                  {cat.emoji}
                </div>
                <h3 className="font-bold text-sm text-[#2B2420] group-hover:text-[#E8632C] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#6B625A] mt-1">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION BOUTIQUES PARTENAIRES (CDC §2.6)
          ========================================================================= */}
      <section className="py-12 bg-[#F5EDE1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2420] tracking-tight">
                Boutiques & Ateliers de proximité
              </h2>
              <p className="text-sm text-[#6B625A] mt-1">
                Commerces vérifiés à Mboro, Thiès et environs
              </p>
            </div>
            <Link
              href="/shops"
              className="text-sm font-bold text-[#115E59] hover:text-[#0D4A46] flex items-center gap-1"
            >
              <span>Toutes les boutiques</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.length > 0 ? (
              shops.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/shops/${s.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[#E2D6C4] bg-white shadow-sm jt-card-hover"
                >
                  <div className="relative h-44 overflow-hidden bg-[#F5EDE1]">
                    <Image
                      src={shopImage(s)}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#115E59] text-white text-[11px] font-bold shadow-sm">
                        ✓ Vérifiée
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-[#2B2420] group-hover:text-[#E8632C] transition-colors line-clamp-1">
                      {s.name}
                    </h3>
                    <p className="text-xs text-[#6B625A] line-clamp-2 mt-1 mb-3">
                      {s.shortDescription || 'Commerçant local sur JëndCiThiès'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2D6C4]/60 text-xs">
                      <span className="text-[#6B625A] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E8632C]" />
                        {s.publicAddress?.split(',')[0] || 'Mboro'}
                      </span>
                      <span className="font-bold text-[#115E59]">Voir la boutique →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#E2D6C4] p-12 text-center text-[#6B625A]">
                Aucune boutique disponible pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION PRODUITS POPULAIRES (CDC §4.1)
          ========================================================================= */}
      <section className="py-12 bg-[#FFFBF5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2420] tracking-tight">
                Offres & Produits du moment
              </h2>
              <p className="text-sm text-[#6B625A] mt-1">
                Commandez en ligne ou contactez directement le vendeur sur WhatsApp
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-[#E8632C] hover:text-[#B6481A] flex items-center gap-1"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#E2D6C4] p-12 text-center text-[#6B625A]">
                Aucun produit disponible pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION COMMENT ÇA MARCHE (CDC §4.1)
          ========================================================================= */}
      <section className="py-16 bg-[#F5EDE1] border-t border-[#E2D6C4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2B2420] tracking-tight mb-3">
            Comment fonctionne JëndCiThiès ?
          </h2>
          <p className="text-sm text-[#6B625A] max-w-xl mx-auto mb-12">
            Une expérience pensée pour les réalités du Sénégal, simple et transparente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="p-8 rounded-2xl bg-white border border-[#E2D6C4] jt-card-hover text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#E8632C] text-white flex items-center justify-center font-black text-xl mx-auto mb-5 shadow-sm">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg text-[#2B2420] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B625A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Bannière CTA Commerçant */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#115E59] to-[#0D4A46] p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">
                Vous avez un commerce à Mboro ou Thiès ?
              </h3>
              <p className="text-sm sm:text-base text-emerald-100 max-w-xl">
                Créez votre vitrine professionnelle, publiez vos produits et recevez des commandes en quelques minutes.
              </p>
            </div>
            <Link
              href="/register"
              className="jt-btn-primary px-8 py-4 text-base font-bold shrink-0 text-white rounded-xl shadow-lg"
            >
              Ouvrir ma boutique →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
