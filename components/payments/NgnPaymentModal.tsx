'use client';

import React, { useState, useEffect } from 'react';
import { Order, Payment } from '@/types/orders';
import { PaymentsService } from '@/services/payments';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Copy,
  Check,
  Building2,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface NgnPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  payment: Payment | null;
  onPaymentUpdated: (payment: Payment) => void;
}

export function NgnPaymentModal({
  isOpen,
  onClose,
  order,
  payment,
  onPaymentUpdated,
}: NgnPaymentModalProps) {
  const { token } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-poll verification while modal is open and payment is PENDING
  useEffect(() => {
    if (!isOpen || !payment || !token || (payment.status !== 'PENDING' && payment.status !== 'CREATED')) return;

    const interval = setInterval(async () => {
      try {
        const res = await PaymentsService.verifyPayment(payment.id, {}, token);
        if (res.success && res.data) {
          if (res.data.status !== payment.status) {
            onPaymentUpdated({ ...payment, ...res.data });
            if (res.data.status === 'SUCCEEDED') {
              setSuccessMsg('Payment verified & confirmed! USDC settlement triggered.');
            }
          }
        }
      } catch {
        // Silent poll error ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, payment, token, onPaymentUpdated]);

  if (!isOpen || !order || !payment) return null;

  const isPaystackMode =
    (payment.provider && payment.provider.includes('PAYSTACK')) ||
    !!payment.instructions?.paymentUrl ||
    payment.metadata?.railType === 'PAYSTACK_TEST_CHECKOUT';

  const paymentUrl = payment.instructions?.paymentUrl || payment.metadata?.paymentUrl;

  const instructions = payment.instructions || {
    bankName: isPaystackMode ? 'Paystack Test Mode Checkout' : 'Providus Bank / LuminaRail Rail',
    accountNumber: payment.metadata?.accountNumber || (isPaystackMode ? undefined : '9982014821'),
    accountName: isPaystackMode ? 'Paystack Test Merchant' : 'LuminaRail On-Ramp Vault',
    reference: payment.reference || order.id,
    amount: payment.amount ? payment.amount.toString() : order.sourceAmount ? order.sourceAmount.toString() : '0',
    paymentUrl,
    instructions: isPaystackMode
      ? 'Complete Paystack TEST MODE payment via dynamic test bank transfer or test card.'
      : 'Transfer the exact NGN amount to this virtual bank account. Use reference in narration.',
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = async (simulateSuccess = false) => {
    if (!payment || !token) return;
    if (simulateSuccess) {
      setSimulating(true);
    } else {
      setVerifying(true);
    }
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await PaymentsService.verifyPayment(
        payment.id,
        simulateSuccess ? { simulateSuccess: true } : {},
        token
      );

      if (res.success && res.data) {
        onPaymentUpdated({ ...payment, ...res.data });
        if (res.data.status === 'SUCCEEDED') {
          setSuccessMsg('Payment verified & confirmed! USDC settlement triggered.');
        } else if (res.data.status === 'FAILED') {
          setError('Payment verification failed or expired.');
        } else {
          setSuccessMsg('Payment status refreshed: Pending.');
        }
      } else {
        setError(res.message || 'Failed to verify payment status.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verifying payment status.');
    } finally {
      setVerifying(false);
      setSimulating(false);
    }
  };

  const isPending = payment.status === 'PENDING' || payment.status === 'CREATED';
  const isSucceeded = payment.status === 'SUCCEEDED';
  const isFailed = payment.status === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn font-sans">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isPaystackMode
                ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">NGN Deposit Instructions</h2>
                {isPaystackMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40">
                    PAYSTACK TEST MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order #{order.id.slice(0, 8)}... • Reference <span className="font-mono text-slate-800 dark:text-slate-300">{payment.reference}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Amount Overview Banner */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">NGN Deposit Required</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                ₦{Number(payment.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">NGN</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">You Will Receive</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Number(order.destinationAmount).toLocaleString()} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300">{order.destinationAsset}</span>
              </div>
            </div>
          </div>

          {/* Paystack Test Mode Checkout Card OR Sandbox Account Card */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  {isPaystackMode ? 'Paystack Test Payment Checkout' : 'Bank Transfer Virtual Account'}
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                isSucceeded
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  : isFailed
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              }`}>
                {payment.status}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              
              {/* If Paystack Mode, display Paystack Checkout Button */}
              {isPaystackMode && paymentUrl ? (
                <div className="space-y-3">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <span>Pay via Paystack Test Checkout</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Opens Paystack TEST MODE hosted checkout page to test bank transfer or card payment.
                  </p>
                </div>
              ) : instructions.accountNumber ? (
                /* Sandbox Virtual Account Number Row */
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider">Virtual Account Number</span>
                    <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-0.5 tracking-wider">
                      {instructions.accountNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(instructions.accountNumber!, 'accountNumber')}
                    className="py-1.5 px-3 bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedField === 'accountNumber' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Account</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Provider Rail</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{instructions.bankName}</span>
                </div>
                <div className="bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Rail Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {isPaystackMode ? 'Paystack Hosted Checkout' : 'Sandbox Virtual Account'}
                  </span>
                </div>
              </div>

              {/* Payment Reference */}
              <div className="bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Payment Reference</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-300 mt-0.5 block text-xs">{payment.reference}</span>
                </div>
                <button
                  onClick={() => handleCopy(payment.reference, 'reference')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy reference"
                >
                  {copiedField === 'reference' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Guidance Note */}
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-300/90 text-[11px] flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  {instructions.instructions || 'Complete the payment. Once submitted, verify status or wait for webhook processing.'}
                </p>
              </div>

            </div>
          </div>

          {/* Status Banners & Controls */}
          {isPending && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">Awaiting Payment Confirmation</p>
                  <p className="text-amber-700 dark:text-amber-300/80 text-[11px] mt-0.5">
                    {isPaystackMode
                      ? 'Complete test transfer/card payment on Paystack checkout, then click Verify Payment Status below.'
                      : 'Transfer exact amount to virtual account above and verify.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleVerify(false)}
                  disabled={verifying || simulating}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Verify Payment Status</span>
                    </>
                  )}
                </button>

                {!isPaystackMode && (
                  <button
                    onClick={() => handleVerify(true)}
                    disabled={verifying || simulating}
                    className="w-full py-2.5 px-3 bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    title="Simulate successful bank transfer in sandbox test mode"
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Simulate Transfer (Test Mode)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {isSucceeded && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Payment Confirmed & Verified!</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300/80">
                Your NGN deposit has been verified by the payment provider. LuminaRail settlement engine is processing Soroban USDC delivery to your Stellar wallet address (<span className="font-mono font-bold text-emerald-900 dark:text-emerald-100">{order.walletAddress?.slice(0, 8)}...</span>).
              </p>
            </div>
          )}

          {isFailed && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Payment Unsuccessful</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300/80">
                The payment provider reported that this transaction failed or expired. Please initiate a new order or try again.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Provider: <span className="font-semibold text-slate-800 dark:text-slate-300">{payment.provider}</span></span>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
