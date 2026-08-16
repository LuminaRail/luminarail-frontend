'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { GridScan } from '@/components/backgrounds/GridScan';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus, Payment } from '@/types/orders';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { NgnPaymentModal } from '@/components/payments/NgnPaymentModal';
import {
  Search,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Lock,
  History,
  FileSpreadsheet,
} from 'lucide-react';

function TransactionsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, total, limit, offset, loading, error, fetchOrders, fetchOrderDetails } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const [selectedNgnOrder, setSelectedNgnOrder] = useState<Order | null>(null);
  const [selectedNgnPayment, setSelectedNgnPayment] = useState<Payment | null>(null);
  const [isNgnModalOpen, setIsNgnModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOpenDetails = async (orderId: string) => {
    const detailed = await fetchOrderDetails(orderId);
    if (detailed) {
      setSelectedOrder(detailed);
    } else {
      const fallback = orders.find((o) => o.id === orderId) || null;
      setSelectedOrder(fallback);
    }
    setIsDetailsOpen(true);
  };

  const handleOpenNgnModal = (order: Order, payment?: Payment) => {
    const pmt = payment || order.payments?.[0] || null;
    setSelectedNgnOrder(order);
    setSelectedNgnPayment(pmt);
    setIsNgnModalOpen(true);
  };

  const getStatusBadge = (status: OrderStatus, walletAddress?: string | null) => {
    if (status === 'PAYMENT_CONFIRMED' && (!walletAddress || walletAddress.trim() === '')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          ATTACH WALLET
        </span>
      );
    }

    switch (status) {
      case 'COMPLETED':
      case 'SETTLEMENT_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            COMPLETED
          </span>
        );
      case 'AWAITING_PAYMENT':
      case 'PAYMENT_DETECTED':
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            AWAITING PAY
          </span>
        );
      case 'PAYMENT_CONFIRMED':
      case 'SETTLEMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            SETTLING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  const getExplorerUrl = (txHash: string) => {
    const net = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
    return `https://stellar.expert/explorer/${net}/tx/${txHash}`;
  };

  const filteredOrders = orders.filter((ord) => {
    const query = searchQuery.toLowerCase();
    const pmt = ord.payments?.[0];
    const stl = ord.settlements?.[0];

    return (
      ord.id.toLowerCase().includes(query) ||
      ord.sourceCurrency.toLowerCase().includes(query) ||
      ord.destinationAsset.toLowerCase().includes(query) ||
      (pmt?.reference && pmt.reference.toLowerCase().includes(query)) ||
      (stl?.stellarTransactionHash && stl.stellarTransactionHash.toLowerCase().includes(query))
    );
  });

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-x-hidden transition-colors duration-200">
      <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction History</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Comprehensive audit trail of local NGN deposits, Paystack transactions, and Stellar Soroban USDC settlements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOrders(offset, limit, true)}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs"
                title="Refresh history"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/dashboard"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>New Deposit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {!authLoading && !isAuthenticated ? (
            <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-2xl my-12 backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in required</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6">
                Please sign in to view your complete deposit and settlement transaction logs.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
              >
                Sign In to Account
              </Link>
            </div>
          ) : (
            <>
              {/* Search input */}
              <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Ref, or Tx Hash..."
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block font-mono">
                  Showing <strong className="text-slate-900 dark:text-slate-200">{filteredOrders.length}</strong> records
                </div>
              </div>

              {/* Transactions Table */}
              {loading && orders.length === 0 ? (
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Loading audit history...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No transaction records found</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                    {searchQuery ? 'No transactions match your search query.' : 'No transactions recorded yet.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider">
                          <th className="py-3.5 px-4 font-semibold">Order / Ref</th>
                          <th className="py-3.5 px-4 font-semibold">Deposit NGN</th>
                          <th className="py-3.5 px-4 font-semibold">USDC Received</th>
                          <th className="py-3.5 px-4 font-semibold">Rate & Fee</th>
                          <th className="py-3.5 px-4 font-semibold">Order Status</th>
                          <th className="py-3.5 px-4 font-semibold">Stellar Tx Hash</th>
                          <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                          <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                        {filteredOrders.map((ord) => {
                          const pmt = ord.payments?.[0];
                          const stl = ord.settlements?.[0];
                          const txHash = stl?.stellarTransactionHash;

                          return (
                            <tr
                              key={ord.id}
                              onClick={() => handleOpenDetails(ord.id)}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                            >
                              <td className="py-4 px-4 font-mono">
                                <div className="font-bold text-slate-900 dark:text-slate-200">#{ord.id.slice(0, 8)}...</div>
                                {pmt?.reference && (
                                  <div className="text-[10px] text-amber-600 dark:text-amber-300/80 truncate max-w-[120px]">
                                    Ref: {pmt.reference}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                                ₦{Number(ord.sourceAmount).toLocaleString()} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">NGN</span>
                              </td>
                              <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {Number(ord.destinationAmount).toLocaleString()} <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-normal">{ord.destinationAsset}</span>
                              </td>
                              <td className="py-4 px-4 text-[11px] text-slate-700 dark:text-slate-300">
                                <div>1 USDC = {ord.quote ? Number(ord.quote.exchangeRate).toFixed(4) : '-'} NGN</div>
                                <div className="text-[10px] text-slate-500">Fee: ₦{ord.quote ? Number(ord.quote.fee).toLocaleString() : '0'}</div>
                              </td>
                              <td className="py-4 px-4">{getStatusBadge(ord.status, ord.walletAddress)}</td>
                              <td className="py-4 px-4 font-mono">
                                {txHash ? (
                                  <a
                                    href={getExplorerUrl(txHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                                  >
                                    <span>{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Unsettled</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                                {new Date(ord.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  {(ord.status === 'CREATED' || ord.status === 'AWAITING_PAYMENT') && ord.sourceCurrency === 'NGN' && (
                                    <button
                                      onClick={() => handleOpenNgnModal(ord)}
                                      className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all shadow cursor-pointer font-sans"
                                    >
                                      Pay NGN
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenDetails(ord.id)}
                                    className="py-1.5 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-all cursor-pointer font-sans"
                                  >
                                    View
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {total > limit && (
                    <div className="bg-slate-100/80 dark:bg-slate-950/80 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{offset + 1}</span> to{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {Math.min(offset + limit, total)}
                        </span>{' '}
                        of <span className="font-semibold text-slate-900 dark:text-slate-200">{total}</span> records
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchOrders(Math.max(0, offset - limit), limit)}
                          disabled={offset === 0 || loading}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => fetchOrders(offset + limit, limit)}
                          disabled={offset + limit >= total || loading}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </main>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRefresh={() => {
          if (selectedOrder) handleOpenDetails(selectedOrder.id);
          fetchOrders(offset, limit, true);
        }}
      />

      <NgnPaymentModal
        isOpen={isNgnModalOpen}
        onClose={() => setIsNgnModalOpen(false)}
        order={selectedNgnOrder}
        payment={selectedNgnPayment}
        onPaymentUpdated={(updatedPayment) => {
          setSelectedNgnPayment(updatedPayment);
          fetchOrders(offset, limit, true);
        }}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
