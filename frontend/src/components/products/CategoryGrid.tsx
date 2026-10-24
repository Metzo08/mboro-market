import Link from 'next/link';
import Image from 'next/image';

// Photos réelles par catégorie (CDC §2 : pas d'emoji dans l'UI finale)
const CATEGORIES = [
  {
    slug: 'fruits-legumes',
    name: 'Fruits & Légumes',
    desc: 'Frais du marché',
    img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
  },
  {
    slug: 'epicerie',
    name: 'Épicerie',
    desc: 'Riz, huile, bissap',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
  },
  {
    slug: 'artisanat',
    name: 'Artisanat',
    desc: 'Bazin, couture',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  },
  {
    slug: 'services',
    name: 'Plats & Resto',
    desc: 'Thiéboudienne, jus',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/products?categoryId=${c.slug}`}
          className="relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group h-40"
        >
          <Image
            src={c.img}
            alt={c.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white text-sm">{c.name}</h3>
            <p className="text-xs text-gray-200">{c.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
