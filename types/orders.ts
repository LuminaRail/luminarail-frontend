import { Quote } from './quotes';

export type OrderType = 'ON_RAMP' | 'OFF_RAMP' | 'MERCHANT_PAYMENT';

export type OrderStatus =
  | 'CREATED'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_DETECTED'
  | 'PAYMENT_CONFIRMED'
  | 'SETTLEMENT_PENDING'
  | 'SETTLEMENT_COMPLETED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type SettlementStatus =
  | 'PENDING'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'CONFIRMING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REQUIRES_RECONCILIATION';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export type { Quote };

export interface PaymentInstruction {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reference: string;
  amount?: string;
  currency?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  instructions?: string;
  expiresAt?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  provider: string;
  providerPaymentId?: string | null;
  type: string;
  amount: number | string;
  grossAmount?: number | string;
  providerFee?: number | string;
  platformFee?: number | string;
  netAmount?: number | string;
  currency: string;
  status: PaymentStatus;
  reference: string;
  idempotencyKey?: string | null;
  instructions?: PaymentInstruction | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Settlement {
  id: string;
  settlementId?: string;
  orderId: string;
  userId: string;
  status: SettlementStatus;
  asset: string;
  amount: number | string;
  source?: string | null;
  destination?: string | null;
  contractAddress?: string | null;
  stellarTransactionHash?: string | null;
  stellarLedger?: number | null;
  attemptCount: number;
  lastError?: string | null;
  submittedAt?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderTransaction {
  id: string;
  userId?: string | null;
  orderId?: string | null;
  type: string;
  status: string;
  stellarTxHash?: string | null;
  amount: number | string;
  asset: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  quoteId: string;
  idempotencyKey?: string | null;
  type: OrderType;
  status: OrderStatus;
  sourceCurrency: string;
  destinationAsset: string;
  sourceAmount: number | string;
  destinationAmount: number | string;
  walletAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  quote?: Quote;
  transactions?: OrderTransaction[];
  payments?: Payment[];
  settlements?: Settlement[];
  targetCurrency?: string;
  targetAmount?: number | string;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateOrderInput {
  quoteId: string;
  type?: OrderType;
  walletAddress?: string;
  idempotencyKey?: string;
}

export interface CreatePaymentInput {
  orderId: string;
  currency?: string;
  type?: 'DEPOSIT' | 'PAYMENT' | 'PAYOUT' | 'REFUND';
  provider?: string;
}
