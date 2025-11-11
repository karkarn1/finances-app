/**
 * Central export for all validation schemas
 *
 * This file re-exports all validation schemas and their TypeScript types
 * for convenient importing throughout the application.
 *
 * Usage:
 * ```typescript
 * import { loginSchema, type LoginInput } from '@/schemas';
 * ```
 */

// Account schemas
export {
  accountTypeSchema,
  accountCreateSchema,
  accountUpdateSchema,
  accountValueCreateSchema,
  accountValueUpdateSchema,
  financialInstitutionCreateSchema,
  type AccountType,
  type AccountCreateInput,
  type AccountUpdateInput,
  type AccountValueCreateInput,
  type AccountValueUpdateInput,
  type FinancialInstitutionCreateInput,
} from './accountSchemas';

// Security schemas
export {
  securitySearchSchema,
  securitySymbolSchema,
  holdingCreateSchema,
  holdingUpdateSchema,
  timeframeSchema,
  priceQuerySchema,
  portfolioAllocationSchema,
  portfolioRebalancingSchema,
  type SecuritySearchInput,
  type SecuritySymbol,
  type HoldingCreateInput,
  type HoldingUpdateInput,
  type Timeframe,
  type PriceQueryInput,
  type PortfolioAllocationInput,
  type PortfolioRebalancingInput,
} from './securitySchemas';

// Auth schemas
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserProfileSchema,
  emailVerificationSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type UpdateUserProfileInput,
  type EmailVerificationInput,
} from './authSchemas';
