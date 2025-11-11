# Error Handling Guide

This guide explains the standardized error handling patterns implemented across the finances-app.

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Usage Examples](#usage-examples)
4. [Migration Guide](#migration-guide)
5. [Best Practices](#best-practices)

## Overview

The application now uses a unified error handling system with the following components:

- **ErrorBoundary**: React component that catches rendering errors
- **useApiCall Hook**: Handles API calls with retry logic and notifications
- **Error Handler Utilities**: Categorize and format errors consistently
- **withErrorHandler HOC**: Wraps components with error boundaries

## Core Components

### 1. ErrorBoundary Component

Location: `src/components/ErrorBoundary/index.tsx`

Catches React component errors and displays user-friendly fallback UI.

**Features:**
- Automatic error logging
- User-friendly error display
- Reset/retry functionality
- Custom fallback components
- Development mode error details

**Basic Usage:**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

**With Custom Fallback:**
```typescript
import ErrorBoundary, { FallbackProps } from '@/components/ErrorBoundary';

const CustomFallback: FC<FallbackProps> = ({ error, reset }) => (
  <Box>
    <Typography>Oops! {error.message}</Typography>
    <Button onClick={reset}>Try Again</Button>
  </Box>
);

function App() {
  return (
    <ErrorBoundary FallbackComponent={CustomFallback}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 2. useApiCall Hook

Location: `src/hooks/useApiCall.ts`

Handles API calls with comprehensive error handling, loading states, and retry logic.

**Features:**
- Automatic loading state management
- Error handling with user-friendly messages
- Success/error toast notifications
- Configurable retry logic (attempts + delay)
- Reset and retry functionality
- Type-safe with TypeScript generics

**Basic Usage:**
```typescript
import { useApiCall } from '@/hooks';

function MyComponent() {
  const { execute, loading, error, data } = useApiCall(
    async (id: string) => await api.getAccount(id),
    {
      showSuccessMessage: 'Account loaded successfully',
      retryCount: 3,
      retryDelay: 2000,
    }
  );

  const handleLoadAccount = async () => {
    await execute('account-123');
  };

  return (
    <Box>
      <Button onClick={handleLoadAccount} disabled={loading}>
        Load Account
      </Button>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}
      {data && <AccountDisplay account={data} />}
    </Box>
  );
}
```

**Advanced Usage with Error Handling:**
```typescript
const { execute, loading, error, retry, reset } = useApiCall(
  async (data: FormData) => await api.submitForm(data),
  {
    showSuccessMessage: 'Form submitted successfully',
    showErrorMessage: true,
    retryCount: 2,
    retryDelay: 1000,
    retryOnlyNetworkErrors: true,
    onSuccess: (result) => {
      console.log('Success:', result);
      navigate('/success');
    },
    onError: (err) => {
      console.error('Error:', err);
      // Custom error handling
    },
  }
);

// Execute API call
await execute(formData);

// Retry last call
await retry();

// Reset state
reset();
```

### 3. Error Handler Utilities

Location: `src/utils/errorHandler.ts`

Enhanced utilities for error categorization and handling.

**New Functions:**

#### `isNetworkError(error: unknown): boolean`

Detects if an error is network-related.

```typescript
import { isNetworkError } from '@/utils/errorHandler';

if (isNetworkError(error)) {
  console.log('Network error detected, showing offline message');
}
```

#### `shouldRetry(error: unknown): boolean`

Determines if an error is retryable (network errors, 5xx, 408, 429, 503, 504).

```typescript
import { shouldRetry } from '@/utils/errorHandler';

if (shouldRetry(error)) {
  console.log('Error is retryable, attempting retry');
}
```

#### `categorizeError(error: unknown): ErrorCategory`

Categorizes errors into predefined types.

```typescript
import { categorizeError, ErrorCategory } from '@/utils/errorHandler';

const category = categorizeError(error);

switch (category) {
  case ErrorCategory.NETWORK:
    // Handle network error
    break;
  case ErrorCategory.AUTHENTICATION:
    // Redirect to login
    break;
  case ErrorCategory.VALIDATION:
    // Show validation errors
    break;
  // etc.
}
```

#### `getErrorMessage(error: unknown): string`

Gets user-friendly error message based on error category.

```typescript
import { getErrorMessage } from '@/utils/errorHandler';

const userMessage = getErrorMessage(error);
// Returns category-specific message like:
// - "Network error. Please check your connection."
// - "You are not authorized to perform this action."
// - "Please check your input and try again."
```

### 4. withErrorHandler HOC

Location: `src/hoc/withErrorHandler.tsx`

Higher-Order Component that wraps components with ErrorBoundary.

**Usage:**
```typescript
import { withErrorHandler } from '@/hoc/withErrorHandler';

const MyComponent: FC = () => {
  // Component that might throw errors
  return <div>My Component</div>;
};

// Wrap with error handling
export default withErrorHandler(MyComponent);

// With custom fallback
export default withErrorHandler(MyComponent, CustomFallback);

// With reset handler
export default withErrorHandler(
  MyComponent,
  undefined,
  () => console.log('Error boundary reset')
);
```

## Usage Examples

### Example 1: Replacing try/catch with useApiCall

**Before:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleDelete = async (id: string) => {
  setLoading(true);
  setError(null);

  try {
    await dispatch(deleteAccount(id)).unwrap();
    errorService.showSuccess('Account deleted successfully');
    navigate('/accounts');
  } catch (err) {
    const message = formatErrorMessage(err);
    setError(message);
    errorService.showError(err, 'Delete account');
    logger.error('Failed to delete account:', err);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const { execute: deleteAccount, loading } = useApiCall(
  async (id: string) => await dispatch(deleteAccount(id)).unwrap(),
  {
    showSuccessMessage: 'Account deleted successfully',
    onSuccess: () => navigate('/accounts'),
  }
);

const handleDelete = async (id: string) => {
  await deleteAccount(id);
};
```

### Example 2: Form Submission with Validation

**Before:**
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await api.submitForm(data);
    errorService.showSuccess('Form submitted');
    closeDialog();
  } catch (err) {
    errorService.showError(err, 'Form submission');
  }
};
```

**After:**
```typescript
const { execute: submitForm, loading, error } = useApiCall(
  async (data: FormData) => await api.submitForm(data),
  {
    showSuccessMessage: 'Form submitted successfully',
    onSuccess: () => closeDialog(),
    retryCount: 0, // No retry for form submissions
  }
);

