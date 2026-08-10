import Link from 'next/link';
import { WalletConnectButton } from '../wallet/WalletConnectButton';

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
            L
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">LuminaRail</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/dashboard" className="hover:text-indigo-400 transition">Dashboard</Link>
          <Link href="/quotes" className="hover:text-indigo-400 transition">Quotes</Link>
          <Link href="/orders" className="hover:text-indigo-400 transition">Orders</Link>
          <Link href="/transactions" className="hover:text-indigo-400 transition">Transactions</Link>
          <Link href="/merchant" className="hover:text-indigo-400 transition">Merchant</Link>
          <Link href="/admin" className="hover:text-indigo-400 transition">Admin</Link>
        </nav>

        <div className="flex items-center gap-3">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
