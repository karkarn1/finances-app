import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type {
  Currency,
  CurrencyRatesResponse,
  SyncRatesResponse,
  CurrencyCreate,
  CurrencyUpdate,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface CurrenciesState {
  currencies: Currency[];
  currentRates: CurrencyRatesResponse | null;
  selectedCurrency: string | null;
  loading: boolean;
  error: string | null;
  syncStatus: {
    loading: boolean;
    lastSync: string | null;
  };
}

const initialState: CurrenciesState = {
  currencies: [],
  currentRates: null,
  selectedCurrency: null,
  loading: false,
  error: null,
  syncStatus: {
    loading: false,
    lastSync: null,
  },
};

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: Record<string, unknown>): Currency {
  return {
    id: obj['id'] as string,
    code: obj['code'] as string,
    name: obj['name'] as string,
    symbol: obj['symbol'] as string,
    isActive: obj['is_active'] as boolean,
    createdAt: obj['created_at'] as string,
    updatedAt: obj['updated_at'] as string,
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
      const error = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch currencies');
    }

    const data = await response.json();
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
      const error = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch currency rates');
    }

    const data = await response.json();
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
        const error = await response.json();
        return rejectWithValue(error.detail || 'Failed to sync currency rates');
      }

      const data = await response.json();
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
      const error = await response.json();
      return rejectWithValue(error.detail || 'Failed to create currency');
    }

    const data = await response.json();
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
      const error = await response.json();
      return rejectWithValue(error.detail || 'Failed to update currency');
    }

    const responseData = await response.json();
    return toCamelCase(responseData);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update currency'
    );
  }
});

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
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch currencies';
      })
      // fetchCurrencyRates
      .addCase(fetchCurrencyRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRates = action.payload;
      })
      .addCase(fetchCurrencyRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch currency rates';
      })
      // syncCurrencyRates
      .addCase(syncCurrencyRates.pending, (state) => {
        state.syncStatus.loading = true;
        state.error = null;
      })
      .addCase(syncCurrencyRates.fulfilled, (state, action) => {
        state.syncStatus.loading = false;
        state.syncStatus.lastSync = action.payload.date;
      })
      .addCase(syncCurrencyRates.rejected, (state, action) => {
        state.syncStatus.loading = false;
        state.error = action.payload || 'Failed to sync currency rates';
      })
      // createCurrency
      .addCase(createCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.push(action.payload);
      })
      .addCase(createCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create currency';
      })
      // updateCurrency
      .addCase(updateCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrency.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.currencies.findIndex((c) => c.code === action.payload.code);
        if (index !== -1) {
          state.currencies[index] = action.payload;
        }
      })
      .addCase(updateCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update currency';
      });
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

export const selectCurrenciesLoading = (state: RootState) => state.currencies.loading;

export const selectCurrenciesError = (state: RootState) => state.currencies.error;

export const selectCurrentRates = (state: RootState) => state.currencies.currentRates;

export const selectSyncStatus = (state: RootState) => state.currencies.syncStatus;

export const selectSelectedCurrency = (state: RootState) =>
  state.currencies.selectedCurrency;

export default currenciesSlice.reducer;
