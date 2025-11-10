import type { Currency } from '@/types';

/**
 * Format an amount with the appropriate currency symbol
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., "USD", "EUR")
 * @param currencies - Array of available currencies
 * @returns Formatted string with currency symbol (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  currencies: Currency[]
): string {
  const currency = currencies.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || currencyCode;

  // Format the number with thousands separators and 2 decimal places
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formattedAmount}`;
}

/**
 * Convert an amount from one currency to another using exchange rates
 * @param amount - The amount to convert
 * @param fromCode - Source currency code
 * @param toCode - Target currency code
 * @param rates - Exchange rates object where keys are currency codes
 * @returns Converted amount or null if conversion not possible
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number>
): number | null {
  // If same currency, no conversion needed
  if (fromCode === toCode) {
    return amount;
  }

  // Get the exchange rate
  const rate = rates[toCode];

  if (rate === undefined || rate === null) {
    return null;
  }

  return amount * rate;
}

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - The ISO 4217 currency code
 * @param currencies - Array of available currencies
 * @returns Currency symbol or the code if not found
 */
export function getCurrencySymbol(
  currencyCode: string,
  currencies: Currency[]
): string {
  const currency = currencies.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

/**
 * Sort currencies alphabetically by code
 * @param currencies - Array of currencies to sort
 * @returns Sorted array of currencies
 */
export function sortCurrencies(currencies: Currency[]): Currency[] {
  return [...currencies].sort((a, b) => a.code.localeCompare(b.code));
}
