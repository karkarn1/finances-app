import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmit } from './useFormSubmit';
import { errorService } from '@/services/errorService';
import * as errorHandler from '@/utils/errorHandler';

// Mock dependencies
jest.mock('@/services/errorService');
jest.mock('@/utils/errorHandler');

describe('useFormSubmit', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockFormatErrorMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (errorService.showError as jest.Mock) = mockShowError;
    (errorHandler.formatErrorMessage as jest.Mock) = mockFormatErrorMessage;
    mockFormatErrorMessage.mockReturnValue('Formatted error message');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFormSubmit(mockOnSubmit));

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should handle successful form submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(mockOnSubmit, mockOnSuccess));

    const testData = { name: 'Test', email: 'test@example.com' };

    await act(async () => {
      await result.current.handleSubmit(testData);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(testData);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    const { result } = renderHook(() => useFormSubmit(mockOnSubmit));

    act(() => {
      result.current.handleSubmit({ test: 'data' });
    });

    // Should be loading immediately
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.error).toBeNull();

    // Resolve the promise
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    // Should no longer be loading
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle submission errors', async () => {
    const testError = new Error('Submission failed');
    mockOnSubmit.mockRejectedValue(testError);

    const { result } = renderHook(() => useFormSubmit(mockOnSubmit, mockOnSuccess));

    await act(async () => {
      await result.current.handleSubmit({ test: 'data' });
    });

    expect(mockFormatErrorMessage).toHaveBeenCalledWith(testError);
    expect(result.current.error).toBe('Formatted error message');
    expect(mockShowError).toHaveBeenCalledWith(testError, 'Form submission');
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should not call onSuccess if not provided', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(mockOnSubmit));

    await act(async () => {
      await result.current.handleSubmit({ test: 'data' });
    });

    expect(mockOnSubmit).toHaveBeenCalled();
    // Should not throw even without onSuccess
    expect(result.current.error).toBeNull();
  });

  it('should clear error state', async () => {
    const testError = new Error('Test error');
    mockOnSubmit.mockRejectedValue(testError);
    const { result } = renderHook(() => useFormSubmit(mockOnSubmit));

    await act(async () => {
      await result.current.handleSubmit({ test: 'data' });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Formatted error message');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });


  it('should handle multiple submissions sequentially', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(mockOnSubmit, mockOnSuccess));

    // First submission
    await act(async () => {
      await result.current.handleSubmit({ data: 'first' });
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({ data: 'first' });
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);

    // Second submission
    await act(async () => {
      await result.current.handleSubmit({ data: 'second' });
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({ data: 'second' });
    expect(mockOnSuccess).toHaveBeenCalledTimes(2);
  });

  it('should clear previous error on new submission', async () => {
    const testError = new Error('First error');
    mockOnSubmit.mockRejectedValueOnce(testError).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useFormSubmit(mockOnSubmit));

    // First submission (fails)
    await act(async () => {
      await result.current.handleSubmit({ data: 'first' });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Formatted error message');
    });

    // Second submission (succeeds)
    await act(async () => {
      await result.current.handleSubmit({ data: 'second' });
    });

    expect(result.current.error).toBeNull();
  });
});
