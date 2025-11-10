/**
 * Services barrel export
 *
 * Centralized export for all API service modules.
 * This allows clean imports like: import { authService, accountsService } from '@/services'
 */

// Re-export everything from individual service modules
export * as authService from './auth';
export * as securitiesService from './securities';
export * as accountsService from './accounts';
export * as holdingsService from './holdings';

// Re-export API client utilities
export { apiClient, apiClientFormData, ApiErrorClass } from './api';
