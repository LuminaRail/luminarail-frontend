'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quote, Order, Payment } from '@/types/orders';
import { QuotesService } from '@/services/quotes';
import { OrdersService } from '@/services/orders';
import { PaymentsService } from '@/services/payments';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';

async function validateStellarAddress(address: string): Promise<boolean> {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (!/^G[A-Z2-7]{55}$/.test(trimmed)) return false;

  if (typeof window !== 'undefined') {
    try {
      const { StrKey } = await import('@stellar/stellar-sdk');
      return StrKey.isValidEd25519PublicKey(trimmed);
    } catch {
      return true;
    }
  }
  return true;
}

interface CreateOrderModalProps {
  quoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order, payment?: Payment) => void;
}

export function CreateOrderModal({ quoteId, isOpen, onClose, onOrderCreated }: CreateOrderModalProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { publicKey: connectedWalletAddress, connect: connectWallet } = useStellarWallet();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [orderType, setOrderType] = useState<'ON_RAMP' | 'OFF_RAMP'>('ON_RAMP');

  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [refreshingQuote, setRefreshingQuote] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('luminarail_wallet_address') : null;
      const addr = connectedWalletAddress || stored;
      if (addr) {
        setWalletAddress(addr);
      }
    }
  }, [isOpen, connectedWalletAddress]);

  useEffect(() => {
    if (!isOpen || !quoteId) return;

    const fetchQuote = async () => {
      setLoadingQuote(true);
      setError(null);
      try {
        const response = await QuotesService.getQuoteById(quoteId);
        if (response.success && response.data) {
          setQuote(response.data);
        } else {
          setError(response.message || 'Quote not found or expired.');
        }
      } catch (err) {
        setError('Failed to fetch quote information.');
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [quoteId, isOpen]);

  // Live Quote Expiration Countdown Timer
  useEffect(() => {
    if (!quote || !quote.expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const calcSeconds = () => {
      const expiresTime = new Date(quote.expiresAt).getTime();
      const diff = Math.max(0, Math.ceil((expiresTime - Date.now()) / 1000));
      return diff;
    };

    setSecondsLeft(calcSeconds());

    const interval = setInterval(() => {
      const remaining = calcSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote]);

  const isExpired =
    quote?.status === 'EXPIRED' ||
    (secondsLeft !== null && secondsLeft <= 0) ||
    (quote?.expiresAt ? new Date(quote.expiresAt).getTime() <= Date.now() : false);

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefreshQuote = async () => {
    if (!quote) return;
    setRefreshingQuote(true);
    setError(null);
    try {
      const response = await QuotesService.createQuote(
        {
          sourceCurrency: quote.sourceCurrency || 'NGN',
          destinationAsset: quote.destinationAsset || 'USDC',
          amount: Number(quote.sourceAmount || 10000),
          side: 'source',
        },
        token || undefined
      );

      if (response.success && response.data) {
        setQuote(response.data);
      } else {
        setError(response.message || 'Failed to refresh quote.');
      }
    } catch (err) {
      setError('Failed to refresh quote metrics.');
    } finally {
      setRefreshingQuote(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveWalletAddress = () => {
    if (typeof window !== 'undefined' && walletAddress.trim()) {
      localStorage.setItem('luminarail_wallet_address', walletAddress.trim());
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    if (!token || !isAuthenticated) {
      handleSaveWalletAddress();
      router.push(`/auth/login?redirect=${encodeURIComponent(`/orders?quoteId=${quote.id}`)}`);
      return;
    }

    if (isExpired) {
      setError('Quote has expired. Please refresh to lock in current rate.');
      return;
    }

    const trimmedAddress = walletAddress.trim();
    if (!trimmedAddress) {
      setError('Please connect your Stellar wallet or provide a valid destination address.');
      return;
    }

    const isValidAddr = await validateStellarAddress(trimmedAddress);
    if (!isValidAddr) {
      setError('Invalid Stellar destination address format. Address must be a 56-character ed25519 public key starting with "G".');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Create Order with verified Stellar destination address & Idempotency Key
      const orderIdempotencyKey = `order-onramp-${quote.id}-${Date.now()}`;
      const orderRes = await OrdersService.createOrder(
        {
          quoteId: quote.id,
          type: orderType,
          walletAddress: trimmedAddress,
        },
        token,
        orderIdempotencyKey
      );

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create order.');
      }

      const createdOrder = orderRes.data;

      // Step 2: Automatically initiate Paystack NGN payment rail
      let createdPayment: Payment | undefined;
      const pmtIdempotencyKey = `paystack-onramp-${createdOrder.id}-${Date.now()}`;
      try {
        const pmtRes = await PaymentsService.createPayment(
          {
            orderId: createdOrder.id,
            currency: quote.sourceCurrency,
            provider: 'PAYSTACK',
          },
          token,
          pmtIdempotencyKey
        );
        if (pmtRes.success && pmtRes.data) {
          createdPayment = pmtRes.data;
        }
      } catch (pmtErr) {
        console.warn('Auto Paystack payment initiation warning:', pmtErr);
      }

      onOrderCreated(createdOrder, createdPayment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Confirm Settlement Order</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Review quote metrics and specify destination wallet</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loadingQuote ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs">Loading quote metrics...</p>
            </div>
          ) : !quote && error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <p className="font-semibold">Unable to process quote</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          ) : quote ? (
            <form onSubmit={handleCreateOrder} className="space-y-5">
              
              {/* Error Banner with Refresh Action */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <div>
                      <p className="font-semibold">Unable to process quote</p>
                      <p className="mt-0.5">{error}</p>
                    </div>
                  </div>
                  {(error.toLowerCase().includes('expired') || isExpired) && (
                    <button
                      type="button"
                      onClick={handleRefreshQuote}
                      disabled={refreshingQuote}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingQuote ? 'animate-spin' : ''}`} />
                      <span>Refresh Quote</span>
                    </button>
                  )}
                </div>
              )}

              {/* Quote Expiry / Refresh Indicator */}
              {isExpired ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Quote has expired. Refresh to lock in latest rate.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshQuote}
                    disabled={refreshingQuote}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingQuote ? 'animate-spin' : ''}`} />
                    <span>Refresh Quote</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    <span>Quote Locks for: <strong className="text-amber-700 dark:text-amber-400">{formatTimer(secondsLeft)}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshQuote}
                    disabled={refreshingQuote}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingQuote ? 'animate-spin' : ''}`} />
                    <span>Refresh Rate</span>
                  </button>
                </div>
              )}

              {/* Quote Metrics Summary */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">You Pay</span>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {Number(quote.sourceAmount).toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{quote.sourceCurrency}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">You Receive</span>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {Number(quote.destinationAmount).toLocaleString()} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300">{quote.destinationAsset}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Exchange Rate:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-300 block">{Number(quote.exchangeRate).toFixed(6)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Platform Fee:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-300 block">{Number(quote.fee).toLocaleString()} {quote.sourceCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Destination Wallet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    Destination Stellar Wallet Address
                  </label>
                  {connectedWalletAddress ? (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        const addr = await connectWallet('freighter');
                        if (addr) setWalletAddress(addr);
                      }}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Wallet className="w-3 h-3" /> Connect Wallet
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="GBBD... (56-char Stellar Public Key G...)"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Settling USDC to this Stellar account via Soroban Vault smart contract.
                </p>
              </div>

              {/* Action Buttons: Unauthenticated vs Authenticated */}
              {!isAuthenticated || !token ? (
                <div className="pt-2 space-y-3">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-3">
                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-200">Account required to complete order</p>
                      <p className="mt-0.5 text-slate-600 dark:text-slate-400">Sign in or create an account to finalize settlement & proceed to deposit.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent(`/orders?quoteId=${quote.id}`)}`}
                      onClick={handleSaveWalletAddress}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Finish Order</span>
                    </Link>

                    <Link
                      href={`/auth/login?mode=register&redirect=${encodeURIComponent(`/orders?quoteId=${quote.id}`)}`}
                      onClick={handleSaveWalletAddress}
                      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Create Account</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  {isExpired ? (
                    <button
                      type="button"
                      onClick={handleRefreshQuote}
                      disabled={refreshingQuote}
                      className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {refreshingQuote ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Refreshing Quote Rate...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Quote Expired — Refresh Quote Rate</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || refreshingQuote}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Settlement Order...</span>
                        </>
                      ) : (
                        <span>Create Settlement Order & Proceed to Deposit</span>
                      )}
                    </button>
                  )}
                </div>
              )}

            </form>
          ) : null}
        </div>

      </div>
    </div>
  );
}
