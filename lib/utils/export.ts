import { Order } from '@/types/orders';

export const TRANSACTION_EXPORT_COLUMNS = [
  'Order ID',
  'Payment Ref',
  'NGN Amount',
  'USDC Amount',
  'Rate',
  'Stellar Hash',
  'Status',
] as const;

export interface TransactionExportRow {
  'Order ID': string;
  'Payment Ref': string;
  'NGN Amount': string;
  'USDC Amount': string;
  'Rate': string;
  'Stellar Hash': string;
  'Status': string;
}

const escapeCsvValue = (value: string): string => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const formatNumber = (value: number | string | undefined | null): string => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toString() : '0';
};

/**
 * Flattens an Order into the flat row shape used by both export formats.
 */
export function orderToExportRow(order: Order): TransactionExportRow {
  const payment = order.payments?.[0];
  const settlement = order.settlements?.[0];
  const txHash = settlement?.stellarTransactionHash;

  return {
    'Order ID': order.id ?? '',
    'Payment Ref': payment?.reference ?? '',
    'NGN Amount': formatNumber(order.sourceAmount),
    'USDC Amount': formatNumber(order.destinationAmount),
    'Rate': order.quote?.exchangeRate !== undefined ? formatNumber(order.quote.exchangeRate) : '',
    'Stellar Hash': txHash ?? '',
    'Status': order.status ?? '',
  };
}

/**
 * Serializes rows into RFC 4180-compliant CSV (quoting, escaping, CRLF line endings).
 */
export function ordersToCsv(orders: Order[]): string {
  const rows = orders.map(orderToExportRow);
  const header = TRANSACTION_EXPORT_COLUMNS.join(',');
  const body = rows
    .map((row) => TRANSACTION_EXPORT_COLUMNS.map((col) => escapeCsvValue(String(row[col] ?? ''))).join(','))
    .join('\r\n');

  return body ? `${header}\r\n${body}\r\n` : `${header}\r\n`;
}

/**
 * Serializes orders into a pretty-printed JSON export payload.
 */
export function ordersToJson(orders: Order[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalRecords: orders.length,
      records: orders.map(orderToExportRow),
    },
    null,
    2
  );
}

/**
 * Triggers a client-side download of the given content as a file.
 * Returns true when a download was initiated.
 */
export function downloadFile(filename: string, content: string, mimeType: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') return false;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const stamp = (date = new Date()): string => date.toISOString().replace(/[:.]/g, '-').slice(0, 19);

export function exportTransactionsAsCsv(orders: Order[]): boolean {
  return downloadFile(`luminarail-transactions-${stamp()}.csv`, ordersToCsv(orders), 'text/csv;charset=utf-8;');
}

export function exportTransactionsAsJson(orders: Order[]): boolean {
  return downloadFile(`luminarail-transactions-${stamp()}.json`, ordersToJson(orders), 'application/json;charset=utf-8;');
}
