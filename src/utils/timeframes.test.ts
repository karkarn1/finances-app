import type { Timeframe } from '@/types';
import {
  getTimeframeRange,
  formatDate,
  formatDateTime,
  formatMarketCap,
} from './timeframes';

describe('timeframes utilities', () => {
  // Mock Date to ensure consistent test results
  const mockNow = new Date('2024-06-15T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTimeframeRange', () => {
    it('should return correct range for 1D', () => {
      const result = getTimeframeRange('1D');

      expect(result.interval).toBe('1m');
      expect(result.end).toEqual(mockNow);
      // Start of day depends on timezone, just verify it's earlier than mockNow
      expect(result.start.getTime()).toBeLessThan(mockNow.getTime());
      expect(result.start.getDate()).toBe(15); // Same day
    });

    it('should return correct range for 1W', () => {
      const result = getTimeframeRange('1W');

      expect(result.interval).toBe('1h');
      expect(result.end).toEqual(mockNow);
      // 7 days before
      expect(result.start.toISOString()).toBe('2024-06-08T12:00:00.000Z');
    });

    it('should return correct range for 1M', () => {
      const result = getTimeframeRange('1M');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // 1 month before
      expect(result.start.toISOString()).toBe('2024-05-15T12:00:00.000Z');
    });

    it('should return correct range for 6M', () => {
      const result = getTimeframeRange('6M');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // 6 months before - verify date without timezone comparison
      expect(result.start.getFullYear()).toBe(2023);
      expect(result.start.getMonth()).toBe(11); // December (0-indexed)
      expect(result.start.getDate()).toBe(15);
    });

    it('should return correct range for YTD', () => {
      const result = getTimeframeRange('YTD');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // Start of current year
      expect(result.start.toISOString()).toBe('2024-01-01T05:00:00.000Z');
    });

    it('should return correct range for 1Y', () => {
      const result = getTimeframeRange('1Y');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // 1 year before
      expect(result.start.toISOString()).toBe('2023-06-15T12:00:00.000Z');
    });

    it('should return correct range for 5Y', () => {
      const result = getTimeframeRange('5Y');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // 5 years before
      expect(result.start.toISOString()).toBe('2019-06-15T12:00:00.000Z');
    });

    it('should return correct range for ALL', () => {
      const result = getTimeframeRange('ALL');

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // Unix epoch
      expect(result.start.toISOString()).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should default to 1M for unknown timeframe', () => {
      const result = getTimeframeRange('UNKNOWN' as Timeframe);

      expect(result.interval).toBe('1d');
      expect(result.end).toEqual(mockNow);
      // Should default to 1 month
      expect(result.start.toISOString()).toBe('2024-05-15T12:00:00.000Z');
    });

    it('should return Date objects', () => {
      const result = getTimeframeRange('1M');

      expect(result.start instanceof Date).toBe(true);
      expect(result.end instanceof Date).toBe(true);
    });

    it('should always have start before end', () => {
      const timeframes: Timeframe[] = ['1D', '1W', '1M', '6M', 'YTD', '1Y', '5Y', 'ALL'];

      timeframes.forEach((tf) => {
        const result = getTimeframeRange(tf);
        expect(result.start.getTime()).toBeLessThan(result.end.getTime());
      });
    });
  });

  describe('formatDate', () => {
    beforeEach(() => {
      jest.useRealTimers(); // Use real timers for date formatting
    });

    it('should format time for 1D timeframe', () => {
      const timestamp = new Date('2024-06-15T14:30:00').getTime();
      const result = formatDate(timestamp, '1D');

      expect(result).toMatch(/\d{2}:\d{2}\s[AP]M/); // Format: "02:30 PM"
    });

    it('should format month-day for 1W timeframe', () => {
      const timestamp = new Date('2024-06-15T14:30:00').getTime();
      const result = formatDate(timestamp, '1W');

      expect(result).toMatch(/Jun\s\d{1,2}/); // Format: "Jun 15"
    });

    it('should format month-day for 1M timeframe', () => {
      const timestamp = new Date('2024-06-15T14:30:00').getTime();
      const result = formatDate(timestamp, '1M');

      expect(result).toMatch(/Jun\s\d{1,2}/); // Format: "Jun 15"
    });

    it('should format year-month for longer timeframes', () => {
      const timestamp = new Date('2024-06-15T14:30:00').getTime();
      const result = formatDate(timestamp, '1Y');

      expect(result).toMatch(/\d{4}/); // Should include year
      expect(result).toMatch(/Jun/); // Should include month
    });

    it('should handle different months correctly', () => {
      const timestamps = [
        new Date('2024-01-15T12:00:00').getTime(),
        new Date('2024-06-15T12:00:00').getTime(),
        new Date('2024-12-15T12:00:00').getTime(),
      ];

      const results = timestamps.map((ts) => formatDate(ts, '1M'));

      expect(results[0]).toContain('Jan');
      expect(results[1]).toContain('Jun');
      expect(results[2]).toContain('Dec');
    });
  });

  describe('formatDateTime', () => {
    beforeEach(() => {
      jest.useRealTimers(); // Use real timers for date formatting
    });

    it('should format timestamp number correctly', () => {
      const timestamp = new Date('2024-06-15T14:30:00').getTime();
      const result = formatDateTime(timestamp);

      expect(result).toContain('2024');
      expect(result).toContain('Jun');
      expect(result).toContain('15');
      expect(result).toMatch(/\d{2}:\d{2}\s[AP]M/);
    });

    it('should format ISO string correctly', () => {
      const isoString = '2024-06-15T14:30:00Z';
      const result = formatDateTime(isoString);

      expect(result).toContain('2024');
      expect(result).toContain('Jun');
      expect(result).toContain('15');
    });

    it('should handle different times of day', () => {
      const morning = formatDateTime(new Date('2024-06-15T09:00:00').getTime());
      const evening = formatDateTime(new Date('2024-06-15T21:00:00').getTime());

      expect(morning).toContain('AM');
      expect(evening).toContain('PM');
    });

    it('should handle midnight correctly', () => {
      const midnight = formatDateTime(new Date('2024-06-15T00:00:00').getTime());

      expect(midnight).toContain('12:00 AM');
    });

    it('should handle noon correctly', () => {
      const noon = formatDateTime(new Date('2024-06-15T12:00:00').getTime());

      expect(noon).toContain('12:00 PM');
    });
  });

  describe('formatMarketCap', () => {
    it('should format trillions correctly', () => {
      expect(formatMarketCap(1_000_000_000_000)).toBe('$1.00T');
      expect(formatMarketCap(2_500_000_000_000)).toBe('$2.50T');
      expect(formatMarketCap(10_000_000_000_000)).toBe('$10.00T');
    });

    it('should format billions correctly', () => {
      expect(formatMarketCap(1_000_000_000)).toBe('$1.00B');
      expect(formatMarketCap(500_000_000_000)).toBe('$500.00B');
      expect(formatMarketCap(50_000_000_000)).toBe('$50.00B');
    });

    it('should format millions correctly', () => {
      expect(formatMarketCap(1_000_000)).toBe('$1.00M');
      expect(formatMarketCap(250_000_000)).toBe('$250.00M');
      expect(formatMarketCap(10_000_000)).toBe('$10.00M');
    });

    it('should format thousands correctly', () => {
      expect(formatMarketCap(1_000)).toBe('$1.00K');
      expect(formatMarketCap(500_000)).toBe('$500.00K');
      expect(formatMarketCap(10_000)).toBe('$10.00K');
    });

    it('should format small values with 2 decimals', () => {
      expect(formatMarketCap(100)).toBe('$100.00');
      expect(formatMarketCap(50.5)).toBe('$50.50');
      expect(formatMarketCap(0.99)).toBe('$0.99');
    });

    it('should handle null values', () => {
      expect(formatMarketCap(null)).toBe('N/A');
    });

    it('should handle undefined values', () => {
      expect(formatMarketCap(undefined as unknown as number)).toBe('N/A');
    });

    it('should handle zero', () => {
      expect(formatMarketCap(0)).toBe('$0.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatMarketCap(1_234_567_890)).toBe('$1.23B');
      expect(formatMarketCap(1_235_000_000)).toBe('$1.24B'); // Rounds up
      expect(formatMarketCap(9_999_999_999)).toBe('$10.00B');
    });

    it('should handle edge cases at boundaries', () => {
      expect(formatMarketCap(999_999_999_999)).toBe('$1000.00B'); // Just under 1T
      expect(formatMarketCap(999_999_999)).toBe('$1000.00M'); // Just under 1B
      expect(formatMarketCap(999_999)).toBe('$1000.00K'); // Just under 1M
      expect(formatMarketCap(999)).toBe('$999.00'); // Just under 1K
    });

    it('should handle very large numbers', () => {
      expect(formatMarketCap(100_000_000_000_000)).toBe('$100.00T');
      expect(formatMarketCap(999_999_999_999_999)).toBe('$1000.00T');
    });

    it('should handle decimal inputs correctly', () => {
      expect(formatMarketCap(1_234_567.89)).toBe('$1.23M');
      expect(formatMarketCap(9_876.54)).toBe('$9.88K');
    });
  });
});
