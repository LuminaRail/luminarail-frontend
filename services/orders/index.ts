import { ApiClient } from '@/lib/api';
import { Order } from '@/types/orders';
import { ApiResponse } from '@/types/api';

export class OrdersService {
  public static async getOrders(token?: string): Promise<ApiResponse<Order[]>> {
    return ApiClient.get<Order[]>('/orders', token);
  }

  public static async createOrder(quoteId: string, token?: string): Promise<ApiResponse<Order>> {
    return ApiClient.post<Order, { quoteId: string }>('/orders', { quoteId }, token);
  }
}
