/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Calculate percentage change
 * @param oldValue - The original value
 * @param newValue - The new value
 * @returns Percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get human-readable account type label
 * @param accountType - The account type code
 * @returns Formatted account type label
 */
export function getAccountTypeLabel(accountType: string): string {
  const labels: Record<string, string> = {
    checking: 'Checking',
    savings: 'Savings',
    tfsa: 'TFSA',
    rrsp: 'RRSP',
    fhsa: 'FHSA',
    margin: 'Margin',
    credit_card: 'Credit Card',
    line_of_credit: 'Line of Credit',
    payment_plan: 'Payment Plan',
    mortgage: 'Mortgage',
  };
  return labels[accountType] || accountType;
}

/**
 * Check if account type is a liability
 * @param accountType - The account type code
 * @returns True if the account is a liability
 */
export function isLiabilityAccount(accountType: string): boolean {
  return ['credit_card', 'line_of_credit', 'payment_plan', 'mortgage'].includes(accountType);
}

/**
 * Format number with optional decimal places
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date to short format (e.g., "Jan 15, 2024")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// Export logger utility
export { logger } from './logger';

// Export type guards
export * from './typeGuards';
