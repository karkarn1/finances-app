/**
 * Redux slice for authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type {
  User,
  LoginCredentials,
  RegisterData,
  TokenResponse,
} from '@/types';
import * as authService from '@/services/auth';
import { ApiErrorClass } from '@/services/api';
import { createAsyncReducers, initialAsyncState } from '@/store/utils/asyncHelpers';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create async helpers for this slice
const asyncHelpers = createAsyncReducers<AuthState>('auth');

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  ...initialAsyncState,
};

// Async thunks

/**
 * Login user thunk
 */
export const loginUser = createAsyncThunk<
  { user: User; tokens: TokenResponse },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // Get tokens
    const tokens = await authService.login(credentials);

    // Store tokens in localStorage
    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    // Get user data
    const user = await authService.getCurrentUser();

    return { user, tokens };
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Login failed. Please try again.');
  }
});

/**
 * Register user thunk
 */
export const registerUser = createAsyncThunk<
  { user: User; tokens: TokenResponse },
  RegisterData,
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    // Register user
    const user = await authService.register(data);

    // Auto-login after registration
    const tokens = await authService.login({
      username: data.email,
      password: data.password,
    });

    // Store tokens in localStorage
    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    return { user, tokens };
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Registration failed. Please try again.');
  }
});

/**
 * Logout user thunk
 */
export const logoutUser = createAsyncThunk('auth/logout', () => {
  // Clear tokens from localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
});

/**
 * Fetch current user thunk
 */
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const user = await authService.getCurrentUser();
    return user;
  } catch (error) {
    // Clear tokens if user fetch fails (invalid token)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');

    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch user data.');
  }
});

/**
 * Forgot password thunk
 */
export const forgotPassword = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const result = await authService.forgotPassword(email);
    return result;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to send password reset email.');
  }
});

/**
 * Reset password thunk
 */
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; password: string },
  { rejectValue: string }
>('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const result = await authService.resetPassword(token, password);
    return result;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to reset password.');
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set credentials (for manual token setting)
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, asyncHelpers.pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.user = action.payload.user;
        state.token = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        asyncHelpers.rejected(state, action);
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, asyncHelpers.pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.user = action.payload.user;
        state.token = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, asyncHelpers.rejected);

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, asyncHelpers.pending)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        asyncHelpers.fulfilled(state);
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        asyncHelpers.rejected(state, action);
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, asyncHelpers.pending)
      .addCase(forgotPassword.fulfilled, asyncHelpers.fulfilled)
      .addCase(forgotPassword.rejected, asyncHelpers.rejected);

    // Reset password
    builder
      .addCase(resetPassword.pending, asyncHelpers.pending)
      .addCase(resetPassword.fulfilled, asyncHelpers.fulfilled)
      .addCase(resetPassword.rejected, asyncHelpers.rejected);
  },
});

// Actions
export const { clearError, setCredentials } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState): User | null => state.auth.user;
export const selectToken = (state: RootState): string | null => state.auth.token;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState): boolean => state.auth.isLoading;
export const selectError = (state: RootState): string | null => state.auth.error;

// Reducer
export default authSlice.reducer;
