'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types/orders';
import { OrderSummaryCards } from '@/components/orders/OrderSummaryCards';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { GridScan } from '@/components/backgrounds/GridScan';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Layers,
} from 'lucide-react';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteIdFromQuery = searchParams.get('quoteId');

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    orders,
    total,
    limit,
    offset,
    loading,
    error,
    stats,
    fetchOrders,
    fetchOrderDetails,
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(!!quoteIdFromQuery);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (quoteIdFromQuery) {
      setIsCreateOpen(true);
    }
  }, [quoteIdFromQuery]);

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

  const handleRefreshSelectedOrder = async () => {
    if (selectedOrder) {
      const updated = await fetchOrderDetails(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
      fetchOrders(offset, limit, true);
    }
  };

  const handleOrderCreated = (newOrder: Order) => {
    setSelectedOrder(newOrder);
    setIsDetailsOpen(true);
    // Remove query param
    router.replace('/orders');
  };

  // Status Badge color mapping using LuminaRail design system
  const getStatusBadge = (status: OrderStatus, walletAddress?: string | null) => {
    if (status === 'PAYMENT_CONFIRMED' && (!walletAddress || walletAddress.trim() === '')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          ACTION REQUIRED
        </span>
      );
    }

    switch (status) {
      case 'COMPLETED':
      case 'SETTLEMENT_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      case 'AWAITING_PAYMENT':
      case 'PAYMENT_DETECTED':
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {status}
          </span>
        );
      case 'PAYMENT_CONFIRMED':
      case 'SETTLEMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            {status}
          </span>
        );
      case 'FAILED':
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {status}
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

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sourceCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.destinationAsset.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') {
      return (
        order.status === 'CREATED' ||
        order.status === 'AWAITING_PAYMENT' ||
        order.status === 'PAYMENT_DETECTED'
      );
    }
    if (statusFilter === 'PROCESSING') {
      return order.status === 'PAYMENT_CONFIRMED' || order.status === 'SETTLEMENT_PENDING';
    }
    if (statusFilter === 'COMPLETED') {
      return order.status === 'SETTLEMENT_COMPLETED' || order.status === 'COMPLETED';
    }
    if (statusFilter === 'FAILED') {
      return order.status === 'FAILED' || order.status === 'CANCELLED' || order.status === 'REFUNDED';
    }
    return true;
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">
      {/* Background Grid Scan animation */}
      <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Settlement Orders</h1>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                Stellar & Soroban
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Track local fiat payment and on-chain settlement order state transitions in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(offset, limit)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/quotes"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Get New Quote</span>
            </Link>
          </div>
        </div>

        {/* Unauthenticated View */}
        {!authLoading && !isAuthenticated ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-2xl my-12">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Sign in required</h2>
            <p className="text-xs text-slate-400 mt-2 mb-6">
              Please sign in or register to view and manage your LuminaRail settlement orders.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-lg transition-all"
            >
              Sign In to Account
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <OrderSummaryCards stats={stats} />

            {/* Filter & Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID or asset..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

            </div>

            {/* Main Orders Table / Cards View */}
            {loading && orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Loading your orders...</p>
                <p className="text-xs text-slate-500">Fetching live settlement lifecycle states from backend.</p>
              </div>
            ) : error && orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-rose-900/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <p className="text-sm font-semibold text-rose-300">We couldn't load your orders</p>
                <p className="text-xs text-slate-400 max-w-md">{error}</p>
                <button
                  onClick={() => fetchOrders(offset, limit)}
                  className="mt-2 py-2 px-4 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-medium text-xs transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-1">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-200">No settlement orders found</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No orders match your selected search query or status filter.'
                    : 'You haven’t created any LuminaRail settlement orders yet.'}
                </p>
                <Link
                  href="/quotes"
                  className="mt-2 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                >
                  Get a Settlement Quote
                </Link>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                        <th className="py-3.5 px-4 font-semibold">Order ID</th>
                        <th className="py-3.5 px-4 font-semibold">Type</th>
                        <th className="py-3.5 px-4 font-semibold">Source</th>
                        <th className="py-3.5 px-4 font-semibold">Destination</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold">Created Date</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => handleOpenDetails(ord.id)}
                        >
                          <td className="py-4 px-4 font-mono font-medium text-slate-200">
                            #{ord.id.slice(0, 8)}...
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-300">{ord.type}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-100">
                            {Number(ord.sourceAmount).toLocaleString()}{' '}
                            <span className="text-slate-400 font-normal">{ord.sourceCurrency}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-emerald-400">
                            {Number(ord.destinationAmount).toLocaleString()}{' '}
                            <span className="text-emerald-300 font-normal">{ord.destinationAsset}</span>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(ord.status, ord.walletAddress)}</td>
                          <td className="py-4 px-4 text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenDetails(ord.id)}
                              className="py-1.5 px-3 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-700 hover:border-emerald-500/40"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-slate-800/80">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => handleOpenDetails(ord.id)}
                      className="p-4 hover:bg-slate-800/40 transition-colors space-y-3 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          #{ord.id.slice(0, 8)}...
                        </span>
                        {getStatusBadge(ord.status, ord.walletAddress)}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Source</span>
                          <span className="font-bold text-slate-100">
                            {Number(ord.sourceAmount).toLocaleString()} {ord.sourceCurrency}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase block">Destination</span>
                          <span className="font-bold text-emerald-400">
                            {Number(ord.destinationAmount).toLocaleString()} {ord.destinationAsset}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          View details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {total > limit && (
                  <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      Showing <span className="font-semibold text-slate-200">{offset + 1}</span> to{' '}
                      <span className="font-semibold text-slate-200">
                        {Math.min(offset + limit, total)}
                      </span>{' '}
                      of <span className="font-semibold text-slate-200">{total}</span> orders
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchOrders(Math.max(0, offset - limit), limit)}
                        disabled={offset === 0 || loading}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => fetchOrders(offset + limit, limit)}
                        disabled={offset + limit >= total || loading}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
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

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRefresh={handleRefreshSelectedOrder}
      />

      <CreateOrderModal
        quoteId={quoteIdFromQuery}
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          router.replace('/orders');
        }}
        onOrderCreated={handleOrderCreated}
      />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
