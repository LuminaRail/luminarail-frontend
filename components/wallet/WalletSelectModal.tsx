'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { StellarWalletType } from '@/types/wallets';
import { X, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface WalletSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: StellarWalletType) => void;
  isFreighterAvailable: boolean;
  isLobstrAvailable: boolean;
  isWalletConnectAvailable: boolean;
  loading: boolean;
  error: string | null;
}

export function FreighterLogo({ className = "w-9 h-9 rounded-lg shrink-0 object-cover" }: { className?: string }) {
  return (
    <img
      src="/brand/freighter-logo.png"
      alt="Freighter Wallet"
      className={className}
    />
  );
}

export function LobstrLogo({ className = "w-9 h-9 rounded-lg shrink-0 object-cover" }: { className?: string }) {
  return (
    <img
      src="/brand/lobstr-logo.png"
      alt="LOBSTR Wallet"
      className={className}
    />
  );
}

export function WalletConnectLogo({ className = "w-9 h-9 rounded-lg shrink-0 object-cover" }: { className?: string }) {
  return (
    <img
      src="/brand/walletconnect-logo.png"
      alt="WalletConnect"
      className={className}
    />
  );
}

export function WalletSelectModal({
  isOpen,
  onClose,
  onSelectWallet,
  isFreighterAvailable,
  isLobstrAvailable,
  isWalletConnectAvailable,
  loading,
  error,
}: WalletSelectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on ESC key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#101311] border border-[#E5E8E4] dark:border-[#222722] rounded-xl shadow-2xl p-6 sm:p-7 space-y-6 text-[#111411] dark:text-[#F5F7F5] font-sans transition-all duration-200 transform scale-100"
      >
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h2 id="wallet-modal-title" className="text-xl font-bold tracking-tight text-[#111411] dark:text-[#F5F7F5]">
              Connect your wallet
            </h2>
            <p className="text-xs text-[#6B716B] dark:text-[#929992] mt-1">
              Choose a Stellar wallet to continue.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#6B716B] dark:text-[#929992] hover:text-[#111411] dark:hover:text-[#F5F7F5] rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3.5 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="space-y-3">
          {/* Option 1: Freighter */}
          <button
            onClick={() => onSelectWallet('freighter')}
            disabled={loading}
            className="w-full p-4 rounded-lg border border-[#E5E8E4] dark:border-[#222722] bg-[#F7F8F6] dark:bg-[#080A09] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <FreighterLogo className="w-9 h-9 rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111411] dark:text-[#F5F7F5] flex items-center gap-2">
                  <span>Freighter</span>
                  {isFreighterAvailable ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                      Installed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#6B716B] dark:text-[#929992] font-medium">
                      Browser Wallet
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6B716B] dark:text-[#929992] truncate">
                  Official Stellar browser extension
                </div>
              </div>
            </div>
            {loading ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#6B716B] dark:text-[#929992] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            )}
          </button>

          {/* Option 2: LOBSTR */}
          <button
            onClick={() => onSelectWallet('lobstr')}
            disabled={loading}
            className="w-full p-4 rounded-lg border border-[#E5E8E4] dark:border-[#222722] bg-[#F7F8F6] dark:bg-[#080A09] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <LobstrLogo className="w-9 h-9 rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111411] dark:text-[#F5F7F5] flex items-center gap-2">
                  <span>LOBSTR</span>
                  {isLobstrAvailable ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                      Installed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#6B716B] dark:text-[#929992] font-medium">
                      Extension & Mobile
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6B716B] dark:text-[#929992] truncate">
                  LOBSTR Signer Extension & Mobile Wallet
                </div>
              </div>
            </div>
            {loading ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#6B716B] dark:text-[#929992] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            )}
          </button>

          {/* Option 3: WalletConnect */}
          <button
            onClick={() => onSelectWallet('walletconnect')}
            disabled={loading}
            className="w-full p-4 rounded-lg border border-[#E5E8E4] dark:border-[#222722] bg-[#F7F8F6] dark:bg-[#080A09] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <WalletConnectLogo className="w-9 h-9 rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111411] dark:text-[#F5F7F5] flex items-center gap-2">
                  <span>WalletConnect</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#6B716B] dark:text-[#929992] font-medium">
                    {isWalletConnectAvailable ? 'Configured' : 'Configuration required'}
                  </span>
                </div>
                <div className="text-xs text-[#6B716B] dark:text-[#929992] truncate">
                  Connect a compatible mobile wallet
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6B716B] dark:text-[#929992] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6B716B] dark:text-[#929992] hover:text-[#111411] dark:hover:text-[#F5F7F5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
