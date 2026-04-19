// Copyright (c) FlexOps, LLC. All rights reserved.

/** Format a number as USD currency. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format an ISO date string to a localized display string. */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/** Format estimated delivery days as a human-readable string. */
export function formatDeliveryDays(days: number | null): string {
  if (days === null || days === undefined) return 'Varies';
  if (days === 0) return 'Same day';
  if (days === 1) return '1 business day';
  return `${days} business days`;
}
