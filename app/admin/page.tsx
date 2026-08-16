import { Header } from '@/components/layout/Header';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Admin Operations</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">System health, provider routing rules, fee configuration, and audit log inspection.</p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl max-w-lg shadow-xl">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Phase 0 Foundation</span>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">Admin console foundation prepared for platform maintenance and auditing.</p>
        </div>
      </main>
    </div>
  );
}
