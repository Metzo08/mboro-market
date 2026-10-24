'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, setToken, removeToken } from '@/lib/api';

type AuthMode = 'phone' | 'password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode téléphone (OTP)
  const [phone, setPhone] = useState('');

  // Mode email/mot de passe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', { phone });
      router.push('/verify-otp');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login/password', { email, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      sessionStorage.setItem('token', res.data.access_token);

      if (res.data.user.role === 'MERCHANT') {
        router.push('/mon-commerce');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
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
          <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Connectez-vous à votre compte JëndCiThiès
          </p>
        </div>

        {/* Mode sélection */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('phone')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'phone' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Téléphone (OTP)
            </button>
            <button
              onClick={() => setMode('password')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'password' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Email / Mot de passe
            </button>
          </div>
        </div>

        <form className="space-y-6" onSubmit={mode === 'phone' ? handlePhoneSubmit : handlePasswordSubmit}>
          {mode === 'phone' ? (
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 70 xxx xxxx"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion en cours...' : mode === 'phone' ? 'Envoyer le code OTP' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
            Créer un compte
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400">
          Activation boutique : 5 000 FCFA + 2 500 FCFA/mois
        </p>
      </div>
    </div>
  );
}
