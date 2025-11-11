# Error Handling Refactoring Example

This document shows a before/after comparison of refactoring the Accounts page to use the new error handling patterns.

## Before: Manual Error Handling

```typescript
// OLD PATTERN: Manual try/catch with explicit loading and error states

const Accounts: FC = () => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAllAccounts);

  const deleteDialog = useDialog<AccountDetailed | null>(null);

  const handleDelete = () => {
    if (!deleteDialog.data) return;

    void (async () => {
      try {
        await dispatch(deleteAccount(deleteDialog.data.id)).unwrap();
        errorService.showSuccess('Account deleted successfully');
        deleteDialog.closeDialog();
      } catch (err) {
        errorService.showError(err, 'Delete account');
        logger.error('Failed to delete account:', err);
      }
    })();
  };

  return (
    <Container>
      {/* Dialog */}
      <Dialog open={deleteDialog.open} onClose={deleteDialog.closeDialog}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.data?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDialog.closeDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
```

## After: Using useApiCall Hook

```typescript
// NEW PATTERN: Using useApiCall hook with automatic error handling

const Accounts: FC = () => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAllAccounts);

  const deleteDialog = useDialog<AccountDetailed | null>(null);

  // New: useApiCall handles loading, error states, and notifications
  const { execute: executeDelete, loading: deleting } = useApiCall(
    async (id: string) => await dispatch(deleteAccount(id)).unwrap(),
    {
      showSuccessMessage: 'Account deleted successfully',
      onSuccess: () => {
        deleteDialog.closeDialog();
        void dispatch(fetchAccounts()); // Refresh list
      },
      retryCount: 0, // Don't retry delete operations
    }
  );

  const handleDelete = async () => {
    if (!deleteDialog.data) return;
    await executeDelete(deleteDialog.data.id);
  };

  return (
    <Container>
      {/* Dialog */}
      <Dialog open={deleteDialog.open} onClose={deleteDialog.closeDialog}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.data?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDialog.closeDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
```

## Key Improvements

### 1. Reduced Boilerplate

**Before:** 13 lines of error handling code
```typescript
void (async () => {
  try {
    await dispatch(deleteAccount(deleteDialog.data.id)).unwrap();
    errorService.showSuccess('Account deleted successfully');
    deleteDialog.closeDialog();
  } catch (err) {
    errorService.showError(err, 'Delete account');
    logger.error('Failed to delete account:', err);
  }
})();
```

**After:** 3 lines of hook configuration
```typescript
const { execute: executeDelete, loading: deleting } = useApiCall(
  async (id: string) => await dispatch(deleteAccount(id)).unwrap(),
  { showSuccessMessage: 'Account deleted successfully', onSuccess: () => deleteDialog.closeDialog() }
);
```

### 2. Automatic Loading State

**Before:** No loading state shown to user

**After:** Automatic loading state management
```typescript
const { execute, loading } = useApiCall(...);

<Button disabled={loading}>
  {loading ? 'Deleting...' : 'Delete'}
</Button>
```

### 3. Consistent Error Handling

**Before:** Manual error logging and notification
```typescript
catch (err) {
  errorService.showError(err, 'Delete account');
  logger.error('Failed to delete account:', err);
}
```

**After:** Automatic error handling with consistent formatting
```typescript
// useApiCall automatically:
// - Logs errors with logger
// - Shows error notification
// - Formats error messages
// - Categorizes error type
```

### 4. Success Callback Simplification

**Before:** Success logic mixed with error handling
```typescript
try {
  await dispatch(deleteAccount(deleteDialog.data.id)).unwrap();
  errorService.showSuccess('Account deleted successfully');
  deleteDialog.closeDialog();
} catch (err) { ... }
```

**After:** Clean separation of success logic
```typescript
useApiCall(apiCall, {
  showSuccessMessage: 'Account deleted successfully',
  onSuccess: () => deleteDialog.closeDialog(),
});
```

## Another Example: Data Fetching with Retry

### Before

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadSecurityData = async (symbol: string) => {
  setLoading(true);
  setError(null);

  try {
    const result = await dispatch(fetchSecurityDetails(symbol)).unwrap();
    // Success handling
  } catch (err) {
    const message = formatErrorMessage(err);
    setError(message);
    errorService.showError(err, 'Load security data');
    logger.error('Failed to load security:', err);
  } finally {
    setLoading(false);
  }
};
```

### After

```typescript
const { execute: loadSecurityData, loading, error, retry } = useApiCall(
  async (symbol: string) => await dispatch(fetchSecurityDetails(symbol)).unwrap(),
  {
    retryCount: 3,
    retryDelay: 2000,
    retryOnlyNetworkErrors: true,
  }
);

// In render
{error && (
  <Box>
    <Alert severity="error">{error.message}</Alert>
    <Button onClick={retry}>Retry</Button>
  </Box>
)}
```

## Wrapping Pages with ErrorBoundary

### Before

```typescript
// No error boundary - errors crash the app

const Dashboard: FC = () => {
  return <Container>...</Container>;
};

export default Dashboard;
```

### After

```typescript
// ErrorBoundary catches rendering errors

import { withErrorHandler } from '@/hoc/withErrorHandler';

const Dashboard: FC = () => {
  return <Container>...</Container>;
};

export default withErrorHandler(Dashboard);
```

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of code** | ~15 per API call | ~5 per API call |
| **Loading state** | Manual | Automatic |
| **Error logging** | Manual | Automatic |
| **Error notifications** | Manual | Automatic |
| **Retry logic** | Not implemented | Configurable |
| **Error categorization** | Basic | Advanced |
| **Type safety** | Partial | Full |
| **Error tracking prep** | None | TODO comments |
| **Component errors** | App crashes | Graceful fallback |

## Migration Checklist

When refactoring a component:

- [ ] Replace manual `try/catch` with `useApiCall`
- [ ] Remove manual `loading` state variables
- [ ] Remove manual `error` state variables
- [ ] Move success notifications to `showSuccessMessage` option
- [ ] Move success logic to `onSuccess` callback
- [ ] Add `retryCount` based on operation type
- [ ] Wrap page component with `withErrorHandler` HOC
- [ ] Remove manual error logging (handled automatically)
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test retry functionality

## Next Steps

1. **Identify target components** - Find components with manual try/catch blocks
2. **Refactor incrementally** - Update 1-2 components at a time
3. **Test thoroughly** - Verify loading, success, and error states
4. **Update documentation** - Document any component-specific patterns
5. **Remove old patterns** - Clean up after successful migration

See `ERROR_HANDLING_GUIDE.md` for complete documentation.
