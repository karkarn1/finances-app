/**
 * Centralized error handling utilities.
 * Provides consistent error message formatting and logging.
 */

import { logger } from './logger';

/**
 * Extract a user-friendly error message from various error types.
 *
 * @param error - Any error object (Error, API response, string, unknown)
 * @returns User-friendly error message
 */
export const formatErrorMessage = (error: unknown): string => {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses (common FastAPI format)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // FastAPI detail field
    if ('detail' in errorObj && errorObj['detail']) {
      if (typeof errorObj['detail'] === 'string') {
        return errorObj['detail'];
      }
      if (Array.isArray(errorObj['detail'])) {
        // Handle empty arrays
        if (errorObj['detail'].length === 0) {
          return 'An unexpected error occurred';
        }
        return errorObj['detail'].map((d: unknown) => {
          if (typeof d === 'object' && d !== null && 'msg' in d) {
            return (d as { msg: string }).msg;
          }
          return JSON.stringify(d);
        }).join(', ');
      }
    }

    // Response data field (Axios)
    if (
      'response' in errorObj &&
      typeof errorObj['response'] === 'object' &&
      errorObj['response'] !== null &&
      'data' in errorObj['response']
    ) {
      const responseData = (errorObj['response'] as Record<string, unknown>)['data'];
      if (
        typeof responseData === 'object' &&
        responseData !== null &&
        'detail' in responseData
      ) {
        const detail = (responseData as Record<string, unknown>)['detail'];
        if (typeof detail === 'string') {
          return detail;
        }
      }
    }

    // Generic message field
    if ('message' in errorObj && typeof errorObj['message'] === 'string') {
      return errorObj['message'];
    }
  }

  // Fallback
  return 'An unexpected error occurred';
};

/**
 * Log error to console with context.
 * In production, this could send to error tracking service (Sentry, etc.)
 */
export const logError = (error: unknown, context?: string): void => {
  const message = formatErrorMessage(error);
  logger.error(
    `[Error${context ? ` - ${context}` : ''}]:`,
    message,
    error
  );
};

/**
 * Common error messages for consistent UX.
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Detect if error is a network error
 *
 * @param error - Error to check
 * @returns True if error is network-related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;

  // Check Error object
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' // Fetch API throws TypeError for network errors
    );
  }

  // Check response status
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Check for status code
    if ('status' in errorObj) {
      return errorObj['status'] === 0 || errorObj['status'] === 503 || errorObj['status'] === 504;
    }

    // Check response object
    if ('response' in errorObj && typeof errorObj['response'] === 'object' && errorObj['response'] !== null) {
      const response = errorObj['response'] as Record<string, unknown>;
      if ('status' in response) {
        return response['status'] === 0 || response['status'] === 503 || response['status'] === 504;
      }
    }

    // Check for network flag
    if ('isNetworkError' in errorObj) {
      return errorObj['isNetworkError'] === true;
    }
  }

  return false;
};

/**
 * Determine if an error should be retried
 *
 * @param error - Error to check
 * @returns True if error is retryable
 */
export const shouldRetry = (error: unknown): boolean => {
  // Network errors are retryable
  if (isNetworkError(error)) {
    return true;
  }

  // Check for specific HTTP status codes that are retryable
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    const getStatus = (): number | null => {
      if ('status' in errorObj && typeof errorObj['status'] === 'number') {
        return errorObj['status'];
      }
      if ('response' in errorObj && typeof errorObj['response'] === 'object' && errorObj['response'] !== null) {
        const response = errorObj['response'] as Record<string, unknown>;
        if ('status' in response && typeof response['status'] === 'number') {
          return response['status'];
        }
      }
      return null;
    };

    const status = getStatus();
    if (status !== null) {
      // Retry on server errors (5xx) and specific client errors
      return (
        status === 408 || // Request Timeout
        status === 429 || // Too Many Requests
        status === 503 || // Service Unavailable
        status === 504 || // Gateway Timeout
        (status >= 500 && status < 600) // Server errors
      );
    }
  }

  return false;
};

/**
 * Get user-friendly error message based on error category
 *
 * @param error - Error to get message for
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const category = categorizeError(error);

  switch (category) {
    case ErrorCategory.NETWORK:
      return ERROR_MESSAGES.NETWORK;
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case ErrorCategory.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case ErrorCategory.VALIDATION:
      return ERROR_MESSAGES.VALIDATION;
    case ErrorCategory.SERVER:
      return ERROR_MESSAGES.SERVER;
    default:
      return formatErrorMessage(error) || ERROR_MESSAGES.UNKNOWN;
  }
};

/**
 * Categorize error type
 *
 * @param error - Error to categorize
 * @returns Error category
 */
export const categorizeError = (error: unknown): ErrorCategory => {
  if (!error) return ErrorCategory.UNKNOWN;

  // Check for network errors
  if (isNetworkError(error)) {
    return ErrorCategory.NETWORK;
  }

  // Check HTTP status codes
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    const getStatus = (): number | null => {
      if ('status' in errorObj && typeof errorObj['status'] === 'number') {
        return errorObj['status'];
      }
      if ('response' in errorObj && typeof errorObj['response'] === 'object' && errorObj['response'] !== null) {
        const response = errorObj['response'] as Record<string, unknown>;
        if ('status' in response && typeof response['status'] === 'number') {
          return response['status'];
        }
      }
      return null;
    };

    const status = getStatus();
    if (status !== null) {
      if (status === 401) return ErrorCategory.AUTHENTICATION;
      if (status === 403) return ErrorCategory.AUTHORIZATION;
      if (status === 404) return ErrorCategory.NOT_FOUND;
      if (status === 422 || status === 400) return ErrorCategory.VALIDATION;
      if (status >= 500) return ErrorCategory.SERVER;
    }
  }

  // Check error message content
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('not found')) {
      return ErrorCategory.NOT_FOUND;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * TODO: Integration with error tracking service (Sentry/LogRocket)
 *
 * Future implementation:
 *
 * export const trackError = (error: unknown, context?: Record<string, unknown>): void => {
 *   if (process.env['NODE_ENV'] === 'production' && typeof Sentry !== 'undefined') {
 *     const category = categorizeError(error);
 *     Sentry.captureException(error, {
 *       level: category === ErrorCategory.NETWORK ? 'warning' : 'error',
 *       tags: {
 *         errorCategory: category,
 *       },
 *       contexts: {
 *         custom: context || {},
 *       },
 *     });
 *   }
 * };
 */
