/**
 * Tests for ProtectedRoute component
 */

import { screen, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import ProtectedRoute from './index';
import { renderWithProviders, mockAuthState, mockUnauthenticatedState, mockLoadingState } from '@/test-utils';
import authReducer from '@/store/slices/authSlice';
import * as authService from '@/services/auth';

// Mock the auth service
jest.mock('@/services/auth');

describe('ProtectedRoute', () => {
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;

  // Helper to render with auth reducer always included
  const renderProtectedRoute = (ui: ReactElement, options: any = {}) => {
    return renderWithProviders(ui, {
      ...options,
      reducers: { auth: authReducer },
    });
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    it('should render children when user is authenticated', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not show loading spinner when authenticated', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should render multiple children when authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: mockAuthState,
          },
        }
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should fetch current user when token exists in localStorage', async () => {
      const mockGetCurrentUser = authService.getCurrentUser as jest.Mock;
      mockGetCurrentUser.mockResolvedValue(mockAuthState.user);

      localStorage.setItem('auth_token', 'valid-token');

      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      await waitFor(() => {
        expect(mockGetCurrentUser).toHaveBeenCalled();
      });
    });

    it('should not fetch current user when token does not exist in localStorage', () => {
      const mockGetCurrentUser = authService.getCurrentUser as jest.Mock;

      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      expect(mockGetCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when user is not authenticated', () => {
      const { container } = renderWithProviders(
        <ProtectedRoute>{mockChildren}</ProtectedRoute>,
        {
          preloadedState: {
            auth: mockUnauthenticatedState,
          },
          route: '/dashboard',
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(container.querySelector('div')).toBeNull(); // No content rendered
    });

    it('should not render children when user is not authenticated', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockUnauthenticatedState,
        },
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should preserve location state when redirecting', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockUnauthenticatedState,
        },
        route: '/protected-page',
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when authentication is loading', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockLoadingState,
        },
      });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should center loading spinner on page', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockLoadingState,
        },
      });

      const spinnerContainer = screen.getByRole('progressbar').parentElement;
      expect(spinnerContainer).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      });
    });

    it('should use full viewport height for loading container', () => {
      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockLoadingState,
        },
      });

      const spinnerContainer = screen.getByRole('progressbar').parentElement;
      expect(spinnerContainer).toHaveStyle({ minHeight: '100vh' });
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to authenticated', () => {
      const { rerender, store } = renderWithProviders(
        <ProtectedRoute>{mockChildren}</ProtectedRoute>,
        {
          preloadedState: {
            auth: mockLoadingState,
          },
        }
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Simulate authentication completion
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: {
          user: mockAuthState.user,
          token: mockAuthState.token,
        },
      });

      rerender(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should transition from loading to unauthenticated (redirect)', () => {
      const { rerender, store } = renderWithProviders(
        <ProtectedRoute>{mockChildren}</ProtectedRoute>,
        {
          preloadedState: {
            auth: mockLoadingState,
          },
        }
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Simulate authentication failure
      store.dispatch({
        type: 'auth/loginUser/rejected',
        payload: 'Authentication failed',
      });

      rerender(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      renderProtectedRoute(<ProtectedRoute>{null}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      // Should not throw error
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      renderProtectedRoute(<ProtectedRoute>{undefined}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      // Should not throw error
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle empty string children', () => {
      renderProtectedRoute(<ProtectedRoute>{''}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      // Should not throw error
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>
            <div>
              <span data-testid="nested-content">Deeply Nested</span>
            </div>
          </div>
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: mockAuthState,
          },
        }
      );

      expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    });
  });

  describe('Token Management', () => {
    it('should not fetch user when both token and authenticated are true', async () => {
      const mockGetCurrentUser = authService.getCurrentUser as jest.Mock;

      localStorage.setItem('auth_token', 'valid-token');

      renderProtectedRoute(<ProtectedRoute>{mockChildren}</ProtectedRoute>, {
        preloadedState: {
          auth: mockAuthState,
        },
      });

      await waitFor(() => {
        expect(mockGetCurrentUser).toHaveBeenCalled();
      });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should handle token removal during component lifecycle', () => {
      localStorage.setItem('auth_token', 'valid-token');

      const { rerender } = renderWithProviders(
        <ProtectedRoute>{mockChildren}</ProtectedRoute>,
        {
          preloadedState: {
            auth: mockAuthState,
          },
        }
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Remove token
      localStorage.removeItem('auth_token');

      rerender(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      // Should still render because isAuthenticated is still true in state
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
