/**
 * Holdings RTK Query API
 *
 * Provides endpoints for portfolio holdings management.
 * Holdings are tied to investment accounts.
 */

import { baseApi } from './baseApi';
import type { Holding, HoldingCreate, HoldingUpdate } from '@/types';

/**
 * Holdings API endpoints
 *
 * Includes:
 * - CRUD operations for holdings
 * - Account-specific holdings retrieval
 * - Automatic cache invalidation
 */
export const holdingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all holdings for a specific account
     */
    getHoldings: builder.query<Holding[], string>({
      query: (accountId) => `accounts/${accountId}/holdings`,
      providesTags: (result, _error, accountId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Holding' as const, id })),
              { type: 'Account', id: accountId },
            ]
          : [{ type: 'Account', id: accountId }],
    }),

    /**
     * Get a specific holding by ID
     */
    getHolding: builder.query<Holding, { accountId: string; holdingId: string }>({
      query: ({ accountId, holdingId }) => `accounts/${accountId}/holdings/${holdingId}`,
      providesTags: (_result, _error, { holdingId }) => [{ type: 'Holding', id: holdingId }],
    }),

    /**
     * Create a new holding
     */
    createHolding: builder.mutation<Holding, { accountId: string; data: HoldingCreate }>({
      query: ({ accountId, data }) => ({
        url: `accounts/${accountId}/holdings`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { accountId }) => [{ type: 'Account', id: accountId }],
    }),

    /**
     * Update an existing holding
     */
    updateHolding: builder.mutation<
      Holding,
      { accountId: string; holdingId: string; data: HoldingUpdate }
    >({
      query: ({ accountId, holdingId, data }) => ({
        url: `accounts/${accountId}/holdings/${holdingId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { accountId, holdingId }) => [
        { type: 'Holding', id: holdingId },
        { type: 'Account', id: accountId },
      ],
    }),

    /**
     * Delete a holding
     */
    deleteHolding: builder.mutation<void, { accountId: string; holdingId: string }>({
      query: ({ accountId, holdingId }) => ({
        url: `accounts/${accountId}/holdings/${holdingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { accountId, holdingId }) => [
        { type: 'Holding', id: holdingId },
        { type: 'Account', id: accountId },
      ],
    }),
  }),
});

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetHoldingsQuery,
  useGetHoldingQuery,
  useCreateHoldingMutation,
  useUpdateHoldingMutation,
  useDeleteHoldingMutation,
} = holdingsApi;
