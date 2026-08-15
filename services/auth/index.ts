import { ApiClient } from '@/lib/api';
import { UserProfile, LoginPayload, RegisterPayload, AuthResponseData } from '@/types/auth';
import { ApiResponse } from '@/types/api';

export class AuthService {
  public static async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return ApiClient.post<AuthResponseData, LoginPayload>('/auth/login', payload);
  }

  public static async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    return ApiClient.post<AuthResponseData, RegisterPayload>('/auth/register', payload);
  }

  public static async logout(token?: string): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post<{ message: string }>('/auth/logout', {}, token);
  }

  public static async getCurrentUser(token: string): Promise<ApiResponse<UserProfile>> {
    return ApiClient.get<UserProfile>('/users/me', token);
  }
}
