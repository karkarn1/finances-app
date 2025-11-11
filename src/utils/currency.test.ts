import type { Currency } from '@/types';
import {
  formatCurrency,
  convertCurrency,
  getCurrencySymbol,
  sortCurrencies,
} from './currency';

describe('currency utilities', () => {
  const mockCurrencies: Currency[] = [
    {
      id: '1',
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  describe('formatCurrency', () => {
    it('should format currency with correct symbol', () => {
      expect(formatCurrency(1234.56, 'USD', mockCurrencies)).toBe('$1,234.56');
      expect(formatCurrency(1000.5, 'EUR', mockCurrencies)).toBe('€1,000.50');
      expect(formatCurrency(999.99, 'GBP', mockCurrencies)).toBe('£999.99');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD', mockCurrencies)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1234.56, 'USD', mockCurrencies)).toBe('$-1,234.56');
      expect(formatCurrency(-500, 'EUR', mockCurrencies)).toBe('€-500.00');
    });

    it('should add thousands separators', () => {
      expect(formatCurrency(1000000, 'USD', mockCurrencies)).toBe('$1,000,000.00');
      expect(formatCurrency(1234567.89, 'EUR', mockCurrencies)).toBe('€1,234,567.89');
    });

    it('should always show 2 decimal places', () => {
      expect(formatCurrency(100, 'USD', mockCurrencies)).toBe('$100.00');
      expect(formatCurrency(100.1, 'USD', mockCurrencies)).toBe('$100.10');
      expect(formatCurrency(100.99, 'USD', mockCurrencies)).toBe('$100.99');
    });

    it('should use currency code if currency not found', () => {
      expect(formatCurrency(100, 'JPY', mockCurrencies)).toBe('JPY100.00');
      expect(formatCurrency(50.25, 'CHF', mockCurrencies)).toBe('CHF50.25');
    });

    it('should handle very large amounts', () => {
      expect(formatCurrency(1000000000, 'USD', mockCurrencies)).toBe('$1,000,000,000.00');
    });

    it('should handle very small amounts', () => {
      expect(formatCurrency(0.01, 'USD', mockCurrencies)).toBe('$0.01');
      expect(formatCurrency(0.99, 'EUR', mockCurrencies)).toBe('€0.99');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(1.234, 'USD', mockCurrencies)).toBe('$1.23');
      expect(formatCurrency(1.235, 'USD', mockCurrencies)).toBe('$1.24'); // Rounds up
      expect(formatCurrency(1.999, 'USD', mockCurrencies)).toBe('$2.00');
    });
  });

  describe('convertCurrency', () => {
    const mockRates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
    };

    it('should convert between different currencies', () => {
      expect(convertCurrency(100, 'USD', 'EUR', mockRates)).toBe(92);
      expect(convertCurrency(100, 'USD', 'GBP', mockRates)).toBe(79);
      expect(convertCurrency(100, 'USD', 'CAD', mockRates)).toBe(136);
    });

    it('should return same amount for same currency', () => {
      expect(convertCurrency(100, 'USD', 'USD', mockRates)).toBe(100);
      expect(convertCurrency(50.5, 'EUR', 'EUR', mockRates)).toBe(50.5);
    });

    it('should return null if target rate not found', () => {
      expect(convertCurrency(100, 'USD', 'JPY', mockRates)).toBeNull();
      expect(convertCurrency(100, 'USD', 'CHF', mockRates)).toBeNull();
    });

    it('should handle zero amount', () => {
      expect(convertCurrency(0, 'USD', 'EUR', mockRates)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(convertCurrency(-100, 'USD', 'EUR', mockRates)).toBe(-92);
    });

    it('should handle decimal amounts', () => {
      expect(convertCurrency(100.5, 'USD', 'EUR', mockRates)).toBeCloseTo(92.46, 2);
    });

    it('should return null for undefined rate', () => {
      const ratesWithUndefined = { ...mockRates, XXX: undefined as unknown as number };
      expect(convertCurrency(100, 'USD', 'XXX', ratesWithUndefined)).toBeNull();
    });

    it('should handle conversion with fractional rates', () => {
      const fractionalRates = { USD: 1.0, EUR: 0.923456 };
      expect(convertCurrency(100, 'USD', 'EUR', fractionalRates)).toBe(92.3456);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct currency symbol', () => {
      expect(getCurrencySymbol('USD', mockCurrencies)).toBe('$');
      expect(getCurrencySymbol('EUR', mockCurrencies)).toBe('€');
      expect(getCurrencySymbol('GBP', mockCurrencies)).toBe('£');
      expect(getCurrencySymbol('CAD', mockCurrencies)).toBe('C$');
    });

    it('should return currency code if not found', () => {
      expect(getCurrencySymbol('JPY', mockCurrencies)).toBe('JPY');
      expect(getCurrencySymbol('CHF', mockCurrencies)).toBe('CHF');
      expect(getCurrencySymbol('AUD', mockCurrencies)).toBe('AUD');
    });

    it('should be case-sensitive', () => {
      expect(getCurrencySymbol('usd', mockCurrencies)).toBe('usd');
      expect(getCurrencySymbol('Usd', mockCurrencies)).toBe('Usd');
    });

    it('should handle empty currency array', () => {
      expect(getCurrencySymbol('USD', [])).toBe('USD');
    });
  });

  describe('sortCurrencies', () => {
    it('should sort currencies alphabetically by code', () => {
      const unsorted: Currency[] = [
        { ...mockCurrencies[2] }, // GBP
        { ...mockCurrencies[0] }, // USD
        { ...mockCurrencies[3] }, // CAD
        { ...mockCurrencies[1] }, // EUR
      ];

      const sorted = sortCurrencies(unsorted);

      expect(sorted[0].code).toBe('CAD');
      expect(sorted[1].code).toBe('EUR');
      expect(sorted[2].code).toBe('GBP');
      expect(sorted[3].code).toBe('USD');
    });

    it('should not mutate original array', () => {
      const original = [...mockCurrencies];
      const sorted = sortCurrencies(original);

      expect(sorted).not.toBe(original);
      expect(original[0].code).toBe('USD'); // Original unchanged
    });

    it('should handle empty array', () => {
      expect(sortCurrencies([])).toEqual([]);
    });

    it('should handle single item array', () => {
      const single = [mockCurrencies[0]];
      expect(sortCurrencies(single)).toEqual(single);
    });

    it('should handle already sorted array', () => {
      const alreadySorted = [
        { ...mockCurrencies[3] }, // CAD
        { ...mockCurrencies[1] }, // EUR
        { ...mockCurrencies[2] }, // GBP
        { ...mockCurrencies[0] }, // USD
      ];

      const sorted = sortCurrencies(alreadySorted);

      expect(sorted[0].code).toBe('CAD');
      expect(sorted[1].code).toBe('EUR');
      expect(sorted[2].code).toBe('GBP');
      expect(sorted[3].code).toBe('USD');
    });

    it('should sort case-sensitively', () => {
      const mixedCase: Currency[] = [
        { ...mockCurrencies[0], code: 'usd' },
        { ...mockCurrencies[1], code: 'EUR' },
        { ...mockCurrencies[2], code: 'Gbp' },
      ];

      const sorted = sortCurrencies(mixedCase);

      expect(sorted[0].code).toBe('EUR');
      expect(sorted[1].code).toBe('Gbp');
      expect(sorted[2].code).toBe('usd');
    });
  });
});
