'use client';

import React from 'react';
import { Order, OrderStatus, SettlementStatus, PaymentStatus } from '@/types/orders';
import { Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface OrderLifecycleTimelineProps {
  order: Order;
}

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFailed: boolean;
}

export function OrderLifecycleTimeline({ order }: OrderLifecycleTimelineProps) {
  const status = order.status;
  const payment = order.payments?.[0];
  const settlement = order.settlements?.[0];

  const isFailedOrder = status === 'FAILED' || status === 'CANCELLED' || status === 'REFUNDED';

  // Helper to determine step completion rank based on actual OrderStatus
  const statusRank: Record<OrderStatus, number> = {
    CREATED: 1,
    AWAITING_PAYMENT: 2,
    PAYMENT_DETECTED: 3,
    PAYMENT_CONFIRMED: 4,
    SETTLEMENT_PENDING: 5,
    SETTLEMENT_COMPLETED: 6,
    COMPLETED: 7,
    FAILED: -1,
    CANCELLED: -1,
    REFUNDED: -1,
  };

  const currentRank = statusRank[status] || 1;

  const paymentConfirmed =
    currentRank >= 4 ||
    (payment && payment.status === 'SUCCEEDED') ||
    status === 'SETTLEMENT_PENDING' ||
    status === 'SETTLEMENT_COMPLETED' ||
    status === 'COMPLETED';

  const settlementSubmitted =
    currentRank >= 6 ||
    (settlement &&
      (settlement.status === 'SUBMITTING' ||
        settlement.status === 'SUBMITTED' ||
        settlement.status === 'CONFIRMING' ||
        settlement.status === 'COMPLETED'));

  const orderCompleted = status === 'SETTLEMENT_COMPLETED' || status === 'COMPLETED';

  const steps: TimelineStep[] = [
    {
      key: 'quote',
      label: 'Quote Created',
      description: 'Exchange rate & fee locked',
      isCompleted: true,
      isCurrent: false,
      isFailed: false,
    },
    {
      key: 'created',
      label: 'Order Created',
      description: `ID #${order.id.slice(0, 8)} initialized`,
      isCompleted: currentRank >= 1,
      isCurrent: status === 'CREATED',
      isFailed: isFailedOrder && !paymentConfirmed && !settlementSubmitted,
    },
    {
      key: 'payment_pending',
      label: 'Payment Required',
      description: payment ? `Fiat Deposit (${payment.currency})` : 'Awaiting payment link',
      isCompleted: currentRank >= 2,
      isCurrent: status === 'AWAITING_PAYMENT' || status === 'PAYMENT_DETECTED',
      isFailed: isFailedOrder && !paymentConfirmed,
    },
    {
      key: 'payment_confirmed',
      label: 'Payment Verified',
      description: paymentConfirmed ? 'Provider confirmed funds' : 'Verifying transaction',
      isCompleted: paymentConfirmed,
      isCurrent: status === 'PAYMENT_CONFIRMED',
      isFailed: isFailedOrder && payment?.status === 'FAILED',
    },
    {
      key: 'settlement_pending',
      label: !order.walletAddress && status === 'PAYMENT_CONFIRMED' ? 'Wallet Required' : 'Settlement Queued',
      description: !order.walletAddress && status === 'PAYMENT_CONFIRMED'
        ? 'Connect Stellar wallet to trigger settlement'
        : 'Soroban contract triggered',
      isCompleted: currentRank >= 5 || settlementSubmitted || orderCompleted,
      isCurrent: (status === 'SETTLEMENT_PENDING' && !settlementSubmitted) || (status === 'PAYMENT_CONFIRMED' && !order.walletAddress),
      isFailed: isFailedOrder && paymentConfirmed && !settlementSubmitted,
    },
    {
      key: 'soroban_execution',
      label: 'Stellar Settlement',
      description: settlement?.stellarTransactionHash
        ? `Tx Hash #${settlement.stellarTransactionHash.slice(0, 8)}...`
        : 'Submitting on-chain XDR',
      isCompleted: settlementSubmitted || orderCompleted,
      isCurrent: settlement?.status === 'SUBMITTING' || settlement?.status === 'SUBMITTED' || settlement?.status === 'CONFIRMING',
      isFailed: settlement?.status === 'FAILED' || settlement?.status === 'REQUIRES_RECONCILIATION',
    },
    {
      key: 'completed',
      label: 'Order Completed',
      description: orderCompleted ? 'USDC transferred successfully' : 'Final confirmation',
      isCompleted: orderCompleted,
      isCurrent: orderCompleted,
      isFailed: isFailedOrder,
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order Lifecycle State</h3>
        <span
          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
            orderCompleted
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : isFailedOrder
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
              : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {steps.map((step) => {
          return (
            <div key={step.key} className="relative flex items-start group">
              {/* Timeline Indicator Badge */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                  step.isFailed
                    ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-500/40'
                    : step.isCompleted
                    ? 'bg-emerald-600 text-white shadow-md'
                    : step.isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {step.isFailed ? (
                  <AlertTriangle className="w-3 h-3 text-white" />
                ) : step.isCompleted ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : step.isCurrent ? (
                  <Clock className="w-3 h-3 animate-spin-slow" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                )}
              </div>

              {/* Step Info */}
              <div className="ml-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      step.isFailed
                        ? 'text-rose-600 dark:text-rose-400'
                        : step.isCompleted
                        ? 'text-slate-900 dark:text-slate-100'
                        : step.isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.isCurrent && !step.isFailed && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      Active Step
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
