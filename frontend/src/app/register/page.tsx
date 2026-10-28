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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFBF5]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E2D6C4] shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E8632C] text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-sm">
            J
          </div>
          <h1 className="text-2xl font-black text-[#2B2420] tracking-tight">Créer un compte</h1>
          <p className="text-center text-xs text-[#6B625A] mt-1">
            Rejoignez JëndCiThiès comme client ou commerçant local
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2B2420] mb-1">Prénom</label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amadou" required className="rounded-xl border-[#E2D6C4]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2B2420] mb-1">Nom</label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Diallo" required className="rounded-xl border-[#E2D6C4]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Numéro de téléphone</label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 123 45 67" required className="rounded-xl border-[#E2D6C4]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Email (facultatif)</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.sn" className="rounded-xl border-[#E2D6C4]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Mot de passe</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required className="rounded-xl border-[#E2D6C4]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Type de compte</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-3 py-2.5 border border-[#E2D6C4] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#E8632C] bg-[#FFFBF5]">
              <option value="merchant">🏪 Je suis un commerçant / artisan (Vendeur)</option>
              <option value="customer">🛒 Je suis un client (Acheteur)</option>
            </select>
          </div>

          {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">{error}</div>}

          <Button type="submit" className="w-full py-3.5 jt-btn-primary rounded-xl text-sm font-bold shadow-md" disabled={loading}>
            {loading ? 'Création en cours...' : "Créer mon compte →"}
          </Button>

          <p className="text-center text-xs text-[#6B625A] pt-1">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-bold text-[#E8632C] hover:underline">Connectez-vous</Link>
          </p>
        </form>

        <p className="text-center text-[11px] text-[#6B625A]">
          Activation boutique : 5 000 FCFA + 2 500 FCFA/mois
        </p>
      </div>
    </div>
  );
}
