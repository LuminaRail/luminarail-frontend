import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';

export class StellarWalletService {
  public static async isFreighterAvailable(): Promise<boolean> {
    try {
      const result = await isConnected();
      return !!result.isConnected;
    } catch {
      return false;
    }
  }

  public static async connectWallet(): Promise<string | null> {
    try {
      const accessObj = await requestAccess();
      if (accessObj.address) {
        return accessObj.address;
      }
      const addrObj = await getAddress();
      return addrObj.address || null;
    } catch (error) {
      console.error('Freighter connection error:', error);
      return null;
    }
  }
}
