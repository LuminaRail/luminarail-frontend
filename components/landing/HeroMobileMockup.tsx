'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, MoreVertical, Info, ChevronDown } from 'lucide-react';
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

  return (
    <div className="relative max-w-[360px] sm:max-w-[380px] w-full mx-auto pt-2">
      {/* Hardware Buttons (iPhone Side Buttons) */}
      <div className="absolute -left-1.5 top-28 w-1.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-l-md shadow-xs" />
      <div className="absolute -left-1.5 top-40 w-1.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-l-md shadow-xs" />
      <div className="absolute -right-1.5 top-32 w-1.5 h-12 bg-slate-300 dark:bg-slate-700 rounded-r-md shadow-xs" />

      {/* iPhone Outer Body Chassis (White / Metallic Finish matching reference photo) */}
      <div className="bg-white dark:bg-[#0d121f] p-3.5 sm:p-4 rounded-t-[54px] rounded-b-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] ring-1 ring-slate-200/90 dark:ring-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        
        {/* iPhone Dynamic Island Notch */}
        <div className="w-28 h-5 bg-black rounded-full mx-auto mt-0.5 mb-3.5 flex items-center justify-center gap-2 border border-slate-900 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-[#111116] ring-1 ring-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]" />
        </div>

        {/* iPhone Retina Display Screen Container */}
        <div className="bg-white text-slate-900 rounded-[38px] p-6 shadow-inner flex flex-col space-y-5 font-sans border border-slate-100">
          
          {/* Top App Bar: Logo | Buy/Sell Switcher | Menu & Help */}
          <div className="flex items-center justify-between gap-1 pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Image
                src="/brand/luminarail-icon.svg"
                alt="LuminaRail"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
            </div>

            {/* Buy / Sell Tab Switcher */}
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('BUY')}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'BUY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buy USDC
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SELL')}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'SELL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sell USDC
              </button>
            </div>

            {/* Help & Menu Icons */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <button type="button" className="p-1 hover:text-slate-600 transition-colors">
                <HelpCircle className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              </button>
              <button type="button" className="p-1 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              </button>
            </div>
          </div>

          {/* Payment Method Selector Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-600 text-emerald-700 bg-emerald-50/40 text-[11px] font-medium self-start">
            <span>Bank transfer</span>
          </div>

          {/* On-Ramp Swap Card Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
            
            {/* You Pay Row */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">You Pay</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-500">
                    {activeTab === 'BUY' ? 'NGN' : 'USDC'}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                    {activeTab === 'BUY' ? '28960' : '20'}
                  </span>
                </div>
              </div>

              {/* Currency Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
                <span>{activeTab === 'BUY' ? '🇳🇬' : '⭐'}</span>
                <span>{activeTab === 'BUY' ? 'NGN' : 'USDC'}</span>
              </div>
            </div>

            <div className="border-b border-slate-100 my-1" />

            {/* You Receive Row */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">You Receive</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-500">
                    {activeTab === 'BUY' ? 'USDC' : 'NGN'}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                    {activeTab === 'BUY' ? '20' : '28960'}
                  </span>
                </div>
              </div>

              {/* Currency Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
                {activeTab === 'BUY' ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">★</span>
                    <span>STELLAR</span>
                  </>
                ) : (
                  <>
                    <span>🇳🇬</span>
                    <span>NGN</span>
                  </>
                )}
              </div>
            </div>

            <div className="border-b border-slate-100 my-1" />

            {/* Exchange Rate & Refresh Countdown */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="font-bold text-slate-900">
                1 USDC ≈ 1411.50 NGN
              </span>
              <span className="text-emerald-600 font-medium text-[10px]">
                Updates in <span className="font-bold">{countdown}s</span>
              </span>
            </div>
          </div>

          {/* Estimated Fee Row */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span>Estimated Fee</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-1 font-bold text-slate-900 text-[11px]">
              <span>0.52 USDC</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Primary Action Button (Solid iPhone Dark Button) */}
          <Link
            href="/quotes"
            className="w-full py-3.5 px-4 bg-[#18181b] hover:bg-[#27272a] text-white font-semibold text-xs rounded-2xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99] mt-2 text-center"
          >
            <span>Next: Specify your wallet</span>
          </Link>

          {/* Footer Branding */}
          <div className="pt-1 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 font-sans">
            <span>Powered by</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              luminarail
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
