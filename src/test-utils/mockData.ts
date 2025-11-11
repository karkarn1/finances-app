/**
 * Shared mock data for tests
 */

import type { User } from '@/types';

/**
 * Mock authenticated user
 */
export const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  isActive: true,
  isSuperuser: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock superuser
 */
export const mockSuperuser: User = {
  id: '2',
  username: 'admin',
  email: 'admin@example.com',
  isActive: true,
  isSuperuser: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock inactive user
 */
export const mockInactiveUser: User = {
  id: '3',
  username: 'inactive',
  email: 'inactive@example.com',
  isActive: false,
  isSuperuser: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock authentication tokens
 */
export const mockTokens = {
  access_token: 'mock-access-token-123',
  refresh_token: 'mock-refresh-token-456',
  token_type: 'bearer' as const,
};

/**
 * Mock security
 */
export const mockSecurity = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  type: 'stock',
  exchange: 'NASDAQ',
  currency: 'USD',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock security with prices
 */
export const mockSecurityWithPrices = {
  ...mockSecurity,
  latestPrice: 180.5,
  previousClose: 178.2,
  change: 2.3,
  changePercent: 1.29,
  dayHigh: 182.0,
  dayLow: 177.5,
  volume: 52000000,
  marketCap: 2800000000000,
};

/**
 * Mock currency
 */
export const mockCurrency = {
  id: '1',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock financial institution
 */
export const mockFinancialInstitution = {
  id: '1',
  name: 'Chase Bank',
  type: 'bank',
  website: 'https://www.chase.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock account
 */
export const mockAccount = {
  id: '1',
  name: 'Checking Account',
  type: 'asset',
  category: 'Checking',
  balance: 5000.0,
  change: 2.5,
  currency: 'USD',
  financialInstitutionId: '1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock holding
 */
export const mockHolding = {
  id: '1',
  accountId: '1',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  quantity: 10,
  costBasis: 1500.0,
  currentPrice: 180.5,
  marketValue: 1805.0,
  gainLoss: {
    amount: 305.0,
    percentage: 20.33,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock Redux auth state (authenticated)
 */
export const mockAuthState = {
  user: mockUser,
  token: mockTokens.access_token,
  refreshToken: mockTokens.refresh_token,
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

/**
 * Mock Redux auth state (unauthenticated)
 */
export const mockUnauthenticatedState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Mock Redux auth state (loading)
 */
export const mockLoadingState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Mock Redux auth state (with error)
 */
export const mockErrorState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: 'Authentication failed',
};
