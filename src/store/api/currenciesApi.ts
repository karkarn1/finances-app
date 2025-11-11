/**
 * Currencies RTK Query API
 *
 * Provides endpoints for currency management and exchange rate operations.
 */

import { baseApi } from './baseApi';
import type {
  Currency,
  CurrencyCreate,
  CurrencyUpdate,
  CurrencyRatesResponse,
  SyncRatesResponse,
} from '@/types';

/**
 * Raw API response types (snake_case from backend)
 */
interface RawCurrencyResponse {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RawCurrencyRatesResponse {
  base_currency: string;
  date: string;
  rates: Record<string, number>;
  count: number;
}

interface RawSyncRatesResponse {
  base_currency: string;
  synced_count: number;
  failed_count: number;
  date: string;
  message: string;
}

/**
 * Helper function to convert snake_case to camelCase
 */
function toCamelCase(obj: RawCurrencyResponse): Currency {
  return {
    id: obj.id,
    code: obj.code,
    name: obj.name,
    symbol: obj.symbol,
    isActive: obj.is_active,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
  };
}

/**
 * Currencies API endpoints
 *
 * Includes:
 * - CRUD operations for currencies
 * - Currency exchange rate retrieval
 * - Exchange rate synchronization
 * - Automatic cache invalidation
 */
export const currenciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all currencies
     *
     * @param activeOnly - If true, only return active currencies
     */
    getCurrencies: builder.query<Currency[], boolean | undefined>({
      query: (activeOnly = true) => `currencies?active_only=${activeOnly}`,
      transformResponse: (response: RawCurrencyResponse[]) => response.map(toCamelCase),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ code }) => ({ type: 'Currency' as const, id: code })),
              { type: 'CurrencyList' as const },
            ]
          : [{ type: 'CurrencyList' as const }],
    }),

    /**
     * Get a specific currency by code
     */
    getCurrency: builder.query<Currency, string>({
      query: (code) => `currencies/${code}`,
      transformResponse: (response: RawCurrencyResponse) => toCamelCase(response),
      providesTags: (_result, _error, code) => [{ type: 'Currency', id: code }],
    }),

    /**
     * Create a new currency
     */
    createCurrency: builder.mutation<Currency, CurrencyCreate>({
      query: (data) => ({
        url: 'currencies',
        method: 'POST',
        body: {
          code: data.code,
          name: data.name,
          symbol: data.symbol,
          is_active: data.isActive ?? true,
        },
      }),
      transformResponse: (response: RawCurrencyResponse) => toCamelCase(response),
      invalidatesTags: [{ type: 'CurrencyList' }],
    }),

    /**
     * Update an existing currency
     */
    updateCurrency: builder.mutation<Currency, { code: string; data: CurrencyUpdate }>({
      query: ({ code, data }) => {
        const requestBody: Record<string, string | boolean> = {};
        if (data.name !== undefined) requestBody['name'] = data.name;
        if (data.symbol !== undefined) requestBody['symbol'] = data.symbol;
        if (data.isActive !== undefined) requestBody['is_active'] = data.isActive;

        return {
          url: `currencies/${code}`,
          method: 'PUT',
          body: requestBody,
        };
      },
      transformResponse: (response: RawCurrencyResponse) => toCamelCase(response),
      invalidatesTags: (_result, _error, { code }) => [
        { type: 'Currency', id: code },
        { type: 'CurrencyList' },
      ],
    }),

    /**
     * Get currency exchange rates
     *
     * @param code - Base currency code
     * @param date - Optional date for historical rates (ISO format)
     */
    getCurrencyRates: builder.query<
      CurrencyRatesResponse,
      { code: string; date?: string }
    >({
      query: ({ code, date }) => {
        const url = `currencies/${code}/rates`;
        return date ? `${url}?rate_date=${date}` : url;
      },
      transformResponse: (response: RawCurrencyRatesResponse): CurrencyRatesResponse => ({
        baseCurrency: response.base_currency,
        date: response.date,
        rates: response.rates,
        count: response.count,
      }),
    }),

    /**
     * Sync currency exchange rates
     *
     * Fetches latest exchange rates from external provider.
     *
     * @param baseCurrency - Optional base currency code
     * @param syncDate - Optional date to sync rates for
     */
    syncCurrencyRates: builder.mutation<
      SyncRatesResponse,
      { baseCurrency?: string; syncDate?: string } | undefined
    >({
      query: (params = {}) => {
        const url = new URL('currencies/sync-rates', 'http://localhost');
        if (params.baseCurrency) url.searchParams.append('base_currency', params.baseCurrency);
        if (params.syncDate) url.searchParams.append('sync_date', params.syncDate);
        return {
          url: `currencies/sync-rates?${url.searchParams.toString()}`,
          method: 'POST',
        };
      },
      transformResponse: (response: RawSyncRatesResponse): SyncRatesResponse => ({
        baseCurrency: response.base_currency,
        syncedCount: response.synced_count,
        failedCount: response.failed_count,
        date: response.date,
        message: response.message,
      }),
      invalidatesTags: [{ type: 'CurrencyList' }],
    }),
  }),
});

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetCurrenciesQuery,
  useGetCurrencyQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useGetCurrencyRatesQuery,
  useSyncCurrencyRatesMutation,
} = currenciesApi;
