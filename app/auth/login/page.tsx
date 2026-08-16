'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, Phone, UserCheck, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/orders';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, register, isAuthenticated, error, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'MERCHANT'>('USER');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const searchMode = searchParams.get('mode');
    if (searchMode === 'register' || searchMode === 'login') {
      setMode(searchMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTarget);
    }
  }, [isAuthenticated, router, redirectTarget]);

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
            router.push(redirectTarget);
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
            router.push(redirectTarget);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto py-12 px-4 flex flex-col justify-center">
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
          
          {/* Header & Tabs */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {mode === 'login' ? 'Sign In to LuminaRail' : 'Create LuminaRail Account'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {mode === 'login'
                ? 'Access non-custodial fiat settlement & Soroban liquidity rails'
                : 'Register as a User or Merchant to start settling digital assets'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('register')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Alerts */}
          {activeError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone Number <span className="text-slate-400 dark:text-slate-600 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        role === 'USER'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-slate-900 dark:text-white font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Individual User</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Personal settlement</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('MERCHANT')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        role === 'MERCHANT'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-slate-900 dark:text-white font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Merchant</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Commercial API rails</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                New to LuminaRail?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
