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

  private static async processResponse<T>(res: Response): Promise<ApiResponse<T>> {
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    const isOk = res.ok;
    const isSuccess = body
      ? body.success === true || body.status === 'success' || (isOk && body.success !== false && body.status !== 'error')
      : isOk;

    if (isOk && isSuccess && body) {
      const data = body.data !== undefined ? body.data : body;
      return {
        status: 'success',
        success: true,
        data: data as T,
        message: body.message,
      };
    }

    let message = 'An unexpected error occurred.';
    let code: string | undefined;

    if (body) {
      if (typeof body.error === 'object' && body.error !== null) {
        message = body.error.message || message;
        code = body.error.code;
      } else if (typeof body.error === 'string') {
        message = body.error;
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } else {
      message = `Request failed with HTTP status ${res.status}`;
    }

    return {
      status: 'error',
      success: false,
      message,
      code,
      error: body?.error,
    };
  }

  public static async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      return await this.processResponse<T>(res);
    } catch (error) {
      return {
        status: 'error',
        success: false,
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
      return await this.processResponse<T>(res);
    } catch (error) {
      return {
        status: 'error',
        success: false,
        message: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  public static async patch<T, B = unknown>(endpoint: string, body: B, token?: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify(body),
      });
      return await this.processResponse<T>(res);
    } catch (error) {
      return {
        status: 'error',
        success: false,
        message: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }
}
