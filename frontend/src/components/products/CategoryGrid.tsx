import Link from 'next/link';
import Image from 'next/image';

// Photos réelles par catégorie (CDC §2 : pas d'emoji dans l'UI finale)
const CATEGORIES = [
  {
    slug: 'fruits-legumes',
    name: 'Fruits & Légumes',
    desc: 'Frais du marché',
    img: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&q=80',
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
    img: 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
  },
  {
    slug: 'services',
    name: 'Plats & Resto',
    desc: 'Thiéboudienne, jus',
    img: 'https://images.unsplash.com/photo-1665400808116-f0e6339b7e9a?w=600&q=80',
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/products?categoryId=${c.slug}`}
          className="group block overflow-hidden rounded-2xl border border-green-50 bg-white shadow-sm jt-card-hover aspect-square"
        >
          <div className="relative h-40 overflow-hidden bg-green-50">
            <Image
              src={c.img}
              alt={c.name}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/20 to-transparent" />
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-900">{c.name}</h3>
            <p className="text-sm text-green-600 font-medium">{c.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
