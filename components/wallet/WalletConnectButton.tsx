'use client';

import { useStellarWallet } from '@/hooks/useStellarWallet';
import { truncateAddress } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export function WalletConnectButton() {
  const { publicKey, isConnected, connect, disconnect } = useStellarWallet();

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-100 rounded-lg border border-slate-700 text-sm font-mono">
        <Wallet className="w-4 h-4 text-emerald-400" />
        <span>{truncateAddress(publicKey)}</span>
        <button
          onClick={disconnect}
          className="ml-2 text-xs text-slate-400 hover:text-rose-400 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Stellar Wallet</span>
    </button>
  );
}
