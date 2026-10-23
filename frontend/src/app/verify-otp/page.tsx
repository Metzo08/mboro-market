'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { api, setToken } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('jendcithes.otpPhone');
    if (saved) setPhone(saved);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, code });
      setToken(res.data.access_token);
      window.sessionStorage.removeItem('jendcithes.otpPhone');
      const role = res.data?.user?.role;
      router.push(role === 'MERCHANT' || role === 'ADMIN' ? '/merchant/dashboard' : '/');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-line bg-white p-6 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal/10 text-teal">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-h1 font-semibold">Vérification</h1>
        <p className="mt-1 text-small text-muted">
          Saisissez le code à 6 chiffres envoyé au numéro indiqué.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Numéro de téléphone" required htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field label="Code à 6 chiffres" required htmlFor="code">
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              className="numbers text-center text-xl tracking-[0.4em]"
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Vérifier et se connecter
          </Button>
        </form>

        <p className="mt-4 text-caption text-muted">
          Code non reçu ? Vérifiez le numéro, puis demandez un nouveau code. En démonstration, le
          code apparaît dans la console du serveur.
        </p>
      </div>

      <p className="mt-5 text-center text-small text-muted">
        <Link href="/login" className="font-medium text-teal hover:text-terracotta-dark">
          Renvoyer un code
        </Link>
      </p>
    </div>
  );
}
