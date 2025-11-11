/**
 * Base service class with common patterns for all API services.
 *
 * This abstract class provides:
 * - Consistent service structure
 * - Shared API client instance
 * - Endpoint path building utilities
 * - Common CRUD patterns
 *
 * All API services should extend this class and use the protected
 * client and helper methods to maintain consistency.
 */

import { apiClient, ApiClient } from './apiClient';

export abstract class BaseService {
  protected client: ApiClient;
  protected baseEndpoint: string;

  /**
   * Create a new service instance.
   * @param baseEndpoint - Base endpoint path for this service (e.g., 'accounts', 'securities')
   * @param client - API client instance (defaults to global singleton)
   */
  constructor(baseEndpoint: string, client: ApiClient = apiClient) {
    this.client = client;
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Build endpoint path relative to base endpoint.
   * Handles leading slashes and path concatenation.
   *
   * @param path - Path to append to base endpoint (optional)
   * @returns Full endpoint path
   *
   * @example
   * // If baseEndpoint is 'accounts'
   * buildEndpoint() // Returns 'accounts'
   * buildEndpoint('123') // Returns 'accounts/123'
   * buildEndpoint('/123') // Returns 'accounts/123' (leading slash removed)
   * buildEndpoint('123/values') // Returns 'accounts/123/values'
   */
  protected buildEndpoint(path: string = ''): string {
    if (!path) {
      return this.baseEndpoint;
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseEndpoint}/${cleanPath}`;
  }
}
