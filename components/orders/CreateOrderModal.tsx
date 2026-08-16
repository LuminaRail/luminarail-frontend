'use client';

import React, { useState, useEffect } from 'react';
import { StrKey } from '@stellar/stellar-sdk';
import { Quote, Order, Payment } from '@/types/orders';
import { QuotesService } from '@/services/quotes';
import { OrdersService } from '@/services/orders';
import { PaymentsService } from '@/services/payments';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, ArrowRight, Loader2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateOrderModalProps {
  quoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order, payment?: Payment) => void;
}

export function CreateOrderModal({ quoteId, isOpen, onClose, onOrderCreated }: CreateOrderModalProps) {
  const { token } = useAuth();
  const { publicKey: connectedWalletAddress, connect: connectWallet } = useStellarWallet();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [orderType, setOrderType] = useState<'ON_RAMP' | 'OFF_RAMP'>('ON_RAMP');

  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !token) return;

    const trimmedAddress = walletAddress.trim();
    if (!trimmedAddress) {
      setError('Please connect your Stellar wallet or provide a valid destination address.');
      return;
    }

    if (!StrKey.isValidEd25519PublicKey(trimmedAddress)) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Confirm Settlement Order</h2>
              <p className="text-xs text-slate-400">Review quote metrics and specify destination wallet</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loadingQuote ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs">Loading quote metrics...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold">Unable to process quote</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          ) : quote ? (
            <form onSubmit={handleCreateOrder} className="space-y-5">
              
              {/* Quote Metrics Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">You Pay</span>
                    <div className="text-lg font-bold text-slate-100 mt-0.5">
                      {Number(quote.sourceAmount).toLocaleString()} <span className="text-xs font-normal text-slate-400">{quote.sourceCurrency}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">You Receive</span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                      {Number(quote.destinationAmount).toLocaleString()} <span className="text-xs font-normal text-emerald-300">{quote.destinationAsset}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Exchange Rate:</span>
                    <span className="font-semibold text-slate-300 block">{Number(quote.exchangeRate).toFixed(6)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Platform Fee:</span>
                    <span className="font-semibold text-slate-300 block">{Number(quote.fee).toLocaleString()} {quote.sourceCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Destination Wallet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Destination Stellar Wallet Address
                  </label>
                  {connectedWalletAddress ? (
                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        const addr = await connectWallet('freighter');
                        if (addr) setWalletAddress(addr);
                      }}
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Settling USDC to this Stellar account via Soroban Vault smart contract.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
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
              </div>

            </form>
          ) : null}
        </div>

      </div>
    </div>
  );
}
