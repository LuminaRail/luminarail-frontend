import { ApiClient } from '@/lib/api';
import { Order, PaginatedOrdersResponse, CreateOrderInput } from '@/types/orders';
import { ApiResponse } from '@/types/api';

export class OrdersService {
  public static async getOrders(
    token?: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<PaginatedOrdersResponse>> {
    return ApiClient.get<PaginatedOrdersResponse>(
      `/orders?limit=${limit}&offset=${offset}`,
      token
    );
  }

  public static async getOrderById(
    id: string,
    token?: string
  ): Promise<ApiResponse<Order>> {
    return ApiClient.get<Order>(`/orders/${id}`, token);
  }

  public static async createOrder(
    payload: CreateOrderInput,
    token?: string,
    idempotencyKey?: string
  ): Promise<ApiResponse<Order>> {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
    return headers
      ? ApiClient.post<Order, CreateOrderInput>('/orders', payload, token, headers)
      : ApiClient.post<Order, CreateOrderInput>('/orders', payload, token);
  }

  public static async updateOrderWallet(
    orderId: string,
    walletAddress: string,
    token?: string
  ): Promise<ApiResponse<Order>> {
    return ApiClient.patch<Order, { walletAddress: string }>(
      `/orders/${orderId}/wallet`,
      { walletAddress },
      token
    );
  }
}
