/**
 * Date utilities for timezone-aware date handling
 *
 * TIMEZONE STRATEGY:
 * - API receives dates: ISO 8601 WITH timezone offset (e.g., "2025-11-11T14:30:00-05:00")
 * - API returns dates: ISO 8601 in UTC (e.g., "2025-11-11T19:30:00Z")
 * - Frontend displays: User's local timezone
 * - Frontend submits: User's local time WITH timezone information
 *
 * WORKFLOW:
 * 1. Parse API dates (UTC) → Convert to local Date object → Display in local timezone
 * 2. User inputs date → Create Date object → Send to API with timezone offset
 * 3. Backend handles UTC conversion for storage
 */

import {
  parseISO,
  format,
  formatDistanceToNow,
  isValid,
  startOfDay,
  endOfDay,
  fromUnixTime,
  getUnixTime,
} from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Parse a UTC date string from the API into a JavaScript Date object
 *
 * @param utcString - ISO 8601 UTC date string (e.g., "2025-11-11T12:30:00Z")
 * @returns Date object representing the UTC time
 * @throws Error if the date string is invalid
 *
 * @example
 * const date = parseUTCDate("2025-11-11T12:30:00Z");
 * // Returns Date object for Nov 11, 2025 at 12:30 UTC
 */
export function parseUTCDate(utcString: string | null | undefined): Date | null {
  if (!utcString) {
    return null;
  }

  try {
    const date = parseISO(utcString);
    if (!isValid(date)) {
      throw new Error(`Invalid date string: ${utcString}`);
    }
    return date;
  } catch (error) {
    console.error('Error parsing UTC date:', error);
    return null;
  }
}

/**
 * Format a Date object for display to the user in their local timezone
 *
 * @param date - Date object or UTC string to format
 * @param formatString - date-fns format string (default: 'PPP' = "Nov 11, 2025")
 * @returns Formatted date string in user's local timezone
 *
 * @example
 * formatDateForDisplay(new Date(), 'PPP');
 * // Returns "Nov 11, 2025"
 *
 * formatDateForDisplay(new Date(), 'PPpp');
 * // Returns "Nov 11, 2025 at 12:30 PM"
 *
 * formatDateForDisplay(utcString, 'yyyy-MM-dd');
 * // Returns "2025-11-11"
 */
export function formatDateForDisplay(
  date: Date | string | null | undefined,
  formatString: string = 'PPP'
): string {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' ? parseUTCDate(date) : date;
    if (!dateObj || !isValid(dateObj)) {
      return '';
    }

    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
}

/**
 * Format a Date object for API submission with timezone information
 *
 * The API expects dates in ISO 8601 format WITH timezone information.
 * This allows the backend to handle UTC conversion while preserving the user's intent.
 *
 * @param date - Date object in user's local timezone
 * @returns ISO 8601 string with timezone offset (e.g., "2025-11-11T12:30:00-05:00")
 *
 * @example
 * const localDate = new Date(2025, 10, 11, 12, 30); // Nov 11, 2025 12:30 local time
 * formatDateForAPI(localDate);
 * // Returns "2025-11-11T12:30:00-05:00" (in EST timezone)
 * // Backend will convert this to UTC: "2025-11-11T17:30:00Z"
 */
