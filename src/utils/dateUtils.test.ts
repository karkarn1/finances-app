/**
 * Unit tests for timezone-aware date utilities
 */

import {
  parseUTCDate,
  parseAPIDate,
  formatDateForDisplay,
  formatLocalDate,
  formatDateForAPI,
  formatRelativeTime,
  toUTCStartOfDay,
  toUTCEndOfDay,
  parseUnixTimestamp,
  toUnixTimestamp,
  formatDateInTimezone,
  toTimezone,
  fromTimezone,
  getUserTimezone,
  toDatePickerValue,
  fromDatePickerValue,
  isPastDate,
  isFutureDate,
  getCurrentDate,
  createLocalDate,
  DateFormats,
} from './dateUtils';

describe('dateUtils', () => {
  describe('parseUTCDate / parseAPIDate', () => {
    it('should parse valid UTC date string', () => {
      const utcString = '2025-11-11T19:30:00Z';
      const result = parseUTCDate(utcString);
      expect(result).toBeInstanceOf(Date);
      // Date.toISOString() includes milliseconds, so we check the base part
      expect(result?.toISOString()).toContain('2025-11-11T19:30:00');
    });

    it('should parse valid UTC date string without Z suffix', () => {
      const utcString = '2025-11-11T19:30:00';
      const result = parseUTCDate(utcString);
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for invalid date string', () => {
      expect(parseUTCDate('invalid-date')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(parseUTCDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(parseUTCDate(undefined)).toBeNull();
    });

    it('parseAPIDate should be an alias for parseUTCDate', () => {
      expect(parseAPIDate).toBe(parseUTCDate);
    });
  });

  describe('formatDateForDisplay / formatLocalDate', () => {
    it('should format Date object with default format', () => {
      const date = new Date(2025, 10, 11, 14, 30); // Nov 11, 2025 2:30 PM local
      const result = formatDateForDisplay(date);
      expect(result).toContain('2025');
      expect(result).toContain('Nov');
    });

    it('should format UTC string', () => {
      const utcString = '2025-11-11T19:30:00Z';
      const result = formatDateForDisplay(utcString);
      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    it('should use custom format string', () => {
      const date = new Date(2025, 10, 11);
      const result = formatDateForDisplay(date, DateFormats.ISO);
      expect(result).toBe('2025-11-11');
    });

    it('should return empty string for null', () => {
      expect(formatDateForDisplay(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDateForDisplay(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDateForDisplay('invalid-date')).toBe('');
    });

    it('formatLocalDate should be an alias for formatDateForDisplay', () => {
      expect(formatLocalDate).toBe(formatDateForDisplay);
    });
  });

  describe('formatDateForAPI', () => {
    it('should format Date object with timezone offset', () => {
      const date = new Date(2025, 10, 11, 14, 30); // Nov 11, 2025 2:30 PM local
      const result = formatDateForAPI(date);

      expect(result).toBeTruthy();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(result).toContain('2025-11-11');
      expect(result).toContain('14:30');
    });

    it('should include timezone offset', () => {
      const date = new Date(2025, 10, 11, 14, 30);
      const result = formatDateForAPI(date);

      // Result should include timezone offset like -05:00 or +00:00
      expect(result).toMatch(/[+-]\d{2}:\d{2}$/);
    });

    it('should return null for null input', () => {
      expect(formatDateForAPI(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(formatDateForAPI(undefined)).toBeNull();
    });

    it('should return null for invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(formatDateForAPI(invalidDate)).toBeNull();
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent date as relative time', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toContain('ago');
    });

    it('should format UTC string as relative time', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    it('should return empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatRelativeTime('invalid-date')).toBe('');
    });
  });

  describe('toUTCStartOfDay', () => {
    it('should return start of day', () => {
      const date = new Date(2025, 10, 11, 14, 30, 45);
      const result = toUTCStartOfDay(date);

      expect(result).toBeTruthy();
      expect(result?.getHours()).toBe(0);
      expect(result?.getMinutes()).toBe(0);
      expect(result?.getSeconds()).toBe(0);
      expect(result?.getMilliseconds()).toBe(0);
    });

    it('should return null for null input', () => {
      expect(toUTCStartOfDay(null)).toBeNull();
    });
  });

  describe('toUTCEndOfDay', () => {
    it('should return end of day', () => {
      const date = new Date(2025, 10, 11, 14, 30, 45);
      const result = toUTCEndOfDay(date);

      expect(result).toBeTruthy();
      expect(result?.getHours()).toBe(23);
      expect(result?.getMinutes()).toBe(59);
      expect(result?.getSeconds()).toBe(59);
    });

    it('should return null for null input', () => {
      expect(toUTCEndOfDay(null)).toBeNull();
    });
  });

  describe('parseUnixTimestamp', () => {
    it('should parse valid Unix timestamp', () => {
      const timestamp = Math.floor(new Date(2025, 10, 11).getTime() / 1000);
      const result = parseUnixTimestamp(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(10);
      expect(result?.getDate()).toBe(11);
    });

    it('should return null for null input', () => {
      expect(parseUnixTimestamp(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(parseUnixTimestamp(undefined)).toBeNull();
    });
  });

  describe('toUnixTimestamp', () => {
    it('should convert Date to Unix timestamp', () => {
      const date = new Date(2025, 10, 11, 0, 0, 0);
      const result = toUnixTimestamp(date);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('number');

      // Verify round-trip
      const restored = parseUnixTimestamp(result!);
      expect(restored?.getFullYear()).toBe(2025);
      expect(restored?.getMonth()).toBe(10);
      expect(restored?.getDate()).toBe(11);
    });

    it('should return null for null input', () => {
      expect(toUnixTimestamp(null)).toBeNull();
    });

    it('should return null for invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(toUnixTimestamp(invalidDate)).toBeNull();
    });
  });

  describe('formatDateInTimezone', () => {
    it('should format date in specific timezone', () => {
      const date = new Date('2025-11-11T19:30:00Z');
      const result = formatDateInTimezone(date, DateFormats.MEDIUM_TIME, 'America/New_York');

      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    it('should return empty string for null', () => {
      expect(formatDateInTimezone(null, DateFormats.MEDIUM, 'America/New_York')).toBe('');
    });
  });

  describe('toTimezone', () => {
    it('should convert date to specific timezone', () => {
      const date = new Date('2025-11-11T19:30:00Z');
      const result = toTimezone(date, 'America/New_York');

      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for null input', () => {
      expect(toTimezone(null, 'America/New_York')).toBeNull();
    });
  });

  describe('fromTimezone', () => {
    it('should convert date from specific timezone', () => {
      const date = new Date(2025, 10, 11, 14, 30);
      const result = fromTimezone(date, 'America/New_York');

      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for null input', () => {
      expect(fromTimezone(null, 'America/New_York')).toBeNull();
    });
  });

  describe('getUserTimezone', () => {
    it('should return IANA timezone string', () => {
      const timezone = getUserTimezone();
      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe('string');
      // IANA timezones typically contain a slash
      // Examples: America/New_York, Europe/London, Asia/Tokyo
    });
  });

  describe('toDatePickerValue', () => {
    it('should convert UTC string to Date object', () => {
      const utcString = '2025-11-11T19:30:00Z';
      const result = toDatePickerValue(utcString);

      expect(result).toBeInstanceOf(Date);
    });

    it('should pass through valid Date object', () => {
      const date = new Date(2025, 10, 11);
      const result = toDatePickerValue(date);

      expect(result).toBe(date);
    });

    it('should return null for null input', () => {
      expect(toDatePickerValue(null)).toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(toDatePickerValue('invalid-date')).toBeNull();
    });

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(toDatePickerValue(invalidDate)).toBeNull();
    });
  });

  describe('fromDatePickerValue', () => {
    it('should convert Date object to API format with timezone', () => {
      const date = new Date(2025, 10, 11, 14, 30);
      const result = fromDatePickerValue(date);

      expect(result).toBeTruthy();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    it('should return null for null input', () => {
      expect(fromDatePickerValue(null)).toBeNull();
    });
  });

  describe('isPastDate', () => {
    it('should return true for past date', () => {
      const pastDate = new Date(2020, 0, 1);
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const futureDate = new Date(2030, 0, 1);
      expect(isPastDate(futureDate)).toBe(false);
    });

    it('should return true for past UTC string', () => {
      expect(isPastDate('2020-01-01T00:00:00Z')).toBe(true);
    });

    it('should return false for null', () => {
      expect(isPastDate(null)).toBe(false);
    });

    it('should return false for invalid date', () => {
      expect(isPastDate('invalid-date')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future date', () => {
      const futureDate = new Date(2030, 0, 1);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should return false for past date', () => {
      const pastDate = new Date(2020, 0, 1);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should return true for future UTC string', () => {
      expect(isFutureDate('2030-01-01T00:00:00Z')).toBe(true);
    });

    it('should return false for null', () => {
      expect(isFutureDate(null)).toBe(false);
    });

    it('should return false for invalid date', () => {
      expect(isFutureDate('invalid-date')).toBe(false);
    });
  });

  describe('getCurrentDate', () => {
    it('should return current Date object', () => {
      const before = Date.now();
      const result = getCurrentDate();
      const after = Date.now();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('createLocalDate', () => {
    it('should create date with year, month, day', () => {
      const result = createLocalDate(2025, 10, 11);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(10);
      expect(result.getDate()).toBe(11);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should create date with time components', () => {
      const result = createLocalDate(2025, 10, 11, 14, 30, 45);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(10);
      expect(result.getDate()).toBe(11);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });
  });

  describe('DateFormats', () => {
    it('should have all expected format constants', () => {
      expect(DateFormats.SHORT).toBe('P');
      expect(DateFormats.MEDIUM).toBe('PPP');
      expect(DateFormats.LONG).toBe('PPPP');
      expect(DateFormats.ISO).toBe('yyyy-MM-dd');
      expect(DateFormats.SHORT_TIME).toBe('Pp');
      expect(DateFormats.MEDIUM_TIME).toBe('PPpp');
      expect(DateFormats.LONG_TIME).toBe('PPPppp');
      expect(DateFormats.TIME).toBe('p');
      expect(DateFormats.TIME_SECONDS).toBe('pp');
      expect(DateFormats.TIME_24H).toBe('HH:mm');
      expect(DateFormats.TIME_24H_SECONDS).toBe('HH:mm:ss');
    });
  });
});
