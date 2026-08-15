import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdersService } from '../services/orders';
import { PaymentsService } from '../services/payments';
import { SettlementsService } from '../services/settlements';
import { ApiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  ApiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Frontend Orders, Payments & Settlements Services Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OrdersService.getOrders calls ApiClient.get with correct query params', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        orders: [
          {
            id: 'ord_1',
            userId: 'usr_1',
            quoteId: 'q_1',
            type: 'ON_RAMP',
            status: 'CREATED',
            sourceCurrency: 'NGN',
            destinationAsset: 'USDC',
            sourceAmount: '100000',
            destinationAmount: '66',
            createdAt: '2026-08-15T10:00:00Z',
            updatedAt: '2026-08-15T10:00:00Z',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      },
    };

    (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await OrdersService.getOrders('mock_token', 50, 0);

    expect(ApiClient.get).toHaveBeenCalledWith('/orders?limit=50&offset=0', 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('OrdersService.getOrderById calls ApiClient.get with /orders/:id', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'ord_123',
        userId: 'usr_1',
        quoteId: 'q_1',
        type: 'ON_RAMP',
        status: 'SETTLEMENT_PENDING',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: '100000',
        destinationAmount: '66',
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
    };

    (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await OrdersService.getOrderById('ord_123', 'mock_token');

    expect(ApiClient.get).toHaveBeenCalledWith('/orders/ord_123', 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('OrdersService.createOrder calls ApiClient.post with /orders and payload', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'ord_new',
        userId: 'usr_1',
        quoteId: 'q_99',
        type: 'ON_RAMP',
        status: 'CREATED',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: '50000',
        destinationAmount: '33',
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const payload = { quoteId: 'q_99', type: 'ON_RAMP' as const };
    const res = await OrdersService.createOrder(payload, 'mock_token');

    expect(ApiClient.post).toHaveBeenCalledWith('/orders', payload, 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('PaymentsService.createPayment calls ApiClient.post with /payments', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'pmt_1',
        orderId: 'ord_1',
        userId: 'usr_1',
        provider: 'MOCK',
        type: 'DEPOSIT',
        amount: '100000',
        currency: 'NGN',
        status: 'PENDING',
        reference: 'PAY_123',
        createdAt: '2026-08-15T10:00:00Z',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const payload = { orderId: 'ord_1', currency: 'NGN' };
    const res = await PaymentsService.createPayment(payload, 'mock_token');

    expect(ApiClient.post).toHaveBeenCalledWith('/payments', payload, 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('PaymentsService.verifyPayment calls ApiClient.post with /payments/:id/verify', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'pmt_1',
        orderId: 'ord_1',
        status: 'SUCCEEDED',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await PaymentsService.verifyPayment('pmt_1', {}, 'mock_token');

    expect(ApiClient.post).toHaveBeenCalledWith('/payments/pmt_1/verify', {}, 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('SettlementsService.getSettlementByOrder calls ApiClient.get with /settlements/order/:orderId', async () => {
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'stl_1',
        orderId: 'ord_1',
        userId: 'usr_1',
        status: 'COMPLETED',
        asset: 'USDC',
        amount: '66',
        stellarTransactionHash: 'abc123def456',
        attemptCount: 1,
        createdAt: '2026-08-15T10:00:00Z',
      },
    };

    (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await SettlementsService.getSettlementByOrder('ord_1', 'mock_token');

    expect(ApiClient.get).toHaveBeenCalledWith('/settlements/order/ord_1', 'mock_token');
    expect(res).toEqual(mockData);
  });

  it('Stellar Wallet Gate: validates ed25519 public keys correctly', () => {
    const { StrKey } = require('@stellar/stellar-sdk');
    const validAddress = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    const invalidAddress = 'GINVALID_ADDRESS_123';

    expect(StrKey.isValidEd25519PublicKey(validAddress)).toBe(true);
    expect(StrKey.isValidEd25519PublicKey(invalidAddress)).toBe(false);
  });

  it('OrdersService.createOrder includes validated walletAddress in request payload', async () => {
    const validAddress = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    const mockData = {
      status: 'success',
      success: true,
      data: {
        id: 'ord_wallet_1',
        userId: 'usr_1',
        quoteId: 'q_99',
        type: 'ON_RAMP',
        status: 'CREATED',
        walletAddress: validAddress,
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: '50000',
        destinationAmount: '33',
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
    };

    (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const payload = { quoteId: 'q_99', type: 'ON_RAMP' as const, walletAddress: validAddress };
    const res = await OrdersService.createOrder(payload, 'mock_token');

    expect(ApiClient.post).toHaveBeenCalledWith('/orders', payload, 'mock_token');
    expect(res.data?.walletAddress).toBe(validAddress);
  });
});
