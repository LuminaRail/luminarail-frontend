import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TRANSACTION_EXPORT_COLUMNS,
  orderToExportRow,
  ordersToCsv,
  ordersToJson,
  downloadFile,
  exportTransactionsAsCsv,
  exportTransactionsAsJson,
} from '../lib/utils/export';
import { Order } from '../types/orders';

/**
 * Issue #21 — CSV and JSON export functionality for transaction history.
 */

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ord_12345678',
  userId: 'usr_1',
  quoteId: 'q_1',
  type: 'ON_RAMP',
  status: 'COMPLETED',
  sourceCurrency: 'NGN',
  destinationAsset: 'USDC',
  sourceAmount: '100000',
  destinationAmount: '66.5',
  walletAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  createdAt: '2026-08-15T10:00:00Z',
  updatedAt: '2026-08-15T10:00:00Z',
  ...overrides,
});

describe('Transaction export utilities (#21)', () => {
  describe('orderToExportRow', () => {
    it('maps an order to the flat export row with all required columns', () => {
      const row = orderToExportRow(
        buildOrder({
          payments: [
            {
              id: 'pmt_1',
              orderId: 'ord_12345678',
              userId: 'usr_1',
              provider: 'PAYSTACK',
              type: 'DEPOSIT',
              amount: '100000',
              currency: 'NGN',
              status: 'SUCCEEDED',
              reference: 'PAY_REF_001',
              createdAt: '2026-08-15T10:00:00Z',
            },
          ],
          settlements: [
            {
              id: 'stl_1',
              orderId: 'ord_12345678',
              userId: 'usr_1',
              status: 'COMPLETED',
              asset: 'USDC',
              amount: '66.5',
              stellarTransactionHash: 'abc123def456789',
              attemptCount: 1,
              createdAt: '2026-08-15T10:00:00Z',
            },
          ],
          quote: {
            id: 'q_1',
            sourceCurrency: 'NGN',
            destinationAsset: 'USDC',
            sourceAmount: '100000',
            destinationAmount: '66.5',
            exchangeRate: '1500.25',
            fee: '500',
            expiresAt: '2026-08-15T10:01:00Z',
            status: 'COMPLETED',
          },
        })
      );

      expect(Object.keys(row)).toEqual([...TRANSACTION_EXPORT_COLUMNS]);
      expect(row['Order ID']).toBe('ord_12345678');
      expect(row['Payment Ref']).toBe('PAY_REF_001');
      expect(row['NGN Amount']).toBe('100000');
      expect(row['USDC Amount']).toBe('66.5');
      expect(row['Rate']).toBe('1500.25');
      expect(row['Stellar Hash']).toBe('abc123def456789');
      expect(row['Status']).toBe('COMPLETED');
    });

    it('falls back to empty strings when payment, settlement, or quote are missing', () => {
      const row = orderToExportRow(buildOrder({ payments: [], settlements: [] }));

      expect(row['Payment Ref']).toBe('');
      expect(row['Stellar Hash']).toBe('');
      expect(row['Rate']).toBe('');
    });
  });

  describe('ordersToCsv', () => {
    it('produces a header row plus one row per order with CRLF endings', () => {
      const csv = ordersToCsv([buildOrder(), buildOrder({ id: 'ord_2', status: 'FAILED' })]);
      const lines = csv.split('\r\n');

      expect(lines[0]).toBe('Order ID,Payment Ref,NGN Amount,USDC Amount,Rate,Stellar Hash,Status');
      expect(lines[1]).toContain('ord_12345678');
      expect(lines[2]).toContain('ord_2');
      expect(csv.endsWith('\r\n')).toBe(true);
    });

    it('returns only the header for an empty order list', () => {
      expect(ordersToCsv([])).toBe('Order ID,Payment Ref,NGN Amount,USDC Amount,Rate,Stellar Hash,Status\r\n');
    });

    it('escapes values containing commas, quotes, and newlines per RFC 4180', () => {
      const csv = ordersToCsv([
        buildOrder({
          id: 'ord,"tricky"',
          settlements: [
            {
              id: 'stl_1',
              orderId: 'x',
              userId: 'u',
              status: 'COMPLETED',
              asset: 'USDC',
              amount: '1',
              stellarTransactionHash: 'hash\nwith newline',
              attemptCount: 1,
              createdAt: '2026-08-15T10:00:00Z',
            },
          ],
        }),
      ]);

      expect(csv).toContain('"ord,""tricky"""');
      expect(csv).toContain('"hash\nwith newline"');
    });
  });

  describe('ordersToJson', () => {
    it('includes metadata and one flat record per order', () => {
      const parsed = JSON.parse(ordersToJson([buildOrder(), buildOrder({ id: 'ord_2' })]));

      expect(parsed.totalRecords).toBe(2);
      expect(parsed.records).toHaveLength(2);
      expect(parsed.records[0]).toMatchObject({
        'Order ID': 'ord_12345678',
        'NGN Amount': '100000',
        'USDC Amount': '66.5',
        Status: 'COMPLETED',
      });
      expect(typeof parsed.exportedAt).toBe('string');
    });
  });

  describe('downloadFile', () => {
    let anchorClick: ReturnType<typeof vi.fn>;
    let createdObjectUrls: string[] = [];

    beforeEach(() => {
      anchorClick = vi.fn();
      createdObjectUrls = [];

      vi.stubGlobal('Blob', class {
        constructor(public parts: string[], public options: { type: string }) {}
      });
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => {
          const url = `blob:mock-${createdObjectUrls.length}`;
          createdObjectUrls.push(url);
          return url;
        }),
        revokeObjectURL: vi.fn(),
      });
      vi.stubGlobal('window', {});
      vi.stubGlobal('document', {
        createElement: vi.fn(() => ({ href: '', download: '', click: anchorClick, remove: vi.fn() })),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('creates a blob download anchor, clicks it, and revokes the URL', () => {
      const result = downloadFile('file.csv', 'a,b', 'text/csv');

      expect(result).toBe(true);
      expect(anchorClick).toHaveBeenCalledTimes(1);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-0');
    });

    it('returns false when running in a non-browser environment', () => {
      vi.stubGlobal('document', undefined);

      expect(downloadFile('file.csv', 'a,b', 'text/csv')).toBe(false);
    });
  });

  describe('exportTransactionsAsCsv / exportTransactionsAsJson', () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('downloads a timestamped CSV file', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-10T12:34:56Z'));
      const click = vi.fn();
      vi.stubGlobal('Blob', class { constructor(public parts: string[]) {} });
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      });
      vi.stubGlobal('window', {});
      vi.stubGlobal('document', {
        createElement: vi.fn(() => ({ href: '', download: '', click, remove: vi.fn() })),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      expect(exportTransactionsAsCsv([buildOrder()])).toBe(true);
      expect(click).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('downloads a timestamped JSON file', () => {
      vi.stubGlobal('Blob', class { constructor(public parts: string[]) {} });
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      });
      vi.stubGlobal('window', {});
      vi.stubGlobal('document', {
        createElement: vi.fn(() => ({ href: '', download: '', click: vi.fn(), remove: vi.fn() })),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      expect(exportTransactionsAsJson([buildOrder()])).toBe(true);
    });

    it('fails gracefully outside the browser', () => {
      expect(exportTransactionsAsCsv([buildOrder()])).toBe(false);
      expect(exportTransactionsAsJson([buildOrder()])).toBe(false);
    });
  });
});
