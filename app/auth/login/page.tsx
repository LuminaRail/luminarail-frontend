import { Header } from '@/components/layout/Header';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-md mx-auto py-16 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h1 className="text-xl font-bold mb-2">Authentication Foundation</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in or register to access LuminaRail settlement rails.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
              <input type="email" placeholder="user@example.com" disabled className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 opacity-60" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
              <input type="password" placeholder="••••••••" disabled className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 opacity-60" />
            </div>
            <button disabled className="w-full py-2.5 bg-indigo-600/50 text-indigo-200 rounded font-medium text-sm cursor-not-allowed">
              Authentication Disabled (Phase 0 Foundation)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
