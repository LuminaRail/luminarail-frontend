'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Order, CreateOrderInput } from '@/types/orders';
import { OrdersService } from '@/services/orders';
import { useAuth } from '@/context/AuthContext';

export interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
}

export function useOrders() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (currentOffset = offset, currentLimit = limit, silent = false) => {
      if (!token) {
        setOrders([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setError(null);

      try {
        const response = await OrdersService.getOrders(token, currentLimit, currentOffset);
        if (response.success && response.data) {
          setOrders(response.data.orders || []);
          setTotal(response.data.total || 0);
          setLimit(response.data.limit || currentLimit);
          setOffset(response.data.offset || currentOffset);
        } else {
          setError(response.message || 'Failed to retrieve orders.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error while loading orders.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, offset, limit]
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders(0, limit);
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, token, limit]);

  // Sensible 5-second polling if active orders are in processing/non-terminal status
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasActiveOrders = orders.some(
      (o) =>
        o.status === 'CREATED' ||
        o.status === 'AWAITING_PAYMENT' ||
        o.status === 'PAYMENT_DETECTED' ||
        o.status === 'PAYMENT_CONFIRMED' ||
        o.status === 'SETTLEMENT_PENDING'
    );

    if (hasActiveOrders && isAuthenticated && token) {
      pollingTimerRef.current = setInterval(() => {
        fetchOrders(offset, limit, true);
      }, 5000);
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [orders, isAuthenticated, token, offset, limit, fetchOrders]);

  const fetchOrderDetails = useCallback(
    async (id: string): Promise<Order | null> => {
      if (!token) return null;
      try {
        const response = await OrdersService.getOrderById(id, token);
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        return null;
      }
    },
    [token]
  );

  const createOrder = useCallback(
    async (payload: CreateOrderInput): Promise<Order | null> => {
      if (!token) {
        setError('You must be signed in to create an order.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await OrdersService.createOrder(payload, token);
        if (response.success && response.data) {
          await fetchOrders(0, limit, true);
          return response.data;
        } else {
          setError(response.message || 'Failed to create order.');
          return null;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Order creation failed.';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, limit, fetchOrders]
  );

  // Stats computation derived from backend Order statuses
  const stats: OrderStats = {
    totalOrders: total || orders.length,
    pendingCount: orders.filter(
      (o) => o.status === 'CREATED' || o.status === 'AWAITING_PAYMENT' || o.status === 'PAYMENT_DETECTED'
    ).length,
    processingCount: orders.filter(
      (o) => o.status === 'PAYMENT_CONFIRMED' || o.status === 'SETTLEMENT_PENDING'
    ).length,
    completedCount: orders.filter(
      (o) => o.status === 'SETTLEMENT_COMPLETED' || o.status === 'COMPLETED'
    ).length,
    failedCount: orders.filter(
      (o) => o.status === 'FAILED' || o.status === 'CANCELLED' || o.status === 'REFUNDED'
    ).length,
  };

  return {
    orders,
    total,
    limit,
    offset,
    loading,
    error,
    stats,
    fetchOrders,
    fetchOrderDetails,
    createOrder,
  };
}
