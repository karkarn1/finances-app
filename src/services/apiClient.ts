/**
 * Base API client with standardized error handling, interceptors, and logging.
 *
 * This class provides a centralized way to make HTTP requests with:
 * - Automatic authentication header injection
 * - Consistent error handling
 * - Request/response interceptors
 * - Type-safe responses
 */

/**
 * API base URL from environment.
 * In tests: Uses process.env.VITE_API_BASE_URL or default
 * In browser: Vite replaces process.env.VITE_API_BASE_URL with the value from .env
 */
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  message: string;
  status?: number;
  detail?: string | Record<string, unknown>;
}

/**
 * Custom error class for API client errors with status and detail information.
 */
export class ApiClientError extends Error {
  status: number | undefined;
  detail: string | Record<string, unknown> | undefined;

  constructor(message: string, status?: number, detail?: string | Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Standard API client with common request/response handling.
 *
 * Features:
 * - Automatic Bearer token authentication
 * - JSON request/response handling
 * - Comprehensive error handling
 * - RESTful method wrappers (GET, POST, PUT, DELETE)
 * - URL building with base path
 */
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization header with current token from localStorage.
   * @private
   */
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Build full URL from endpoint path.
   * Handles leading slashes in endpoints.
   * @private
   */
  private buildURL(endpoint: string): string {
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Handle fetch response and extract JSON or throw error.
   * Provides consistent error handling across all requests.
   * @private
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Check if response is OK (status 200-299)
    if (!response.ok) {
      // Try to parse error response for detailed error information
      let errorDetail: string | Record<string, unknown> = response.statusText;

      try {
        const errorData: unknown = await response.json();
        if (errorData && typeof errorData === 'object') {
          const errorObj = errorData as Record<string, unknown>;
          const detail = errorObj['detail'];
          const message = errorObj['message'];

          if (typeof detail === 'string' || (detail && typeof detail === 'object')) {
            errorDetail = detail as string | Record<string, unknown>;
          } else if (typeof message === 'string') {
            errorDetail = message;
          } else {
            errorDetail = errorData as Record<string, unknown>;
          }
        }
      } catch {
        // If JSON parsing fails, use status text as fallback
      }

      throw new ApiClientError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorDetail
      );
    }

    // Handle 204 No Content responses (typically from DELETE)
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    try {
      return (await response.json()) as T;
    } catch {
      // If no JSON body (or parsing fails), return empty object
      return {} as T;
    }
  }

  /**
   * Make GET request.
   * @param endpoint - API endpoint path (e.g., '/accounts' or 'accounts')
   * @param options - Additional fetch options
   * @returns Promise resolving to typed response
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    // Destructure to exclude headers from options spread
    const { headers: _, ...restOptions } = options || {};

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options?.headers,
      },
      ...restOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make POST request.
   * @param endpoint - API endpoint path
   * @param data - Request body data (will be JSON stringified)
   * @param options - Additional fetch options
   * @returns Promise resolving to typed response
   */
  async post<T, D = unknown>(endpoint: string, data?: D, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    // Destructure to exclude headers from options spread
    const { headers: _, ...restOptions } = options || {};

    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options?.headers,
      },
      ...restOptions,
    };

    if (data !== undefined) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    return this.handleResponse<T>(response);
  }

  /**
   * Make PUT request.
   * @param endpoint - API endpoint path
   * @param data - Request body data (will be JSON stringified)
   * @param options - Additional fetch options
   * @returns Promise resolving to typed response
   */
  async put<T, D = unknown>(endpoint: string, data?: D, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    // Destructure to exclude headers from options spread
    const { headers: _, ...restOptions } = options || {};

    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options?.headers,
      },
      ...restOptions,
    };

    if (data !== undefined) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    return this.handleResponse<T>(response);
  }

  /**
   * Make DELETE request.
   * @param endpoint - API endpoint path
   * @param options - Additional fetch options
   * @returns Promise resolving to typed response
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    // Destructure to exclude headers from options spread
    const { headers: _, ...restOptions } = options || {};

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options?.headers,
      },
      ...restOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make POST request with FormData (used for OAuth2 login).
   * Special case for form-encoded requests.
   * @param endpoint - API endpoint path
   * @param formData - URLSearchParams with form data
   * @param options - Additional fetch options
   * @returns Promise resolving to typed response
   */
  async postForm<T>(endpoint: string, formData: URLSearchParams, options?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    // Destructure to exclude headers from options spread
    const { headers: _, ...restOptions } = options || {};

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
      body: formData,
      ...restOptions,
    });

    return this.handleResponse<T>(response);
  }
}

/**
 * Global API client instance.
 * Use this singleton for all API calls throughout the application.
 */
export const apiClient = new ApiClient();
