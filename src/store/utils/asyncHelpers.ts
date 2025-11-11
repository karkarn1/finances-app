/**
 * Reusable utilities for Redux async state management.
 * Eliminates boilerplate for loading and error states.
 */

import { formatErrorMessage } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import type { SerializedError } from '@reduxjs/toolkit';

/**
 * Standard async state interface for Redux slices.
 */
export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial async state values.
 */
export const initialAsyncState: AsyncState = {
  isLoading: false,
  error: null,
};

/**
 * Helper to create standardized async case reducers.
 * Use this with createAsyncThunk to automatically handle loading and error states.
 *
 * @param sliceName - Name of the slice (for logging/debugging)
 *
 * @example
 * ```typescript
 * const asyncHelpers = createAsyncReducers('accounts');
 *
 * export const accountsSlice = createSlice({
 *   name: 'accounts',
 *   initialState,
 *   reducers: {},
 *   extraReducers: (builder) => {
 *     builder
 *       .addCase(fetchAccounts.pending, asyncHelpers.pending)
 *       .addCase(fetchAccounts.fulfilled, asyncHelpers.fulfilled)
 *       .addCase(fetchAccounts.rejected, asyncHelpers.rejected);
 *   },
 * });
 * ```
 */
export const createAsyncReducers = <T extends AsyncState>(sliceName?: string) => ({
  /**
   * Handle pending state for async thunks.
   * Sets isLoading to true and clears any previous error.
   */
  pending: (state: T) => {
    state.isLoading = true;
    state.error = null;
  },

  /**
   * Handle fulfilled state for async thunks.
   * Sets isLoading to false.
   */
  fulfilled: (state: T) => {
    state.isLoading = false;
  },

  /**
   * Handle rejected state for async thunks.
   * Sets isLoading to false and stores the formatted error message.
   */
  rejected: (state: T, action: { error?: SerializedError; payload?: unknown }) => {
    state.isLoading = false;
    // Prefer payload (from rejectWithValue) over error (generic Redux error)
    state.error = formatErrorMessage(action.payload ?? action.error);

    if (sliceName) {
      logger.error(`[${sliceName}] Async operation failed:`, state.error);
    }
  },
});

/**
 * Extended async state with multiple loading flags.
 * Use when a slice has multiple independent async operations.
 */
export interface MultiLoadingAsyncState extends AsyncState {
  // Additional dynamic properties (loading flags, data, etc.)
  [key: string]: unknown;
}

/**
 * Create async reducers for specific loading flag.
 * Useful when a slice has multiple async operations that need independent loading states.
 *
 * @param loadingKey - The key for the loading state (e.g., 'isSearching', 'isSyncing')
 *
 * @example
 * ```typescript
 * const searchHelpers = createAsyncReducersWithKey('isSearching');
 * const syncHelpers = createAsyncReducersWithKey('isSyncing');
 *
 * builder
 *   .addCase(searchSecurities.pending, searchHelpers.pending)
 *   .addCase(searchSecurities.fulfilled, searchHelpers.fulfilled)
 *   .addCase(syncSecurity.pending, syncHelpers.pending)
 *   .addCase(syncSecurity.fulfilled, syncHelpers.fulfilled);
 * ```
 */
export const createAsyncReducersWithKey = <T extends MultiLoadingAsyncState>(
  loadingKey: string
) => ({
  pending: (state: T) => {
    // Dynamic property assignment requires type assertion due to generic constraints
    // This is safe because MultiLoadingAsyncState allows index signatures
    (state as Record<string, unknown>)[loadingKey] = true;
    state.error = null;
  },

  fulfilled: (state: T) => {
    // Dynamic property assignment requires type assertion due to generic constraints
    (state as Record<string, unknown>)[loadingKey] = false;
  },

  rejected: (state: T, action: { error?: SerializedError; payload?: unknown }) => {
    // Dynamic property assignment requires type assertion due to generic constraints
    (state as Record<string, unknown>)[loadingKey] = false;
    // Prefer payload (from rejectWithValue) over error (generic Redux error)
    state.error = formatErrorMessage(action.payload ?? action.error);
  },
});

/**
 * Reset async state to initial values.
 * Useful for cleanup on logout or component unmount.
 */
export const resetAsyncState = <T extends AsyncState>(state: T): void => {
  state.isLoading = false;
  state.error = null;
};
