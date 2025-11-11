/**
 * Development-only logger utility
 *
 * Provides console logging methods that are automatically disabled in production builds.
 * All logs are prefixed with a category label for easier filtering.
 *
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.error('API request failed', error);
 * logger.warn('Deprecated feature used');
 * logger.info('User logged in successfully');
 * logger.debug('Component rendered with props:', props);
 * ```
 */

/* eslint-disable no-console */

/**
 * Check if in development mode.
 * In tests: Always use process.env.NODE_ENV
 * In browser: Falls back to process.env if import.meta not available (this never happens in practice)
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Logger utility with conditional logging based on environment
 *
 * In development:
 * - All log levels are active and output to console
 * - Logs are prefixed with category labels for easy filtering
 *
 * In production:
 * - All log levels are no-ops (except error which could send to tracking service)
 * - No console output
 */
export const logger = {
  /**
   * Log error messages
   *
   * In development: Outputs to console.error
   * In production: Silent (could be configured to send to error tracking service)
   *
   * @param args - Error message and optional data
   */
  error: (...args: unknown[]): void => {
    if (isDev) {
      console.error('[ERROR]', ...args);
    }
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.) in production
    // Example: Sentry.captureException(args[0]);
  },

  /**
   * Log warning messages
   *
   * In development: Outputs to console.warn
   * In production: Silent
   *
   * @param args - Warning message and optional data
   */
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log informational messages
   *
   * In development: Outputs to console.info
   * In production: Silent
   *
   * @param args - Info message and optional data
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log debug messages
   *
   * In development: Outputs to console.debug
   * In production: Silent
   *
   * @param args - Debug message and optional data
   */
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
};
