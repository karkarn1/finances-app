# API Services Guide

## Architecture Overview

All API services follow a standardized, class-based architecture using:
- **`ApiClient`** - Base HTTP client with error handling, authentication, and interceptors
- **`BaseService`** - Abstract service class providing common patterns for all services
- **Service classes** - Specific API implementations (accounts, securities, auth, etc.)

This architecture provides:
- ✅ Consistent error handling across all API calls
- ✅ Automatic authentication header injection
- ✅ Type-safe request/response handling
- ✅ Centralized API configuration
- ✅ Easy testability and mocking
- ✅ Clear separation of concerns

## Core Components

### ApiClient (`apiClient.ts`)

The base HTTP client that handles all network requests.

**Features:**
- Automatic Bearer token authentication from localStorage
- JSON request/response serialization
- Comprehensive error handling with `ApiClientError`
- RESTful method wrappers: `get()`, `post()`, `put()`, `delete()`
- Special `postForm()` for form-encoded requests (OAuth2)
- URL building with base path handling
- 204 No Content response handling

**Usage:**
```typescript
import { apiClient, ApiClientError } from '@/services/apiClient';

try {
  const data = await apiClient.get<ResponseType>('/endpoint');
  console.log(data);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error('API Error:', error.status, error.detail);
  }
}
```

### BaseService (`BaseService.ts`)

Abstract class providing common patterns for all service implementations.

**Features:**
- Protected `client` property for making API calls
- Protected `baseEndpoint` property for service-specific path
- `buildEndpoint()` helper for path concatenation
- Consistent structure across all services

**Usage:**
```typescript
import { BaseService } from './BaseService';

class MyService extends BaseService {
  constructor() {
    super('my-endpoint'); // Base path for this service
  }

  async customMethod(): Promise<MyType> {
    // Access this.client for API calls
    // Access this.buildEndpoint() for path building
    return this.client.get<MyType>(this.buildEndpoint('custom'));
  }
}
```

## Available Services

### Accounts Service (`accounts.ts`)

Manages user accounts and account values (balance history).

**Methods:**
- `getAll()` - Fetch all accounts
- `getById(id)` - Fetch specific account
- `create(data)` - Create new account
- `update(id, data)` - Update existing account
- `delete(id)` - Delete account
- `getValues(accountId)` - Fetch account balance history
- `createValue(accountId, data)` - Add balance entry
- `updateValue(accountId, valueId, data)` - Update balance entry
- `deleteValue(accountId, valueId)` - Delete balance entry

**Usage:**
```typescript
import { accountsService } from '@/services/accounts';
// OR for backward compatibility:
import { fetchAllAccounts, createAccount } from '@/services/accounts';

// Class-based (recommended)
const accounts = await accountsService.getAll();
const account = await accountsService.getById('123');
const newAccount = await accountsService.create({
  name: 'Savings Account',
  account_type: 'savings',
  is_investment_account: false,
});

// Function-based (backward compatible)
const accounts = await fetchAllAccounts();
const newAccount = await createAccount({ /* data */ });
```

### Securities Service (`securities.ts`)

Manages securities (stocks, ETFs, etc.) and market data.

**Methods:**
- `search(query)` - Search securities by symbol or name
- `getBySymbol(symbol)` - Get security details
- `sync(symbol)` - Sync data from Yahoo Finance
- `getPrices(symbol, start?, end?, interval)` - Get historical prices

**Usage:**
```typescript
import { securitiesService } from '@/services/securities';
// OR for backward compatibility:
import { searchSecurities, getSecurity } from '@/services/securities';

// Class-based (recommended)
const results = await securitiesService.search('AAPL');
const security = await securitiesService.getBySymbol('AAPL');
const sync = await securitiesService.sync('AAPL');
const prices = await securitiesService.getPrices('AAPL', '2024-01-01', '2024-12-31', '1d');

// Function-based (backward compatible)
const results = await searchSecurities('AAPL');
const security = await getSecurity('AAPL');
```

### Auth Service (`auth.ts`)

Handles authentication, registration, and password management.

**Methods:**
- `login(credentials)` - Login user and get JWT tokens
- `register(data)` - Register new user
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Complete password reset
- `getCurrentUser()` - Get authenticated user profile

