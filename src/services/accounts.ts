/**
 * Accounts API service
 *
 * Provides methods for managing user accounts and account values (balance history).
 * Uses the standardized BaseService pattern for consistent API interactions.
 */

import { BaseService } from './BaseService';
import type {
  AccountDetailed,
  AccountCreate,
  AccountUpdate,
  AccountValue,
  AccountValueCreate,
  AccountValueUpdate,
} from '@/types';

/**
 * Service class for account-related API operations.
 * Handles both account management and account value (balance history) operations.
 */
class AccountsService extends BaseService {
  constructor() {
    super('accounts');
  }

  /**
   * Fetch all accounts for the current user.
   * @returns Promise resolving to array of detailed account objects
   */
  async getAll(): Promise<AccountDetailed[]> {
    return this.client.get<AccountDetailed[]>(this.baseEndpoint);
  }

  /**
   * Fetch a specific account by ID.
   * @param id - Account ID
   * @returns Promise resolving to detailed account object
   */
  async getById(id: string): Promise<AccountDetailed> {
    return this.client.get<AccountDetailed>(this.buildEndpoint(id));
  }

  /**
   * Create a new account.
   * @param data - Account creation data
   * @returns Promise resolving to created account object
   */
  async create(data: AccountCreate): Promise<AccountDetailed> {
    return this.client.post<AccountDetailed, AccountCreate>(this.baseEndpoint, data);
  }

  /**
   * Update an existing account.
   * @param id - Account ID
   * @param data - Partial account update data
   * @returns Promise resolving to updated account object
   */
  async update(id: string, data: AccountUpdate): Promise<AccountDetailed> {
    return this.client.put<AccountDetailed, AccountUpdate>(this.buildEndpoint(id), data);
  }

  /**
   * Delete an account.
   * @param id - Account ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(this.buildEndpoint(id));
  }

  // Account Values (Balance History) methods

  /**
   * Fetch all account values (historical balances) for an account.
   * @param accountId - Account ID
   * @returns Promise resolving to array of account value objects
   */
  async getValues(accountId: string): Promise<AccountValue[]> {
    return this.client.get<AccountValue[]>(this.buildEndpoint(`${accountId}/values`));
  }

  /**
   * Create a new account value entry.
   * @param accountId - Account ID
   * @param data - Account value creation data
   * @returns Promise resolving to created account value object
   */
  async createValue(accountId: string, data: AccountValueCreate): Promise<AccountValue> {
    return this.client.post<AccountValue, AccountValueCreate>(
      this.buildEndpoint(`${accountId}/values`),
      data
    );
  }

  /**
   * Update an existing account value entry.
   * @param accountId - Account ID
   * @param valueId - Account value ID
   * @param data - Partial account value update data
   * @returns Promise resolving to updated account value object
   */
  async updateValue(
    accountId: string,
    valueId: string,
    data: AccountValueUpdate
  ): Promise<AccountValue> {
    return this.client.put<AccountValue, AccountValueUpdate>(
      this.buildEndpoint(`${accountId}/values/${valueId}`),
      data
    );
  }

  /**
   * Delete an account value entry.
   * @param accountId - Account ID
   * @param valueId - Account value ID
   * @returns Promise resolving when deletion is complete
   */
  async deleteValue(accountId: string, valueId: string): Promise<void> {
    return this.client.delete<void>(this.buildEndpoint(`${accountId}/values/${valueId}`));
  }
}

/**
 * Global accounts service instance.
 * Use this singleton for all account-related API calls.
 */
export const accountsService = new AccountsService();

// Export individual methods for backward compatibility with existing code
// This allows gradual migration from function-based to class-based service usage
// Bind methods to avoid unbound method warnings
export const fetchAllAccounts = accountsService.getAll.bind(accountsService);
export const fetchAccountById = accountsService.getById.bind(accountsService);
export const createAccount = accountsService.create.bind(accountsService);
export const updateAccount = accountsService.update.bind(accountsService);
export const deleteAccount = accountsService.delete.bind(accountsService);
export const fetchAccountValues = accountsService.getValues.bind(accountsService);
export const createAccountValue = accountsService.createValue.bind(accountsService);
export const updateAccountValue = accountsService.updateValue.bind(accountsService);
export const deleteAccountValue = accountsService.deleteValue.bind(accountsService);
