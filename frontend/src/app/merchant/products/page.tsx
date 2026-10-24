'use client';

import { api, getToken, removeToken } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { Product } from '@/types';

export default function MerchantProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });

  const loadShop = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login?callback=/merchant/products');
        return;
      }
      const meRes = await api.get('/auth/me');
      const userId = meRes.data.user.id;
      const shopRes = await api.get(`/shops/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(shopRes.data);
      loadProducts(shopRes.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de la boutique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, [router]);

  const loadProducts = async (shopId?: string) => {
    try {
      const res = await api.get('/products', { params: { shopId } });
      setProducts(res.data.items || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!shop) {
        setError('Boutique non trouvée');
        return;
      }
      if (editingId) {
        await api.patch(`/products/${editingId}`, {
          title: formData.title,
          slug: formData.slug,
          shortDescription: formData.shortDescription,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
      } else {
        await api.post('/products', {
          title: formData.title,
          slug: formData.slug,
          shortDescription: formData.shortDescription,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          shopId: shop.id,
          categoryId: formData.categoryId || undefined,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', slug: '', shortDescription: '', description: '', price: '', stock: '', categoryId: '' });
      loadProducts(shop.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (!getToken()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <Link href="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
        <Button onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', shortDescription: '', description: '', price: '', stock: '', categoryId: '' }); setShowForm(true); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Produit</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Prix</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Stock</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Statut</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.shortDescription || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(Number(p.price))}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-gray-500">{p.stock}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucun produit. Ajoutez votre premier produit !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
              <Input
                placeholder="Ex: Mangues fraîches de Mboro"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
              <Input
                placeholder="ex: mangues-fraiches-mboro"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description courte</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description complète</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Prix (XOF)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Catégorie (ID)</label>
              <Input
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">
                {editingId ? 'Enregistrer' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
