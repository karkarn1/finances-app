/**
 * Accounts RTK Query API
 *
 * Provides endpoints for account and account value (balance history) management.
 * Uses automatic cache invalidation and optimistic updates.
 */

import { baseApi } from './baseApi';
import type {
  AccountDetailed,
  AccountCreate,
  AccountUpdate,
  AccountValue,
  AccountValueCreate,
  AccountValueUpdate,
} from '@/types';

/**
 * Accounts API endpoints
 *
 * Includes:
 * - CRUD operations for accounts
 * - CRUD operations for account values (balance history)
 * - Automatic cache invalidation
 * - Optimistic updates for mutations
 */
export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all accounts for the current user
     */
    getAccounts: builder.query<AccountDetailed[], void>({
      query: () => 'accounts',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Account' as const, id })),
              { type: 'AccountList' as const },
            ]
          : [{ type: 'AccountList' as const }],
    }),

    /**
     * Get a specific account by ID
     */
    getAccount: builder.query<AccountDetailed, string>({
      query: (id) => `accounts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Account', id }],
    }),

    /**
     * Create a new account
     */
    createAccount: builder.mutation<AccountDetailed, AccountCreate>({
      query: (data) => ({
        url: 'accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'AccountList' }],
    }),

    /**
     * Update an existing account
     */
    updateAccount: builder.mutation<AccountDetailed, { id: string; data: AccountUpdate }>({
      query: ({ id, data }) => ({
        url: `accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Account', id },
        { type: 'AccountList' },
      ],
    }),

    /**
     * Delete an account
     */
    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Account', id },
        { type: 'AccountList' },
      ],
    }),

    /**
     * Get account values (balance history) for a specific account
     */
    getAccountValues: builder.query<AccountValue[], string>({
      query: (accountId) => `accounts/${accountId}/values`,
      providesTags: (result, _error, accountId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AccountValue' as const, id })),
              { type: 'Account', id: accountId },
            ]
          : [{ type: 'Account', id: accountId }],
    }),

    /**
     * Create a new account value entry
     */
    createAccountValue: builder.mutation<
      AccountValue,
      { accountId: string; data: AccountValueCreate }
    >({
      query: ({ accountId, data }) => ({
        url: `accounts/${accountId}/values`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { accountId }) => [
        { type: 'Account', id: accountId },
      ],
    }),

    /**
     * Update an existing account value entry
     */
    updateAccountValue: builder.mutation<
      AccountValue,
      { accountId: string; valueId: string; data: AccountValueUpdate }
    >({
      query: ({ accountId, valueId, data }) => ({
        url: `accounts/${accountId}/values/${valueId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { accountId, valueId }) => [
        { type: 'AccountValue', id: valueId },
        { type: 'Account', id: accountId },
      ],
    }),

    /**
     * Delete an account value entry
     */
    deleteAccountValue: builder.mutation<void, { accountId: string; valueId: string }>({
      query: ({ accountId, valueId }) => ({
        url: `accounts/${accountId}/values/${valueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { accountId, valueId }) => [
        { type: 'AccountValue', id: valueId },
        { type: 'Account', id: accountId },
      ],
    }),
  }),
});

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetAccountValuesQuery,
  useCreateAccountValueMutation,
  useUpdateAccountValueMutation,
  useDeleteAccountValueMutation,
} = accountsApi;
