/**
 * Base API client with request/response interceptors
 */

import type { ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Custom error class for API errors
 */
export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public status?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Handle API errors and throw custom error
 */
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An error occurred';
  let detail = '';

  try {
    const errorData = (await response.json()) as ApiError;
    errorMessage = errorData.detail || errorMessage;
    detail = errorData.detail || '';
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || errorMessage;
  }

  throw new ApiErrorClass(errorMessage, response.status, detail);
};

/**
 * Base fetch wrapper with auth and error handling
 */
export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with options headers if provided
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle error responses
    if (!response.ok) {
      await handleApiError(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return (await response.json()) as T;
  } catch (error) {
    // Re-throw ApiErrorClass instances
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    // Handle network errors
    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'Network error occurred',
      undefined,
      'Failed to connect to the server'
    );
  }
};

/**
 * Helper for FormData requests (used for OAuth2 login)
 */
export const apiClientFormData = async <T>(
  endpoint: string,
  formData: URLSearchParams,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method: 'POST',
    ...options,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      await handleApiError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'Network error occurred',
      undefined,
      'Failed to connect to the server'
    );
  }
};
