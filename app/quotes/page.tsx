'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useQuotes } from '@/hooks/useQuotes';
import { GridScan } from '@/components/backgrounds/GridScan';

export default function QuotesPage() {
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'source' | 'destination'>('source');

  const {
    currentQuote,
    loading,
    error,
    requestQuote,
    clearQuote,
  } = useQuotes();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    await requestQuote({
      sourceCurrency: 'NGN',
      destinationAsset: 'USDC',
      amount: numericAmount,
      side,
    });
  };

  const formatAmount = (value: number | string) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      {/* Background Grid Scan animation */}
      <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-400">
            LuminaRail
          </p>

          <h1 className="text-3xl font-bold">
            Get a settlement quote
          </h1>

          <p className="mt-2 text-slate-400">
            Get a live quote for converting NGN into Stellar USDC.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Request quote
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {side === 'source' ? 'You are paying' : 'You receive'}
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      if (currentQuote) clearQuote();
                    }}
                    placeholder={side === 'source' ? '100000' : '100'}
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-lg outline-none"
                  />

                  <div className="flex items-center gap-2 border-l border-slate-700 px-4 font-semibold">
                    {side === 'source' ? (
                      <>
                        <img
                          src="/assets/ngn.svg"
                          alt="NGN"
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span>NGN</span>
                      </>
                    ) : (
                      <>
                        <img
                          src="/assets/usdc.svg"
                          alt="USDC"
                          className="w-5 h-5 rounded-full shrink-0"
                        />
                        <span>USDC</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Settlement asset
                </label>

                <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 flex items-center gap-3">
                  <img
                    src="/assets/usdc.svg"
                    alt="USDC"
                    className="w-6 h-6 rounded-full shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-sm">USDC</div>
                    <div className="text-xs text-slate-500">Stellar Testnet</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Quote direction
                </label>

                <select
                  value={side}
                  onChange={(event) => {
                    setSide(
                      event.target.value as 'source' | 'destination'
                    );
                    if (currentQuote) clearQuote();
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
                >
                  <option value="source">
                    I enter the NGN amount
                  </option>
                  <option value="destination">
                    I want a specific USDC amount
                  </option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Getting quote...' : 'Get quote'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Quote details
            </h2>

            {!currentQuote ? (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 text-center text-sm text-slate-500">
                Enter an amount and request a quote.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    You pay
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={currentQuote.sourceCurrency === 'NGN' ? '/assets/ngn.svg' : '/assets/usdc.svg'}
                      alt={currentQuote.sourceCurrency}
                      className="w-5 h-5 rounded-full shrink-0"
                    />
                    <p className="text-2xl font-bold">
                      {formatAmount(currentQuote.sourceAmount)}{' '}
                      <span className="text-base text-slate-400">
                        {currentQuote.sourceCurrency}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-indigo-950/40 p-5">
                  <p className="text-sm text-slate-400">
                    You receive
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={(currentQuote.destinationAsset ?? currentQuote.targetCurrency) === 'NGN' ? '/assets/ngn.svg' : '/assets/usdc.svg'}
                      alt="Destination Asset"
                      className="w-6 h-6 rounded-full shrink-0"
                    />
                    <p className="text-3xl font-bold text-indigo-300">
                      {formatAmount(currentQuote.destinationAmount ?? currentQuote.targetAmount ?? 0)}{' '}
                      <span className="text-base font-semibold">
                        {currentQuote.destinationAsset ?? currentQuote.targetCurrency ?? 'USDC'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Exchange rate
                    </span>
                    <span>
                      {formatAmount(currentQuote.exchangeRate)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Fee
                    </span>
                    <span>
                      {formatAmount(currentQuote.fee ?? currentQuote.feeAmount ?? 0)}{' '}
                      {currentQuote.sourceCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Provider
                    </span>
                    <span className="text-xs">
                      {currentQuote.provider}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Expires
                    </span>
                    <span>
                      {new Date(
                        currentQuote.expiresAt
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/orders?quoteId=${currentQuote.id}`}
                  className="block w-full text-center rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-4 py-3 font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                >
                  Continue to settlement
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
