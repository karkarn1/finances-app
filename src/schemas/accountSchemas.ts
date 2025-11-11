/**
 * Account validation schemas using Zod
 *
 * Provides validation for account creation, updates, and account values.
 * All schemas are TypeScript-strict mode compliant with exported types.
 */

import { z } from 'zod';

/**
 * Account Types
 * Must match backend AccountType enum
 */
export const accountTypeSchema = z.enum([
  'checking',
  'savings',
  'tfsa',
  'rrsp',
  'fhsa',
  'margin',
  'credit_card',
  'line_of_credit',
  'payment_plan',
  'mortgage',
]);

/**
 * Account Creation Schema
 * Used when creating a new account
 */
export const accountCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim(),

  account_type: accountTypeSchema,

  financial_institution_id: z
    .string()
    .uuid('Invalid financial institution ID')
    .optional(),

  is_investment_account: z
    .boolean()
    .default(false)
    .optional(),

  interest_rate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%')
    .optional(),

  currency_code: z
    .string()
    .length(3, 'Currency code must be exactly 3 characters')
    .toUpperCase()
    .optional(),
});

/**
 * Account Update Schema
 * Used when updating an existing account
 * All fields are optional since user may update only specific fields
 */
export const accountUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name cannot be empty')
    .max(100, 'Account name must be less than 100 characters')
    .trim()
    .optional(),

  account_type: accountTypeSchema.optional(),

  financial_institution_id: z
    .string()
    .uuid('Invalid financial institution ID')
    .nullable()
    .optional(),

  is_investment_account: z
    .boolean()
    .optional(),

  interest_rate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%')
    .nullable()
    .optional(),

  currency_code: z
    .string()
    .length(3, 'Currency code must be exactly 3 characters')
    .toUpperCase()
    .nullable()
    .optional(),
});

/**
 * Account Value Creation Schema
 * Used when creating a new account balance record
 */
export const accountValueCreateSchema = z.object({
  timestamp: z
    .string()
    .datetime({ message: 'Invalid timestamp format' })
    .optional(),

  balance: z
    .number()
    .finite('Balance must be a valid number'),

  cash_balance: z
    .number()
    .finite('Cash balance must be a valid number')
    .optional(),
}).refine(
  (data) => {
    // If cash_balance is provided, it should not exceed total balance for investment accounts
    if (data.cash_balance !== undefined) {
      return data.cash_balance <= data.balance;
    }
    return true;
  },
  {
    message: 'Cash balance cannot exceed total account balance',
    path: ['cash_balance'],
  }
);

/**
 * Account Value Update Schema
 * Used when updating an existing account balance record
 */
export const accountValueUpdateSchema = z.object({
  timestamp: z
    .string()
    .datetime({ message: 'Invalid timestamp format' })
    .optional(),

  balance: z
    .number()
    .finite('Balance must be a valid number')
    .optional(),

  cash_balance: z
    .number()
    .finite('Cash balance must be a valid number')
    .nullable()
    .optional(),
});

/**
 * Financial Institution Schema
 */
export const financialInstitutionCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Institution name is required')
    .max(100, 'Institution name must be less than 100 characters')
    .trim(),

  url: z
    .string()
    .url('Invalid URL format')
    .optional(),
});

// Export TypeScript types inferred from schemas
export type AccountType = z.infer<typeof accountTypeSchema>;
export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type AccountValueCreateInput = z.infer<typeof accountValueCreateSchema>;
export type AccountValueUpdateInput = z.infer<typeof accountValueUpdateSchema>;
export type FinancialInstitutionCreateInput = z.infer<typeof financialInstitutionCreateSchema>;
