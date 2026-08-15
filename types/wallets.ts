export type StellarWalletType = 'freighter' | 'lobstr' | 'walletconnect' | null;

export interface StellarWalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: string;
  walletType: StellarWalletType;
  isFreighterAvailable: boolean;
  isLobstrAvailable: boolean;
  isWalletConnectAvailable: boolean;
  loading: boolean;
  error: string | null;
}

export interface SignTransactionOptions {
  network?: string;
  networkPassphrase?: string;
}
