/**
 * Timeframe utilities for securities price data
 */

import type { Timeframe } from '@/types';

export interface TimeframeRange {
  start: Date;
  end: Date;
  interval: string;
}

/**
 * Calculate date range and interval for a given timeframe
 */
export const getTimeframeRange = (timeframe: Timeframe): TimeframeRange => {
  const end = new Date();
  let start: Date;
  let interval: string;

  switch (timeframe) {
    case '1D':
      start = new Date(end);
      start.setHours(0, 0, 0, 0);
      interval = '1m';
      break;

    case '1W':
      start = new Date(end);
      start.setDate(start.getDate() - 7);
      interval = '1h';
      break;

    case '1M':
      start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      interval = '1d';
      break;

    case '6M':
      start = new Date(end);
      start.setMonth(start.getMonth() - 6);
      interval = '1d';
      break;

    case 'YTD':
      start = new Date(end.getFullYear(), 0, 1);
      interval = '1d';
      break;

    case '1Y':
      start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      interval = '1d';
      break;

    case '5Y':
      start = new Date(end);
      start.setFullYear(start.getFullYear() - 5);
      interval = '1wk';
      break;

    case 'ALL':
      start = new Date(0); // Unix epoch
      interval = '1wk';
      break;

    default:
      // Default to 1 month
      start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      interval = '1d';
  }

  return { start, end, interval };
};

/**
 * Format date based on timeframe context
 */
export const formatDate = (timestamp: number, timeframe: Timeframe): string => {
  const date = new Date(timestamp);

  if (timeframe === '1D') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (timeframe === '1W' || timeframe === '1M') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }
};

/**
 * Format date and time for tooltip
 */
export const formatDateTime = (timestamp: number | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format market cap value
 */
export const formatMarketCap = (value: number | null): string => {
  if (value === null || value === undefined) return 'N/A';

  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};
