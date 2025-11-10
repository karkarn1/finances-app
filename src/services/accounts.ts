/**
 * Accounts API service
 */

import { apiClient } from './api';
import type {
  AccountDetailed,
  AccountCreate,
  AccountUpdate,
  AccountValue,
  AccountValueCreate,
  AccountValueUpdate,
} from '@/types';

/**
 * Fetch all accounts for the current user
 */
export const fetchAllAccounts = async (): Promise<AccountDetailed[]> => {
  return apiClient<AccountDetailed[]>('/accounts');
};

/**
 * Fetch a specific account by ID
 */
export const fetchAccountById = async (id: string): Promise<AccountDetailed> => {
  return apiClient<AccountDetailed>(`/accounts/${id}`);
};

/**
 * Create a new account
 */
export const createAccount = async (data: AccountCreate): Promise<AccountDetailed> => {
  return apiClient<AccountDetailed>('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Update an existing account
 */
export const updateAccount = async (
  id: string,
  data: AccountUpdate
): Promise<AccountDetailed> => {
  return apiClient<AccountDetailed>(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete an account
 */
export const deleteAccount = async (id: string): Promise<void> => {
  return apiClient<void>(`/accounts/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Fetch account values (historical balances) for an account
 */
export const fetchAccountValues = async (accountId: string): Promise<AccountValue[]> => {
  return apiClient<AccountValue[]>(`/accounts/${accountId}/values`);
};

/**
 * Create a new account value entry
 */
export const createAccountValue = async (
  accountId: string,
  data: AccountValueCreate
): Promise<AccountValue> => {
  return apiClient<AccountValue>(`/accounts/${accountId}/values`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Update an existing account value entry
 */
export const updateAccountValue = async (
  accountId: string,
  valueId: string,
  data: AccountValueUpdate
): Promise<AccountValue> => {
  return apiClient<AccountValue>(`/accounts/${accountId}/values/${valueId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete an account value entry
 */
export const deleteAccountValue = async (
  accountId: string,
  valueId: string
): Promise<void> => {
  return apiClient<void>(`/accounts/${accountId}/values/${valueId}`, {
    method: 'DELETE',
  });
};
