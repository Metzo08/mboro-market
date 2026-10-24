'use client';

import { Store, Smartphone, Search, Bot } from 'lucide-react';
import { ActivityCarousel, ActivitySlide } from '@/components/carousel/ActivityCarousel';

const ACTIVITES: ActivitySlide[] = [
  {
    id: 'boutique',
    title: 'Créez votre boutique en ligne',
    description:
      'Activez votre boutique en quelques minutes : catalogue, catégories, photos et prix. Visible immédiatement dans Mboro et Thiès.',
    icon: Store,
    color: 'bg-green-100 text-green-700',
    href: '/register',
    cta: 'Créer ma boutique',
  },
  {
    id: 'paiements',
    title: 'Encaissez via Wave et PayDunya',
    description:
      'Configurez vos clés API une seule fois et proposez à vos clients le paiement mobile, par carte ou à la livraison.',
    icon: Smartphone,
    color: 'bg-amber-100 text-amber-700',
    href: '/merchant/settings',
    cta: 'Configurer mes réglages',
  },
  {
    id: 'visibilite',
    title: 'Soyez visible sur Google',
    description:
      'Chaque boutique est prérendue et optimisée pour le SEO local : votre catalogue apparaît dans les recherches de votre quartier.',
    icon: Search,
    color: 'bg-blue-100 text-blue-700',
    href: '/shops',
    cta: 'Voir les boutiques',
  },
  {
    id: 'assistant',
    title: 'Un assistant IA en français-wolof',
    description:
      'Gérez vos produits, vos commandes et vos clients grâce à un assistant local qui vous parle dans votre langue.',
    icon: Bot,
    color: 'bg-purple-100 text-purple-700',
    href: '/merchant/dashboard',
    cta: 'Accéder au tableau de bord',
  },
];

export function HomeActivityCarousel() {
  return (
    <section className="py-4" aria-labelledby="activites-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="jt-sand rounded-2xl border border-amber-200 p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#c2410c] mb-2">
              JëndCiThiès — activités commerçantes
            </p>
            <h2 id="activites-title" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Tout ce qu&apos;une boutique locale peut faire
            </h2>
            <p className="text-gray-600">
              De la création de la boutique à l&apos;encaissement de vos ventes, découvrez les
              activités disponibles sur la plateforme.
            </p>
          </div>

          <ActivityCarousel
            slides={ACTIVITES}
            ariaLabel="Activités commerçantes JëndCiThiès"
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeActivityCarousel;
