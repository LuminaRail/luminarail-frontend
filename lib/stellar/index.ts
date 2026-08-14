import { isConnected as checkFreighterConnected, requestAccess as requestFreighterAccess, getAddress as getFreighterAddress, signTransaction as freighterSignTransaction } from '@stellar/freighter-api';
import lobstrExtensionApi, { isBrowser as isLobstrBrowser } from '@lobstrco/signer-extension-api';
import { StellarWalletType, SignTransactionOptions } from '@/types/wallets';

// Intercept window postMessage responses from LOBSTR Signer Extension
// Fixes SDK v2.1.0 bug where request sends messageId but listener looks for messagedId
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (
      event?.data &&
      event.data.source === 'LOBSTR_EXTERNAL_MSG_RESPONSE'
    ) {
      console.log('[LOBSTR] Window message intercepted:', event.data);
      if (event.data.messageId !== undefined && event.data.messagedId === undefined) {
        event.data.messagedId = event.data.messageId;
      }
    }
  }, true);
}

export class StellarWalletService {
  /**
   * Check if Freighter extension is available in browser
   */
  public static async isFreighterAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ((window as any).freighter) return true;
      const res = await checkFreighterConnected();
      return !!res?.isConnected;
    } catch (err) {
      console.log('[Freighter] Availability check failed:', err);
      return false;
    }
  }

  /**
   * Check if LOBSTR Signer Extension is available in browser using official API
   */
  public static async isLobstrAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const isBrowser = typeof isLobstrBrowser === 'function'
        ? (isLobstrBrowser as any)()
        : (isLobstrBrowser ?? (typeof window !== 'undefined'));

      if (!isBrowser) return false;
      const connected = await lobstrExtensionApi.isConnected();
      return !!connected;
    } catch (err) {
      console.log('[LOBSTR] Availability check failed:', err);
      return false;
    }
  }

  /**
   * Check if WalletConnect environment configuration is present
   */
  public static isWalletConnectConfigured(): boolean {
    if (typeof window === 'undefined') return false;
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    return !!(projectId && projectId.trim().length > 0);
  }

  /**
   * Connect to specified wallet and retrieve real public address
   */
  public static async connect(walletType: StellarWalletType): Promise<{ publicKey: string; walletType: StellarWalletType }> {
    if (typeof window === 'undefined') {
      throw new Error('Wallet connection is only available in the browser.');
    }

    if (!walletType) {
      throw new Error('Please select a Stellar wallet to connect.');
    }

    // ----------------------------------------------------
    // FREIGHTER CONNECTION FLOW
    // ----------------------------------------------------
    if (walletType === 'freighter') {
      console.log('[Freighter] connect clicked');
      const isAvailable = await this.isFreighterAvailable();
      console.log('[Freighter] API available:', isAvailable);

      if (!isAvailable) {
        throw new Error('Freighter is not detected. Please install Freighter browser extension and try again.');
      }

      try {
        console.log('[Freighter] requesting public key...');
        const accessObj = await requestFreighterAccess();
        let addr = accessObj?.address;
        if (!addr) {
          const addrObj = await getFreighterAddress();
          addr = addrObj?.address;
        }

        console.log('[Freighter] response received:', addr ? `${addr.substring(0, 6)}...` : 'empty');

        if (!addr || typeof addr !== 'string' || !addr.startsWith('G') || addr.length !== 56) {
          throw new Error('Connection was rejected in your wallet.');
        }

        return { publicKey: addr, walletType: 'freighter' };
      } catch (err: any) {
        console.error('[Freighter] connection error:', err);
        if (err?.message?.includes('User rejected') || err?.message?.includes('declined') || err?.message?.includes('Cancel')) {
          throw new Error('Connection was rejected in your wallet.');
        }
        throw new Error(err?.message || 'Freighter connection failed.');
      }
    }

    // ----------------------------------------------------
    // LOBSTR CONNECTION FLOW (Official API)
    // ----------------------------------------------------
    if (walletType === 'lobstr') {
      console.log('[LOBSTR] connect clicked');

      const isBrowser = typeof isLobstrBrowser === 'function'
        ? (isLobstrBrowser as any)()
        : (isLobstrBrowser ?? (typeof window !== 'undefined'));
      console.log('[LOBSTR] isBrowser:', isBrowser);

      if (!isBrowser) {
        throw new Error('LOBSTR Signer Extension is not available in this browser.');
      }

      let connected = false;
      try {
        connected = await lobstrExtensionApi.isConnected();
      } catch (err) {
        console.error('[LOBSTR] isConnected check error:', err);
      }
      console.log('[LOBSTR] isConnected:', connected);

      try {
        console.log('[LOBSTR] requesting public key');

        // Wrap getPublicKey with a 15s timeout to prevent infinite UI hanging
        const getPublicKeyPromise = lobstrExtensionApi.getPublicKey();
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('LOBSTR connection request timed out. Please open/unlock your LOBSTR extension and try again.')), 15000);
        });

        const publicKey = await Promise.race([getPublicKeyPromise, timeoutPromise]);
        console.log('[LOBSTR] public key result:', publicKey);

        if (!publicKey || typeof publicKey !== 'string' || publicKey.trim().length === 0) {
          throw new Error('LOBSTR connection failed or was rejected. No Stellar address returned.');
        }

        const trimmedKey = publicKey.trim();
        if (!trimmedKey.startsWith('G') || trimmedKey.length !== 56) {
          throw new Error('Invalid Stellar public key format returned by LOBSTR.');
        }

        return { publicKey: trimmedKey, walletType: 'lobstr' };
      } catch (err: any) {
        console.error('[LOBSTR] connection error:', err);
        if (typeof err === 'string' && (err.includes('rejected') || err.includes('declined') || err.includes('Cancel'))) {
          throw new Error('Connection was rejected in your wallet.');
        }
        if (err?.message?.includes('User rejected') || err?.message?.includes('declined') || err?.message?.includes('Cancel')) {
          throw new Error('Connection was rejected in your wallet.');
        }
        throw new Error(typeof err === 'string' ? err : err?.message || 'LOBSTR connection failed.');
      }
    }

    // ----------------------------------------------------
    // WALLETCONNECT CONNECTION FLOW
    // ----------------------------------------------------
    if (walletType === 'walletconnect') {
      console.log('[WalletConnect] connect clicked');
      const configured = this.isWalletConnectConfigured();
      if (!configured) {
        throw new Error('WalletConnect configuration required. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to environment variables.');
      }

      throw new Error('WalletConnect project ID configured, but initialization requires browser QR session.');
    }

    throw new Error('Unsupported Stellar wallet type.');
  }

  /**
   * Sign transaction XDR using active wallet
   */
  public static async signTransaction(
    xdr: string,
    walletType: StellarWalletType,
    options?: SignTransactionOptions
  ): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Transaction signing is only available in the browser.');
    }

    if (!xdr) {
      throw new Error('Transaction XDR is required for signing.');
    }

    // ----------------------------------------------------
    // FREIGHTER TRANSACTION SIGNING
    // ----------------------------------------------------
    if (walletType === 'freighter') {
      try {
        const signResult = await freighterSignTransaction(xdr, {
          networkPassphrase: options?.networkPassphrase,
        } as any);

        const signedXdr = typeof signResult === 'string'
          ? signResult
          : (signResult as any)?.signedTxXdr || (signResult as any)?.signedXdr;

        if (!signedXdr) {
          throw new Error('Transaction signing was rejected by user.');
        }
        return signedXdr;
      } catch (err: any) {
        if (err?.message?.includes('User rejected') || err?.message?.includes('declined') || err?.message?.includes('Cancel')) {
          throw new Error('Transaction signing was rejected by user.');
        }
        throw new Error(err?.message || 'Freighter transaction signing failed.');
      }
    }

    // ----------------------------------------------------
    // LOBSTR TRANSACTION SIGNING
    // ----------------------------------------------------
    if (walletType === 'lobstr') {
      try {
        console.log('[LOBSTR] signing transaction XDR...');
        const signedXdr = await lobstrExtensionApi.signTransaction(xdr);
        console.log('[LOBSTR] transaction signed successfully');

        if (!signedXdr) {
          throw new Error('Transaction signing was rejected by user.');
        }
        return signedXdr;
      } catch (err: any) {
        console.error('[LOBSTR] transaction signing error:', err);
        if (typeof err === 'string' && (err.includes('rejected') || err.includes('declined') || err.includes('Cancel'))) {
          throw new Error('Transaction signing was rejected by user.');
        }
        if (err?.message?.includes('User rejected') || err?.message?.includes('declined') || err?.message?.includes('Cancel')) {
          throw new Error('Transaction signing was rejected by user.');
        }
        throw new Error(typeof err === 'string' ? err : err?.message || 'LOBSTR transaction signing failed.');
      }
    }

    throw new Error('Selected wallet does not support transaction signing.');
  }
}

