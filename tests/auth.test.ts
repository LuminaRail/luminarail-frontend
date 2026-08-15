import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/auth';
import { ApiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  ApiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Frontend AuthService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls ApiClient.post with /auth/login and payload', async () => {
    const mockResponse = {
      status: 'success',
      success: true,
      data: {
        user: { id: 'usr_123', email: 'test@example.com', role: 'USER', isKycVerified: false },
        token: 'mock_jwt_token',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const payload = { email: 'test@example.com', password: 'Password123!' };
    const res = await AuthService.login(payload);

    expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(res).toEqual(mockResponse);
  });

  it('register calls ApiClient.post with /auth/register and payload', async () => {
    const mockResponse = {
      status: 'success',
      success: true,
      data: {
        user: { id: 'usr_124', email: 'new@example.com', role: 'MERCHANT', isKycVerified: false },
        token: 'mock_jwt_token_2',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const payload = { email: 'new@example.com', password: 'Password123!', role: 'MERCHANT' as const };
    const res = await AuthService.register(payload);

    expect(ApiClient.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(res).toEqual(mockResponse);
  });

  it('getCurrentUser calls ApiClient.get with /users/me and authorization token', async () => {
    const mockResponse = {
      status: 'success',
      success: true,
      data: { id: 'usr_123', email: 'test@example.com', role: 'USER', isKycVerified: true },
    };

    (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const token = 'active_jwt_token';
    const res = await AuthService.getCurrentUser(token);

    expect(ApiClient.get).toHaveBeenCalledWith('/users/me', token);
    expect(res).toEqual(mockResponse);
  });

  it('logout calls ApiClient.post with /auth/logout', async () => {
    const mockResponse = {
      status: 'success',
      success: true,
      data: { message: 'Logged out successfully.' },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const token = 'active_jwt_token';
    await AuthService.logout(token);

    expect(ApiClient.post).toHaveBeenCalledWith('/auth/logout', {}, token);
  });
});