const handleSubmit = async (data: FormData) => {
  await submitForm(data);
};
```

### Example 3: Data Fetching with Retry

```typescript
const { execute: fetchData, loading, error, retry } = useApiCall(
  async (id: string) => await api.getData(id),
  {
    retryCount: 3,
    retryDelay: 2000,
    retryOnlyNetworkErrors: true,
  }
);

useEffect(() => {
  void fetchData('data-id');
}, []);

// In render
{error && (
  <Box>
    <Alert severity="error">{error.message}</Alert>
    <Button onClick={retry}>Retry</Button>
  </Box>
)}
```

### Example 4: Wrapping Page with ErrorBoundary

```typescript
import { withErrorHandler } from '@/hoc/withErrorHandler';

const DashboardPage: FC = () => {
  // Complex dashboard that might throw errors
  return (
    <Container>
      <Dashboard />
    </Container>
  );
};

export default withErrorHandler(DashboardPage);
```

## Migration Guide

### Step 1: Identify Error Handling Patterns

Look for these patterns in your code:

1. **Manual try/catch blocks:**
```typescript
try {
  await api.call();
} catch (err) {
  errorService.showError(err);
}
```

2. **Manual loading state:**
```typescript
const [loading, setLoading] = useState(false);
setLoading(true);
// ... api call
setLoading(false);
```

3. **Manual error state:**
```typescript
const [error, setError] = useState<string | null>(null);
```

### Step 2: Replace with useApiCall

```typescript
// Old pattern
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  try {
    await api.call();
    errorService.showSuccess('Success');
  } catch (err) {
    setError(formatErrorMessage(err));
    errorService.showError(err);
  } finally {
    setLoading(false);
  }
};

// New pattern
const { execute, loading, error } = useApiCall(
  async () => await api.call(),
  { showSuccessMessage: 'Success' }
);

