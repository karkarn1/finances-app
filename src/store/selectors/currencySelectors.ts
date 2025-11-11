/**
 * Memoized selectors for currencies
 * Performance optimization: Caches lookups and computations
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Currency } from '@/types';

// Base selectors
export const selectAllCurrencies = (state: RootState) => state.currencies.currencies;
export const selectCurrenciesLoading = (state: RootState) => state.currencies.isLoading;
export const selectCurrenciesError = (state: RootState) => state.currencies.error;

/**
 * Memoized selector: Find currency by code
 * Efficient lookup for currency by ISO code (USD, EUR, etc.)
 */
export const selectCurrencyByCode = createSelector(
  [selectAllCurrencies, (_state: RootState, code: string) => code],
  (currencies, code): Currency | undefined => {
    return currencies.find((currency: Currency) => currency.code === code);
  }
);

/**
 * Memoized selector: Get base currency (typically user's default)
 * Looks for USD as default, falls back to first active currency
 */
export const selectBaseCurrency = createSelector(
  [selectAllCurrencies],
  (currencies): Currency | undefined => {
    // Try to find USD first
    const usd = currencies.find((c: Currency) => c.code === 'USD' && c['is_active']);
    if (usd) return usd;

    // Fallback to first active currency
    return currencies.find((c: Currency) => c['is_active']);
  }
);

/**
 * Memoized selector: Filter active currencies only
 */
export const selectActiveCurrencies = createSelector(
  [selectAllCurrencies],
  (currencies): Currency[] => {
    return currencies.filter((currency: Currency) => currency['is_active']);
  }
);

/**
 * Memoized selector: Sort currencies alphabetically by code
 */
export const selectSortedCurrencies = createSelector(
  [selectAllCurrencies],
  (currencies): Currency[] => {
    return [...currencies].sort((a, b) => a.code.localeCompare(b.code));
  }
);

/**
 * Memoized selector: Group currencies by region/type
 * Useful for currency picker dropdowns
 */
export const selectCurrenciesByRegion = createSelector(
  [selectAllCurrencies],
  (currencies): Record<string, Currency[]> => {
    const regions: Record<string, Currency[]> = {
      'North America': [],
      'Europe': [],
      'Asia': [],
      'Other': [],
    };

    currencies.forEach((currency: Currency) => {
      switch (currency.code) {
        case 'USD':
        case 'CAD':
        case 'MXN':
          regions['North America']?.push(currency);
          break;
        case 'EUR':
        case 'GBP':
        case 'CHF':
        case 'SEK':
        case 'NOK':
          regions['Europe']?.push(currency);
          break;
        case 'JPY':
        case 'CNY':
        case 'KRW':
        case 'INR':
        case 'SGD':
          regions['Asia']?.push(currency);
          break;
        default:
          regions['Other']?.push(currency);
      }
    });

    return regions;
  }
);

/**
 * Memoized selector: Create currency code to symbol map
 * Efficient lookup for display purposes
 */
export const selectCurrencySymbolMap = createSelector(
  [selectAllCurrencies],
  (currencies): Record<string, string> => {
    return currencies.reduce((map: Record<string, string>, currency: Currency) => {
      map[currency.code] = currency.symbol;
      return map;
    }, {} as Record<string, string>);
  }
);

/**
 * Memoized selector: Get popular currencies (major trading currencies)
 */
export const selectPopularCurrencies = createSelector(
  [selectAllCurrencies],
  (currencies): Currency[] => {
    const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    return currencies.filter((currency: Currency) =>
      popularCodes.includes(currency.code) && currency['is_active']
    );
  }
);

/**
 * Memoized selector: Count of active vs inactive currencies
 */
export const selectCurrencyStatusCounts = createSelector(
  [selectAllCurrencies],
  (currencies): { active: number; inactive: number } => {
    return currencies.reduce(
      (counts: { active: number; inactive: number }, currency: Currency) => {
        if (currency['is_active']) {
          counts.active += 1;
        } else {
          counts.inactive += 1;
        }
        return counts;
      },
      { active: 0, inactive: 0 }
    );
  }
);
