export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED' | 'CANCELLED';

export interface Order {
  id: string;
  quoteId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
