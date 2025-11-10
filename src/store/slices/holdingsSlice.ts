import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Holding, HoldingCreate, HoldingUpdate } from '@/types';
import type { RootState } from '@/store';
import * as holdingsService from '@/services/holdings';
import { ApiErrorClass } from '@/services/api';

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

// Async thunks
export const fetchHoldings = createAsyncThunk<
  Holding[],
  string,
  { rejectValue: string }
>('holdings/fetchAll', async (accountId, { rejectWithValue }) => {
  try {
    return await holdingsService.fetchAllHoldings(accountId);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch holdings');
  }
});

export const fetchHoldingById = createAsyncThunk<
  Holding,
  { accountId: string; holdingId: string },
  { rejectValue: string }
>('holdings/fetchById', async ({ accountId, holdingId }, { rejectWithValue }) => {
  try {
    return await holdingsService.fetchHoldingById(accountId, holdingId);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch holding');
  }
});

export const createHolding = createAsyncThunk<
  Holding,
  { accountId: string; data: HoldingCreate },
  { rejectValue: string }
>('holdings/create', async ({ accountId, data }, { rejectWithValue }) => {
  try {
    return await holdingsService.createHolding(accountId, data);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to create holding');
  }
});

export const updateHolding = createAsyncThunk<
  Holding,
  { accountId: string; holdingId: string; data: HoldingUpdate },
  { rejectValue: string }
>(
  'holdings/update',
  async ({ accountId, holdingId, data }, { rejectWithValue }) => {
    try {
      return await holdingsService.updateHolding(accountId, holdingId, data);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update holding');
    }
  }
);

export const deleteHolding = createAsyncThunk<
  string,
  { accountId: string; holdingId: string },
  { rejectValue: string }
>('holdings/delete', async ({ accountId, holdingId }, { rejectWithValue }) => {
  try {
    await holdingsService.deleteHolding(accountId, holdingId);
    return holdingId;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to delete holding');
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