**Usage:**
```typescript
import { authService } from '@/services/auth';
// OR for backward compatibility:
import { login, register, getCurrentUser } from '@/services/auth';

// Class-based (recommended)
const tokens = await authService.login({
  username: 'user@example.com',
  password: 'password123',
});
const user = await authService.getCurrentUser();

// Function-based (backward compatible)
const tokens = await login({ username: 'user', password: 'pass' });
const user = await getCurrentUser();
```

## Error Handling

All API calls can throw `ApiClientError` with detailed error information.

### Error Structure

```typescript
class ApiClientError extends Error {
  status?: number;        // HTTP status code (404, 500, etc.)
  detail?: string | any;  // Detailed error from API response
}
```

### Handling Errors

```typescript
import { ApiClientError } from '@/services/apiClient';

try {
  const account = await accountsService.getById('invalid-id');
} catch (error) {
  if (error instanceof ApiClientError) {
    // API error with status and detail
    console.error(`API Error ${error.status}:`, error.detail);

    if (error.status === 404) {
      console.log('Account not found');
    } else if (error.status === 401) {
      console.log('Authentication required');
    }
  } else {
    // Network or other error
    console.error('Unexpected error:', error);
  }
}
```

### Redux Integration

When using services in Redux actions:

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { accountsService } from '@/services/accounts';
import { ApiClientError } from '@/services/apiClient';

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await accountsService.getAll();
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          detail: error.detail,
        });
      }
      return rejectWithValue({ message: 'Unknown error occurred' });
    }
  }
);
```

## Creating New Services

Follow this pattern when creating new API services:

### Step 1: Extend BaseService

```typescript
import { BaseService } from './BaseService';
import type { MyType, MyCreateType, MyUpdateType } from '@/types';

class MyService extends BaseService {
  constructor() {
    super('my-endpoint'); // Base API path
  }

  // Implement service methods
  async getAll(): Promise<MyType[]> {
    return this.client.get<MyType[]>(this.baseEndpoint);
  }

  async getById(id: string): Promise<MyType> {
    return this.client.get<MyType>(this.buildEndpoint(id));
  }

  async create(data: MyCreateType): Promise<MyType> {
    return this.client.post<MyType, MyCreateType>(this.baseEndpoint, data);
  }

  async update(id: string, data: MyUpdateType): Promise<MyType> {
    return this.client.put<MyType, MyUpdateType>(
      this.buildEndpoint(id),
      data
    );
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(this.buildEndpoint(id));
  }
}
```

### Step 2: Export Singleton and Compatibility Methods

```typescript
// Export singleton instance
export const myService = new MyService();

// Export individual methods for backward compatibility
export const {
  getAll: fetchAll,
  getById: fetchById,
  create: createItem,
  update: updateItem,
  delete: deleteItem,
} = myService;
```

### Step 3: Document in This README

Add documentation for your new service following the pattern above.

## Best Practices

### 1. Always Use Type Parameters

```typescript
// ✅ Good - Type-safe
const accounts = await accountsService.getAll(); // accounts is AccountDetailed[]

// ❌ Bad - No type safety
const accounts = await accountsService.getAll() as any;
```

### 2. Handle Errors at Component Level

```typescript
// ✅ Good - Handle errors close to usage
const MyComponent = () => {
  const fetchData = async () => {
    try {
      const data = await accountsService.getAll();
      setData(data);
    } catch (error) {
      if (error instanceof ApiClientError) {
        showError(error.message);
      }
    }
  };
};

// ❌ Bad - Unhandled promise rejection
const MyComponent = () => {
  const fetchData = async () => {
    const data = await accountsService.getAll(); // Could throw!
    setData(data);
  };
};
```

### 3. Use Service Instance, Not Direct Client

```typescript
// ✅ Good - Use service method
const accounts = await accountsService.getAll();

// ❌ Bad - Bypass service layer
const accounts = await apiClient.get('/accounts');
```

### 4. Build URLs with Service Methods

```typescript
// ✅ Good - Use service's path building
class MyService extends BaseService {
  async getItems(userId: string) {
    return this.client.get(this.buildEndpoint(`users/${userId}/items`));
  }
}

