'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, MoreVertical, Info, ChevronDown, ArrowRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

export function HeroMobileMockup() {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [countdown, setCountdown] = useState<number>(24);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const logoSrc = theme === 'light' ? '/brand/luminarail-icon-light.svg' : '/brand/luminarail-icon-dark.svg';

  return (
    <div className="relative max-w-[370px] sm:max-w-[380px] mx-auto">
      {/* Side Hardware Buttons */}
      <div className="absolute -left-2.5 top-24 w-1 h-7 bg-slate-700 dark:bg-slate-800 rounded-l-md shadow-sm" />
      <div className="absolute -left-2.5 top-34 w-1 h-7 bg-slate-700 dark:bg-slate-800 rounded-l-md shadow-sm" />
      <div className="absolute -right-2.5 top-28 w-1 h-11 bg-slate-700 dark:bg-slate-800 rounded-r-md shadow-sm" />

      {/* Outer Smartphone Frame */}
      <div className="bg-slate-900 dark:bg-slate-950 p-3.5 rounded-[46px] shadow-2xl ring-1 ring-slate-900/20 dark:ring-slate-800 border border-slate-700/60 dark:border-slate-800 backdrop-blur-xl transition-all duration-300">
        
        {/* Dynamic Island / Top Camera Notch */}
        <div className="w-28 h-4 bg-black rounded-full mx-auto mb-3.5 flex items-center justify-center gap-2 border border-slate-800/80">
          <div className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
        </div>

        {/* Smartphone Screen Container */}
        <div className="bg-white dark:bg-[#0c101c] rounded-[34px] p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-inner flex flex-col space-y-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
          
          {/* Header Row: LuminaRail Logo | Toggle Pill | Action Icons */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Image
                src={logoSrc}
                alt="LuminaRail"
                width={26}
                height={26}
                className="w-6.5 h-6.5 object-contain"
              />
            </div>

            {/* Buy / Sell Toggle Pill */}
            <div className="bg-slate-100 dark:bg-slate-800/90 p-1 rounded-full flex items-center border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveTab('BUY')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'BUY'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Buy USDC
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SELL')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'SELL'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sell USDC
              </button>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <button type="button" className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Payment Rail Selector Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold self-start shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bank transfer</span>
          </div>

          {/* On-Ramp Swap Card Box */}
          <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 space-y-3.5 shadow-sm transition-all duration-200">
            
            {/* You Pay Section */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">You Pay</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-500">
                    {activeTab === 'BUY' ? 'NGN' : 'USDC'}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                    {activeTab === 'BUY' ? '250,000' : '100'}
                  </span>
                </div>
              </div>

              {/* Currency Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <span>{activeTab === 'BUY' ? '🇳🇬' : '⭐'}</span>
                <span>{activeTab === 'BUY' ? 'NGN' : 'USDC'}</span>
              </div>
            </div>

            <div className="border-b border-slate-100 dark:border-slate-800/80 my-1" />

            {/* You Receive Section */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">You Receive</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-500">
                    {activeTab === 'BUY' ? 'USDC' : 'NGN'}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-sans">
                    {activeTab === 'BUY' ? '158.42' : '157,800'}
                  </span>
                </div>
              </div>

              {/* Currency Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                {activeTab === 'BUY' ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">★</span>
                    <span>USDC</span>
                  </>
                ) : (
                  <>
                    <span>🇳🇬</span>
                    <span>NGN</span>
                  </>
                )}
              </div>
            </div>

            <div className="border-b border-slate-100 dark:border-slate-800/80 my-1" />

            {/* Exchange Rate & Refresh Countdown */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                1 USDC ≈ 1,578.00 NGN
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Updates in {countdown}s
              </span>
            </div>
          </div>

          {/* Estimated Fee Row */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <span>Estimated Fee</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <span>0.00 NGN</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Action CTA Button */}
          <Link
            href="/quotes"
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99] mt-1"
          >
            <span>Next: Specify your wallet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Footer Branding */}
          <div className="pt-1 text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 font-sans">
            <span>Powered by</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              LuminaRail
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
