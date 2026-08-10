'use client';

import { useState } from 'react';
import { Order } from '@/types/orders';

export function useOrders() {
  const [orders] = useState<Order[]>([]);
  const [loading] = useState<boolean>(false);

  return {
    orders,
    loading,
  };
}
