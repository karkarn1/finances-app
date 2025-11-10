/**
 * Holdings API service
 */

import { apiClient } from './api';
import type { Holding, HoldingCreate, HoldingUpdate } from '@/types';

/**
 * Fetch all holdings for a specific account
 */
export const fetchAllHoldings = async (accountId: string): Promise<Holding[]> => {
  return apiClient<Holding[]>(`/accounts/${accountId}/holdings`);
};

/**
 * Fetch a specific holding by ID
 */
export const fetchHoldingById = async (
  accountId: string,
  holdingId: string
): Promise<Holding> => {
  return apiClient<Holding>(`/accounts/${accountId}/holdings/${holdingId}`);
};

/**
 * Create a new holding
 */
export const createHolding = async (
  accountId: string,
  data: HoldingCreate
): Promise<Holding> => {
  return apiClient<Holding>(`/accounts/${accountId}/holdings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Update an existing holding
 */
export const updateHolding = async (
  accountId: string,
  holdingId: string,
  data: HoldingUpdate
): Promise<Holding> => {
  return apiClient<Holding>(`/accounts/${accountId}/holdings/${holdingId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete a holding
 */
export const deleteHolding = async (
  accountId: string,
  holdingId: string
): Promise<void> => {
  return apiClient<void>(`/accounts/${accountId}/holdings/${holdingId}`, {
    method: 'DELETE',
  });
};
