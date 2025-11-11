/**
 * Securities RTK Query API
 *
 * Provides endpoints for security search, details, synchronization, and price data.
 * Integrates with Yahoo Finance for real-time market data.
 */

import { baseApi } from './baseApi';
import type { Security, SecurityPricesResponse, SyncResponse } from '@/types';

/**
 * Securities API endpoints
 *
 * Includes:
 * - Security search
 * - Security details retrieval
 * - Yahoo Finance synchronization
 * - Historical price data retrieval
 * - Automatic cache invalidation
 */
export const securitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Search securities by symbol or name
     */
    searchSecurities: builder.query<Security[], string>({
      query: (query) => `securities/search?q=${encodeURIComponent(query)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ symbol }) => ({ type: 'Security' as const, id: symbol })),
              { type: 'SecurityList' as const },
            ]
          : [{ type: 'SecurityList' as const }],
    }),

    /**
     * Get security details by symbol
     */
    getSecurity: builder.query<Security, string>({
      query: (symbol) => `securities/${symbol}`,
      providesTags: (_result, _error, symbol) => [{ type: 'Security', id: symbol }],
    }),

    /**
     * Sync security data from Yahoo Finance
     *
     * Updates security information and price data from Yahoo Finance.
     * Invalidates both security details and price caches.
     */
    syncSecurity: builder.mutation<SyncResponse, string>({
      query: (symbol) => ({
        url: `securities/${symbol}/sync`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, symbol) => [
        { type: 'Security', id: symbol },
        { type: 'SecurityPrices', id: symbol },
      ],
    }),

    /**
     * Get security price data
     *
     * Supports various time intervals and date ranges.
     */
    getSecurityPrices: builder.query<
      SecurityPricesResponse,
      { symbol: string; start?: string; end?: string; interval?: string }
    >({
      query: ({ symbol, start, end, interval = '1d' }) => {
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        params.append('interval', interval);
        return `securities/${symbol}/prices?${params.toString()}`;
      },
      providesTags: (_result, _error, { symbol }) => [{ type: 'SecurityPrices', id: symbol }],
    }),
  }),
});

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useSearchSecuritiesQuery,
  useLazySearchSecuritiesQuery,
  useGetSecurityQuery,
  useSyncSecurityMutation,
  useGetSecurityPricesQuery,
} = securitiesApi;
