'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { truncateAddress } from '@/lib/utils';
import { WalletSelectModal, FreighterLogo, LobstrLogo, WalletConnectLogo } from './WalletSelectModal';
import { Wallet, LogOut } from 'lucide-react';
import { StellarWalletType } from '@/types/wallets';

export function WalletConnectButton() {
  const {
    publicKey,
    isConnected,
    walletType,
    isFreighterAvailable,
    isLobstrAvailable,
    isWalletConnectAvailable,
    loading,
    error,
    connect,
    disconnect,
    clearError,
  } = useStellarWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    clearError();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    clearError();
    setIsModalOpen(false);
  };

  const handleSelectWallet = async (type: StellarWalletType) => {
    const connectedAddress = await connect(type);
    if (connectedAddress) {
      setIsModalOpen(false);
    }
  };

  const renderWalletLogo = (type: StellarWalletType) => {
    switch (type) {
      case 'lobstr':
        return <LobstrLogo className="w-4 h-4 rounded-full shrink-0" />;
      case 'walletconnect':
        return <WalletConnectLogo className="w-4 h-4 rounded-full shrink-0" />;
      case 'freighter':
      default:
        return <FreighterLogo className="w-4 h-4 rounded-full shrink-0" />;
    }
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 bg-slate-100/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-mono tracking-tight shadow-xs whitespace-nowrap shrink-0">
        {renderWalletLogo(walletType)}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
          {truncateAddress(publicKey)}
        </span>
        <span className="text-[9px] uppercase font-sans font-medium px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/50">
          {walletType || 'Stellar'}
        </span>
        <button
          onClick={disconnect}
          title="Disconnect Wallet"
          className="ml-0.5 p-1 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className="inline-flex items-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-full text-xs font-semibold tracking-wide transition-all duration-150 shadow-sm active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
      >
        <Wallet className="w-3.5 h-3.5 text-emerald-100" />
        <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      <WalletSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectWallet={handleSelectWallet}
        isFreighterAvailable={isFreighterAvailable}
        isLobstrAvailable={isLobstrAvailable}
        isWalletConnectAvailable={isWalletConnectAvailable}
        loading={loading}
        error={error}
      />
    </>
  );
}
