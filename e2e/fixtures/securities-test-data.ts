/**
 * Test data and constants for securities E2E tests
 */

export const testSecurities = {
  aapl: {
    symbol: 'AAPL',
    nameContains: 'Apple',
    exchange: 'NMS',
    currency: 'USD',
  },
  msft: {
    symbol: 'MSFT',
    nameContains: 'Microsoft',
    exchange: 'NMS',
    currency: 'USD',
  },
  googl: {
    symbol: 'GOOGL',
    nameContains: 'Alphabet',
    exchange: 'NMS',
    currency: 'USD',
  },
  amzn: {
    symbol: 'AMZN',
    nameContains: 'Amazon',
    exchange: 'NMS',
    currency: 'USD',
  },
  tsla: {
    symbol: 'TSLA',
    nameContains: 'Tesla',
    exchange: 'NMS',
    currency: 'USD',
  },
  spy: {
    symbol: 'SPY',
    nameContains: 'SPDR S&P 500',
    exchange: 'PCX',
    currency: 'USD',
  },
  qqq: {
    symbol: 'QQQ',
    nameContains: 'Invesco QQQ',
    exchange: 'NMS',
    currency: 'USD',
  },
  vti: {
    symbol: 'VTI',
    nameContains: 'Vanguard Total',
    exchange: 'PCX',
    currency: 'USD',
  },
};

/**
 * The 8 popular securities that should appear on the securities list page
 */
export const popularSecurities = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
  'SPY',
  'QQQ',
  'VTI',
];

/**
 * All 8 timeframe options available in the securities detail page
 */
export const allTimeframes = ['1D', '1W', '1M', '6M', 'YTD', '1Y', '5Y', 'ALL'];

/**
 * Expected statistics that should be displayed for a security
 */
export const expectedStatistics = [
  'Exchange',
  'Market Cap',
  'Currency',
  'Type',
  // Note: Sector and Industry may not always be available
];

/**
 * Search test cases
 */
export const searchTestCases = {
  validSymbol: 'AAPL',
  validName: 'Apple',
  invalidSymbol: 'XXXYYYZZZ',
  partialMatch: 'Micro', // Should match Microsoft
};
