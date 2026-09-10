import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Issue #37 — Mobile Transaction Experience
 *
 * Static layout-contract tests: they parse the component sources and assert
 * the responsive classes / touch-target affordances that guarantee no
 * horizontal overflow and 44x44px touch targets on mobile viewports
 * (320px - 768px).
 */
const readSource = (relPath: string): string =>
  readFileSync(path.resolve(__dirname, '..', relPath), 'utf-8');

const TRANSACTIONS_PAGE = 'app/transactions/page.tsx';
const NGN_PAYMENT_MODAL = 'components/payments/NgnPaymentModal.tsx';
const CREATE_ORDER_MODAL = 'components/orders/CreateOrderModal.tsx';
const QUOTES_PAGE = 'app/quotes/page.tsx';
const WALLET_SELECT_MODAL = 'components/wallet/WalletSelectModal.tsx';

describe('Mobile Transaction Experience — layout contracts (#37)', () => {
  describe('transactions page', () => {
    const src = readSource(TRANSACTIONS_PAGE);

    it('renders a stacked card list for transactions on mobile', () => {
      expect(src).toMatch(/className="md:hidden divide-y/);
      expect(src).toMatch(/\{\/\* Mobile: stacked transaction cards \*\/\}/);
    });

    it('hides the desktop table below the md breakpoint', () => {
      expect(src).toMatch(/className="hidden md:block overflow-x-auto"/);
    });

    it('stacks the search / export toolbar vertically on mobile', () => {
      expect(src).toMatch(/flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3/);
    });

    it('wraps the page header actions so they never overflow', () => {
      expect(src).toMatch(/flex items-center gap-3 flex-wrap/);
    });

    it('stacks the pagination footer on mobile with labelled 44px controls', () => {
      expect(src).toMatch(/flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs/);
      expect(src).toMatch(/aria-label="Previous page"/);
      expect(src).toMatch(/aria-label="Next page"/);
      expect(src).toMatch(/min-h-\[44px\] min-w-\[44px\] rounded-lg/);
    });

    it('gives export buttons 44px touch targets and disabled empty-state handling', () => {
      expect(src).toMatch(/Export CSV/);
      expect(src).toMatch(/Export JSON/);
      expect(src).toMatch(/min-h-\[44px\] py-2 px-3 bg-white/);
      expect(src).toMatch(/disabled=\{filteredOrders\.length === 0\}/);
    });

    it('keeps mobile card action buttons at 44px height', () => {
      expect(src).toMatch(/min-h-\[44px\] py-2 px-3 bg-emerald-600/);
      expect(src).toMatch(/min-h-\[44px\] py-2 px-3 bg-slate-100/);
    });
  });

  describe('NGN payment modal', () => {
    const src = readSource(NGN_PAYMENT_MODAL);

    it('caps modal height so body content scrolls instead of overflowing', () => {
      expect(src).toMatch(/max-h-\[92dvh\]/);
    });

    it('stacks the amount overview banner vertically on mobile', () => {
      expect(src).toMatch(/flex flex-col sm:flex-row sm:items-center justify-between gap-3/);
    });

    it('collapses the provider details grid to one column on mobile', () => {
      expect(src).toMatch(/grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs/);
    });

    it('collapses the verify / simulate action buttons to one column on mobile', () => {
      expect(src).toMatch(/grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1/);
    });

    it('uses 44px touch targets for the header close and reference copy buttons', () => {
      expect(src).toMatch(/min-h-\[44px\] min-w-\[44px\] flex items-center justify-center/);
      expect(src).toMatch(/min-h-\[44px\] min-w-\[44px\] flex items-center justify-center p-1\.5/);
    });

    it('breaks long account numbers and references instead of overflowing', () => {
      expect(src).toMatch(/tracking-wider break-all/);
      expect(src).toMatch(/text-xs break-all/);
    });

    it('aligns error and success alerts for long-text wrapping', () => {
      expect(src).toMatch(/flex items-start gap-2\.5">\s*\n\s*<AlertCircle/);
      expect(src).toMatch(/<span className="min-w-0 break-words">\{error\}<\/span>/);
      expect(src).toMatch(/<span className="min-w-0 break-words">\{successMsg\}<\/span>/);
    });
  });

  describe('create order modal (quote card)', () => {
    const src = readSource(CREATE_ORDER_MODAL);

    it('stacks the you-pay / you-receive quote card on mobile', () => {
      expect(src).toMatch(/flex flex-col sm:flex-row sm:items-center justify-between gap-3/);
      expect(src).toMatch(/rotate-90 sm:rotate-0/);
    });

    it('keeps the wallet address input at 44px touch height', () => {
      expect(src).toMatch(/min-h-\[44px\] text-xs text-slate-900/);
    });

    it('caps modal height on small viewports', () => {
      expect(src).toMatch(/max-h-\[92dvh\]/);
    });

    it('lets the error banner wrap instead of pushing content off-screen', () => {
      expect(src).toMatch(/flex flex-wrap items-center justify-between gap-3/);
    });
  });

  describe('quotes page (NGN amount input)', () => {
    const src = readSource(QUOTES_PAGE);

    it('keeps the amount input at 44px height with fluid text sizing', () => {
      expect(src).toMatch(/min-h-\[44px\] text-base sm:text-lg outline-none/);
    });

    it('prevents the currency suffix from squeezing the input', () => {
      expect(src).toMatch(/px-3 sm:px-4 font-semibold text-slate-700 dark:text-slate-200 shrink-0/);
    });

    it('uses a 44px select control for quote direction', () => {
      expect(src).toMatch(/px-4 py-3 min-h-\[44px\] outline-none/);
    });
  });

  describe('wallet association modal', () => {
    const src = readSource(WALLET_SELECT_MODAL);

    it('gives the cancel action a 44px touch target', () => {
      expect(src).toMatch(/min-h-\[44px\] px-4 py-2 text-xs font-semibold/);
    });
  });

  describe('settlement status progress (order lifecycle timeline)', () => {
    const src = readSource('components/orders/OrderLifecycleTimeline.tsx');

    it('wraps long transaction hashes in step descriptions', () => {
      expect(src).toMatch(/mt-0\.5 break-words">\{step\.description\}<\/p>/);
    });

    it('keeps the status badge from colliding with the heading on narrow screens', () => {
      expect(src).toMatch(/flex items-center justify-between gap-2 mb-4/);
    });
  });
});
