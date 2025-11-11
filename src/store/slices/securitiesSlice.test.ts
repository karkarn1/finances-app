/**
 * Tests for securitiesSlice
 */

import { configureStore } from '@reduxjs/toolkit';
import securitiesReducer, {
  searchSecuritiesAsync,
  fetchSecurityAsync,
  syncSecurityAsync,
  fetchPricesAsync,
  clearSearchResults,
  clearError,
  setCurrentTimeframe,
  selectSearchResults,
  selectSelectedSecurity,
  selectPrices,
  selectCurrentTimeframe,
  selectIsSearching,
  selectIsLoadingSecurity,
  selectIsLoadingPrices,
  selectIsSyncing,
  selectError,
  selectIsLoading,
  selectPriceMetadata,
} from './securitiesSlice';
import * as securitiesApi from '@/services/securities';
import { ApiErrorClass } from '@/services/api';
import type { Security, PriceData, Timeframe } from '@/types';

// Mock the securities API
jest.mock('@/services/securities');
jest.mock('@/utils/timeframes', () => ({
  getTimeframeRange: (timeframe: Timeframe) => ({
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    interval: '1d',
  }),
}));

describe('securitiesSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockSecurity: Security = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    exchange: 'NASDAQ',
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockSearchResults: Security[] = [
    mockSecurity,
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      type: 'stock',
      exchange: 'NASDAQ',
      currency: 'USD',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockPrices: PriceData[] = [
    {
      date: '2024-01-01',
      open: 180.0,
      high: 182.0,
      low: 179.0,
      close: 181.0,
      volume: 50000000,
    },
    {
      date: '2024-01-02',
      open: 181.0,
      high: 183.0,
      low: 180.0,
      close: 182.0,
      volume: 52000000,
    },
  ];

  const mockPriceMetadata = {
    requestedStart: '2024-01-01T00:00:00Z',
    requestedEnd: '2024-01-31T00:00:00Z',
    actualStart: '2024-01-01T00:00:00Z',
    actualEnd: '2024-01-30T00:00:00Z',
    dataCompleteness: 'complete' as const,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        securities: securitiesReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().securities;

      expect(state.searchResults).toEqual([]);
      expect(state.selectedSecurity).toBeNull();
      expect(state.prices).toEqual([]);
      expect(state.currentTimeframe).toBe('1M');
      expect(state.isSearching).toBe(false);
      expect(state.isLoadingSecurity).toBe(false);
      expect(state.isLoadingPrices).toBe(false);
      expect(state.isSyncing).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should have correct initial price metadata', () => {
      const state = store.getState().securities;

      expect(state.priceMetadata).toEqual({
        requestedStart: null,
        requestedEnd: null,
        actualStart: null,
        actualEnd: null,
        dataCompleteness: null,
      });
    });
  });

  describe('searchSecuritiesAsync thunk', () => {
    it('should handle successful search', async () => {
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      await store.dispatch(searchSecuritiesAsync('apple'));

      const state = store.getState().securities;

      expect(state.searchResults).toEqual(mockSearchResults);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during search', async () => {
      (securitiesApi.searchSecurities as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSearchResults), 100))
      );

      const promise = store.dispatch(searchSecuritiesAsync('apple'));

      expect(store.getState().securities.isSearching).toBe(true);

      await promise;

      expect(store.getState().securities.isSearching).toBe(false);
    });

    it('should handle search failure', async () => {
      const error = new ApiErrorClass('Search failed', 500);
      (securitiesApi.searchSecurities as jest.Mock).mockRejectedValue(error);

      await store.dispatch(searchSecuritiesAsync('invalid'));

      const state = store.getState().securities;

      expect(state.searchResults).toEqual([]);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBe('Search failed');
    });

    it('should clear previous results when new search starts', async () => {
      // First search
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue(
        mockSearchResults
      );
      await store.dispatch(searchSecuritiesAsync('apple'));

      expect(store.getState().securities.searchResults).toEqual(mockSearchResults);

      // Second search with different results
      const newResults = [mockSearchResults[0]];
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue(newResults);
      await store.dispatch(searchSecuritiesAsync('aapl'));

      expect(store.getState().securities.searchResults).toEqual(newResults);
    });

    it('should handle empty search results', async () => {
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue([]);

      await store.dispatch(searchSecuritiesAsync('nonexistent'));

      const state = store.getState().securities;

      expect(state.searchResults).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSecurityAsync thunk', () => {
    it('should handle successful security fetch', async () => {
      (securitiesApi.getSecurity as jest.Mock).mockResolvedValue(mockSecurity);

      await store.dispatch(fetchSecurityAsync('AAPL'));

      const state = store.getState().securities;

      expect(state.selectedSecurity).toEqual(mockSecurity);
      expect(state.isLoadingSecurity).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      (securitiesApi.getSecurity as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSecurity), 100))
      );

      const promise = store.dispatch(fetchSecurityAsync('AAPL'));

      expect(store.getState().securities.isLoadingSecurity).toBe(true);

      await promise;

      expect(store.getState().securities.isLoadingSecurity).toBe(false);
    });

    it('should handle fetch failure', async () => {
      const error = new ApiErrorClass('Security not found', 404);
      (securitiesApi.getSecurity as jest.Mock).mockRejectedValue(error);

      await store.dispatch(fetchSecurityAsync('INVALID'));

      const state = store.getState().securities;

      expect(state.selectedSecurity).toBeNull();
      expect(state.isLoadingSecurity).toBe(false);
      expect(state.error).toBe('Security not found');
    });

    it('should replace previous selected security', async () => {
      // Fetch first security
      (securitiesApi.getSecurity as jest.Mock).mockResolvedValue(mockSecurity);
      await store.dispatch(fetchSecurityAsync('AAPL'));

      expect(store.getState().securities.selectedSecurity?.symbol).toBe('AAPL');

      // Fetch second security
      const msftSecurity = { ...mockSecurity, symbol: 'MSFT', name: 'Microsoft' };
      (securitiesApi.getSecurity as jest.Mock).mockResolvedValue(msftSecurity);
      await store.dispatch(fetchSecurityAsync('MSFT'));

      expect(store.getState().securities.selectedSecurity?.symbol).toBe('MSFT');
    });
  });

  describe('syncSecurityAsync thunk', () => {
    it('should handle successful sync', async () => {
      const syncResponse = {
        security: mockSecurity,
        message: 'Security synced successfully',
      };
      (securitiesApi.syncSecurity as jest.Mock).mockResolvedValue(syncResponse);

      await store.dispatch(syncSecurityAsync('AAPL'));

      const state = store.getState().securities;

      expect(state.selectedSecurity).toEqual(mockSecurity);
      expect(state.isSyncing).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set syncing state during sync', async () => {
      const syncResponse = {
        security: mockSecurity,
        message: 'Security synced successfully',
      };
      (securitiesApi.syncSecurity as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(syncResponse), 100))
      );

      const promise = store.dispatch(syncSecurityAsync('AAPL'));

      expect(store.getState().securities.isSyncing).toBe(true);

      await promise;

      expect(store.getState().securities.isSyncing).toBe(false);
    });

    it('should handle sync failure', async () => {
      const error = new ApiErrorClass('Sync failed', 500);
      (securitiesApi.syncSecurity as jest.Mock).mockRejectedValue(error);

      await store.dispatch(syncSecurityAsync('AAPL'));

      const state = store.getState().securities;

      expect(state.isSyncing).toBe(false);
      expect(state.error).toBe('Sync failed');
    });
  });

  describe('fetchPricesAsync thunk', () => {
    it('should handle successful price fetch', async () => {
      const priceResponse = {
        prices: mockPrices,
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: mockPriceMetadata.actualStart,
        actual_end: mockPriceMetadata.actualEnd,
        data_completeness: mockPriceMetadata.dataCompleteness,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockResolvedValue(priceResponse);

      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' }));

      const state = store.getState().securities;

      expect(state.prices).toEqual(mockPrices);
      expect(state.currentTimeframe).toBe('1M');
      expect(state.isLoadingPrices).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should update price metadata on successful fetch', async () => {
      const priceResponse = {
        prices: mockPrices,
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: mockPriceMetadata.actualStart,
        actual_end: mockPriceMetadata.actualEnd,
        data_completeness: mockPriceMetadata.dataCompleteness,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockResolvedValue(priceResponse);

      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' }));

      const state = store.getState().securities;

      expect(state.priceMetadata).toEqual(mockPriceMetadata);
    });

    it('should set loading state during price fetch', async () => {
      const priceResponse = {
        prices: mockPrices,
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: mockPriceMetadata.actualStart,
        actual_end: mockPriceMetadata.actualEnd,
        data_completeness: mockPriceMetadata.dataCompleteness,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(priceResponse), 100))
      );

      const promise = store.dispatch(
        fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' })
      );

      expect(store.getState().securities.isLoadingPrices).toBe(true);

      await promise;

      expect(store.getState().securities.isLoadingPrices).toBe(false);
    });

    it('should handle price fetch failure', async () => {
      const error = new ApiErrorClass('Price data not available', 404);
      (securitiesApi.getSecurityPrices as jest.Mock).mockRejectedValue(error);

      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' }));

      const state = store.getState().securities;

      expect(state.prices).toEqual([]);
      expect(state.isLoadingPrices).toBe(false);
      expect(state.error).toBe('Price data not available');
    });

    it('should update timeframe when fetching prices', async () => {
      const priceResponse = {
        prices: mockPrices,
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: mockPriceMetadata.actualStart,
        actual_end: mockPriceMetadata.actualEnd,
        data_completeness: mockPriceMetadata.dataCompleteness,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockResolvedValue(priceResponse);

      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1Y' }));

      expect(store.getState().securities.currentTimeframe).toBe('1Y');
    });

    it('should handle empty price data', async () => {
      const priceResponse = {
        prices: [],
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: null,
        actual_end: null,
        data_completeness: 'no_data' as const,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockResolvedValue(priceResponse);

      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' }));

      const state = store.getState().securities;

      expect(state.prices).toEqual([]);
      expect(state.priceMetadata.dataCompleteness).toBe('no_data');
    });
  });

  describe('reducers', () => {
    beforeEach(async () => {
      // Set up some state
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue(
        mockSearchResults
      );
      await store.dispatch(searchSecuritiesAsync('apple'));
    });

    it('should clear search results', () => {
      expect(store.getState().securities.searchResults).toEqual(mockSearchResults);

      store.dispatch(clearSearchResults());

      expect(store.getState().securities.searchResults).toEqual([]);
    });

    it('should clear error', () => {
      // Manually set error for testing
      const error = new ApiErrorClass('Test error', 500);
      (securitiesApi.searchSecurities as jest.Mock).mockRejectedValue(error);

      void store.dispatch(searchSecuritiesAsync('test')).then(() => {
        expect(store.getState().securities.error).toBe('Test error');

        store.dispatch(clearError());

        expect(store.getState().securities.error).toBeNull();
      });
    });

    it('should set current timeframe', () => {
      expect(store.getState().securities.currentTimeframe).toBe('1M');

      store.dispatch(setCurrentTimeframe('1Y'));

      expect(store.getState().securities.currentTimeframe).toBe('1Y');
    });

    it('should set timeframe to different values', () => {
      const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

      timeframes.forEach((timeframe) => {
        store.dispatch(setCurrentTimeframe(timeframe));
        expect(store.getState().securities.currentTimeframe).toBe(timeframe);
      });
    });
  });

  describe('selectors', () => {
    beforeEach(async () => {
      (securitiesApi.searchSecurities as jest.Mock).mockResolvedValue(
        mockSearchResults
      );
      (securitiesApi.getSecurity as jest.Mock).mockResolvedValue(mockSecurity);
      const priceResponse = {
        prices: mockPrices,
        requested_start: mockPriceMetadata.requestedStart,
        requested_end: mockPriceMetadata.requestedEnd,
        actual_start: mockPriceMetadata.actualStart,
        actual_end: mockPriceMetadata.actualEnd,
        data_completeness: mockPriceMetadata.dataCompleteness,
      };
      (securitiesApi.getSecurityPrices as jest.Mock).mockResolvedValue(priceResponse);

      await store.dispatch(searchSecuritiesAsync('apple'));
      await store.dispatch(fetchSecurityAsync('AAPL'));
      await store.dispatch(fetchPricesAsync({ symbol: 'AAPL', timeframe: '1M' }));
    });

    it('should select search results', () => {
      expect(selectSearchResults(store.getState())).toEqual(mockSearchResults);
    });

    it('should select selected security', () => {
      expect(selectSelectedSecurity(store.getState())).toEqual(mockSecurity);
    });

    it('should select prices', () => {
      expect(selectPrices(store.getState())).toEqual(mockPrices);
    });

    it('should select current timeframe', () => {
      expect(selectCurrentTimeframe(store.getState())).toBe('1M');
    });

    it('should select isSearching', () => {
      expect(selectIsSearching(store.getState())).toBe(false);
    });

    it('should select isLoadingSecurity', () => {
      expect(selectIsLoadingSecurity(store.getState())).toBe(false);
    });

    it('should select isLoadingPrices', () => {
      expect(selectIsLoadingPrices(store.getState())).toBe(false);
    });

    it('should select isSyncing', () => {
      expect(selectIsSyncing(store.getState())).toBe(false);
    });

    it('should select error', () => {
      expect(selectError(store.getState())).toBeNull();
    });

    it('should select isLoading (combined loading state)', () => {
      expect(selectIsLoading(store.getState())).toBe(false);
    });

    it('should select price metadata', () => {
      expect(selectPriceMetadata(store.getState())).toEqual(mockPriceMetadata);
    });

    it('should correctly compute isLoading when any operation is loading', async () => {
      (securitiesApi.searchSecurities as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSearchResults), 1000))
      );

      const promise = store.dispatch(searchSecuritiesAsync('test'));

      // Should be true when searching
      expect(selectIsLoading(store.getState())).toBe(true);

      await promise;

      // Should be false when complete
      expect(selectIsLoading(store.getState())).toBe(false);
    });
  });
});