export function formatDateForAPI(date: Date | null | undefined): string | null {
  if (!date || !isValid(date)) {
    return null;
  }

  try {
    // Get user's timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the date in the user's timezone with offset
    // This uses date-fns-tz to include timezone information
    return formatInTimeZone(date, userTimeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return null;
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date object or UTC string
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date());
 * // Returns "less than a minute ago"
 *
 * formatRelativeTime(yesterday);
 * // Returns "1 day ago"
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' ? parseUTCDate(date) : date;
    if (!dateObj || !isValid(dateObj)) {
      return '';
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Convert a local date to start of day in UTC
 *
 * @param date - Date in user's local timezone
 * @returns Date object representing start of day in UTC
 *
 * @example
 * const localDate = new Date(2025, 10, 11); // Nov 11, 2025 local time
 * toUTCStartOfDay(localDate);
 * // Returns UTC date for start of Nov 11, 2025 in user's timezone
 */
export function toUTCStartOfDay(date: Date | null | undefined): Date | null {
  if (!date || !isValid(date)) {
    return null;
  }

  try {
    return startOfDay(date);
  } catch (error) {
    console.error('Error converting to UTC start of day:', error);
    return null;
  }
}

/**
 * Convert a local date to end of day in UTC
 *
 * @param date - Date in user's local timezone
 * @returns Date object representing end of day in UTC
 *
 * @example
 * const localDate = new Date(2025, 10, 11); // Nov 11, 2025 local time
 * toUTCEndOfDay(localDate);
 * // Returns UTC date for end of Nov 11, 2025 in user's timezone
 */
export function toUTCEndOfDay(date: Date | null | undefined): Date | null {
  if (!date || !isValid(date)) {
    return null;
  }

  try {
    return endOfDay(date);
  } catch (error) {
    console.error('Error converting to UTC end of day:', error);
    return null;
  }
}

/**
 * Parse a Unix timestamp (seconds since epoch) to Date object
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object
 *
 * @example
 * parseUnixTimestamp(1699704600);
 * // Returns Date for Nov 11, 2025 at 12:30 UTC
 */
export function parseUnixTimestamp(timestamp: number | null | undefined): Date | null {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }

  try {
    const date = fromUnixTime(timestamp);
    if (!isValid(date)) {
      throw new Error(`Invalid Unix timestamp: ${timestamp}`);
    }
    return date;
  } catch (error) {
    console.error('Error parsing Unix timestamp:', error);
    return null;
  }
}

/**
 * Convert Date object to Unix timestamp (seconds since epoch)
 *
 * @param date - Date object
 * @returns Unix timestamp in seconds
 *
 * @example
 * toUnixTimestamp(new Date());
 * // Returns current Unix timestamp (e.g., 1699704600)
 */
export function toUnixTimestamp(date: Date | null | undefined): number | null {
  if (!date || !isValid(date)) {
    return null;
  }

  try {
    return getUnixTime(date);
  } catch (error) {
    console.error('Error converting to Unix timestamp:', error);
    return null;
  }
}

/**
 * Format a date in a specific timezone
 *
 * @param date - Date object or UTC string
 * @param formatString - date-fns format string
 * @param timeZone - IANA timezone (e.g., 'America/New_York')
 * @returns Formatted date string in specified timezone
 *
 * @example
 * formatDateInTimezone(new Date(), 'PPpp', 'America/New_York');
 * // Returns "Nov 11, 2025 at 12:30 PM" in EST
 */
export function formatDateInTimezone(
  date: Date | string | null | undefined,
  formatString: string,
  timeZone: string
): string {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' ? parseUTCDate(date) : date;
    if (!dateObj || !isValid(dateObj)) {
      return '';
    }

    return formatInTimeZone(dateObj, timeZone, formatString);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return '';
  }
}

/**
 * Convert a date to a specific timezone
 *
 * @param date - Date object or UTC string
 * @param timeZone - IANA timezone (e.g., 'America/New_York')
 * @returns Date object in specified timezone
 */
export function toTimezone(
  date: Date | string | null | undefined,
  timeZone: string
): Date | null {
  if (!date) {
    return null;
  }

  try {
    const dateObj = typeof date === 'string' ? parseUTCDate(date) : date;
    if (!dateObj || !isValid(dateObj)) {
      return null;
    }

    return toZonedTime(dateObj, timeZone);
  } catch (error) {
    console.error('Error converting to timezone:', error);
    return null;
  }
}

/**
 * Convert a date from a specific timezone to UTC
 *
 * @param date - Date object in specific timezone
 * @param timeZone - IANA timezone (e.g., 'America/New_York')
 * @returns Date object in UTC
 */
export function fromTimezone(
  date: Date | null | undefined,
  timeZone: string
): Date | null {
  if (!date || !isValid(date)) {
    return null;
  }

  try {
    return fromZonedTime(date, timeZone);
  } catch (error) {
    console.error('Error converting from timezone:', error);
    return null;
  }
}

/**
 * Common date format presets
 */
export const DateFormats = {
  /** Short date: 11/11/2025 */
  SHORT: 'P',
  /** Medium date: Nov 11, 2025 */
  MEDIUM: 'PPP',
  /** Long date: November 11, 2025 */
  LONG: 'PPPP',
  /** ISO date: 2025-11-11 */
  ISO: 'yyyy-MM-dd',
  /** Short with time: 11/11/2025, 12:30 PM */
  SHORT_TIME: 'Pp',
  /** Medium with time: Nov 11, 2025 at 12:30 PM */
  MEDIUM_TIME: 'PPpp',
  /** Long with time: November 11, 2025 at 12:30:45 PM */
  LONG_TIME: 'PPPppp',
  /** Time only: 12:30 PM */
  TIME: 'p',
  /** Time with seconds: 12:30:45 PM */
  TIME_SECONDS: 'pp',
  /** 24-hour time: 12:30 */
  TIME_24H: 'HH:mm',
  /** 24-hour time with seconds: 12:30:45 */
  TIME_24H_SECONDS: 'HH:mm:ss',
} as const;

/**
 * CONVENIENCE ALIASES FOR COMMON USE CASES
 *
 * These aliases make the code more readable and provide clear semantic meaning.
 */

/**
 * Parse a UTC date from the API
 * Alias for parseUTCDate - more semantic naming
 */
export const parseAPIDate = parseUTCDate;

/**
 * Format a date for display in the user's local timezone
 * Alias for formatDateForDisplay - more semantic naming
 */
export const formatLocalDate = formatDateForDisplay;

/**
 * Get the user's current timezone (IANA format)
 *
 * @returns IANA timezone string (e.g., "America/New_York", "Europe/London")
 *
 * @example
 * getUserTimezone();
 * // Returns "America/New_York" (if user is in EST)
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC'; // Fallback to UTC
  }
}

/**
 * Convert a date string to a Date object suitable for date pickers
 *
 * Date pickers (like MUI DatePicker) work with Date objects.
 * This function handles both UTC strings from API and local dates.
 *
 * @param dateValue - Date string (UTC or local) or Date object
 * @returns Date object in user's local timezone
 *
 * @example
 * // From API (UTC)
 * toDatePickerValue("2025-11-11T19:30:00Z");
 * // Returns Date object for Nov 11, 2025 2:30 PM EST (local time)
 *
 * // Already a Date object
 * toDatePickerValue(new Date());
 * // Returns the same Date object
 */
export function toDatePickerValue(
  dateValue: Date | string | null | undefined
): Date | null {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null;
  }

  return parseUTCDate(dateValue);
}

