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
}

export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SecurityPricesResponse {
  security: Security;
  prices: PriceData[];
  interval_type: string;
  count: number;
}

export interface SyncResponse {
  security: Security;
  prices_synced: number;
  message: string;
}

export type Timeframe = '1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL';
