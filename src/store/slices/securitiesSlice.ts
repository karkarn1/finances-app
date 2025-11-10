/**
 * Securities Redux slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Security, PriceData, Timeframe, DataCompleteness } from '@/types';
import * as securitiesApi from '@/services/securities';
import { getTimeframeRange } from '@/utils/timeframes';

interface SecuritiesState {
  searchResults: Security[];
  selectedSecurity: Security | null;
  prices: PriceData[];
  currentTimeframe: Timeframe;
  isSearching: boolean;
  isLoadingSecurity: boolean;
  isLoadingPrices: boolean;
  isSyncing: boolean;
  error: string | null;
  // NEW: Price data metadata
  priceMetadata: {
    requestedStart: string | null;
    requestedEnd: string | null;
    actualStart: string | null;
    actualEnd: string | null;
    dataCompleteness: DataCompleteness | null;
  };
}

const initialState: SecuritiesState = {
  searchResults: [],
  selectedSecurity: null,
  prices: [],
  currentTimeframe: '1M',
  isSearching: false,
  isLoadingSecurity: false,
  isLoadingPrices: false,
  isSyncing: false,
  error: null,
  priceMetadata: {
    requestedStart: null,
    requestedEnd: null,
    actualStart: null,
    actualEnd: null,
    dataCompleteness: null,
  },
};

// Async thunks

/**
 * Search securities by query
 */
export const searchSecuritiesAsync = createAsyncThunk(
  'securities/search',
  async (query: string) => {
    const results = await securitiesApi.searchSecurities(query);
    return results;
  }
);

/**
 * Fetch security details by symbol
 */
export const fetchSecurityAsync = createAsyncThunk(
  'securities/fetchSecurity',
  async (symbol: string) => {
    const security = await securitiesApi.getSecurity(symbol);
    return security;
  }
);

/**
 * Sync security data from Yahoo Finance
 */
export const syncSecurityAsync = createAsyncThunk(
  'securities/sync',
  async (symbol: string) => {
    const response = await securitiesApi.syncSecurity(symbol);
    return response;
  }
);

/**
 * Fetch prices for a specific timeframe
 */
export const fetchPricesAsync = createAsyncThunk(
  'securities/fetchPrices',
  async ({ symbol, timeframe }: { symbol: string; timeframe: Timeframe }) => {
    const { start, end, interval } = getTimeframeRange(timeframe);
    const response = await securitiesApi.getSecurityPrices(
      symbol,
      start.toISOString(),
      end.toISOString(),
      interval
    );
    return {
      prices: response.prices,
      timeframe,
      // NEW: Include metadata from API response
      metadata: {
        requestedStart: response.requested_start,
        requestedEnd: response.requested_end,
        actualStart: response.actual_start,
        actualEnd: response.actual_end,
        dataCompleteness: response.data_completeness,
      },
    };
  }
);

// Slice

const securitiesSlice = createSlice({
  name: 'securities',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTimeframe: (state, action: PayloadAction<Timeframe>) => {
      state.currentTimeframe = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Search securities
    builder
      .addCase(searchSecuritiesAsync.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchSecuritiesAsync.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSecuritiesAsync.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.error.message || 'Failed to search securities';
      });

    // Fetch security
    builder
      .addCase(fetchSecurityAsync.pending, (state) => {
        state.isLoadingSecurity = true;
        state.error = null;
      })
      .addCase(fetchSecurityAsync.fulfilled, (state, action) => {
        state.isLoadingSecurity = false;
        state.selectedSecurity = action.payload;
      })
      .addCase(fetchSecurityAsync.rejected, (state, action) => {
        state.isLoadingSecurity = false;
        state.error = action.error.message || 'Failed to fetch security';
      });

    // Sync security
    builder
      .addCase(syncSecurityAsync.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncSecurityAsync.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.selectedSecurity = action.payload.security;
      })
      .addCase(syncSecurityAsync.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message || 'Failed to sync security data';
      });

    // Fetch prices
    builder
      .addCase(fetchPricesAsync.pending, (state) => {
        state.isLoadingPrices = true;
        state.error = null;
      })
      .addCase(fetchPricesAsync.fulfilled, (state, action) => {
        state.isLoadingPrices = false;
        state.prices = action.payload.prices;
        state.currentTimeframe = action.payload.timeframe;
        // NEW: Store metadata
        state.priceMetadata = action.payload.metadata;
      })
      .addCase(fetchPricesAsync.rejected, (state, action) => {
        state.isLoadingPrices = false;
        state.error = action.error.message || 'Failed to fetch price data';
      });
  },
});

// Actions
export const { clearSearchResults, clearError, setCurrentTimeframe } =
  securitiesSlice.actions;

// Selectors
export const selectSearchResults = (state: RootState) =>
  state.securities.searchResults;
export const selectSelectedSecurity = (state: RootState) =>
  state.securities.selectedSecurity;
export const selectPrices = (state: RootState) => state.securities.prices;
export const selectCurrentTimeframe = (state: RootState) =>
  state.securities.currentTimeframe;
export const selectIsSearching = (state: RootState) =>
  state.securities.isSearching;
export const selectIsLoadingSecurity = (state: RootState) =>
  state.securities.isLoadingSecurity;
export const selectIsLoadingPrices = (state: RootState) =>
  state.securities.isLoadingPrices;
export const selectIsSyncing = (state: RootState) => state.securities.isSyncing;
export const selectError = (state: RootState) => state.securities.error;
export const selectIsLoading = (state: RootState) =>
  state.securities.isSearching ||
  state.securities.isLoadingSecurity ||
  state.securities.isLoadingPrices ||
  state.securities.isSyncing;
// NEW: Selector for price metadata
export const selectPriceMetadata = (state: RootState) =>
  state.securities.priceMetadata;

export default securitiesSlice.reducer;
