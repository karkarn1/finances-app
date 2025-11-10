/**
 * Securities API service
 */

import { apiClient } from './api';
import type {
  Security,
  SecurityPricesResponse,
  SyncResponse,
} from '@/types';

/**
 * Search securities by symbol or name
 */
export const searchSecurities = async (query: string): Promise<Security[]> => {
  return apiClient<Security[]>(`/securities/search?q=${encodeURIComponent(query)}`);
};

/**
 * Get security details by symbol
 */
export const getSecurity = async (symbol: string): Promise<Security> => {
  return apiClient<Security>(`/securities/${symbol}`);
};

/**
 * Sync security data from Yahoo Finance (requires auth)
 */
export const syncSecurity = async (symbol: string): Promise<SyncResponse> => {
  return apiClient<SyncResponse>(`/securities/${symbol}/sync`, {
    method: 'POST',
  });
};

/**
 * Get security price data (requires auth)
 */
export const getSecurityPrices = async (
  symbol: string,
  start?: string,
  end?: string,
  interval: string = '1d'
): Promise<SecurityPricesResponse> => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  params.append('interval', interval);

  return apiClient<SecurityPricesResponse>(
    `/securities/${symbol}/prices?${params.toString()}`
  );
};
