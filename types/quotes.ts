export interface QuoteRequest {
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  direction: 'ONRAMP' | 'OFFRAMP';
}

export interface Quote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: number;
  feeAmount: number;
  expiresAt: string;
}
