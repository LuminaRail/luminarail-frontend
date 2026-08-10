import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  private static getHeaders(authToken?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  public static async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      return await res.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  public static async post<T, B = unknown>(endpoint: string, body: B, token?: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }
}
