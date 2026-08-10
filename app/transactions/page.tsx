import { Header } from '@/components/layout/Header';

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
        <p className="text-slate-400 text-sm mb-6">Historical record of Stellar Horizon transactions and local payment execution.</p>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-lg">
          <span className="text-xs text-indigo-400 font-medium">Phase 0 Foundation</span>
          <p className="text-sm text-slate-300 mt-2">Audit trail and transaction history ready for backend API connection.</p>
        </div>
      </main>
    </div>
  );
}
