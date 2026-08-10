export interface StellarWalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: string;
  isFreighterAvailable: boolean;
}
