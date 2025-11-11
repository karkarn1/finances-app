import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return a function', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    expect(typeof result.current).toBe('function');
  });

  it('should debounce callback execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call the debounced function
    act(() => {
      result.current('test');
    });

    // Should not be called immediately
    expect(callback).not.toHaveBeenCalled();

    // Advance timers by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should be called after delay
    expect(callback).toHaveBeenCalledWith('test');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use custom delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 1000));

    act(() => {
      result.current('test');
    });

    // Should not be called after 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).not.toHaveBeenCalled();

    // Should be called after 1000ms total
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should reset timer on rapid calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // First call
    act(() => {
      result.current('call1');
    });

    // Advance 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Second call (should reset timer)
    act(() => {
      result.current('call2');
    });

    // Advance 200ms more (400ms total from first call)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Still should not be called
    expect(callback).not.toHaveBeenCalled();

    // Advance 300ms more (700ms from first call, but 500ms from second)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be called with the latest value only
    expect(callback).toHaveBeenCalledWith('call2');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple arguments', () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback((a: number, b: string, c: boolean) => callback(a, b, c), 300)
    );

    act(() => {
      result.current(42, 'hello', true);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith(42, 'hello', true);
  });

  it('should clear timeout on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('test');
    });

    // Unmount before timeout completes
    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle void return type', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(() => callback(), 300));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should update when callback changes', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 300),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      result.current('test1');
    });

    // Change the callback
    rerender({ cb: callback2 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Original timer will execute with the original callback
    expect(callback1).toHaveBeenCalledWith('test1');
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should update when delay changes', () => {
    const callback = jest.fn();

    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      { initialProps: { delay: 500 } }
    );

    act(() => {
      result.current('test');
    });

    // Change the delay
    rerender({ delay: 1000 });

    // Advance by old delay (500ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Original timer executes with original delay
    expect(callback).toHaveBeenCalledWith('test');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle default delay of 500ms', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current('test');
    });

    // Advance by default delay (500ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should handle rapid successive calls correctly', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Simulate rapid typing
    act(() => {
      result.current('a');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current('ab');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current('abc');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current('abcd');
    });

    // Total 300ms elapsed, but timer resets each time
    expect(callback).not.toHaveBeenCalled();

    // Wait the full delay from last call
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should only be called once with the last value
    expect(callback).toHaveBeenCalledWith('abcd');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
