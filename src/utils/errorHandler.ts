/**
 * Centralized error handling utilities.
 * Provides consistent error message formatting and logging.
 */

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
  console.error(
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
