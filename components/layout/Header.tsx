'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded bg-emerald-600 border border-emerald-500/30 flex items-center justify-center font-semibold text-white text-xs tracking-wider group-hover:bg-emerald-500 transition-colors">
            LR
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight font-sans">
              Lumina<span className="text-slate-500 dark:text-slate-400 font-normal">Rail</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
              Stellar USDC
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <Link href="/#product" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Product
          </Link>
          <Link href="/#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            How it works
          </Link>
          <Link href="/quotes" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Quotes
          </Link>
          <Link href="/orders" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Orders
          </Link>
          <Link href="/#developers" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Developers
          </Link>
        </nav>

        {/* Action Group Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors uppercase tracking-wider px-2"
          >
            Sign in
          </Link>
          
          <ThemeToggle />
          
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          
          <WalletConnectButton />
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <WalletConnectButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101c] px-4 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Link
              href="/#product"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors"
            >
              Product
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/quotes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Quotes</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Orders</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              href="/#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600 dark:hover:text-white transition-colors"
            >
              Developers
            </Link>
          </nav>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
            >
              Sign in to Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
