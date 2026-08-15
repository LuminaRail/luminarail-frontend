'use client';

import { useState, useCallback, useEffect } from 'react';
import { StellarWalletService } from '@/lib/stellar';
import { StellarWalletState, StellarWalletType, SignTransactionOptions } from '@/types/wallets';

export function useStellarWallet() {
  const [walletState, setWalletState] = useState<StellarWalletState>({
    publicKey: null,
    isConnected: false,
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    walletType: null,
    isFreighterAvailable: false,
    isLobstrAvailable: false,
    isWalletConnectAvailable: false,
    loading: false,
    error: null,
  });

  // Check extension availability and restore active session on mount
  useEffect(() => {
    async function checkAvailability() {
      const isFreighter = await StellarWalletService.isFreighterAvailable();
      const isLobstr = await StellarWalletService.isLobstrAvailable();
      const isWc = StellarWalletService.isWalletConnectConfigured();

      setWalletState((prev) => ({
        ...prev,
        isFreighterAvailable: isFreighter,
        isLobstrAvailable: isLobstr,
        isWalletConnectAvailable: isWc,
      }));

      // Restore session if present
      if (typeof window !== 'undefined') {
        const storedAddress = localStorage.getItem('luminarail_wallet_address');
        const storedType = localStorage.getItem('luminarail_wallet_type') as StellarWalletType;

        if (storedAddress && storedType) {
          setWalletState((prev) => ({
            ...prev,
            publicKey: storedAddress,
            walletType: storedType,
            isConnected: true,
          }));
        }
      }
    }

    checkAvailability();
  }, []);

  const connect = useCallback(async (targetWalletType: StellarWalletType = 'freighter') => {
    if (!targetWalletType) return null;

    setWalletState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await StellarWalletService.connect(targetWalletType);

      if (result && result.publicKey) {
        setWalletState((prev) => ({
          ...prev,
          publicKey: result.publicKey,
          walletType: result.walletType,
          isConnected: true,
          loading: false,
          error: null,
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem('luminarail_wallet_address', result.publicKey);
          localStorage.setItem('luminarail_wallet_type', result.walletType || '');
        }

        return result.publicKey;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect wallet.';
      setWalletState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState((prev) => ({
      ...prev,
      publicKey: null,
      walletType: null,
      isConnected: false,
      error: null,
    }));

    if (typeof window !== 'undefined') {
      localStorage.removeItem('luminarail_wallet_address');
      localStorage.removeItem('luminarail_wallet_type');
    }
  }, []);

  const signTransaction = useCallback(
    async (xdr: string, options?: SignTransactionOptions) => {
      if (!walletState.walletType) {
        throw new Error('No Stellar wallet is currently connected.');
      }
      return StellarWalletService.signTransaction(xdr, walletState.walletType, options);
    },
    [walletState.walletType]
  );

  const clearError = useCallback(() => {
    setWalletState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...walletState,
    connect,
    disconnect,
    signTransaction,
    clearError,
  };
}
