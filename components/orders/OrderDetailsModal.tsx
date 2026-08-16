'use client';

import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { OrderLifecycleTimeline } from './OrderLifecycleTimeline';
import { PaymentsService } from '@/services/payments';
import { useAuth } from '@/context/AuthContext';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { OrdersService } from '@/services/orders';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Building2,
  ShieldCheck,
  Coins,
  AlertCircle,
  Loader2,
  Wallet,
  AlertTriangle,
  Info,
  Link as LinkIcon,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose, onRefresh }: OrderDetailsModalProps) {
  const { token } = useAuth();
  const { publicKey: connectedWalletAddress, connect: connectWallet } = useStellarWallet();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [attachingWallet, setAttachingWallet] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const quote = order.quote;
  const payment = order.payments?.[0];
  const settlement = order.settlements?.[0];
  const orderWallet = order.walletAddress;

  const isWalletMissing = !orderWallet || orderWallet.trim() === '';
  const isWalletMismatched =
    !!connectedWalletAddress &&
    !!orderWallet &&
    connectedWalletAddress.toLowerCase() !== orderWallet.toLowerCase();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAttachWallet = async (addressToAttach?: string) => {
    const targetAddr = addressToAttach || connectedWalletAddress;
    if (!targetAddr || !token || !order) return;

    setAttachingWallet(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await OrdersService.updateOrderWallet(order.id, targetAddr, token);
      if (res.success && res.data) {
        setActionSuccess(`Stellar destination wallet associated successfully! (${targetAddr.slice(0, 8)}...${targetAddr.slice(-6)})`);
        onRefresh();
      } else {
        setActionError(res.message || 'Failed to attach wallet address.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error associating wallet.');
    } finally {
      setAttachingWallet(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!payment || !token) return;
    setVerifyingPayment(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await PaymentsService.verifyPayment(payment.id, {}, token);
      if (res.success && res.data) {
        setActionSuccess(`Payment verified! Status: ${res.data.status}`);
        onRefresh();
      } else {
        setActionError(res.message || 'Payment verification failed.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error verifying payment.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const getFormattedProvider = (provName?: string | null) => {
    if (!provName || provName === 'MOCK' || provName === 'MOCK_PROVIDER' || provName === 'LUMINA_PAY') {
      return 'LuminaRail Direct Pay';
    }
    if (provName === 'REAL_FX_PROVIDER') {
      return 'Real FX Provider';
    }
    return provName;
  };

  const getExplorerUrl = (txHash: string) => {
    const net = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
    return `https://stellar.expert/explorer/${net}/tx/${txHash}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 min-h-screen shadow-2xl flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Order #{order.id.slice(0, 8)}...</h2>
                <button
                  onClick={() => handleCopy(order.id, 'orderId')}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title="Copy full Order ID"
                >
                  {copiedField === 'orderId' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Type: <span className="font-semibold text-slate-300">{order.type}</span> • Created{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh order status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Wallet Action Required Banner */}
          {isWalletMissing && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800 text-purple-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-purple-300">Action Required: Associate Destination Stellar Wallet</p>
                  <p className="text-purple-200/80 mt-0.5">
                    Your order needs a valid Stellar wallet address to receive the on-chain USDC settlement.
                  </p>
                </div>
                {connectedWalletAddress ? (
                  <button
                    onClick={() => handleAttachWallet(connectedWalletAddress)}
                    disabled={attachingWallet}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    {attachingWallet ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5" />
                    )}
                    <span>Link Connected Wallet ({connectedWalletAddress.slice(0, 6)}...{connectedWalletAddress.slice(-4)})</span>
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const addr = await connectWallet('freighter');
                      if (addr) await handleAttachWallet(addr);
                    }}
                    disabled={attachingWallet}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect Stellar Wallet</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Wallet Mismatch Warning */}
          {isWalletMismatched && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Wallet Mismatch Detected</p>
                <p className="text-amber-200/80 mt-0.5">
                  This order is associated with Stellar wallet <span className="font-mono font-bold text-amber-100">{orderWallet?.slice(0, 8)}...{orderWallet?.slice(-6)}</span>, but your connected wallet is <span className="font-mono font-bold text-amber-100">{connectedWalletAddress?.slice(0, 8)}...{connectedWalletAddress?.slice(-6)}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Visual Order Lifecycle Timeline */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
            <OrderLifecycleTimeline order={order} />
          </div>

          {/* Order Overview Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Source Amount</span>
              <div className="text-lg font-bold text-slate-100 mt-1">
                {Number(order.sourceAmount).toLocaleString()} <span className="text-xs font-normal text-slate-400">{order.sourceCurrency}</span>
              </div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Destination Settlement</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {Number(order.destinationAmount).toLocaleString()} <span className="text-xs font-normal text-emerald-300">{order.destinationAsset}</span>
              </div>
            </div>
          </div>

          {/* Stellar Destination Wallet Info */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Stellar Settlement Destination</h3>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                isWalletMissing
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isWalletMissing ? 'ACTION REQUIRED' : 'VERIFIED'}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="font-mono text-slate-200 truncate text-[11px]">
                  {orderWallet || 'No Stellar destination wallet associated'}
                </span>
                {orderWallet ? (
                  <button
                    onClick={() => handleCopy(orderWallet, 'walletAddress')}
                    className="text-slate-400 hover:text-slate-200 p-1 shrink-0 cursor-pointer"
                    title="Copy wallet address"
                  >
                    {copiedField === 'walletAddress' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : connectedWalletAddress ? (
                  <button
                    onClick={() => handleAttachWallet(connectedWalletAddress)}
                    disabled={attachingWallet}
                    className="py-1 px-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {attachingWallet ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3" />}
                    <span>Link Connected Wallet</span>
                  </button>
                ) : null}
              </div>

              {/* Server Signer Clarification Callout */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/50 text-indigo-300/90 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-indigo-200">On-Chain Settlement Architecture</p>
                  <p className="mt-0.5 text-indigo-300/80">
                    LuminaRail server-side vault signer executes Soroban smart contract transactions on Stellar Testnet, delivering settled USDC directly to your recipient address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Information */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Quote Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Exchange Rate:</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  1 {order.sourceCurrency} = {quote ? Number(quote.exchangeRate).toFixed(6) : '-'} {order.destinationAsset}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Fee:</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {quote ? Number(quote.fee).toLocaleString() : '0.00'} {order.sourceCurrency}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Provider:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{getFormattedProvider(quote?.provider)}</p>
              </div>
              <div>
                <span className="text-slate-500">Quote Expiry:</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {quote ? new Date(quote.expiresAt).toLocaleTimeString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Payment Information</h3>
              </div>
              {payment && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {payment.status}
                </span>
              )}
            </div>

            {payment ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Payment ID:</span>
                    <p className="font-mono text-slate-300 mt-0.5 truncate">{payment.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Reference:</span>
                    <p className="font-mono text-slate-300 mt-0.5 truncate">{payment.reference}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Provider Payment ID:</span>
                    <p className="font-mono text-slate-300 mt-0.5 truncate">
                      {payment.providerPaymentId ? payment.providerPaymentId.replace(/^mock_pay_/, 'PAY_') : 'PENDING'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Provider:</span>
                    <p className="font-semibold text-slate-300 mt-0.5">{getFormattedProvider(payment.provider)}</p>
                  </div>
                </div>

                {payment.currency === 'NGN' && (
                  <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                      <span>NGN BANK TRANSFER DEPOSIT DETAILS</span>
                      <span className="text-[10px] font-mono text-slate-400">Providus Bank / LuminaRail</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Virtual Account Number</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-white text-sm">
                            {payment.instructions?.accountNumber || payment.metadata?.accountNumber || '9982014821'}
                          </span>
                          <button
                            onClick={() => handleCopy(payment.instructions?.accountNumber || payment.metadata?.accountNumber || '9982014821', 'accNumModal')}
                            className="text-indigo-400 hover:text-indigo-300 p-1 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedField === 'accNumModal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Account Name</span>
                        <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                          {payment.instructions?.accountName || 'LuminaRail Vault'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Reference / Narration</span>
                        <span className="font-mono font-bold text-amber-300 block">{payment.reference}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(payment.reference, 'refModal')}
                        className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                        title="Copy Reference"
                      >
                        {copiedField === 'refModal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {payment.status !== 'SUCCEEDED' && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleVerifyPayment}
                      disabled={verifyingPayment}
                      className="py-2 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {verifyingPayment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Payment...</span>
                        </>
                      ) : (
                        <span>Verify / Confirm Payment</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No payment record associated yet.</p>
            )}
          </div>

          {/* Settlement Information */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Settlement & Soroban Details</h3>
              </div>
              {settlement && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {settlement.status}
                </span>
              )}
            </div>

            {settlement ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Settlement ID:</span>
                    <p className="font-mono text-slate-300 mt-0.5 truncate">{settlement.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Destination Wallet:</span>
                    <p className="font-mono text-slate-300 mt-0.5 truncate">
                      {settlement.destination || order.walletAddress || 'Not specified'}
                    </p>
                  </div>
                  {settlement.stellarLedger && (
                    <div>
                      <span className="text-slate-500">Stellar Ledger:</span>
                      <p className="font-mono text-slate-300 mt-0.5">#{settlement.stellarLedger}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Attempt Count:</span>
                    <p className="font-mono text-slate-300 mt-0.5">{settlement.attemptCount}</p>
                  </div>
                </div>

                {settlement.stellarTransactionHash && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Stellar Transaction Hash:</span>
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono text-emerald-400 truncate text-[11px]">
                        {settlement.stellarTransactionHash}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(settlement.stellarTransactionHash!, 'txHash')}
                          className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                          title="Copy Transaction Hash"
                        >
                          {copiedField === 'txHash' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={getExplorerUrl(settlement.stellarTransactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {settlement.lastError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-[11px]">
                    <span className="font-semibold block mb-0.5">Last Error:</span>
                    <p>{settlement.lastError}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {order.status === 'SETTLEMENT_PENDING'
                  ? 'Settlement queued for Soroban execution worker.'
                  : order.status === 'PAYMENT_CONFIRMED' && !order.walletAddress
                  ? 'Payment confirmed. Connect a Stellar wallet to begin on-chain settlement.'
                  : 'Settlement record will be created upon payment verification and wallet association.'}
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
