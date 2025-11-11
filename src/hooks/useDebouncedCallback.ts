import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of the provided callback function.
 * Useful for debouncing event handlers like onChange, onScroll, etc.
 *
 * @template Args - Argument types for the callback function
 * @template Return - Return type of the callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced callback function
 *
 * @example
 * ```tsx
 * const SearchComponent: FC = () => {
 *   const handleSearch = useDebouncedCallback((query: string) => {
 *     fetchResults(query);
 *   }, 300);
 *
 *   return (
 *     <input onChange={(e) => handleSearch(e.target.value)} />
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With immediate execution on first call
 * const handleScroll = useDebouncedCallback(() => {
 *   console.log('Scrolled');
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export const useDebouncedCallback = <
  Args extends unknown[] = unknown[],
  Return = void
>(
  callback: (...args: Args) => Return,
  delay: number = 500
): ((...args: Args) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Args) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
