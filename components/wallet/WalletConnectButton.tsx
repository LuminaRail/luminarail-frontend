'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { truncateAddress } from '@/lib/utils';
import { WalletSelectModal, FreighterLogo, LobstrLogo, WalletConnectLogo } from './WalletSelectModal';
import { Wallet } from 'lucide-react';
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
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#101311] text-[#111411] dark:text-[#F5F7F5] rounded-md border border-[#E5E8E4] dark:border-[#222722] text-xs font-mono tracking-tight shadow-xs">
        {renderWalletLogo(walletType)}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {truncateAddress(publicKey)}
        </span>
        <span className="text-[10px] uppercase font-sans font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#6B716B] dark:text-[#929992]">
          {walletType || 'Stellar'}
        </span>
        <button
          onClick={disconnect}
          className="ml-1 text-[11px] text-[#6B716B] dark:text-[#929992] hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-wider font-sans font-medium cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-md text-xs font-semibold tracking-wide transition-all duration-150 shadow-sm active:scale-[0.99] cursor-pointer"
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
