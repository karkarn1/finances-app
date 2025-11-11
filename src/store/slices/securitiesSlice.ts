/**
 * Securities Redux slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Security, PriceData, Timeframe, DataCompleteness } from '@/types';
import * as securitiesApi from '@/services/securities';
import { getTimeframeRange } from '@/utils/timeframes';
import {
  createAsyncReducersWithKey,
  initialAsyncState,
  MultiLoadingAsyncState,
} from '@/store/utils/asyncHelpers';

interface SecuritiesState extends MultiLoadingAsyncState {
  searchResults: Security[];
  selectedSecurity: Security | null;
  prices: PriceData[];
  currentTimeframe: Timeframe;
  isLoading: boolean;
  isSearching: boolean;
  isLoadingSecurity: boolean;
  isLoadingPrices: boolean;
  isSyncing: boolean;
  error: string | null;
  // Price data metadata
  priceMetadata: {
    requestedStart: string | null;
    requestedEnd: string | null;
    actualStart: string | null;
    actualEnd: string | null;
    dataCompleteness: DataCompleteness | null;
  };
}

// Create specific helpers for each loading state
const searchHelpers = createAsyncReducersWithKey<SecuritiesState>('isSearching');
const securityHelpers = createAsyncReducersWithKey<SecuritiesState>('isLoadingSecurity');
const pricesHelpers = createAsyncReducersWithKey<SecuritiesState>('isLoadingPrices');
const syncHelpers = createAsyncReducersWithKey<SecuritiesState>('isSyncing');

const initialState: SecuritiesState = {
  searchResults: [],
  selectedSecurity: null,
  prices: [],
  currentTimeframe: '1M',
  ...initialAsyncState,
  isSearching: false,
  isLoadingSecurity: false,
  isLoadingPrices: false,
  isSyncing: false,
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
      .addCase(searchSecuritiesAsync.pending, searchHelpers.pending)
      .addCase(searchSecuritiesAsync.fulfilled, (state, action) => {
        searchHelpers.fulfilled(state);
        state.searchResults = action.payload;
      })
      .addCase(searchSecuritiesAsync.rejected, searchHelpers.rejected);

    // Fetch security
    builder
      .addCase(fetchSecurityAsync.pending, securityHelpers.pending)
      .addCase(fetchSecurityAsync.fulfilled, (state, action) => {
        securityHelpers.fulfilled(state);
        state.selectedSecurity = action.payload;
      })
      .addCase(fetchSecurityAsync.rejected, securityHelpers.rejected);

    // Sync security
    builder
      .addCase(syncSecurityAsync.pending, syncHelpers.pending)
      .addCase(syncSecurityAsync.fulfilled, (state, action) => {
        syncHelpers.fulfilled(state);
        state.selectedSecurity = action.payload.security;
      })
      .addCase(syncSecurityAsync.rejected, syncHelpers.rejected);

    // Fetch prices
    builder
      .addCase(fetchPricesAsync.pending, pricesHelpers.pending)
      .addCase(fetchPricesAsync.fulfilled, (state, action) => {
        pricesHelpers.fulfilled(state);
        state.prices = action.payload.prices;
        state.currentTimeframe = action.payload.timeframe;
        // Store metadata
        state.priceMetadata = action.payload.metadata;
      })
      .addCase(fetchPricesAsync.rejected, pricesHelpers.rejected);
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
