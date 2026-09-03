import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../lib/api/index';

describe('ApiClient Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should send GET request with Authorization header when token is provided', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { rate: 1500 } }),
    } as Response;

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await ApiClient.get<{ rate: number }>('/quotes/current', 'test-jwt-token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/quotes/current'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-jwt-token',
        }),
      })
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ rate: 1500 });
  });

  it('should send POST request with body and return error status on API error response', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Amount must be positive' },
      }),
    } as Response;

    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await ApiClient.post('/orders', { amount: -10 });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Amount must be positive');
    expect(result.code).toBe('INVALID_INPUT');
  });

  it('should handle network failure gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network connection timeout'));

    const result = await ApiClient.get('/health');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network connection timeout');
  });
});
