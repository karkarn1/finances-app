/**
 * useApiCall Hook
 *
 * Reusable hook for handling API calls with comprehensive error handling,
 * loading states, retry logic, and toast notifications.
 *
 * Features:
 * - Automatic loading state management
 * - Error handling with user-friendly messages
 * - Success/error toast notifications
 * - Retry logic with configurable attempts and delay
 * - Reset and retry functionality
 * - Type-safe with TypeScript generics
 */

import { useState, useCallback, useRef } from 'react';
import { errorService } from '@/services/errorService';
import { shouldRetry } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export interface UseApiCallOptions<T> {
  /**
   * Callback to run on successful API call
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback to run on error (after automatic error handling)
   */
  onError?: (error: Error) => void;

  /**
   * Success message to display in toast notification
   */
  showSuccessMessage?: string;

  /**
   * Whether to show error toast notification (default: true)
   */
  showErrorMessage?: boolean;

  /**
   * Number of retry attempts on failure (default: 0)
   */
  retryCount?: number;

  /**
   * Delay in milliseconds between retry attempts (default: 1000)
   */
  retryDelay?: number;

  /**
   * Whether to only retry on network errors (default: true)
   */
  retryOnlyNetworkErrors?: boolean;
}

export interface UseApiCallReturn<T, Args extends unknown[]> {
  /**
   * Execute the API call with given arguments
   */
  execute: (...args: Args) => Promise<T | undefined>;

  /**
   * Loading state - true while API call is in progress
   */
  loading: boolean;

  /**
   * Error object if the API call failed
   */
  error: Error | null;

  /**
   * Data returned from successful API call
   */
  data: T | null;

  /**
   * Reset the hook state (clear error, data, loading)
   */
  reset: () => void;

  /**
   * Retry the last failed API call with same arguments
   */
  retry: () => Promise<T | undefined>;

  /**
   * Current retry attempt number (0 if not retrying)
   */
  retryAttempt: number;
}

/**
 * Delay helper for retry logic
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * useApiCall Hook
 *
 * @template T - Return type of the API call
 * @template Args - Argument types for the API call function
 *
 * @param apiCall - The async function to execute
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * const { execute, loading, error, data } = useApiCall(
 *   async (id: string) => await api.getAccount(id),
 *   {
 *     showSuccessMessage: 'Account loaded successfully',
 *     retryCount: 3,
 *     retryDelay: 2000,
 *   }
 * );
 *
 * // Execute the API call
 * await execute('account-123');
 * ```
 */
export const useApiCall = <T, Args extends unknown[]>(
  apiCall: (...args: Args) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T, Args> => {
  const {
    onSuccess,
    onError,
    showSuccessMessage,
    showErrorMessage = true,
    retryCount = 0,
    retryDelay = 1000,
    retryOnlyNetworkErrors = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Store last arguments for retry functionality
  const lastArgsRef = useRef<Args | null>(null);

  /**
   * Execute the API call with retry logic
   */
  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      // Store arguments for retry
      lastArgsRef.current = args;

      setLoading(true);
      setError(null);
      setRetryAttempt(0);

      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt <= retryCount) {
        try {
          const result = await apiCall(...args);

          // Success - update state and call success callback
          setData(result);
          setLoading(false);

          if (showSuccessMessage) {
            errorService.showSuccess(showSuccessMessage);
          }

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          lastError = error;

          // Check if we should retry
          const canRetry = attempt < retryCount;
          const shouldRetryError = retryOnlyNetworkErrors ? shouldRetry(error) : true;

          if (canRetry && shouldRetryError) {
            attempt++;
            setRetryAttempt(attempt);

            logger.warn(`[useApiCall] Retry attempt ${attempt}/${retryCount}`, error);

            // Wait before retrying
            await delay(retryDelay);
          } else {
            // No more retries or error is not retryable
            break;
          }
        }
      }

      // All retries failed - handle error
      if (lastError) {
        setError(lastError);
        setLoading(false);
        setRetryAttempt(0);

        logger.error('[useApiCall] API call failed:', lastError);

        if (showErrorMessage) {
          errorService.showError(lastError, 'API call');
        }

        if (onError) {
          onError(lastError);
        }

        // TODO: Send to error tracking service
        // if (process.env['NODE_ENV'] === 'production') {
        //   Sentry.captureException(lastError, {
        //     contexts: {
        //       apiCall: {
        //         retryAttempts: attempt,
        //       },
        //     },
        //   });
        // }

        return undefined;
      }

      return undefined;
    },
    [
      apiCall,
      onSuccess,
      onError,
      showSuccessMessage,
      showErrorMessage,
      retryCount,
      retryDelay,
      retryOnlyNetworkErrors,
    ]
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setRetryAttempt(0);
    lastArgsRef.current = null;
  }, []);

  /**
   * Retry the last API call with same arguments
   */
  const retry = useCallback(async (): Promise<T | undefined> => {
    if (!lastArgsRef.current) {
      logger.warn('[useApiCall] Cannot retry: no previous arguments stored');
      return undefined;
    }

    return execute(...lastArgsRef.current);
  }, [execute]);

  return {
    execute,
    loading,
    error,
    data,
    reset,
    retry,
    retryAttempt,
  };
};
