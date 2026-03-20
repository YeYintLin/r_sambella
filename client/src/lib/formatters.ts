/**
 * Currency and Data Formatting Utilities
 * Design: Nature-Inspired Manufacturing CRM
 * - MMK currency formatting with thousands separator
 * - Percentage formatting for metrics
 * - Production unit formatting
 */

export function formatMMK(amount: number): string {
  return new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatUnits(units: number): string {
  return new Intl.NumberFormat('en-US').format(units);
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusColor(status: 'running' | 'idle' | 'error'): string {
  switch (status) {
    case 'running':
      return 'bg-green-100 text-green-800';
    case 'idle':
      return 'bg-amber-100 text-amber-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusIcon(status: 'running' | 'idle' | 'error'): string {
  switch (status) {
    case 'running':
      return '●';
    case 'idle':
      return '◐';
    case 'error':
      return '✕';
    default:
      return '○';
  }
}
