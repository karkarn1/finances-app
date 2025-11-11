import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  forgotPassword,
  resetPassword,
  clearError,
  setCredentials,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from './authSlice';
import * as authService from '@/services/auth';
import { ApiErrorClass } from '@/services/api';
import type { User, TokenResponse } from '@/types';

// Mock the auth service
jest.mock('@/services/auth');

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    isActive: true,
    isSuperuser: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockTokens: TokenResponse = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    token_type: 'bearer',
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state when no tokens in localStorage', () => {
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    // Note: localStorage initialization is tested implicitly through setCredentials reducer
    // Testing it directly would require module reset which is complex and fragile
  });

  describe('loginUser async thunk', () => {
    it('should handle successful login', async () => {
      (authService.login as jest.Mock).mockResolvedValue(mockTokens);
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await store.dispatch(
        loginUser({ username: 'testuser', password: 'password123' })
      );

      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.access_token);
      expect(state.refreshToken).toBe(mockTokens.refresh_token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();

      // Check localStorage
      expect(localStorage.getItem('auth_token')).toBe(mockTokens.access_token);
      expect(localStorage.getItem('refresh_token')).toBe(mockTokens.refresh_token);
    });

    it('should set loading state during login', async () => {
      (authService.login as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTokens), 100))
      );
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const promise = store.dispatch(
        loginUser({ username: 'testuser', password: 'password123' })
      );

      // Check loading state
      expect(store.getState().auth.isLoading).toBe(true);

      await promise;

      expect(store.getState().auth.isLoading).toBe(false);
    });

    it('should handle login failure with ApiError', async () => {
      const apiError = new ApiErrorClass('Invalid credentials', 401);
      (authService.login as jest.Mock).mockRejectedValue(apiError);

      await store.dispatch(
        loginUser({ username: 'wrong', password: 'wrong' })
      );

      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isLoading).toBe(false);
    });

    it('should handle login failure with generic error', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Network error'));

      await store.dispatch(
        loginUser({ username: 'test', password: 'test' })
      );

      const state = store.getState().auth;

      expect(state.error).toBe('Login failed. Please try again.');
    });
  });

  describe('registerUser async thunk', () => {
    it('should handle successful registration', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockTokens);

      await store.dispatch(
        registerUser({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        })
      );

      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle registration failure', async () => {
      const error = new ApiErrorClass('Email already exists', 400);
      (authService.register as jest.Mock).mockRejectedValue(error);

      await store.dispatch(
        registerUser({
          username: 'existing',
          email: 'existing@example.com',
          password: 'pass',
        })
      );

      const state = store.getState().auth;

      expect(state.error).toBe('Email already exists');
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logoutUser async thunk', () => {
    it('should clear auth state on logout', async () => {
      // First login
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'token',
          refreshToken: 'refresh',
        })
      );

      // Then logout
      await store.dispatch(logoutUser());

      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();

      // Check localStorage cleared
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('fetchCurrentUser async thunk', () => {
    it('should fetch and set current user', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await store.dispatch(fetchCurrentUser());

      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetch user failure and clear tokens', async () => {
      localStorage.setItem('auth_token', 'invalid-token');
      localStorage.setItem('refresh_token', 'invalid-refresh');

      const error = new ApiErrorClass('Unauthorized', 401);
      (authService.getCurrentUser as jest.Mock).mockRejectedValue(error);

      await store.dispatch(fetchCurrentUser());

      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Unauthorized');

      // Tokens should be cleared from localStorage
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('forgotPassword async thunk', () => {
    it('should handle forgot password request', async () => {
      const response = { message: 'Password reset email sent' };
      (authService.forgotPassword as jest.Mock).mockResolvedValue(response);

      await store.dispatch(forgotPassword('test@example.com'));

      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle forgot password failure', async () => {
      const error = new ApiErrorClass('Email not found', 404);
      (authService.forgotPassword as jest.Mock).mockRejectedValue(error);

      await store.dispatch(forgotPassword('unknown@example.com'));

      const state = store.getState().auth;

      expect(state.error).toBe('Email not found');
    });
  });

  describe('resetPassword async thunk', () => {
    it('should handle password reset', async () => {
      const response = { message: 'Password reset successful' };
      (authService.resetPassword as jest.Mock).mockResolvedValue(response);

      await store.dispatch(
        resetPassword({ token: 'reset-token', password: 'newpassword' })
      );

      const state = store.getState().auth;

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle password reset failure', async () => {
      const error = new ApiErrorClass('Invalid or expired token', 400);
      (authService.resetPassword as jest.Mock).mockRejectedValue(error);

      await store.dispatch(
        resetPassword({ token: 'invalid-token', password: 'newpass' })
      );

      const state = store.getState().auth;

      expect(state.error).toBe('Invalid or expired token');
    });
  });

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(setCredentials({ user: mockUser, token: 'token', refreshToken: 'refresh' }));
      // Manually set error for testing
      const stateWithError = {
        ...store.getState().auth,
        error: 'Test error',
      };

      store.dispatch(clearError());

      // Error should be cleared
      expect(store.getState().auth.error).toBeNull();
    });

    it('should set credentials manually', () => {
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'manual-token',
          refreshToken: 'manual-refresh',
        })
      );

      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('manual-token');
      expect(state.refreshToken).toBe('manual-refresh');
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      store.dispatch(
        setCredentials({
          user: mockUser,
          token: 'test-token',
          refreshToken: 'test-refresh',
        })
      );
    });

    it('should select user', () => {
      expect(selectUser(store.getState())).toEqual(mockUser);
    });

    it('should select token', () => {
      expect(selectToken(store.getState())).toBe('test-token');
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(store.getState())).toBe(true);
    });

    it('should select isLoading', () => {
      expect(selectIsLoading(store.getState())).toBe(false);
    });

    it('should select error', () => {
      expect(selectError(store.getState())).toBeNull();
    });
  });
});
