import { ApiClient } from '@/lib/api';
import { Quote, QuoteRequest } from '@/types/quotes';
import { ApiResponse } from '@/types/api';

export class QuotesService {
  public static async createQuote(request: QuoteRequest): Promise<ApiResponse<Quote>> {
    return ApiClient.post<Quote, QuoteRequest>('/quotes', request);
  }
}
