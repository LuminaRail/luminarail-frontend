import { ApiClient } from '@/lib/api';
import { Payment, CreatePaymentInput } from '@/types/orders';
import { ApiResponse } from '@/types/api';

export class PaymentsService {
  public static async createPayment(
    payload: CreatePaymentInput,
    token?: string,
    idempotencyKey?: string
  ): Promise<ApiResponse<Payment>> {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
    return headers
      ? ApiClient.post<Payment, CreatePaymentInput>('/payments', payload, token, headers)
      : ApiClient.post<Payment, CreatePaymentInput>('/payments', payload, token);
  }

  public static async getPayment(
    id: string,
    token?: string
  ): Promise<ApiResponse<Payment>> {
    return ApiClient.get<Payment>(`/payments/${id}`, token);
  }

  public static async verifyPayment(
    id: string,
    params: Record<string, unknown> = {},
    token?: string
  ): Promise<ApiResponse<Payment>> {
    return ApiClient.post<Payment, Record<string, unknown>>(
      `/payments/${id}/verify`,
      params,
      token
    );
  }
}
