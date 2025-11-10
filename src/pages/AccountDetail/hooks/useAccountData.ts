/**
 * useAccountData Hook
 * Fetches and manages account, account values, and holdings data
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchAccountById,
  fetchAccountValues,
  selectSelectedAccount,
  selectAccountValues,
  selectAccountsLoading,
  selectAccountsError,
  clearError,
  setSelectedAccount,
  clearAccountValues,
} from '@/store/slices/accountsSlice';
import {
  fetchHoldings,
  selectAllHoldings,
  selectHoldingsLoading,
  selectHoldingsError,
  clearHoldings,
} from '@/store/slices/holdingsSlice';

export const useAccountData = (accountId: string | undefined) => {
  const dispatch = useAppDispatch();

  const account = useAppSelector(selectSelectedAccount);
  const accountValues = useAppSelector(selectAccountValues);
  const loading = useAppSelector(selectAccountsLoading);
  const error = useAppSelector(selectAccountsError);
  const holdings = useAppSelector(selectAllHoldings);
  const holdingsLoading = useAppSelector(selectHoldingsLoading);
  const holdingsError = useAppSelector(selectHoldingsError);

  // Fetch account and values on mount
  useEffect(() => {
    if (accountId) {
      void dispatch(fetchAccountById(accountId));
      void dispatch(fetchAccountValues(accountId));
    }
    return () => {
      dispatch(setSelectedAccount(null));
      dispatch(clearAccountValues());
      dispatch(clearHoldings());
    };
  }, [accountId, dispatch]);

  // Fetch holdings if investment account
  useEffect(() => {
    if (account?.is_investment_account && accountId) {
      void dispatch(fetchHoldings(accountId));
    }
  }, [account?.is_investment_account, accountId, dispatch]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, dispatch]);

  return {
    account,
    accountValues,
    loading,
    error,
    holdings,
    holdingsLoading,
    holdingsError,
  };
};
