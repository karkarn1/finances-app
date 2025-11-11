/**
 * Financial Institutions RTK Query API
 *
 * Provides endpoints for financial institution management.
 */

import { baseApi } from './baseApi';
import type { FinancialInstitution, FinancialInstitutionCreate } from '@/types';

/**
 * Financial Institutions API endpoints
 *
 * Includes:
 * - CRUD operations for financial institutions
 * - Automatic cache invalidation
 */
export const financialInstitutionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all financial institutions
     */
    getFinancialInstitutions: builder.query<FinancialInstitution[], void>({
      query: () => 'financial-institutions',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'FinancialInstitution' as const, id })),
              { type: 'FinancialInstitutionList' as const },
            ]
          : [{ type: 'FinancialInstitutionList' as const }],
    }),

    /**
     * Get a specific financial institution by ID
     */
    getFinancialInstitution: builder.query<FinancialInstitution, string>({
      query: (id) => `financial-institutions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'FinancialInstitution', id }],
    }),

    /**
     * Create a new financial institution
     */
    createFinancialInstitution: builder.mutation<
      FinancialInstitution,
      FinancialInstitutionCreate
    >({
      query: (data) => ({
        url: 'financial-institutions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'FinancialInstitutionList' }],
    }),

    /**
     * Update an existing financial institution
     */
    updateFinancialInstitution: builder.mutation<
      FinancialInstitution,
      { id: string; data: Partial<FinancialInstitutionCreate> }
    >({
      query: ({ id, data }) => ({
        url: `financial-institutions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'FinancialInstitution', id },
        { type: 'FinancialInstitutionList' },
      ],
    }),

    /**
     * Delete a financial institution
     */
    deleteFinancialInstitution: builder.mutation<void, string>({
      query: (id) => ({
        url: `financial-institutions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'FinancialInstitution', id },
        { type: 'FinancialInstitutionList' },
      ],
    }),
  }),
});

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetFinancialInstitutionsQuery,
  useGetFinancialInstitutionQuery,
  useCreateFinancialInstitutionMutation,
  useUpdateFinancialInstitutionMutation,
  useDeleteFinancialInstitutionMutation,
} = financialInstitutionsApi;
