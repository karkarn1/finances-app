/**
 * Memoized selectors for securities
 * Performance optimization: Caches computed values and prevents unnecessary re-renders
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Security } from '@/types';

// Base selectors

export const selectAllSecurities = (state: RootState) => state.securities['securities'];
export const selectSearchResults = (state: RootState) => state.securities.searchResults;
export const selectIsSearching = (state: RootState) => state.securities.isSearching;
export const selectSelectedSecurity = (state: RootState) => state.securities.selectedSecurity;
export const selectSecurityPrices = (state: RootState) => state.securities.prices;
export const selectIsSyncing = (state: RootState) => state.securities.isSyncing;

/**
 * Memoized selector: Find security by symbol
 * Factory function for parameterized selection
 */
export const selectSecurityBySymbol = createSelector(
  [selectAllSecurities, (_state: RootState, symbol: string) => symbol],
  (securities, symbol): Security | undefined => {
    return securities.find((security: Security) => security.symbol === symbol);
  }
);

/**
 * Memoized selector: Filter securities by type
 */
export const selectSecuritiesByType = createSelector(
  [selectAllSecurities, (_state: RootState, securityType: string) => securityType],
  (securities, securityType): Security[] => {
    return securities.filter((security: Security) => security.security_type === securityType);
  }
);

/**
 * Memoized selector: Group securities by type
 */
export const selectSecuritiesGroupedByType = createSelector(
  [selectAllSecurities],
  (securities): Record<string, Security[]> => {
    return securities.reduce((grouped: Record<string, Security[]>, security: Security) => {
      const type = security.security_type || 'unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(security);
      return grouped;
    }, {} as Record<string, Security[]>);
  }
);

/**
 * Memoized selector: Sort securities alphabetically by name
 */
export const selectSortedSecurities = createSelector(
  [selectAllSecurities],
  (securities): Security[] => {
    return [...securities].sort((a, b) => a.name.localeCompare(b.name));
  }
);

/**
 * Memoized selector: Get latest price for selected security
 */
export const selectLatestPrice = createSelector(
  [selectSecurityPrices],
  (prices) => {
    if (prices.length === 0) return undefined;
    return prices[prices.length - 1];
  }
);

/**
 * Memoized selector: Calculate price change over period
 */
export const selectPriceChange = createSelector(
  [selectSecurityPrices],
  (prices): { amount: number; percentage: number } | null => {
    if (prices.length < 2) return null;

    const oldestPrice = prices[0]?.close;
    const latestPrice = prices[prices.length - 1]?.close;

    if (!oldestPrice || !latestPrice) return null;

    const amount = latestPrice - oldestPrice;
    const percentage = (amount / oldestPrice) * 100;

    return { amount, percentage };
  }
);

/**
 * Memoized selector: Get price range (min/max)
 */
export const selectPriceRange = createSelector(
  [selectSecurityPrices],
  (prices): { min: number; max: number } | null => {
    if (prices.length === 0) return null;

    const priceValues = prices.map((p: typeof prices[number]) => p.close);
    return {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
    };
  }
);

/**
 * Memoized selector: Filter active/tradable securities
 */
export const selectActiveSecurities = createSelector(
  [selectAllSecurities],
  (securities): Security[] => {
    // Filter out securities that might be delisted or inactive
    // This is a placeholder - actual implementation depends on Security model
    return securities.filter((security: Security) => security.symbol && security.name);
  }
);

/**
 * Memoized selector: Count securities by exchange
 */
export const selectSecurityCountsByExchange = createSelector(
  [selectAllSecurities],
  (securities): Record<string, number> => {
    return securities.reduce((counts: Record<string, number>, security: Security) => {
      const exchange = security.exchange || 'unknown';
      counts[exchange] = (counts[exchange] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
);
