'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'jendcithes.locality';
const FALLBACK = ['Mboro', 'Thiès'];

interface Locality {
  name: string;
  slug?: string;
}

/**
 * Localité choisie par l'utilisateur — jamais imposée par la géoloc (§PUB-002).
 * La liste provient de la configuration publique (base), pas du code.
 */
export function LocalityPicker({ className }: { className?: string }) {
  const [localities, setLocalities] = useState<Locality[]>(FALLBACK.map((name) => ({ name })));
  const [selected, setSelected] = useState(FALLBACK[0]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setSelected(saved);
    api
      .get('/config/public')
      .then((res) => {
        const items = res.data?.locations;
        if (Array.isArray(items) && items.length > 0) {
          setLocalities(items);
        }
      })
      .catch(() => {
        /* la configuration est optionnelle : on garde le repli */
      });
  }, []);

  return (
    <label
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-small font-medium text-ink',
        className,
      )}
    >
      <MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
      <span className="sr-only">Choisir une localité</span>
      <select
        value={selected}
        onChange={(event) => {
          setSelected(event.target.value);
          window.localStorage.setItem(STORAGE_KEY, event.target.value);
        }}
        className="max-w-[8.5rem] cursor-pointer appearance-none bg-transparent pr-1 text-small font-medium text-ink focus:outline-none"
      >
        {localities.map((locality) => (
          <option key={locality.slug ?? locality.name} value={locality.name}>
            {locality.name}
          </option>
        ))}
      </select>
    </label>
  );
}
