'use client';

import { useState } from 'react';
import { Quote, QuoteRequest } from '@/types/quotes';
import { QuotesService } from '@/services/quotes';

export function useQuotes(token?: string) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestQuote = async (request: QuoteRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await QuotesService.createQuote(request, token);

      if (response.status === 'error' || !response.data) {
        setCurrentQuote(null);
        setError(response.message || 'Failed to create quote');
        return null;
      }

      setCurrentQuote(response.data);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create quote';

      setCurrentQuote(null);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearQuote = () => {
    setCurrentQuote(null);
    setError(null);
  };

  return {
    currentQuote,
    loading,
    error,
    requestQuote,
    clearQuote,
  };
}
