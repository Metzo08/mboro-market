'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/login', { phone });
      window.sessionStorage.setItem('jendcithes.otpPhone', phone);
      router.push('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-white p-6 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-terracotta/10 text-terracotta-dark">
          <Phone className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-h1 font-semibold">Connexion</h1>
        <p className="mt-1 text-small text-muted">
          Entrez votre numéro de téléphone. Nous vous enverrons un code à 6 chiffres.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Numéro de téléphone" required htmlFor="phone" hint="Format international : +221 77 000 00 00">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              placeholder="+221 77 000 00 00"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Recevoir le code
          </Button>
        </form>

        <p className="mt-4 text-caption text-muted">
          En environnement de démonstration, le code OTP est affiché dans les logs du serveur
          (aucun SMS n’est réellement envoyé).
        </p>
      </div>

      <p className="mt-5 text-center text-small text-muted">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-teal hover:text-terracotta-dark">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
