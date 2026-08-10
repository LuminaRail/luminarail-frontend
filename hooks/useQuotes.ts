'use client';

import { useState } from 'react';
import { Quote } from '@/types/quotes';

export function useQuotes() {
  const [currentQuote] = useState<Quote | null>(null);
  const [loading] = useState<boolean>(false);

  return {
    currentQuote,
    loading,
  };
}
