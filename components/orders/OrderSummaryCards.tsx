'use client';

import React from 'react';
import { OrderStats } from '@/hooks/useOrders';
import { Layers, Clock, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

interface OrderSummaryCardsProps {
  stats: OrderStats;
}

export function OrderSummaryCards({ stats }: OrderSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {/* Total Orders */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-slate-100">{stats.totalOrders}</div>
        <div className="text-[10px] text-slate-500 mt-1">All-time settlement history</div>
      </div>

      {/* Pending */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-amber-400">{stats.pendingCount}</div>
        <div className="text-[10px] text-slate-500 mt-1">Awaiting payment detection</div>
      </div>

      {/* Processing */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all hover:border-sky-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processing</span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-sky-400">{stats.processingCount}</div>
        <div className="text-[10px] text-slate-500 mt-1">Soroban/Stellar executing</div>
      </div>

      {/* Completed */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-emerald-400">{stats.completedCount}</div>
        <div className="text-[10px] text-slate-500 mt-1">Successfully settled on-chain</div>
      </div>

      {/* Failed */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all hover:border-rose-500/40 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed / Cancelled</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-rose-400">{stats.failedCount}</div>
        <div className="text-[10px] text-slate-500 mt-1">Requires review or refund</div>
      </div>
    </div>
  );
}
