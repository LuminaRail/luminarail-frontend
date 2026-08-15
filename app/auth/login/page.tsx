'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, Phone, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, error, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'MERCHANT'>('USER');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/orders');
    }
  }, [isAuthenticated, router]);

  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setFormError(null);
    clearError();
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearError();

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const ok = await login({ email, password });
        if (ok) {
          setSuccessMessage('Authentication successful! Redirecting...');
          setTimeout(() => {
            router.push('/orders');
          }, 800);
        }
      } else {
        const ok = await register({
          email,
          password,
          phone: phone.trim() || undefined,
          role,
        });
        if (ok) {
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push('/orders');
          }, 800);
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = formError || error;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto py-12 px-4 flex flex-col justify-center">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
          
          {/* Header & Tabs */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Sign In to LuminaRail' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Access modular settlement rails for Stellar & local fiat.
            </p>
          </div>

          {/* Toggle Pills */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-lg border border-slate-800/60 mb-6">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('register')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Alert Banners */}
          {activeError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{activeError}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`p-2.5 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        role === 'USER'
                          ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('MERCHANT')}
                      className={`p-2.5 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        role === 'MERCHANT'
                          ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Merchant
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Registering...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400">
                New to LuminaRail?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
