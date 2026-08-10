import { Header } from '@/components/layout/Header';

export default function MerchantPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2">Merchant Portal</h1>
        <p className="text-slate-400 text-sm mb-6">Manage API keys, merchant settings, and webhook subscription endpoints.</p>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-lg">
          <span className="text-xs text-indigo-400 font-medium">Phase 0 Foundation</span>
          <p className="text-sm text-slate-300 mt-2">Merchant dashboard foundation prepared for future settlement integrations.</p>
        </div>
      </main>
    </div>
  );
}