// ❌ Bad - Manual path concatenation
class MyService extends BaseService {
  async getItems(userId: string) {
    return this.client.get(`/my-endpoint/users/${userId}/items`);
  }
}
```

### 5. Maintain Backward Compatibility

When refactoring existing services, always export both:
- Service instance (for new code)
- Individual functions (for existing code)

```typescript
export const myService = new MyService();

// Backward compatibility
export const {
  getAll: legacyGetAll,
  create: legacyCreate,
} = myService;
```

## Testing Services

### Unit Testing

```typescript
import { AccountsService } from '@/services/accounts';
import { ApiClient } from '@/services/apiClient';

describe('AccountsService', () => {
  let service: AccountsService;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new AccountsService();
    (service as any).client = mockClient;
  });

  it('should fetch all accounts', async () => {
    const mockAccounts = [{ id: '1', name: 'Test' }];
    mockClient.get.mockResolvedValue(mockAccounts);

    const result = await service.getAll();

    expect(mockClient.get).toHaveBeenCalledWith('accounts');
    expect(result).toEqual(mockAccounts);
  });
});
```

### Integration Testing with Playwright

```typescript
// In e2e tests, services work with real API
import { test, expect } from '@playwright/test';

test('accounts service integration', async ({ page }) => {
  await page.goto('http://localhost:3000/accounts');

  // Verify API calls in network tab
  const response = await page.waitForResponse(
    response => response.url().includes('/api/v1/accounts')
  );

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
});
```

## Migration Guide

### Migrating from Old Pattern

**Before:**
```typescript
// Old api.ts pattern
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  return response.json();
};

// Old service
export const getAccounts = async (): Promise<Account[]> => {
  return apiClient<Account[]>('/accounts');
};
```

**After:**
```typescript
// New ApiClient class
export class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    // ... implementation with error handling
  }
}

// New service class
class AccountsService extends BaseService {
  constructor() {
    super('accounts');
  }

  async getAll(): Promise<Account[]> {
    return this.client.get<Account[]>(this.baseEndpoint);
  }
}

export const accountsService = new AccountsService();
export const { getAll: getAccounts } = accountsService; // Backward compat
```

**Benefits:**
- Better organization and testability
- Consistent error handling
- Easier to extend with new methods
- Type-safe throughout
- Backward compatible with existing code

## Configuration

### Base URL

Configure API base URL via environment variable:

```env
# .env or .env.local
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Default: `http://localhost:8000/api/v1`

### Authentication

JWT token is automatically read from `localStorage.auth_token` and included in all requests.

To set token after login:

```typescript
const tokens = await authService.login(credentials);
localStorage.setItem('auth_token', tokens.access_token);
```

To clear token on logout:

```typescript
localStorage.removeItem('auth_token');
```

## Troubleshooting

### Issue: "API request failed: 401 Unauthorized"

**Cause:** Missing or expired JWT token

**Solution:**
```typescript
// Check if token exists
const token = localStorage.getItem('auth_token');
if (!token) {
  // Redirect to login or refresh token
}
```

### Issue: "Network error occurred"

**Cause:** Backend server not running or network issue

**Solution:**
- Verify backend is running at configured base URL
- Check CORS configuration on backend
- Verify network connectivity

### Issue: TypeScript errors with service methods

**Cause:** Outdated types or missing type parameters

**Solution:**
```typescript
// Ensure types are imported and used correctly
import type { AccountDetailed } from '@/types';

// Use type parameters explicitly if needed
const account = await accountsService.getById<AccountDetailed>('123');
```

## Future Enhancements

Planned improvements to the service layer:

1. **Request/Response Interceptors**
   - Logging middleware
   - Request timing metrics
   - Response transformation

2. **Caching Layer**
   - In-memory caching for frequently accessed data
   - Cache invalidation strategies
   - TTL configuration

3. **Retry Logic**
   - Automatic retry for failed requests
   - Exponential backoff
   - Configurable retry policies

4. **Request Cancellation**
   - AbortController integration
   - Automatic cleanup on component unmount

5. **Loading State Management**
   - Built-in loading indicators
   - Progress tracking for uploads

---

**Last Updated:** November 10, 2025
**Architecture Version:** 1.0
**Maintainer:** Finance Manager Team
