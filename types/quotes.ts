export interface QuoteRequest {
  sourceCurrency: string;
  destinationAsset?: string;
  targetCurrency?: string;
  amount: number;
  direction?: 'ONRAMP' | 'OFFRAMP';
  side?: 'source' | 'destination';
}

export interface Quote {
  id: string;
  sourceCurrency: string;
  destinationAsset?: string;
  targetCurrency?: string;
  sourceAmount: number | string;
  destinationAmount?: number | string;
  targetAmount?: number | string;
  exchangeRate: number | string;
  fee?: number | string;
  feeAmount?: number | string;
  provider?: string;
  status?: string;
  expiresAt: string;
  createdAt?: string;
}
