import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type {
  Currency,
  CurrencyRatesResponse,
  SyncRatesResponse,
  CurrencyCreate,
  CurrencyUpdate,
} from '@/types';
import {
  createAsyncReducers,
  createAsyncReducersWithKey,
  initialAsyncState,
} from '@/store/utils/asyncHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Raw API response types (snake_case from backend)
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

interface ApiErrorResponse {
  detail: string;
}

interface CurrenciesState {
  currencies: Currency[];
  currentRates: CurrencyRatesResponse | null;
  selectedCurrency: string | null;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  syncStatus: {
    lastSync: string | null;
  };
}

const initialState: CurrenciesState = {
  currencies: [],
  currentRates: null,
  selectedCurrency: null,
  ...initialAsyncState,
  isSyncing: false,
  syncStatus: {
    lastSync: null,
  },
};

// Helper function to convert snake_case to camelCase
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

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Async thunks
export const fetchCurrencies = createAsyncThunk<
  Currency[],
  boolean | undefined,
  { rejectValue: string }
>('currencies/fetchCurrencies', async (activeOnly = true, { rejectWithValue }) => {
  try {
    const url = new URL(`${API_BASE_URL}/currencies`);
    url.searchParams.append('active_only', String(activeOnly));

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiErrorResponse;
      return rejectWithValue(error.detail || 'Failed to fetch currencies');
    }

    const data = (await response.json()) as RawCurrencyResponse[];
    return data.map(toCamelCase);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch currencies'
    );
  }
});

export const fetchCurrencyRates = createAsyncThunk<
  CurrencyRatesResponse,
  { code: string; date?: string },
  { rejectValue: string }
>('currencies/fetchCurrencyRates', async ({ code, date }, { rejectWithValue }) => {
  try {
    const url = new URL(`${API_BASE_URL}/currencies/${code}/rates`);
    if (date) {
      url.searchParams.append('rate_date', date);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiErrorResponse;
      return rejectWithValue(error.detail || 'Failed to fetch currency rates');
    }

    const data = (await response.json()) as RawCurrencyRatesResponse;
    return {
      baseCurrency: data.base_currency,
      date: data.date,
      rates: data.rates,
      count: data.count,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch currency rates'
    );
  }
});

export const syncCurrencyRates = createAsyncThunk<
  SyncRatesResponse,
  { baseCurrency?: string; syncDate?: string } | undefined,
  { rejectValue: string }
>(
  'currencies/syncCurrencyRates',
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE_URL}/currencies/sync-rates`);
      if (params.baseCurrency) {
        url.searchParams.append('base_currency', params.baseCurrency);
      }
      if (params.syncDate) {
        url.searchParams.append('sync_date', params.syncDate);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return rejectWithValue(error.detail || 'Failed to sync currency rates');
      }

      const data = (await response.json()) as RawSyncRatesResponse;
      return {
        baseCurrency: data.base_currency,
        syncedCount: data.synced_count,
        failedCount: data.failed_count,
        date: data.date,
        message: data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to sync currency rates'
      );
    }
  }
);

export const createCurrency = createAsyncThunk<
  Currency,
  CurrencyCreate,
  { rejectValue: string }
>('currencies/createCurrency', async (currencyData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        code: currencyData.code,
        name: currencyData.name,
        symbol: currencyData.symbol,
        is_active: currencyData.isActive ?? true,
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiErrorResponse;
      return rejectWithValue(error.detail || 'Failed to create currency');
    }

    const data = (await response.json()) as RawCurrencyResponse;
    return toCamelCase(data);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create currency'
    );
  }
});

export const updateCurrency = createAsyncThunk<
  Currency,
  { code: string; data: CurrencyUpdate },
  { rejectValue: string }
>('currencies/updateCurrency', async ({ code, data }, { rejectWithValue }) => {
  try {
    const requestBody: Record<string, string | boolean> = {};
    if (data.name !== undefined) requestBody['name'] = data.name;
    if (data.symbol !== undefined) requestBody['symbol'] = data.symbol;
    if (data.isActive !== undefined) requestBody['is_active'] = data.isActive;

    const response = await fetch(`${API_BASE_URL}/currencies/${code}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiErrorResponse;
      return rejectWithValue(error.detail || 'Failed to update currency');
    }

    const responseData = (await response.json()) as RawCurrencyResponse;
    return toCamelCase(responseData);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update currency'
    );
  }
});

// Create async helpers
const asyncHelpers = createAsyncReducers<CurrenciesState>('currencies');
const syncHelpers = createAsyncReducersWithKey<CurrenciesState>('isSyncing');

// Slice
const currenciesSlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {
    setSelectedCurrency: (state, action: PayloadAction<string | null>) => {
      state.selectedCurrency = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrencies
      .addCase(fetchCurrencies.pending, asyncHelpers.pending)
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.currencies = action.payload;
      })
      .addCase(fetchCurrencies.rejected, asyncHelpers.rejected)
      // fetchCurrencyRates
      .addCase(fetchCurrencyRates.pending, asyncHelpers.pending)
      .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.currentRates = action.payload;
      })
      .addCase(fetchCurrencyRates.rejected, asyncHelpers.rejected)
      // syncCurrencyRates
      .addCase(syncCurrencyRates.pending, syncHelpers.pending)
      .addCase(syncCurrencyRates.fulfilled, (state, action) => {
        syncHelpers.fulfilled(state);
        state.syncStatus.lastSync = action.payload.date;
      })
      .addCase(syncCurrencyRates.rejected, syncHelpers.rejected)
      // createCurrency
      .addCase(createCurrency.pending, asyncHelpers.pending)
      .addCase(createCurrency.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.currencies.push(action.payload);
      })
      .addCase(createCurrency.rejected, asyncHelpers.rejected)
      // updateCurrency
      .addCase(updateCurrency.pending, asyncHelpers.pending)
      .addCase(updateCurrency.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        const index = state.currencies.findIndex((c) => c.code === action.payload.code);
        if (index !== -1) {
          state.currencies[index] = action.payload;
        }
      })
      .addCase(updateCurrency.rejected, asyncHelpers.rejected);
  },
});

// Actions
export const { setSelectedCurrency, clearError } = currenciesSlice.actions;

// Selectors
export const selectAllCurrencies = (state: RootState) => state.currencies.currencies;

export const selectActiveCurrencies = (state: RootState) =>
  state.currencies.currencies.filter((c) => c.isActive);

export const selectCurrencyByCode = (code: string) => (state: RootState) =>
  state.currencies.currencies.find((c) => c.code === code);

export const selectCurrenciesLoading = (state: RootState) => state.currencies.isLoading;

export const selectCurrenciesError = (state: RootState) => state.currencies.error;

export const selectCurrentRates = (state: RootState) => state.currencies.currentRates;

export const selectSyncStatus = (state: RootState) => ({
  loading: state.currencies.isSyncing,
  lastSync: state.currencies.syncStatus.lastSync,
});

export const selectSelectedCurrency = (state: RootState) =>
  state.currencies.selectedCurrency;

export default currenciesSlice.reducer;
