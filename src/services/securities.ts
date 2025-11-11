/**
 * Securities API service
 *
 * Provides methods for searching, managing, and synchronizing securities data.
 * Integrates with Yahoo Finance for real-time market data.
 * Uses the standardized BaseService pattern for consistent API interactions.
 */

import { BaseService } from './BaseService';
import type {
  Security,
  SecurityPricesResponse,
  SyncResponse,
} from '@/types';

/**
 * Service class for security-related API operations.
 * Handles security search, details, synchronization, and price data retrieval.
 */
class SecuritiesService extends BaseService {
  constructor() {
    super('securities');
  }

  /**
   * Search securities by symbol or name.
   * @param query - Search query string (symbol or name)
   * @returns Promise resolving to array of matching securities
   */
  async search(query: string): Promise<Security[]> {
    return this.client.get<Security[]>(
      this.buildEndpoint(`search?q=${encodeURIComponent(query)}`)
    );
  }

  /**
   * Get security details by symbol.
   * @param symbol - Security symbol (e.g., 'AAPL', 'GOOGL')
   * @returns Promise resolving to detailed security object
   */
  async getBySymbol(symbol: string): Promise<Security> {
    return this.client.get<Security>(this.buildEndpoint(symbol));
  }

  /**
   * Sync security data from Yahoo Finance (requires authentication).
   * Updates security information and price data.
   * @param symbol - Security symbol to sync
   * @returns Promise resolving to sync response with status information
   */
  async sync(symbol: string): Promise<SyncResponse> {
    return this.client.post<SyncResponse>(this.buildEndpoint(`${symbol}/sync`));
  }

  /**
   * Get security price data (requires authentication).
   * Supports various time intervals and date ranges.
   *
   * @param symbol - Security symbol
   * @param start - Start date (ISO format, optional)
   * @param end - End date (ISO format, optional)
   * @param interval - Price interval ('1d', '1wk', '1mo', etc.)
   * @returns Promise resolving to prices response with historical data
   */
  async getPrices(
    symbol: string,
    start?: string,
    end?: string,
    interval: string = '1d'
  ): Promise<SecurityPricesResponse> {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    params.append('interval', interval);

    return this.client.get<SecurityPricesResponse>(
      this.buildEndpoint(`${symbol}/prices?${params.toString()}`)
    );
  }
}

/**
 * Global securities service instance.
 * Use this singleton for all security-related API calls.
 */
export const securitiesService = new SecuritiesService();

// Export individual methods for backward compatibility with existing code
// This allows gradual migration from function-based to class-based service usage
// Bind methods to avoid unbound method warnings
export const searchSecurities = securitiesService.search.bind(securitiesService);
export const getSecurity = securitiesService.getBySymbol.bind(securitiesService);
export const syncSecurity = securitiesService.sync.bind(securitiesService);
export const getSecurityPrices = securitiesService.getPrices.bind(securitiesService);
