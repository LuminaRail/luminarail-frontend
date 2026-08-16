import { Header } from '@/components/layout/Header';

export default function MerchantPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Merchant Portal</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Manage API keys, merchant settings, and webhook subscription endpoints.</p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl max-w-lg shadow-xl">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Phase 0 Foundation</span>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">Merchant dashboard foundation prepared for future settlement integrations.</p>
        </div>
      </main>
    </div>
  );
}
