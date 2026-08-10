'use client';

import { useState, useCallback } from 'react';
import { StellarWalletService } from '@/lib/stellar';
import { StellarWalletState } from '@/types/wallets';

export function useStellarWallet() {
  const [walletState, setWalletState] = useState<StellarWalletState>({
    publicKey: null,
    isConnected: false,
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    isFreighterAvailable: false,
  });

  const connect = useCallback(async () => {
    const address = await StellarWalletService.connectWallet();
    if (address) {
      setWalletState((prev) => ({
        ...prev,
        publicKey: address,
        isConnected: true,
      }));
    }
    return address;
  }, []);

  const disconnect = useCallback(() => {
    setWalletState((prev) => ({
      ...prev,
      publicKey: null,
      isConnected: false,
    }));
  }, []);

  return {
    ...walletState,
    connect,
    disconnect,
  };
}