/**
 * Convert a date picker value to a string for API submission
 *
 * @param dateValue - Date object from date picker
 * @returns ISO 8601 string with timezone offset
 *
 * @example
 * const date = new Date(2025, 10, 11, 14, 30); // Nov 11, 2025 2:30 PM local
 * fromDatePickerValue(date);
 * // Returns "2025-11-11T14:30:00-05:00" (with timezone offset)
 */
export function fromDatePickerValue(dateValue: Date | null | undefined): string | null {
  return formatDateForAPI(dateValue);
}

/**
 * Check if a date string is in the past
 *
 * @param dateValue - Date string or Date object
 * @returns true if date is in the past, false otherwise
 *
 * @example
 * isPastDate("2020-01-01T00:00:00Z");
 * // Returns true
 */
export function isPastDate(dateValue: Date | string | null | undefined): boolean {
  if (!dateValue) {
    return false;
  }

  try {
    const date = typeof dateValue === 'string' ? parseUTCDate(dateValue) : dateValue;
    if (!date || !isValid(date)) {
      return false;
    }

    return date < new Date();
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
}

/**
 * Check if a date string is in the future
 *
 * @param dateValue - Date string or Date object
 * @returns true if date is in the future, false otherwise
 *
 * @example
 * isFutureDate("2030-01-01T00:00:00Z");
 * // Returns true
 */
export function isFutureDate(dateValue: Date | string | null | undefined): boolean {
  if (!dateValue) {
    return false;
  }

  try {
    const date = typeof dateValue === 'string' ? parseUTCDate(dateValue) : dateValue;
    if (!date || !isValid(date)) {
      return false;
    }

    return date > new Date();
  } catch (error) {
    console.error('Error checking if date is future:', error);
    return false;
  }
}

/**
 * Get the current date/time in the user's timezone
 *
 * @returns Date object representing current time
 *
 * @example
 * const now = getCurrentDate();
 * // Returns current Date object
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Create a date in the user's local timezone
 *
 * @param year - Full year (e.g., 2025)
 * @param month - Month (0-11, where 0 = January)
 * @param day - Day of month (1-31)
 * @param hours - Hours (0-23), default 0
 * @param minutes - Minutes (0-59), default 0
 * @param seconds - Seconds (0-59), default 0
 * @returns Date object in user's local timezone
 *
 * @example
 * createLocalDate(2025, 10, 11, 14, 30);
 * // Returns Date for Nov 11, 2025 at 2:30 PM in user's local timezone
 */
export function createLocalDate(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): Date {
  return new Date(year, month, day, hours, minutes, seconds);
}
