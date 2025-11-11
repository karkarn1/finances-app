import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // Change value but don't advance timers yet
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Should still be initial

    // Advance timers by 500ms
    jest.advanceTimersByTime(500);

    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    // Rapid changes
    rerender({ value: 'change1' });
    jest.advanceTimersByTime(200);

    rerender({ value: 'change2' });
    jest.advanceTimersByTime(200);

    rerender({ value: 'change3' });
    jest.advanceTimersByTime(200);

    // Still should be initial because timer keeps resetting
    expect(result.current).toBe('initial');

    // Now advance past the delay
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('change3');
    });
  });

  it('should work with different types', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 42 },
    });

    expect(result.current).toBe(42);

    rerender({ value: 100 });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe(100);
    });
  });

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    // After 500ms, should still be initial
    jest.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    // After 1000ms total, should be updated
    jest.advanceTimersByTime(500);
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
