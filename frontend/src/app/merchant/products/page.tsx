'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useMerchantShop } from '@/lib/useMerchantShop';
import { formatPrice, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Category, Product } from '@/types';

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  promotionalPrice: string;
  stock: string;
  categoryId: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  price: '',
  promotionalPrice: '',
  stock: '',
  categoryId: '',
};

export default function MerchantProducts() {
  const { shop, loading: shopLoading } = useMerchantShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  async function loadProducts(shopId: string) {
    try {
      const res = await api.get('/products', { params: { shopId, limit: 60 } });
      setProducts(res.data.items ?? res.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de charger le catalogue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data ?? [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (shop) loadProducts(shop.id);
  }, [shop]);

  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      price: String(product.price),
      promotionalPrice: product.promotionalPrice ? String(product.promotionalPrice) : '',
      stock: String(product.stock),
      categoryId: product.categoryId ?? '',
    });
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!shop) return;
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      price: Number(form.price),
      promotionalPrice: form.promotionalPrice ? Number(form.promotionalPrice) : undefined,
      stock: Number(form.stock || 0),
      categoryId: form.categoryId || undefined,
    };
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', { ...payload, shopId: shop.id });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadProducts(shop.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!confirm(`Supprimer « ${product.title} » ? Cette action est définitive.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      if (shop) await loadProducts(shop.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Suppression impossible.');
    }
  }

  if (shopLoading || loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1 font-semibold">Catalogue</h1>
          <p className="mt-1 text-small text-muted">{products.length} produit(s) publiés</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau produit
        </Button>
      </header>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <p className="font-medium text-ink">Votre catalogue est vide</p>
          <p className="mt-1 text-small text-muted">Ajoutez votre premier produit pour le rendre visible.</p>
          <Button className="mt-4" onClick={openCreate}>
            Ajouter un produit
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-sand font-display text-xl font-semibold text-terracotta/60">
                {product.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-ink">{product.title}</p>
                <p className="text-caption text-muted">
                  {product.categoryId ? categoriesById[product.categoryId] ?? 'Catégorie' : 'Sans catégorie'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="numbers text-small font-bold text-terracotta-dark">{formatPrice(product.price)}</span>
                  <Badge tone={product.stock > 0 ? 'success' : 'danger'}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  aria-label={`Modifier ${product.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-sand hover:text-ink"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeProduct(product)}
                  aria-label={`Supprimer ${product.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-semibold">{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Fermer le formulaire"
              className="text-muted hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nom du produit" required htmlFor="title" className="sm:col-span-2">
              <Input
                id="title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: editingId ? current.slug : slugify(event.target.value),
                  }))
                }
                required
              />
            </Field>
            <Field label="URL (slug)" required htmlFor="slug" hint="Lettres minuscules, chiffres et tirets.">
              <Input id="slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} required />
            </Field>
            <Field label="Catégorie" htmlFor="category">
              <select
                id="category"
                value={form.categoryId}
                onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                className="h-11 w-full rounded-sm border border-line bg-white px-3 text-body"
              >
                <option value="">Sans catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prix (FCFA)" required htmlFor="price">
              <Input id="price" type="number" min={0} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </Field>
            <Field label="Prix promotionnel (facultatif)" htmlFor="promo" hint="Doit être inférieur au prix normal.">
              <Input id="promo" type="number" min={0} value={form.promotionalPrice} onChange={(event) => setForm({ ...form, promotionalPrice: event.target.value })} />
            </Field>
            <Field label="Stock" htmlFor="stock">
              <Input id="stock" type="number" min={0} value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
            </Field>
            <Field label="Description courte" htmlFor="short" className="sm:col-span-2">
              <Input id="short" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} />
            </Field>
            <Field label="Description complète" htmlFor="description" className="sm:col-span-2">
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full rounded-sm border border-line bg-white px-3 py-2 text-body focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/25"
              />
            </Field>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={saving}>
                {editingId ? 'Enregistrer' : 'Créer le produit'}
              </Button>
              <Button type="button" variant="tertiary" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
