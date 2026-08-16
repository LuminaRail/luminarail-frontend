'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { GridScan } from '@/components/backgrounds/GridScan';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useQuotes } from '@/hooks/useQuotes';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { Order, OrderStatus, Payment } from '@/types/orders';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { NgnPaymentModal } from '@/components/payments/NgnPaymentModal';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ExternalLink,
  Layers,
  Lock,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicKey: connectedWallet, connect: connectWallet } = useStellarWallet();
  const { orders, total, loading: ordersLoading, stats, fetchOrders, fetchOrderDetails } = useOrders();
  const { currentQuote, loading: quoteLoading, error: quoteError, requestQuote, clearQuote } = useQuotes();

  // Quick Deposit Input
  const [depositAmount, setDepositAmount] = useState<string>('100000');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState<boolean>(false);

  const [selectedNgnOrder, setSelectedNgnOrder] = useState<Order | null>(null);
  const [selectedNgnPayment, setSelectedNgnPayment] = useState<Payment | null>(null);
  const [isNgnPaymentOpen, setIsNgnPaymentOpen] = useState<boolean>(false);

  // Request quick quote on amount change
  const handleQuickQuote = async (amountVal: string) => {
    const num = Number(amountVal);
    if (!num || num <= 0) return;
    await requestQuote({
      sourceCurrency: 'NGN',
      destinationAsset: 'USDC',
      amount: num,
      side: 'source',
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleQuickQuote(depositAmount);
    }
  }, [isAuthenticated]);

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

  const handleOpenNgnPayment = (order: Order, payment?: Payment) => {
    const pmt = payment || order.payments?.[0] || null;
    setSelectedNgnOrder(order);
    setSelectedNgnPayment(pmt);
    setIsNgnPaymentOpen(true);
  };

  const handleProceedToDeposit = () => {
    if (currentQuote) {
      setActiveQuoteId(currentQuote.id);
      setIsCreateOrderOpen(true);
    }
  };

  const handleOrderCreated = (newOrder: Order, newPayment?: Payment) => {
    fetchOrders(0, 10, true);
    if (newPayment) {
      handleOpenNgnPayment(newOrder, newPayment);
    } else {
      setSelectedOrder(newOrder);
      setIsDetailsOpen(true);
    }
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
            AWAITING DEPOSIT
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

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
        <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <main className="max-w-xl mx-auto py-20 px-4 text-center">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100">Sign in to Access Dashboard</h1>
              <p className="text-sm text-slate-400 mt-2 mb-8">
                Please sign in to view your LuminaRail NGN deposit analytics, live quotes, and Stellar USDC settlement history.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer font-sans"
              >
                Sign In to Account
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden font-sans">
      {/* Background Grid Scan animation */}
      <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 w-full space-y-8">
          
          {/* Dashboard Header & Primary Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, <span className="text-emerald-400">{user?.email.split('@')[0]}</span>
                </h1>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80">
                  ACTIVE DEPOSIT RAIL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Seamlessly convert Nigerian Naira (NGN) to Stellar USDC via Paystack test checkout & Soroban smart contracts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => fetchOrders(0, 10, true)}
                disabled={ordersLoading}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  if (currentQuote) {
                    handleProceedToDeposit();
                  } else {
                    handleQuickQuote(depositAmount);
                    setIsCreateOrderOpen(true);
                  }
                }}
                className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>Deposit NGN / Buy USDC</span>
              </button>
            </div>
          </div>

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Total NGN Deposited */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Total NGN Deposited</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-100">
                  ₦{(stats?.completedVolumeNgn ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-semibold">100% Guaranteed</span> via Paystack Rail
                </div>
              </div>
            </div>

            {/* Card 2: Total USDC Settled */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Total USDC Settled</span>
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-sky-400">
                  {(stats?.completedVolumeUsdc ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-sky-300">USDC</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  On Stellar Testnet via Soroban Vault
                </div>
              </div>
            </div>

            {/* Card 3: Active / Pending Orders */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Active Orders</span>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-amber-300">
                  {(stats?.pendingCount ?? 0) + (stats?.processingCount ?? 0)} <span className="text-xs font-normal text-slate-400">orders</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {stats?.pendingCount ?? 0} pending deposit • {stats?.processingCount ?? 0} in settlement
                </div>
              </div>
            </div>

            {/* Card 4: Connected Wallet Status */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Stellar Wallet</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                {connectedWallet ? (
                  <div>
                    <div className="text-sm font-mono font-bold text-emerald-400 truncate">
                      {connectedWallet.slice(0, 10)}...{connectedWallet.slice(-6)}
                    </div>
                    <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Freighter Connected
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => connectWallet('freighter')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Connect Freighter Wallet
                    </button>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Required to receive on-chain USDC
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick Deposit NGN Widget & Live FX Quote Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Widget: Deposit NGN Quick Calculator */}
            <div className="lg:col-span-2 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-white">Instant NGN → USDC On-Ramp</h2>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    REAL FX RATES
                  </span>
                </div>

                {/* Amount input & presets */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Enter NGN Deposit Amount
                    </label>
                    <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-inner">
                      <div className="flex items-center gap-2 border-r border-slate-700 px-4 font-bold text-sm bg-slate-900/60 text-slate-200">
                        <img src="/assets/ngn.svg" alt="NGN" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span>NGN (₦)</span>
                      </div>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={depositAmount}
                        onChange={(e) => {
                          setDepositAmount(e.target.value);
                          handleQuickQuote(e.target.value);
                        }}
                        placeholder="100000"
                        className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-xl font-bold text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Amount Buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['10000', '50000', '100000', '250000', '500000'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setDepositAmount(preset);
                          handleQuickQuote(preset);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          depositAmount === preset
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        ₦{Number(preset).toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Quote Output Preview */}
                  {quoteLoading ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-2 text-slate-400 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Fetching live FX rate from backend...</span>
                    </div>
                  ) : currentQuote ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">You Will Receive</span>
                          <div className="text-2xl font-black text-emerald-400 mt-0.5">
                            {Number(currentQuote.destinationAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{' '}
                            <span className="text-sm font-semibold text-emerald-300">USDC</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Guaranteed FX Rate</span>
                          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                            1 USDC ≈ ₦{(1 / Number(currentQuote.exchangeRate)).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Platform Fee: <strong className="text-slate-200">₦{Number(currentQuote.fee).toLocaleString()} NGN</strong></span>
                        <span>Provider: <strong className="text-indigo-300 font-mono">PAYSTACK REAL FX</strong></span>
                        <span>Quote Locks: <strong className="text-amber-400 font-mono">{new Date(currentQuote.expiresAt).toLocaleTimeString()}</strong></span>
                      </div>
                    </div>
                  ) : quoteError ? (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                      {quoteError}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleProceedToDeposit}
                  disabled={!currentQuote || quoteLoading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <span>Continue to Paystack Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Side Card: How Paystack Deposit Works */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Deposit & Settlement Flow
                </h3>

                <ol className="space-y-4 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-semibold text-slate-100">Lock Real FX Rate</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Get live NGN/USDC rates with guaranteed fee transparency.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-semibold text-slate-100">Pay via Paystack Checkout</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Complete deposit via Paystack test bank transfer or card.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-semibold text-slate-100">Automatic Soroban Settlement</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        LuminaRail vault delivers USDC directly to your Stellar wallet address.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-400 block mb-0.5">Stellar Testnet Horizon</span>
                Transactions are recorded on-chain with full cryptographic verification.
              </div>
            </div>

          </div>

          {/* Recent Settlement Transactions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Recent NGN Deposit & Settlement Orders</h2>
                <p className="text-xs text-slate-400">Audit trail of all your on-ramp requests and Stellar transactions.</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View All Orders ({total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {ordersLoading && orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Loading your deposit orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-1">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-200">No NGN deposits recorded yet</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click the button below to initiate your first NGN deposit and receive Stellar USDC.
                </p>
                <button
                  onClick={handleProceedToDeposit}
                  className="mt-2 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer font-sans"
                >
                  Deposit NGN Now
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                        <th className="py-3.5 px-4 font-semibold">Order ID</th>
                        <th className="py-3.5 px-4 font-semibold">Deposit NGN</th>
                        <th className="py-3.5 px-4 font-semibold">Receive USDC</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold">Stellar Tx Hash</th>
                        <th className="py-3.5 px-4 font-semibold">Date</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((ord) => {
                        const settlement = ord.settlements?.[0];
                        const txHash = settlement?.stellarTransactionHash;

                        return (
                          <tr
                            key={ord.id}
                            onClick={() => handleOpenDetails(ord.id)}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          >
                            <td className="py-4 px-4 font-mono font-bold text-slate-200">
                              #{ord.id.slice(0, 8)}...
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-100">
                              ₦{Number(ord.sourceAmount).toLocaleString()}{' '}
                              <span className="text-slate-400 font-normal text-[11px]">NGN</span>
                            </td>
                            <td className="py-4 px-4 font-bold text-emerald-400">
                              {Number(ord.destinationAmount).toLocaleString()}{' '}
                              <span className="text-emerald-300 font-normal text-[11px]">{ord.destinationAsset}</span>
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(ord.status, ord.walletAddress)}</td>
                            <td className="py-4 px-4 font-mono">
                              {txHash ? (
                                <a
                                  href={getExplorerUrl(txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                                >
                                  <span>{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Pending Settlement</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString(undefined, {
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
                                    onClick={() => handleOpenNgnPayment(ord)}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer font-sans"
                                  >
                                    Pay NGN
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenDetails(ord.id)}
                                  className="py-1.5 px-3 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-700 hover:border-emerald-500/40 cursor-pointer font-sans"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRefresh={() => {
          if (selectedOrder) handleOpenDetails(selectedOrder.id);
          fetchOrders(0, 10, true);
        }}
      />

      <CreateOrderModal
        quoteId={activeQuoteId}
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <NgnPaymentModal
        isOpen={isNgnPaymentOpen}
        onClose={() => setIsNgnPaymentOpen(false)}
        order={selectedNgnOrder}
        payment={selectedNgnPayment}
        onPaymentUpdated={(updatedPayment) => {
          setSelectedNgnPayment(updatedPayment);
          fetchOrders(0, 10, true);
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
