import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  AccountDetailed,
  AccountCreate,
  AccountUpdate,
  AccountValue,
  AccountValueCreate,
  AccountValueUpdate,
} from '@/types';
import type { RootState } from '@/store';
import * as accountsService from '@/services/accounts';
import { ApiErrorClass } from '@/services/api';
import { formatErrorMessage } from '@/utils/errorHandler';

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

// Account async thunks
export const fetchAccounts = createAsyncThunk<
  AccountDetailed[],
  void,
  { rejectValue: string }
>('accounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await accountsService.fetchAllAccounts();
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch accounts');
  }
});

export const fetchAccountById = createAsyncThunk<
  AccountDetailed,
  string,
  { rejectValue: string }
>('accounts/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await accountsService.fetchAccountById(id);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch account');
  }
});

export const createAccount = createAsyncThunk<
  AccountDetailed,
  AccountCreate,
  { rejectValue: string }
>('accounts/create', async (accountData, { rejectWithValue }) => {
  try {
    return await accountsService.createAccount(accountData);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to create account');
  }
});

export const updateAccount = createAsyncThunk<
  AccountDetailed,
  { id: string; data: AccountUpdate },
  { rejectValue: string }
>('accounts/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await accountsService.updateAccount(id, data);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to update account');
  }
});

export const deleteAccount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('accounts/delete', async (id, { rejectWithValue }) => {
  try {
    await accountsService.deleteAccount(id);
    return id;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to delete account');
  }
});

// Account Value async thunks
export const fetchAccountValues = createAsyncThunk<
  AccountValue[],
  string,
  { rejectValue: string }
>('accounts/fetchValues', async (accountId, { rejectWithValue }) => {
  try {
    return await accountsService.fetchAccountValues(accountId);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch account values');
  }
});

export const createAccountValue = createAsyncThunk<
  AccountValue,
  { accountId: string; data: AccountValueCreate },
  { rejectValue: string }
>('accounts/createValue', async ({ accountId, data }, { rejectWithValue }) => {
  try {
    return await accountsService.createAccountValue(accountId, data);
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to create account value');
  }
});

export const updateAccountValue = createAsyncThunk<
  AccountValue,
  { accountId: string; valueId: string; data: AccountValueUpdate },
  { rejectValue: string }
>(
  'accounts/updateValue',
  async ({ accountId, valueId, data }, { rejectWithValue }) => {
    try {
      return await accountsService.updateAccountValue(accountId, valueId, data);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update account value');
    }
  }
);

export const deleteAccountValue = createAsyncThunk<
  string,
  { accountId: string; valueId: string },
  { rejectValue: string }
>('accounts/deleteValue', async ({ accountId, valueId }, { rejectWithValue }) => {
  try {
    await accountsService.deleteAccountValue(accountId, valueId);
    return valueId;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to delete account value');
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
        state.error = formatErrorMessage(action.error);
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
