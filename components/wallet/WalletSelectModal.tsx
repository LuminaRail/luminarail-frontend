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

export function FreighterLogo({ className = "w-8 h-8 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#13141B"/>
      <path d="M20 7L31 15.5V24.5L20 33L9 24.5V15.5L20 7Z" fill="#3E1BDB"/>
      <path d="M20 12L27 17.5V22.5L20 28L13 22.5V17.5L20 12Z" fill="#00F094"/>
      <path d="M20 16L23.5 18.8V21.2L20 24L16.5 21.2V18.8L20 16Z" fill="#13141B"/>
    </svg>
  );
}

export function LobstrLogo({ className = "w-8 h-8 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1C75FF"/>
      <path d="M20 7C19.4 7 19 7.4 19 8V11C19 11.6 19.4 12 20 12C20.6 12 21 11.6 21 11V8C21 7.4 20.6 7 20 7Z" fill="white"/>
      <path d="M15.5 8.5C14.5 8 13.2 8.3 12.7 9.3C12.2 10.3 12.5 11.6 13.5 12.1L15.2 13C15.8 12.3 16.5 11.7 17.3 11.2L15.5 8.5Z" fill="white"/>
      <path d="M24.5 8.5L22.7 11.2C23.5 11.7 24.2 12.3 24.8 13L26.5 12.1C27.5 11.6 27.8 10.3 27.3 9.3C26.8 8.3 25.5 8 24.5 8.5Z" fill="white"/>
      <path d="M12.5 13.5C10 15 9 18 9.5 20.5C10 23 12 24.5 14.5 24.5C15.5 24.5 16.5 24.1 17.2 23.4L15.5 21.7C15.1 22.1 14.5 22.3 13.9 22.2C12.5 22 11.3 20.8 11.1 19.4C10.8 17.6 11.8 15.6 13.5 14.6L12.5 13.5Z" fill="white"/>
      <path d="M27.5 13.5L26.5 14.6C28.2 15.6 29.2 17.6 28.9 19.4C28.7 20.8 27.5 22 26.1 22.2C25.5 22.3 24.9 22.1 24.5 21.7L22.8 23.4C23.5 24.1 24.5 24.5 25.5 24.5C28 24.5 30 23 30.5 20.5C31 18 30 15 27.5 13.5Z" fill="white"/>
      <path d="M20 12.5C17.5 12.5 15.5 14.5 15.5 17C15.5 19.2 17 21 19 21.4V29C19 29.6 19.4 30 20 30C20.6 30 21 29.6 21 29V21.4C23 21 24.5 19.2 24.5 17C24.5 14.5 22.5 12.5 20 12.5ZM20 19.5C18.6 19.5 17.5 18.4 17.5 17C17.5 15.6 18.6 14.5 20 14.5C21.4 14.5 22.5 15.6 22.5 17C22.5 18.4 21.4 19.5 20 19.5Z" fill="white"/>
      <circle cx="20" cy="17" r="1.5" fill="#1C75FF"/>
    </svg>
  );
}

export function WalletConnectLogo({ className = "w-8 h-8 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#3B99FC"/>
      <path d="M12.5 16.5C16.6 12.4 23.4 12.4 27.5 16.5L28 17C28.2 17.2 28.2 17.5 28 17.7L25.9 19.8C25.8 19.9 25.6 19.9 25.5 19.8L24.8 19.1C22.1 16.4 17.9 16.4 15.2 19.1L14.4 19.9C14.3 20 14.1 20 14 19.9L11.9 17.8C11.7 17.6 11.7 17.3 11.9 17.1L12.5 16.5ZM31 20L32.9 21.9C33.1 22.1 33.1 22.4 32.9 22.6L24.4 31.1C24.2 31.3 23.9 31.3 23.7 31.1L19.9 27.3C19.9 27.3 19.9 27.3 19.8 27.3L16.2 30.9C16 31.1 15.7 31.1 15.5 30.9L7.1 22.5C6.9 22.3 6.9 22 7.1 21.8L9 19.9C9.2 19.7 9.5 19.7 9.7 19.9L15.9 26.1C16 26.2 16.1 26.2 16.2 26.1L19.8 22.5C19.9 22.4 20 22.4 20.1 22.5L23.7 26.1C23.8 26.2 23.9 26.2 24 26.1L30.3 19.8C30.5 19.6 30.8 19.6 31 20Z" fill="white"/>
    </svg>
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
