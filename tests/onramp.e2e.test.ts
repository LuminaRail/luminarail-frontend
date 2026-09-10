import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrKey } from '@stellar/stellar-sdk';
import { QuotesService } from '../services/quotes';
import { OrdersService } from '../services/orders';
import { PaymentsService } from '../services/payments';
import { SettlementsService } from '../services/settlements';
import { ApiClient } from '../lib/api';
import { Order, Payment, Settlement } from '../types/orders';
import { Quote } from '../types/quotes';

vi.mock('../lib/api', () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('Frontend On-Ramp Journey End-to-End Integration Tests', () => {
  const MOCK_JWT_TOKEN = 'mock_jwt_auth_token_e2e_999';
  const VALID_STELLAR_PUBKEY = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const INVALID_STELLAR_PUBKEY = 'INVALID_STELLAR_ADDRESS_XYZ';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path: Complete On-Ramp Journey Flow', () => {
    it('executes full end-to-end flow: Enter NGN -> Get Quote -> Create Order -> Payment Simulation -> Wallet Association -> Settlement Tracking -> Completed State', async () => {
      // Step 1: Enter NGN amount & Get Quote
      const mockQuote: Quote = {
        id: 'q_e2e_onramp_101',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: 250000,
        destinationAmount: '166.666667',
        exchangeRate: '0.00066667',
        fee: '1500',
        feeAmount: '1500',
        provider: 'LUMINA_PAY',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockQuote,
      });

      const quoteRes = await QuotesService.createQuote(
        {
          sourceCurrency: 'NGN',
          destinationAsset: 'USDC',
          amount: 250000,
          side: 'source',
        },
        MOCK_JWT_TOKEN
      );

      expect(ApiClient.post).toHaveBeenNthCalledWith(
        1,
        '/quotes',
        {
          sourceCurrency: 'NGN',
          destinationAsset: 'USDC',
          amount: 250000,
          side: 'source',
        },
        MOCK_JWT_TOKEN
      );
      expect(quoteRes.success).toBe(true);
      expect(quoteRes.data?.id).toBe('q_e2e_onramp_101');
      expect(quoteRes.data?.sourceAmount).toBe(250000);
      expect(quoteRes.data?.destinationAmount).toBe('166.666667');

      // Step 2: Create Order
      const mockCreatedOrder: Order = {
        id: 'ord_e2e_onramp_202',
        userId: 'usr_e2e_client',
        quoteId: 'q_e2e_onramp_101',
        type: 'ON_RAMP',
        status: 'CREATED',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: '250000',
        destinationAmount: '166.666667',
        walletAddress: VALID_STELLAR_PUBKEY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quote: mockQuote,
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockCreatedOrder,
      });

      const orderPayload = {
        quoteId: 'q_e2e_onramp_101',
        type: 'ON_RAMP' as const,
        walletAddress: VALID_STELLAR_PUBKEY,
      };
      const idempotencyKey = 'order-idemp-key-e2e-202';

      const orderRes = await OrdersService.createOrder(orderPayload, MOCK_JWT_TOKEN, idempotencyKey);

      expect(ApiClient.post).toHaveBeenNthCalledWith(
        2,
        '/orders',
        orderPayload,
        MOCK_JWT_TOKEN,
        { 'Idempotency-Key': idempotencyKey }
      );
      expect(orderRes.success).toBe(true);
      expect(orderRes.data?.id).toBe('ord_e2e_onramp_202');
      expect(orderRes.data?.status).toBe('CREATED');
      expect(orderRes.data?.walletAddress).toBe(VALID_STELLAR_PUBKEY);

      // Step 3: Payment Modal Simulation & Verification
      const mockPendingPayment: Payment = {
        id: 'pmt_e2e_303',
        orderId: 'ord_e2e_onramp_202',
        userId: 'usr_e2e_client',
        provider: 'NGN_BANK_TRANSFER',
        type: 'DEPOSIT',
        amount: '250000',
        currency: 'NGN',
        status: 'PENDING',
        reference: 'REF_E2E_ONRAMP_303',
        instructions: {
          bankName: 'Providus Bank / LuminaRail Rail',
          accountNumber: '9982014821',
          accountName: 'LuminaRail On-Ramp Vault',
          reference: 'REF_E2E_ONRAMP_303',
          amount: '250000.00',
          currency: 'NGN',
          instructions: 'Transfer exact amount using your bank app.',
        },
        createdAt: new Date().toISOString(),
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockPendingPayment,
      });

      const pmtPayload = {
        orderId: 'ord_e2e_onramp_202',
        currency: 'NGN',
        provider: 'NGN_BANK_TRANSFER',
      };
      const pmtRes = await PaymentsService.createPayment(pmtPayload, MOCK_JWT_TOKEN);

      expect(ApiClient.post).toHaveBeenNthCalledWith(3, '/payments', pmtPayload, MOCK_JWT_TOKEN);
      expect(pmtRes.success).toBe(true);
      expect(pmtRes.data?.status).toBe('PENDING');
      expect(pmtRes.data?.instructions?.accountNumber).toBe('9982014821');

      // Simulate & Verify Payment Success
      const mockSucceededPayment: Payment = {
        ...mockPendingPayment,
        status: 'SUCCEEDED',
        updatedAt: new Date().toISOString(),
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockSucceededPayment,
      });

      const verifyRes = await PaymentsService.verifyPayment(
        'pmt_e2e_303',
        { simulateSuccess: true },
        MOCK_JWT_TOKEN
      );

      expect(ApiClient.post).toHaveBeenNthCalledWith(
        4,
        '/payments/pmt_e2e_303/verify',
        { simulateSuccess: true },
        MOCK_JWT_TOKEN
      );
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.data?.status).toBe('SUCCEEDED');

      // Step 4: Wallet Association Verification
      expect(StrKey.isValidEd25519PublicKey(VALID_STELLAR_PUBKEY)).toBe(true);

      const mockUpdatedOrderWallet: Order = {
        ...mockCreatedOrder,
        status: 'SETTLEMENT_PENDING',
        walletAddress: VALID_STELLAR_PUBKEY,
      };

      (ApiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockUpdatedOrderWallet,
      });

      const patchWalletRes = await OrdersService.updateOrderWallet(
        'ord_e2e_onramp_202',
        VALID_STELLAR_PUBKEY,
        MOCK_JWT_TOKEN
      );

      expect(ApiClient.patch).toHaveBeenNthCalledWith(
        1,
        '/orders/ord_e2e_onramp_202/wallet',
        { walletAddress: VALID_STELLAR_PUBKEY },
        MOCK_JWT_TOKEN
      );
      expect(patchWalletRes.success).toBe(true);
      expect(patchWalletRes.data?.walletAddress).toBe(VALID_STELLAR_PUBKEY);
      expect(patchWalletRes.data?.status).toBe('SETTLEMENT_PENDING');

      // Step 5: Settlement Status Tracking
      const mockSettlement: Settlement = {
        id: 'stl_e2e_404',
        orderId: 'ord_e2e_onramp_202',
        userId: 'usr_e2e_client',
        status: 'COMPLETED',
        asset: 'USDC',
        amount: '166.666667',
        destination: VALID_STELLAR_PUBKEY,
        contractAddress: 'CCW67TSB3SSS36Q674K62CS3SCZX2THDZB45MUKWBS7QCSE2P6J3E5PW',
        stellarTransactionHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        stellarLedger: 520198,
        attemptCount: 1,
        submittedAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockSettlement,
      });

      const stlRes = await SettlementsService.getSettlementByOrder(
        'ord_e2e_onramp_202',
        MOCK_JWT_TOKEN
      );

      expect(ApiClient.get).toHaveBeenNthCalledWith(
        1,
        '/settlements/order/ord_e2e_onramp_202',
        MOCK_JWT_TOKEN
      );
      expect(stlRes.success).toBe(true);
      expect(stlRes.data?.status).toBe('COMPLETED');
      expect(stlRes.data?.stellarTransactionHash).toBe(
        '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
      );
      expect(stlRes.data?.stellarLedger).toBe(520198);

      // Step 6: Final Completed State Verification
      const mockCompletedOrder: Order = {
        ...mockCreatedOrder,
        status: 'COMPLETED',
        payments: [mockSucceededPayment],
        settlements: [mockSettlement],
      };

      (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockCompletedOrder,
      });

      const finalOrderRes = await OrdersService.getOrderById(
        'ord_e2e_onramp_202',
        MOCK_JWT_TOKEN
      );

      expect(ApiClient.get).toHaveBeenNthCalledWith(
        2,
        '/orders/ord_e2e_onramp_202',
        MOCK_JWT_TOKEN
      );
      expect(finalOrderRes.success).toBe(true);
      expect(finalOrderRes.data?.status).toBe('COMPLETED');
      expect(finalOrderRes.data?.payments?.[0].status).toBe('SUCCEEDED');
      expect(finalOrderRes.data?.settlements?.[0].status).toBe('COMPLETED');
    });
  });

  describe('Edge Path: Expired Quote Lifecycle & Refresh', () => {
    it('handles quote expiration gracefully and allows quote refresh to proceed', async () => {
      const pastTime = new Date(Date.now() - 300000).toISOString();
      const expiredQuote: Quote = {
        id: 'q_expired_999',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: 100000,
        destinationAmount: '66.666667',
        exchangeRate: '0.00066667',
        status: 'EXPIRED',
        expiresAt: pastTime,
      };

      (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: expiredQuote,
      });

      const quoteFetchRes = await QuotesService.getQuoteById('q_expired_999', MOCK_JWT_TOKEN);
      expect(quoteFetchRes.data?.status).toBe('EXPIRED');
      const isExpired = new Date(quoteFetchRes.data!.expiresAt).getTime() <= Date.now();
      expect(isExpired).toBe(true);

      // Refresh Quote API Call
      const freshQuote: Quote = {
        id: 'q_refreshed_1000',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: 100000,
        destinationAmount: '67.123456',
        exchangeRate: '0.00067123',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: freshQuote,
      });

      const refreshedQuoteRes = await QuotesService.createQuote(
        {
          sourceCurrency: 'NGN',
          destinationAsset: 'USDC',
          amount: 100000,
          side: 'source',
        },
        MOCK_JWT_TOKEN
      );

      expect(refreshedQuoteRes.success).toBe(true);
      expect(refreshedQuoteRes.data?.id).toBe('q_refreshed_1000');
      expect(refreshedQuoteRes.data?.status).toBe('ACTIVE');
      expect(new Date(refreshedQuoteRes.data!.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Edge Path: Payment Failure & Re-verification Recovery', () => {
    it('handles payment verification failure and supports re-verification recovery', async () => {
      const mockPendingPayment: Payment = {
        id: 'pmt_fail_505',
        orderId: 'ord_fail_505',
        userId: 'usr_e2e_client',
        provider: 'PAYSTACK',
        type: 'DEPOSIT',
        amount: '50000',
        currency: 'NGN',
        status: 'PENDING',
        reference: 'REF_FAIL_505',
        createdAt: new Date().toISOString(),
      };

      // 1. Verification returns FAILED
      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: {
          ...mockPendingPayment,
          status: 'FAILED',
        },
      });

      const verifyFailRes = await PaymentsService.verifyPayment(
        'pmt_fail_505',
        { simulateFailure: true },
        MOCK_JWT_TOKEN
      );

      expect(verifyFailRes.success).toBe(true);
      expect(verifyFailRes.data?.status).toBe('FAILED');

      // 2. Recovery re-verification returns SUCCEEDED
      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: {
          ...mockPendingPayment,
          status: 'SUCCEEDED',
        },
      });

      const recoveryRes = await PaymentsService.verifyPayment(
        'pmt_fail_505',
        { simulateSuccess: true },
        MOCK_JWT_TOKEN
      );

      expect(recoveryRes.success).toBe(true);
      expect(recoveryRes.data?.status).toBe('SUCCEEDED');
    });
  });

  describe('Edge Path: Wallet Missing & Destination Address Validation', () => {
    it('rejects invalid Stellar public key formats and associates verified wallet successfully', async () => {
      // Address validation check
      expect(StrKey.isValidEd25519PublicKey(INVALID_STELLAR_PUBKEY)).toBe(false);
      expect(StrKey.isValidEd25519PublicKey(VALID_STELLAR_PUBKEY)).toBe(true);

      // Order created without wallet
      const mockOrderNoWallet: Order = {
        id: 'ord_no_wallet_606',
        userId: 'usr_e2e_client',
        quoteId: 'q_606',
        type: 'ON_RAMP',
        status: 'CREATED',
        sourceCurrency: 'NGN',
        destinationAsset: 'USDC',
        sourceAmount: '80000',
        destinationAmount: '53.333333',
        walletAddress: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockOrderNoWallet,
      });

      const fetchOrderRes = await OrdersService.getOrderById('ord_no_wallet_606', MOCK_JWT_TOKEN);
      expect(fetchOrderRes.data?.walletAddress).toBeNull();

      // Attach valid wallet
      const mockOrderWithWallet: Order = {
        ...mockOrderNoWallet,
        walletAddress: VALID_STELLAR_PUBKEY,
      };

      (ApiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockOrderWithWallet,
      });

      const attachRes = await OrdersService.updateOrderWallet(
        'ord_no_wallet_606',
        VALID_STELLAR_PUBKEY,
        MOCK_JWT_TOKEN
      );

      expect(attachRes.success).toBe(true);
      expect(attachRes.data?.walletAddress).toBe(VALID_STELLAR_PUBKEY);
    });
  });

  describe('Edge Path: Settlement Failure & Retry Recovery', () => {
    it('handles settlement transaction failure and executes successful retry recovery', async () => {
      // 1. Initial Settlement Failure
      const mockFailedSettlement: Settlement = {
        id: 'stl_fail_707',
        orderId: 'ord_stl_fail_707',
        userId: 'usr_e2e_client',
        status: 'FAILED',
        asset: 'USDC',
        amount: '200.00',
        attemptCount: 1,
        lastError: 'Soroban transaction submission failed: Low resource fee budget',
        createdAt: new Date().toISOString(),
      };

      (ApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockFailedSettlement,
      });

      const fetchStlRes = await SettlementsService.getSettlementByOrder(
        'ord_stl_fail_707',
        MOCK_JWT_TOKEN
      );

      expect(fetchStlRes.success).toBe(true);
      expect(fetchStlRes.data?.status).toBe('FAILED');
      expect(fetchStlRes.data?.lastError).toContain('Low resource fee budget');
      expect(fetchStlRes.data?.attemptCount).toBe(1);

      // 2. Retry Settlement Execution
      const mockRecoveredSettlement: Settlement = {
        ...mockFailedSettlement,
        status: 'COMPLETED',
        attemptCount: 2,
        lastError: null,
        stellarTransactionHash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        stellarLedger: 520210,
        confirmedAt: new Date().toISOString(),
      };

      (ApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 'success',
        success: true,
        data: mockRecoveredSettlement,
      });

      const retryRes = await SettlementsService.retrySettlement('stl_fail_707', MOCK_JWT_TOKEN);

      expect(ApiClient.post).toHaveBeenCalledWith(
        '/settlements/stl_fail_707/retry',
        {},
        MOCK_JWT_TOKEN
      );
      expect(retryRes.success).toBe(true);
      expect(retryRes.data?.status).toBe('COMPLETED');
      expect(retryRes.data?.attemptCount).toBe(2);
      expect(retryRes.data?.stellarTransactionHash).toBe(
        '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff'
      );
    });
  });
});
