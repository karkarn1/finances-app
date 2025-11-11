/**
 * Security validation schemas using Zod
 *
 * Provides validation for security search, holdings, and portfolio management.
 * All schemas are TypeScript-strict mode compliant with exported types.
 */

import { z } from 'zod';

/**
 * Security Search Schema
 * Used when searching for securities by symbol or name
 */
export const securitySearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(50, 'Search query must be less than 50 characters')
    .trim()
    .transform((val) => val.toUpperCase()), // Transform to uppercase for symbols
});

/**
 * Security Symbol Schema
 * Validates ticker symbol format
 */
export const securitySymbolSchema = z
  .string()
  .min(1, 'Symbol is required')
  .max(10, 'Symbol must be less than 10 characters')
  .regex(/^[A-Z0-9.-]+$/, 'Symbol must contain only uppercase letters, numbers, dots, and hyphens')
  .trim()
  .transform((val) => val.toUpperCase());

/**
 * Holding Creation Schema
 * Used when creating a new holding (position in a security)
 */
export const holdingCreateSchema = z.object({
  security_id: z
    .string()
    .uuid('Invalid security ID'),

  timestamp: z
    .string()
    .datetime({ message: 'Invalid timestamp format' })
    .optional(),

  shares: z
    .number()
    .positive('Number of shares must be positive')
    .finite('Number of shares must be a valid number'),

  average_price_per_share: z
    .number()
    .positive('Price per share must be positive')
    .finite('Price per share must be a valid number'),
});

/**
 * Holding Update Schema
 * Used when updating an existing holding
 */
export const holdingUpdateSchema = z.object({
  security_id: z
    .string()
    .uuid('Invalid security ID')
    .optional(),

  timestamp: z
    .string()
    .datetime({ message: 'Invalid timestamp format' })
    .optional(),

  shares: z
    .number()
    .positive('Number of shares must be positive')
    .finite('Number of shares must be a valid number')
    .optional(),

  average_price_per_share: z
    .number()
    .positive('Price per share must be positive')
    .finite('Price per share must be a valid number')
    .optional(),
});

/**
 * Price Data Timeframe Schema
 * Valid timeframes for historical price queries
 */
export const timeframeSchema = z.enum([
  '1D',
  '1W',
  '1M',
  '6M',
  'YTD',
  '1Y',
  '5Y',
  'ALL',
]);

/**
 * Price Query Schema
 * Used when fetching historical price data
 */
export const priceQuerySchema = z.object({
  symbol: securitySymbolSchema,

  start_date: z
    .string()
    .datetime({ message: 'Invalid start date format' })
    .optional(),

  end_date: z
    .string()
    .datetime({ message: 'Invalid end date format' })
    .optional(),

  interval: z
    .enum(['1d', '1wk', '1mo'])
    .default('1d')
    .optional(),
}).refine(
  (data) => {
    // If both dates provided, start must be before end
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) < new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['start_date'],
  }
);

/**
 * Portfolio Allocation Schema
 * Used for portfolio rebalancing and allocation management
 */
export const portfolioAllocationSchema = z.object({
  security_id: z
    .string()
    .uuid('Invalid security ID'),

  target_percentage: z
    .number()
    .min(0, 'Target allocation cannot be negative')
    .max(100, 'Target allocation cannot exceed 100%'),

  tolerance: z
    .number()
    .min(0, 'Tolerance cannot be negative')
    .max(100, 'Tolerance cannot exceed 100%')
    .default(5)
    .optional(),
});

/**
 * Portfolio Rebalancing Schema
 * Validates that allocations sum to 100%
 */
export const portfolioRebalancingSchema = z.object({
  allocations: z
    .array(portfolioAllocationSchema)
    .min(1, 'At least one allocation is required')
    .refine(
      (allocations) => {
        const total = allocations.reduce((sum, alloc) => sum + alloc.target_percentage, 0);
        return Math.abs(total - 100) < 0.01; // Allow for floating point precision
      },
      {
        message: 'Total allocations must sum to 100%',
      }
    ),
});

// Export TypeScript types inferred from schemas
export type SecuritySearchInput = z.infer<typeof securitySearchSchema>;
export type SecuritySymbol = z.infer<typeof securitySymbolSchema>;
export type HoldingCreateInput = z.infer<typeof holdingCreateSchema>;
export type HoldingUpdateInput = z.infer<typeof holdingUpdateSchema>;
export type Timeframe = z.infer<typeof timeframeSchema>;
export type PriceQueryInput = z.infer<typeof priceQuerySchema>;
export type PortfolioAllocationInput = z.infer<typeof portfolioAllocationSchema>;
export type PortfolioRebalancingInput = z.infer<typeof portfolioRebalancingSchema>;
