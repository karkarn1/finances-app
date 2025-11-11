/**
 * Memoized selectors for accounts
 * Performance optimization: Prevents unnecessary re-renders from expensive computations
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { AccountDetailed } from '@/types';

// Simple selectors (already exported from slice, re-export for consistency)
export const selectAllAccounts = (state: RootState) => state.accounts.accounts;
export const selectAccountsLoading = (state: RootState) => state.accounts.isLoading;
export const selectAccountsError = (state: RootState) => state.accounts.error;

/**
 * Memoized selector: Sort accounts alphabetically by name
 * Prevents re-sorting on every render unless accounts array changes
 */
export const selectSortedAccounts = createSelector(
  [selectAllAccounts],
  (accounts): AccountDetailed[] => {
    return [...accounts].sort((a, b) => a.name.localeCompare(b.name));
  }
);

/**
 * Memoized selector: Filter accounts by type
 * Returns factory function for parameterized selection
 */
export const selectAccountsByType = createSelector(
  [selectAllAccounts, (_state: RootState, accountType: string) => accountType],
  (accounts, accountType): AccountDetailed[] => {
    return accounts.filter((account: AccountDetailed) => account.account_type === accountType);
  }
);

/**
 * Memoized selector: Calculate total balance across all asset accounts
 * Expensive computation cached until accounts change
 */
export const selectTotalAssetBalance = createSelector(
  [selectAllAccounts],
  (accounts): number => {
    return accounts
      .filter((account: AccountDetailed) => {
        // Asset account types
        const assetTypes = ['checking', 'savings', 'brokerage', 'retirement'];
        return assetTypes.includes(account.account_type);
      })
      .reduce((total: number, account: AccountDetailed) => total + (account.current_balance || 0), 0);
  }
);

/**
 * Memoized selector: Calculate total liabilities
 */
export const selectTotalLiabilities = createSelector(
  [selectAllAccounts],
  (accounts): number => {
    return accounts
      .filter((account: AccountDetailed) => {
        // Liability account types
        const liabilityTypes = ['credit_card', 'loan', 'mortgage'];
        return liabilityTypes.includes(account.account_type);
      })
      .reduce((total: number, account: AccountDetailed) => total + (account.current_balance || 0), 0);
  }
);

/**
 * Memoized selector: Calculate net worth (assets - liabilities)
 */
export const selectNetWorth = createSelector(
  [selectTotalAssetBalance, selectTotalLiabilities],
  (assets, liabilities): number => {
    return assets - liabilities;
  }
);

/**
 * Memoized selector: Group accounts by financial institution
 */
export const selectAccountsByInstitution = createSelector(
  [selectAllAccounts],
  (accounts): Record<string, AccountDetailed[]> => {
    return accounts.reduce((grouped: Record<string, AccountDetailed[]>, account: AccountDetailed) => {
      const institutionName = account.financial_institution?.name || 'No Institution';
      if (!grouped[institutionName]) {
        grouped[institutionName] = [];
      }
      grouped[institutionName].push(account);
      return grouped;
    }, {} as Record<string, AccountDetailed[]>);
  }
);

/**
 * Memoized selector: Filter investment accounts
 */
export const selectInvestmentAccounts = createSelector(
  [selectAllAccounts],
  (accounts): AccountDetailed[] => {
    return accounts.filter((account: AccountDetailed) => account.is_investment_account);
  }
);

/**
 * Memoized selector: Calculate account count by type
 */
export const selectAccountCountsByType = createSelector(
  [selectAllAccounts],
  (accounts): Record<string, number> => {
    return accounts.reduce((counts: Record<string, number>, account: AccountDetailed) => {
      const type = account.account_type;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
);
