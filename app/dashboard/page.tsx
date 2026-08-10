import { Header } from '@/components/layout/Header';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
        <p className="text-slate-400 text-sm mb-8">Overview of active quotes, settlement orders, and wallet activity.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">Settlement Rail</span>
            <p className="text-lg font-semibold mt-1">NGN ↔ Stellar USDC</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">Stellar Network</span>
            <p className="text-lg font-semibold mt-1 text-emerald-400">Testnet Ready</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">Soroban Smart Contracts</span>
            <p className="text-lg font-semibold mt-1 text-indigo-400">Vault & Escrow Foundation</p>
          </div>
        </div>
      </main>
    </div>
  );
}
