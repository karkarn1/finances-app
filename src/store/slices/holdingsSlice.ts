import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Holding, HoldingCreate, HoldingUpdate, ApiError } from '@/types';
import type { RootState } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface HoldingsState {
  holdings: Holding[];
  loading: boolean;
  error: string | null;
}

const initialState: HoldingsState = {
  holdings: [],
  loading: false,
  error: null,
};

// Helper function to get auth token
const getAuthToken = (state: RootState): string | null => {
  return state.auth.token;
};

// Async thunks
export const fetchHoldings = createAsyncThunk<
  Holding[],
  string,
  { state: RootState; rejectValue: string }
>('holdings/fetchAll', async (accountId, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/holdings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch holdings');
    }

    const data: Holding[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const fetchHoldingById = createAsyncThunk<
  Holding,
  { accountId: string; holdingId: string },
  { state: RootState; rejectValue: string }
>('holdings/fetchById', async ({ accountId, holdingId }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/holdings/${holdingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch holding');
    }

    const data: Holding = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const createHolding = createAsyncThunk<
  Holding,
  { accountId: string; data: HoldingCreate },
  { state: RootState; rejectValue: string }
>('holdings/create', async ({ accountId, data }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/holdings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to create holding');
    }

    const responseData: Holding = await response.json();
    return responseData;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const updateHolding = createAsyncThunk<
  Holding,
  { accountId: string; holdingId: string; data: HoldingUpdate },
  { state: RootState; rejectValue: string }
>(
  'holdings/update',
  async ({ accountId, holdingId, data }, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState());
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/holdings/${holdingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        return rejectWithValue(error.detail || 'Failed to update holding');
      }

      const responseData: Holding = await response.json();
      return responseData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

export const deleteHolding = createAsyncThunk<
  string,
  { accountId: string; holdingId: string },
  { state: RootState; rejectValue: string }
>('holdings/delete', async ({ accountId, holdingId }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/holdings/${holdingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to delete holding');
    }

    return holdingId;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

// Slice
const holdingsSlice = createSlice({
  name: 'holdings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHoldings: (state) => {
      state.holdings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchHoldings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoldings.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload;
      })
      .addCase(fetchHoldings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch holdings';
      })
      // Fetch by ID
      .addCase(fetchHoldingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoldingById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.holdings.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.holdings[index] = action.payload;
        } else {
          state.holdings.push(action.payload);
        }
      })
      .addCase(fetchHoldingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch holding';
      })
      // Create
      .addCase(createHolding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHolding.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings.push(action.payload);
      })
      .addCase(createHolding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create holding';
      })
      // Update
      .addCase(updateHolding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHolding.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.holdings.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.holdings[index] = action.payload;
        }
      })
      .addCase(updateHolding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update holding';
      })
      // Delete
      .addCase(deleteHolding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHolding.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = state.holdings.filter((h) => h.id !== action.payload);
      })
      .addCase(deleteHolding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete holding';
      });
  },
});

export const { clearError, clearHoldings } = holdingsSlice.actions;

// Selectors
export const selectAllHoldings = (state: RootState) => state.holdings.holdings;
export const selectHoldingsLoading = (state: RootState) => state.holdings.loading;
export const selectHoldingsError = (state: RootState) => state.holdings.error;

export default holdingsSlice.reducer;
