import { ApiClient } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export class WalletsService {
  public static async registerStellarPublicKey(publicKey: string, token?: string): Promise<ApiResponse<{ registered: boolean }>> {
    return ApiClient.post<{ registered: boolean }, { stellarPublicKey: string }>(
      '/wallets',
      { stellarPublicKey: publicKey },
      token
    );
  }
}
