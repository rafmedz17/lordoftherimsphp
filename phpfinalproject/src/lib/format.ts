import { format, parseISO } from 'date-fns';

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
}

/** "2025-03-20" → "Mar 20, 2025" */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'MMM d, yyyy');
}
