import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  AccountDetailed,
  AccountCreate,
  AccountUpdate,
  AccountValue,
  AccountValueCreate,
  AccountValueUpdate,
  ApiError,
} from '@/types';
import type { RootState } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface AccountsState {
  accounts: AccountDetailed[];
  selectedAccount: AccountDetailed | null;
  accountValues: AccountValue[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  accountValues: [],
  loading: false,
  error: null,
};

// Helper function to get auth token
const getAuthToken = (state: RootState): string | null => {
  return state.auth.token;
};

// Account async thunks
export const fetchAccounts = createAsyncThunk<
  AccountDetailed[],
  void,
  { state: RootState; rejectValue: string }
>('accounts/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch accounts');
    }

    const data: AccountDetailed[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const fetchAccountById = createAsyncThunk<
  AccountDetailed,
  string,
  { state: RootState; rejectValue: string }
>('accounts/fetchById', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch account');
    }

    const data: AccountDetailed = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const createAccount = createAsyncThunk<
  AccountDetailed,
  AccountCreate,
  { state: RootState; rejectValue: string }
>('accounts/create', async (accountData, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to create account');
    }

    const data: AccountDetailed = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const updateAccount = createAsyncThunk<
  AccountDetailed,
  { id: string; data: AccountUpdate },
  { state: RootState; rejectValue: string }
>('accounts/update', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to update account');
    }

    const responseData: AccountDetailed = await response.json();
    return responseData;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const deleteAccount = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('accounts/delete', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to delete account');
    }

    return id;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

// Account Value async thunks
export const fetchAccountValues = createAsyncThunk<
  AccountValue[],
  string,
  { state: RootState; rejectValue: string }
>('accounts/fetchValues', async (accountId, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/values`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to fetch account values');
    }

    const data: AccountValue[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const createAccountValue = createAsyncThunk<
  AccountValue,
  { accountId: string; data: AccountValueCreate },
  { state: RootState; rejectValue: string }
>('accounts/createValue', async ({ accountId, data }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/values`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to create account value');
    }

    const responseData: AccountValue = await response.json();
    return responseData;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

export const updateAccountValue = createAsyncThunk<
  AccountValue,
  { accountId: string; valueId: string; data: AccountValueUpdate },
  { state: RootState; rejectValue: string }
>(
  'accounts/updateValue',
  async ({ accountId, valueId, data }, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState());
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/values/${valueId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        return rejectWithValue(error.detail || 'Failed to update account value');
      }

      const responseData: AccountValue = await response.json();
      return responseData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

export const deleteAccountValue = createAsyncThunk<
  string,
  { accountId: string; valueId: string },
  { state: RootState; rejectValue: string }
>('accounts/deleteValue', async ({ accountId, valueId }, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState());
    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/values/${valueId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      return rejectWithValue(error.detail || 'Failed to delete account value');
    }

    return valueId;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

// Slice
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAccount: (state, action: PayloadAction<AccountDetailed | null>) => {
      state.selectedAccount = action.payload;
    },
    clearAccountValues: (state) => {
      state.accountValues = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch accounts';
      })
      // Fetch account by ID
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccount = action.payload;
        // Update in list if exists
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        } else {
          state.accounts.push(action.payload);
        }
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch account';
      })
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create account';
      })
      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update account';
      })
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete account';
      })
      // Fetch account values
      .addCase(fetchAccountValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountValues.fulfilled, (state, action) => {
        state.loading = false;
        state.accountValues = action.payload;
      })
      .addCase(fetchAccountValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch account values';
      })
      // Create account value
      .addCase(createAccountValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccountValue.fulfilled, (state, action) => {
        state.loading = false;
        state.accountValues.push(action.payload);
      })
      .addCase(createAccountValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create account value';
      })
      // Update account value
      .addCase(updateAccountValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccountValue.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accountValues.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.accountValues[index] = action.payload;
        }
      })
      .addCase(updateAccountValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update account value';
      })
      // Delete account value
      .addCase(deleteAccountValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccountValue.fulfilled, (state, action) => {
        state.loading = false;
        state.accountValues = state.accountValues.filter((v) => v.id !== action.payload);
      })
      .addCase(deleteAccountValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete account value';
      });
  },
});

export const { clearError, setSelectedAccount, clearAccountValues } = accountsSlice.actions;

// Selectors
export const selectAllAccounts = (state: RootState) => state.accounts.accounts;
export const selectSelectedAccount = (state: RootState) => state.accounts.selectedAccount;
export const selectAccountValues = (state: RootState) => state.accounts.accountValues;
export const selectAccountsLoading = (state: RootState) => state.accounts.loading;
export const selectAccountsError = (state: RootState) => state.accounts.error;

// Derived selectors
export const selectAssetAccounts = (state: RootState) =>
  state.accounts.accounts.filter(
    (a) =>
      !['credit_card', 'line_of_credit', 'payment_plan', 'mortgage'].includes(a.account_type)
  );

export const selectLiabilityAccounts = (state: RootState) =>
  state.accounts.accounts.filter((a) =>
    ['credit_card', 'line_of_credit', 'payment_plan', 'mortgage'].includes(a.account_type)
  );

export const selectInvestmentAccounts = (state: RootState) =>
  state.accounts.accounts.filter((a) => a.is_investment_account);

export default accountsSlice.reducer;
