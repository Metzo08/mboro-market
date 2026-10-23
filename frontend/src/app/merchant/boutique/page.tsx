'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useMerchantShop } from '@/lib/useMerchantShop';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

const SHOP_TYPES = [
  { value: 'RETAIL', label: 'Commerce / épicerie' },
  { value: 'RESTAURANT', label: 'Restaurant / fast-food' },
  { value: 'ARTISAN', label: 'Artisan' },
  { value: 'SERVICE', label: 'Prestataire de service' },
];

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export default function MerchantShopPage() {
  const { shop, loading } = useMerchantShop();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'RETAIL',
    shortDescription: '',
    description: '',
    phone: '',
    whatsapp: '',
    publicAddress: '',
  });
  const [hours, setHours] = useState<Record<string, DayHours>>(
    Object.fromEntries(
      DAYS.map((day) => [day.key, { open: '08:00', close: '20:00', closed: day.key === 'sunday' }]),
    ),
  );

  useEffect(() => {
    if (!shop) return;
    setForm({
      name: shop.name,
      slug: shop.slug,
      type: shop.type,
      shortDescription: shop.shortDescription ?? '',
      description: shop.description ?? '',
      phone: shop.phone ?? '',
      whatsapp: shop.whatsapp ?? '',
      publicAddress: shop.publicAddress ?? '',
    });
    const raw = (shop.openingHours ?? {}) as Record<string, any>;
    setHours((current) => {
      const next = { ...current };
      for (const day of DAYS) {
        const value = raw[day.key];
        if (value && typeof value === 'object' && 'open' in value) {
          next[day.key] = { open: value.open, close: value.close, closed: false };
        } else if (value && typeof value === 'object' && 'closed' in value) {
          next[day.key] = { ...next[day.key], closed: true };
        }
      }
      return next;
    });
  }, [shop]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const openingHours = Object.fromEntries(
      DAYS.map((day) => [
        day.key,
        hours[day.key].closed
          ? { closed: true }
          : { open: hours[day.key].open, close: hours[day.key].close },
      ]),
    );
    try {
      if (shop) {
        await api.patch(`/shops/${shop.id}`, { ...form, openingHours });
        setSuccess('Fiche mise à jour.');
        window.setTimeout(() => window.location.reload(), 800);
      } else {
        const created = await api.post('/shops', {
          name: form.name,
          slug: form.slug || slugify(form.name),
          type: form.type,
          shortDescription: form.shortDescription || undefined,
          description: form.description || undefined,
          phone: form.phone || undefined,
          whatsapp: form.whatsapp || undefined,
          publicAddress: form.publicAddress || undefined,
        });
        await api.patch(`/shops/${created.data.id}`, { openingHours });
        setSuccess('Boutique créée en brouillon. Elle sera visible après vérification.');
        window.setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h1 font-semibold">{shop ? 'Ma boutique' : 'Créer ma boutique'}</h1>
          <p className="mt-1 text-small text-muted">
            Les informations saisies ici alimentent la fiche publique et les données structurées SEO.
          </p>
        </div>
        {shop && (
          <div className="flex items-center gap-2">
            <Badge tone={shop.status === 'ACTIVE' ? 'success' : 'gold'}>{shop.status}</Badge>
            {shop.status === 'ACTIVE' && (
              <Link href={`/shops/${shop.slug}`} className="inline-flex items-center gap-1 text-caption font-medium text-teal">
                Voir la fiche publique <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </header>

      {!shop && (
        <div className="flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 p-3 text-small text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          La création place la boutique en brouillon. Sa publication dépend de la vérification
          Sen-E-Carte et de l’activation de l’abonnement (5 000 FCFA + 2 500 FCFA/mois, montants
          configurables en back-office).
        </div>
      )}

      {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>}
      {success && <p role="status" className="rounded-md bg-success/10 p-3 text-small text-success">{success}</p>}

      <form onSubmit={save} className="space-y-5 rounded-lg border border-line bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la boutique" required htmlFor="name">
            <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: shop ? form.slug : slugify(event.target.value) })} required />
          </Field>
          <Field label="URL (slug)" required htmlFor="slug" hint={`/shops/${form.slug || 'ma-boutique'}`}>
            <Input id="slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} required disabled={Boolean(shop)} />
          </Field>
          <Field label="Activité" htmlFor="type">
            <select id="type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="h-11 w-full rounded-sm border border-line bg-white px-3 text-body">
              {SHOP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Adresse / repère" htmlFor="address" hint="Ex : près du marché central, Mboro">
            <Input id="address" value={form.publicAddress} onChange={(event) => setForm({ ...form, publicAddress: event.target.value })} />
          </Field>
          <Field label="Téléphone" htmlFor="phone">
            <Input id="phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp" hint="Chiffres uniquement, ex : 221771234567">
            <Input id="whatsapp" type="tel" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
          </Field>
          <Field label="Description courte" htmlFor="short" className="sm:col-span-2">
            <Input id="short" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} />
          </Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2">
            <textarea id="description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-sm border border-line bg-white px-3 py-2 text-body focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/25" />
          </Field>
        </div>

        <fieldset className="border-t border-line pt-4">
          <legend className="text-h3 font-semibold">Horaires d’ouverture</legend>
          <p className="mt-1 text-caption text-muted">
            Le statut « Ouvert maintenant » est calculé à partir de ces horaires. Si rien n’est saisi,
            la fiche affiche « Horaires non renseignés ».
          </p>
          <div className="mt-3 space-y-2">
            {DAYS.map((day) => (
              <div key={day.key} className="flex flex-wrap items-center gap-2 text-small">
                <span className="w-24 font-medium text-ink">{day.label}</span>
                <label className="flex items-center gap-1.5 text-caption text-muted">
                  <input
                    type="checkbox"
                    checked={hours[day.key].closed}
                    onChange={(event) => setHours({ ...hours, [day.key]: { ...hours[day.key], closed: event.target.checked } })}
                  />
                  Fermé
                </label>
                <input
                  type="time"
                  aria-label={`Ouverture ${day.label}`}
                  value={hours[day.key].open}
                  disabled={hours[day.key].closed}
                  onChange={(event) => setHours({ ...hours, [day.key]: { ...hours[day.key], open: event.target.value } })}
                  className="numbers h-9 rounded-sm border border-line px-2 text-small disabled:bg-sand"
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  aria-label={`Fermeture ${day.label}`}
                  value={hours[day.key].close}
                  disabled={hours[day.key].closed}
                  onChange={(event) => setHours({ ...hours, [day.key]: { ...hours[day.key], close: event.target.value } })}
                  className="numbers h-9 rounded-sm border border-line px-2 text-small disabled:bg-sand"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 border-t border-line pt-4">
          <Button type="submit" loading={saving}>{shop ? 'Enregistrer' : 'Créer ma boutique'}</Button>
        </div>
      </form>
    </div>
  );
}
