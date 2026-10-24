'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'customer' | 'merchant'>('merchant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        phone,
        email: email || undefined,
        password,
        firstName,
        lastName,
        role,
      });

      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mx-auto mb-4">
            J
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Créer votre compte</h2>
          <p className="text-center text-gray-600 mt-2">
            Rejoignez JëndCiThiès et ouvrez votre boutique à Mboro/Thiès.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Amadou" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex: Diallo" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 70 xxx xxxx" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@email.com" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Je m'inscris en tant que</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
              <option value="customer">Un client (acheteur)</option>
              <option value="merchant">Un commerçant (vendeur)</option>
            </select>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Création en cours...' : "Créer mon compte"}</Button>

          <p className="text-center text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">Connectez-vous</Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400">
          Activation boutique : 5 000 FCFA + 2 500 FCFA/mois
        </p>
      </div>
    </div>
  );
}
