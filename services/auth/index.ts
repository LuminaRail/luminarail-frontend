import { ApiClient } from '@/lib/api';
import { UserProfile } from '@/types/auth';
import { ApiResponse } from '@/types/api';

export class AuthService {
  public static async getCurrentUser(token: string): Promise<ApiResponse<UserProfile>> {
    return ApiClient.get<UserProfile>('/users/me', token);
  }
}
