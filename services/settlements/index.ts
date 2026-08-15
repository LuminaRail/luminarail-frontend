import { ApiClient } from '@/lib/api';
import { Settlement } from '@/types/orders';
import { ApiResponse } from '@/types/api';

export class SettlementsService {
  public static async getSettlementByOrder(
    orderId: string,
    token?: string
  ): Promise<ApiResponse<Settlement>> {
    return ApiClient.get<Settlement>(`/settlements/order/${orderId}`, token);
  }

  public static async getSettlementById(
    id: string,
    token?: string
  ): Promise<ApiResponse<Settlement>> {
    return ApiClient.get<Settlement>(`/settlements/${id}`, token);
  }
}
