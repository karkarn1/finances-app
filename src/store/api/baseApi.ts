/**
 * Base RTK Query API configuration
 *
 * Provides a centralized API client with:
 * - Automatic JWT token injection
 * - Base URL configuration
 * - Tag-based cache invalidation
 * - Error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';

/**
 * API base URL from environment variables
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Base query configuration with JWT token injection
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as RootState).auth.token;

    // Add Authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Set Content-Type for JSON
    headers.set('Content-Type', 'application/json');

    return headers;
  },
});

/**
 * Base RTK Query API
 *
 * All feature-specific APIs should extend this base API using injectEndpoints.
 * This provides automatic cache invalidation, request deduplication, and
 * normalized state management.
 *
 * Tag Types:
 * - Account: Individual account entities
 * - AccountList: List of all accounts
 * - AccountValue: Account value/balance history entities
 * - Holding: Individual holding entities
 * - Security: Individual security entities
 * - SecurityList: Security search results
 * - SecurityPrices: Historical price data
 * - Currency: Individual currency entities
 * - CurrencyList: List of all currencies
 * - FinancialInstitution: Individual financial institution entities
 * - FinancialInstitutionList: List of all financial institutions
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Account',
    'AccountList',
    'AccountValue',
    'Holding',
    'Security',
    'SecurityList',
    'SecurityPrices',
    'Currency',
    'CurrencyList',
    'FinancialInstitution',
    'FinancialInstitutionList',
  ],
  endpoints: () => ({}),
});
