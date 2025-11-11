/**
 * Common types for the finances app
 */

// Auth types
export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginCredentials {
  username: string; // can be email or username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

// Transaction types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

// Account types
export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
}

// Budget types
export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

// Financial goal types
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

// Securities types
export interface Security {
  id: string;
  symbol: string;
  name: string;
  exchange: string | null;
  currency: string | null;
  security_type: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  last_synced_at: string | null;
  is_syncing: boolean;
  created_at: string;
  updated_at: string;
  in_database?: boolean; // NEW: Indicates if security exists in database (optional for backward compatibility)
}

export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type DataCompleteness = 'complete' | 'partial' | 'sparse' | 'empty';

export interface SecurityPricesResponse {
  security: Security;
  prices: PriceData[];
  interval_type: string;
  count: number;
  // NEW: Metadata fields for data quality information
  requested_start: string | null;
  requested_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  data_completeness: DataCompleteness;
}

export interface SyncResponse {
  security: Security;
  prices_synced: number;
  message: string;
}

export type Timeframe = '1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL';

// Financial Institution types
export interface FinancialInstitution {
  id: string;
  name: string;
  url?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialInstitutionCreate {
  name: string;
  url?: string;
}

// Enhanced Account types with full backend integration
export type AccountType =
  | 'checking'
  | 'savings'
  | 'tfsa'
  | 'rrsp'
  | 'fhsa'
  | 'margin'
  | 'credit_card'
  | 'line_of_credit'
  | 'payment_plan'
  | 'mortgage';

export interface AccountDetailed {
  id: string;
  user_id: number;
  financial_institution_id?: string;
  name: string;
  account_type: AccountType;
  is_investment_account: boolean;
  interest_rate?: number;
  currency_code?: string;
  created_at: string;
  updated_at: string;
  // Computed fields from backend
  current_balance?: number;
  current_cash_balance?: number;
  financial_institution?: FinancialInstitution;
  currency?: Currency;
}

export interface AccountCreate {
  name: string;
  account_type: AccountType;
  financial_institution_id?: string;
  is_investment_account?: boolean;
  interest_rate?: number;
  currency_code?: string;
}

export interface AccountUpdate {
  name?: string;
  account_type?: AccountType;
  financial_institution_id?: string;
  is_investment_account?: boolean;
  interest_rate?: number;
  currency_code?: string;
}

// Account Value (Balance History) types
export interface AccountValue {
  id: string;
  account_id: string;
  timestamp: string;
  balance: number;
  cash_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface AccountValueCreate {
  timestamp?: string | undefined; // Defaults to now if not provided
  balance: number;
  cash_balance?: number | undefined;
}

export interface AccountValueUpdate {
  timestamp?: string | undefined;
  balance?: number | undefined;
  cash_balance?: number | undefined;
}

// Holdings types
export interface Holding extends Record<string, unknown> {
  id: string;
  account_id: string;
  security_id: string;
  timestamp: string;
  shares: number;
  average_price_per_share: number;
  created_at: string;
  updated_at: string;
  // Populated from backend
  security?: Security;
  market_value?: number;
}

export interface HoldingCreate {
  security_id: string;
  timestamp?: string | undefined; // Defaults to now if not provided
  shares: number;
  average_price_per_share: number;
}

export interface HoldingUpdate {
  security_id?: string | undefined;
  timestamp?: string | undefined;
  shares?: number | undefined;
  average_price_per_share?: number | undefined;
}

// Currency types
export interface Currency extends Record<string, unknown> {
  code: string; // Primary key
  name: string;
  symbol: string;
}

export interface CurrencyRate {
  id: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  rate: number;
  date: string;
}

export interface CurrencyRatesResponse {
  baseCurrency: string;
  date: string;
  rates: Record<string, number>;
  count: number;
}

export interface SyncRatesResponse {
  baseCurrency: string;
  syncedCount: number;
  failedCount: number;
  date: string;
  message: string;
}

export interface CurrencyCreate {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencyUpdate {
  name?: string;
  symbol?: string;
}
