import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  FinancialInstitution,
  FinancialInstitutionCreate,
  ApiError,
} from '@/types';
import type { RootState } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface FinancialInstitutionsState {
  institutions: FinancialInstitution[];
  selectedInstitution: FinancialInstitution | null;
  loading: boolean;
  error: string | null;
}

const initialState: FinancialInstitutionsState = {
  institutions: [],
  selectedInstitution: null,
  loading: false,
  error: null,
};

// Helper function to get auth token
const getAuthToken = (state: RootState): string | null => {
  return state.auth.token;
};

// Async thunks
export const fetchFinancialInstitutions = createAsyncThunk<
  FinancialInstitution[],
  void,
  { state: RootState; rejectValue: string }
>('financialInstitutions/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/financial-institutions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch financial institutions');
    }

    const data: FinancialInstitution[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const fetchFinancialInstitutionById = createAsyncThunk<
  FinancialInstitution,
  string,
  { state: RootState; rejectValue: string }
>('financialInstitutions/fetchById', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/financial-institutions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch financial institution');
    }

    const data: FinancialInstitution = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const createFinancialInstitution = createAsyncThunk<
  FinancialInstitution,
  FinancialInstitutionCreate,
  { state: RootState; rejectValue: string }
>('financialInstitutions/create', async (institutionData, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/financial-institutions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to create financial institution');
    }

    const data: FinancialInstitution = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const updateFinancialInstitution = createAsyncThunk<
  FinancialInstitution,
  { id: string; data: Partial<FinancialInstitutionCreate> },
  { state: RootState; rejectValue: string }
>('financialInstitutions/update', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/financial-institutions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to update financial institution');
    }

    const responseData: FinancialInstitution = await response.json();
    return responseData;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const deleteFinancialInstitution = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('financialInstitutions/delete', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/financial-institutions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to delete financial institution');
    }

    return id;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

// Slice
const financialInstitutionsSlice = createSlice({
  name: 'financialInstitutions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedInstitution: (state, action: PayloadAction<FinancialInstitution | null>) => {
      state.selectedInstitution = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchFinancialInstitutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialInstitutions.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions = action.payload;
      })
      .addCase(fetchFinancialInstitutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch financial institutions';
      })
      // Fetch by ID
      .addCase(fetchFinancialInstitutionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialInstitutionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInstitution = action.payload;
        // Update in list if exists
        const index = state.institutions.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        } else {
          state.institutions.push(action.payload);
        }
      })
      .addCase(fetchFinancialInstitutionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch financial institution';
      })
      // Create
      .addCase(createFinancialInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFinancialInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions.push(action.payload);
      })
      .addCase(createFinancialInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create financial institution';
      })
      // Update
      .addCase(updateFinancialInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFinancialInstitution.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.institutions.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
        if (state.selectedInstitution?.id === action.payload.id) {
          state.selectedInstitution = action.payload;
        }
      })
      .addCase(updateFinancialInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update financial institution';
      })
      // Delete
      .addCase(deleteFinancialInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFinancialInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions = state.institutions.filter((i) => i.id !== action.payload);
        if (state.selectedInstitution?.id === action.payload) {
          state.selectedInstitution = null;
        }
      })
      .addCase(deleteFinancialInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete financial institution';
      });
  },
});

export const { clearError, setSelectedInstitution } = financialInstitutionsSlice.actions;

// Selectors
export const selectAllInstitutions = (state: RootState) => state.financialInstitutions.institutions;
export const selectSelectedInstitution = (state: RootState) =>
  state.financialInstitutions.selectedInstitution;
export const selectInstitutionsLoading = (state: RootState) => state.financialInstitutions.loading;
export const selectInstitutionsError = (state: RootState) => state.financialInstitutions.error;

export default financialInstitutionsSlice.reducer;