const handleSubmit = async () => {
  await execute();
};
```

### Step 3: Add ErrorBoundary to Page Components

```typescript
// At the bottom of your component file
export default withErrorHandler(YourComponent);

// Or wrap in App.tsx
<ErrorBoundary>
  <Routes>
    <Route path="/page" element={<YourComponent />} />
  </Routes>
</ErrorBoundary>
```

### Step 4: Update Error Categorization

```typescript
// Old
const message = formatErrorMessage(error);

// New - with category-specific handling
const category = categorizeError(error);
const message = getErrorMessage(error);

if (category === ErrorCategory.AUTHENTICATION) {
  navigate('/login');
} else if (category === ErrorCategory.NETWORK) {
  // Show offline indicator
}
```

## Best Practices

### 1. Always Use useApiCall for API Calls

✅ **DO:**
```typescript
const { execute } = useApiCall(api.call, { showSuccessMessage: 'Done' });
await execute();
```

❌ **DON'T:**
```typescript
try {
  await api.call();
  errorService.showSuccess('Done');
} catch (err) {
  errorService.showError(err);
}
```

### 2. Configure Retry Appropriately

- **Data fetching:** Use retry (3 attempts recommended)
- **Form submissions:** No retry (retryCount: 0)
- **Idempotent operations:** Use retry
- **Non-idempotent operations:** No retry

```typescript
// Data fetching - can retry
const { execute } = useApiCall(fetchData, {
  retryCount: 3,
  retryDelay: 2000,
});

// Form submission - don't retry
const { execute } = useApiCall(submitForm, {
  retryCount: 0,
});
```

### 3. Wrap Critical Pages with ErrorBoundary

```typescript
// High-level pages that aggregate multiple components
export default withErrorHandler(DashboardPage);
export default withErrorHandler(AccountsPage);

// Not necessary for simple components
export default SimpleButton; // No wrapper needed
```

### 4. Use Category-Specific Error Handling

```typescript
const { execute, error } = useApiCall(api.call, {
  onError: (err) => {
    const category = categorizeError(err);

    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        navigate('/login');
        break;
      case ErrorCategory.NETWORK:
        setOfflineMode(true);
        break;
      case ErrorCategory.VALIDATION:
        // Validation errors already shown
        break;
    }
  },
});
```

### 5. Provide User-Friendly Success Messages

```typescript
// ✅ Specific and informative
const { execute } = useApiCall(deleteAccount, {
  showSuccessMessage: 'Account "Checking" deleted successfully',
});

// ❌ Generic and unhelpful
const { execute } = useApiCall(deleteAccount, {
  showSuccessMessage: 'Done',
});
```

### 6. Handle Loading States Appropriately

```typescript
const { execute, loading } = useApiCall(api.call);

// Disable buttons during loading
<Button disabled={loading} onClick={execute}>
  {loading ? 'Loading...' : 'Submit'}
</Button>

// Show loading indicator
{loading && <CircularProgress />}
```

### 7. Prepare for Error Tracking Integration

The system includes TODO comments for future Sentry/LogRocket integration:

```typescript
// In ErrorBoundary
// TODO: Send to error tracking service
// if (process.env.NODE_ENV === 'production') {
//   Sentry.captureException(error, {
//     contexts: { react: { componentStack } },
//   });
// }

// In useApiCall
// TODO: Send to error tracking service
// if (process.env.NODE_ENV === 'production') {
//   Sentry.captureException(error, {
//     contexts: { apiCall: { retryAttempts } },
//   });
// }

// In errorHandler utility
// TODO: Integration with error tracking service
// export const trackError = (error, context) => { ... }
```

When ready to integrate:
1. Install Sentry SDK: `yarn add @sentry/react`
2. Initialize in `main.tsx`
3. Uncomment TODO sections
4. Test error reporting

## Summary

The new error handling system provides:

- ✅ Consistent error handling across the application
- ✅ Automatic retry logic for transient failures
- ✅ User-friendly error messages
- ✅ Reduced boilerplate code
- ✅ Better error categorization
- ✅ Preparation for error tracking integration
- ✅ Type-safe error handling with TypeScript

For questions or issues, refer to the source code or create an issue in the repository.
