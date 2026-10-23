'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'merchant'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { phone, email: email || undefined, role });
      window.sessionStorage.setItem('jendcithes.otpPhone', phone);
      router.push('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-white p-6 shadow-card">
        <h1 className="text-h1 font-semibold">Créer un compte</h1>
        <p className="mt-1 text-small text-muted">
          Le téléphone est votre identifiant. L’email est facultatif.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <fieldset>
            <legend className="text-small font-medium text-ink">Je suis…</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className={cn('flex cursor-pointer items-center gap-2 rounded-md border p-3 text-small', role === 'customer' ? 'border-teal bg-teal/5 font-semibold' : 'border-line')}>
                <input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} />
                <User className="h-4 w-4 text-teal" aria-hidden="true" /> Un client
              </label>
              <label className={cn('flex cursor-pointer items-center gap-2 rounded-md border p-3 text-small', role === 'merchant' ? 'border-teal bg-teal/5 font-semibold' : 'border-line')}>
                <input type="radio" name="role" checked={role === 'merchant'} onChange={() => setRole('merchant')} />
                <Store className="h-4 w-4 text-terracotta" aria-hidden="true" /> Un commerçant
              </label>
            </div>
          </fieldset>

          <Field label="Numéro de téléphone" required htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="+221 77 000 00 00" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>
          <Field label="Email (facultatif)" htmlFor="email" hint="Utile pour recevoir vos factures.">
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.sn" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>

          {error && (
            <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Créer mon compte
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-small text-muted">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-teal hover:text-terracotta-dark">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
