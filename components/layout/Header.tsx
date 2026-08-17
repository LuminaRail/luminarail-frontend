'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ArrowUpRight, LogOut, User } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  const logoSrc = theme === 'light' ? '/brand/luminarail-icon-light.svg' : '/brand/luminarail-icon-dark.svg';

  const navLinks = [
    { href: '/#product', label: 'Product' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/quotes', label: 'Quotes' },
    { href: '/orders', label: 'Orders' },
    ...(isAuthenticated
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/transactions', label: 'Transactions' },
        ]
      : []),
    { href: '/#developers', label: 'Developers' },
  ];

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Network Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src={logoSrc}
              alt="LuminaRail Logo"
              width={28}
              height={28}
              className="w-7 h-7 transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              Lumina<span className="text-[#15E113] font-semibold">Rail</span>
            </span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase whitespace-nowrap bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Stellar Testnet • Paystack Test Mode</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-xs">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions Group */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 h-9 px-2.5 bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium shrink-0">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <User className="w-3 h-3" />
              </div>
              <span className="text-slate-700 dark:text-slate-200 max-w-[110px] truncate font-sans text-xs">
                {user.email}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                {user.role}
              </span>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-rose-500/10 cursor-pointer ml-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 shrink-0"
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          <WalletConnectButton />
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <WalletConnectButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus:outline-none rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#0c101c]/95 backdrop-blur-xl px-4 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                  isActive(link.href)
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                {link.href.startsWith('/') && !link.href.includes('#') && (
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                )}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{user.email}</span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase tracking-wider font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
              >
                Sign in to Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
