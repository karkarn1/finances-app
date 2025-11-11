import { formatErrorMessage, logError, ERROR_MESSAGES } from './errorHandler';
import { logger } from './logger';

// Mock logger
jest.mock('./logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('errorHandler utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatErrorMessage', () => {
    it('should handle null/undefined errors', () => {
      expect(formatErrorMessage(null)).toBe('An unexpected error occurred');
      expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred');
    });

    it('should handle string errors', () => {
      expect(formatErrorMessage('Simple error message')).toBe('Simple error message');
      expect(formatErrorMessage('Network timeout')).toBe('Network timeout');
    });

    it('should handle Error objects', () => {
      const error = new Error('Something went wrong');
      expect(formatErrorMessage(error)).toBe('Something went wrong');
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Cannot read property of undefined');
      expect(formatErrorMessage(error)).toBe('Cannot read property of undefined');
    });

    it('should handle FastAPI detail field (string)', () => {
      const error = {
        detail: 'Invalid credentials',
      };
      expect(formatErrorMessage(error)).toBe('Invalid credentials');
    });

    it('should handle FastAPI detail field (array)', () => {
      const error = {
        detail: [
          { msg: 'Field is required', type: 'value_error.missing' },
          { msg: 'Invalid email format', type: 'value_error.email' },
        ],
      };
      expect(formatErrorMessage(error)).toBe('Field is required, Invalid email format');
    });

    it('should handle Axios error response structure', () => {
      const error = {
        response: {
          data: {
            detail: 'Unauthorized access',
          },
        },
      };
      expect(formatErrorMessage(error)).toBe('Unauthorized access');
    });

    it('should handle generic message field', () => {
      const error = {
        message: 'Custom error message',
      };
      expect(formatErrorMessage(error)).toBe('Custom error message');
    });

    it('should prioritize detail over message', () => {
      const error = {
        detail: 'Detail message',
        message: 'Generic message',
      };
      expect(formatErrorMessage(error)).toBe('Detail message');
    });

    it('should handle nested Axios error', () => {
      const error = {
        response: {
          data: {
            detail: 'Resource not found',
          },
          status: 404,
        },
      };
      expect(formatErrorMessage(error)).toBe('Resource not found');
    });

    it('should fallback to default message for unknown error types', () => {
      const error = { randomField: 'random value' };
      expect(formatErrorMessage(error)).toBe('An unexpected error occurred');
    });

    it('should handle detail array with non-object items', () => {
      const error = {
        detail: ['Error 1', 'Error 2', 'Error 3'],
      };
      // Should stringify non-object items
      expect(formatErrorMessage(error)).toContain('Error');
    });

    it('should handle empty detail array', () => {
      const error = {
        detail: [],
      };
      expect(formatErrorMessage(error)).toBe('An unexpected error occurred');
    });

    it('should handle object detail', () => {
      const error = {
        detail: {
          field: 'email',
          issue: 'already exists',
        },
      };
      // Should treat object detail as unexpected
      expect(formatErrorMessage(error)).toBe('An unexpected error occurred');
    });

    it('should handle numbers as errors', () => {
      expect(formatErrorMessage(404)).toBe('An unexpected error occurred');
      expect(formatErrorMessage(500)).toBe('An unexpected error occurred');
    });

    it('should handle boolean as errors', () => {
      expect(formatErrorMessage(true)).toBe('An unexpected error occurred');
      expect(formatErrorMessage(false)).toBe('An unexpected error occurred');
    });
  });

  describe('logError', () => {
    it('should log error to console without context', () => {
      const error = new Error('Test error');
      logError(error);

      expect(logger.error).toHaveBeenCalledWith(
        '[Error]:',
        'Test error',
        error
      );
    });

    it('should log error to console with context', () => {
      const error = new Error('Test error');
      logError(error, 'User Login');

      expect(logger.error).toHaveBeenCalledWith(
        '[Error - User Login]:',
        'Test error',
        error
      );
    });

    it('should log string errors', () => {
      logError('Simple error', 'API Call');

      expect(logger.error).toHaveBeenCalledWith(
        '[Error - API Call]:',
        'Simple error',
        'Simple error'
      );
    });

    it('should log null errors with default message', () => {
      logError(null, 'Some Context');

      expect(logger.error).toHaveBeenCalledWith(
        '[Error - Some Context]:',
        'An unexpected error occurred',
        null
      );
    });

    it('should format complex errors before logging', () => {
      const error = {
        detail: 'Validation failed',
        status: 400,
      };
      logError(error, 'Form Submission');

      expect(logger.error).toHaveBeenCalledWith(
        '[Error - Form Submission]:',
        'Validation failed',
        error
      );
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should contain all expected error messages', () => {
      expect(ERROR_MESSAGES.NETWORK).toBe('Network error. Please check your connection.');
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('You are not authorized to perform this action.');
      expect(ERROR_MESSAGES.NOT_FOUND).toBe('The requested resource was not found.');
      expect(ERROR_MESSAGES.SERVER).toBe('Server error. Please try again later.');
      expect(ERROR_MESSAGES.VALIDATION).toBe('Please check your input and try again.');
      expect(ERROR_MESSAGES.UNKNOWN).toBe('An unexpected error occurred.');
    });

    it('should be a read-only object', () => {
      // TypeScript const assertion ensures this, but we can verify the values exist
      expect(Object.keys(ERROR_MESSAGES)).toContain('NETWORK');
      expect(Object.keys(ERROR_MESSAGES)).toContain('UNAUTHORIZED');
      expect(Object.keys(ERROR_MESSAGES)).toContain('NOT_FOUND');
      expect(Object.keys(ERROR_MESSAGES)).toContain('SERVER');
      expect(Object.keys(ERROR_MESSAGES)).toContain('VALIDATION');
      expect(Object.keys(ERROR_MESSAGES)).toContain('UNKNOWN');
    });

    it('should have exactly 6 error message types', () => {
      expect(Object.keys(ERROR_MESSAGES).length).toBe(6);
    });
  });
});
