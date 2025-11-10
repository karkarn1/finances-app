# Form Hooks Usage Guide

This directory contains reusable React hooks for managing dialogs and form submissions across the application.

## useDialog

Manages dialog state, form data, and edit mode tracking.

### Purpose

Eliminates duplicate code for managing dialog open/close state, form data, and distinguishing between create vs. edit modes. This hook handles the common pattern of opening a dialog to create a new item or edit an existing one.

### API

```typescript
const {
  open,        // boolean - Dialog open state
  data,        // T - Current form data
  isEditing,   // boolean - Whether editing existing item
  openDialog,  // (editData?: T) => void - Open dialog
  closeDialog, // () => void - Close and reset dialog
  setData,     // (data: T) => void - Update form data
} = useDialog<FormDataType>(initialData);
```

### Usage Example

```typescript
import { useDialog } from '@/hooks';
import type { AccountCreate } from '@/types';

const MyComponent = () => {
  const initialData: AccountCreate = {
    name: '',
    account_type: 'checking',
    is_investment_account: false,
  };

  const {
    open: dialogOpen,
    data: formData,
    isEditing,
    openDialog,
    closeDialog,
    setData: setFormData,
  } = useDialog<AccountCreate>(initialData);

  // Open for creating new item
  const handleAdd = () => {
    openDialog();
  };

  // Open for editing existing item
  const handleEdit = (account: AccountDetailed) => {
    openDialog({
      name: account.name,
      account_type: account.account_type,
      // ... other fields
    });
  };

  return (
    <Dialog open={dialogOpen} onClose={closeDialog}>
      <DialogTitle>{isEditing ? 'Edit Account' : 'Add Account'}</DialogTitle>
      <DialogContent>
        <TextField
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={handleSubmit}>
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Key Features

- **Automatic reset**: Calling `closeDialog()` automatically resets to initial data
- **Edit mode detection**: `isEditing` is `true` when `openDialog` receives data
- **Type-safe**: Fully typed with TypeScript generics

---

## useFormSubmit

Handles form submission with loading and error states.

### Purpose

Eliminates duplicate code for managing async form submissions, including loading states, error handling, and success callbacks. Provides a consistent pattern for form submission across the application.

### API

```typescript
const {
  handleSubmit, // (data: T) => Promise<void> - Submit handler
  isSubmitting, // boolean - Loading state
  error,        // string | null - Error message
  clearError,   // () => void - Clear error state
} = useFormSubmit<FormDataType>(
  onSubmit,   // async (data: T) => Promise<void>
  onSuccess?  // () => void - Optional success callback
);
```

### Usage Example

```typescript
import { useFormSubmit } from '@/hooks';
import { useAppDispatch } from '@/hooks';
import { createAccount, updateAccount } from '@/store/slices/accountsSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { handleSubmit, isSubmitting, error } = useFormSubmit(
    async (data: AccountCreate) => {
      if (editingId) {
        await dispatch(updateAccount({ id: editingId, data })).unwrap();
      } else {
        await dispatch(createAccount(data)).unwrap();
      }
    },
    () => {
      closeDialog();
      void dispatch(fetchAccounts());
    }
  );

  const onSubmit = () => {
    if (!validateForm()) return;
    void handleSubmit(formData);
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </>
  );
};
```

### Key Features

- **Automatic loading state**: `isSubmitting` tracks async operation
- **Error handling**: Catches errors and formats messages
- **Success callback**: Optional callback runs only on successful submission
- **Error recovery**: Provides `clearError()` to manually dismiss errors

---

## Complete Example: Accounts Page

See `/src/pages/Accounts/index.tsx` for a complete real-world example combining both hooks.

### Before Refactoring (Original Pattern)

```typescript
// ~100+ lines of state management
const [dialogOpen, setDialogOpen] = useState(false);
const [editingAccount, setEditingAccount] = useState<Account | null>(null);
const [formData, setFormData] = useState<AccountFormData>({ ... });
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleOpenDialog = (account?: Account) => {
  if (account) {
    setEditingAccount(account);
    setFormData({ ... });
  } else {
    setEditingAccount(null);
    setFormData({ ... });
  }
  setDialogOpen(true);
};

const handleCloseDialog = () => {
  setDialogOpen(false);
  setEditingAccount(null);
  setFormData({ ... });
  setError(null);
};

const handleSubmit = async () => {
  setIsSubmitting(true);
  setError(null);
  try {
    if (editingAccount) {
      await api.update(editingAccount.id, formData);
    } else {
      await api.create(formData);
    }
    handleCloseDialog();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

### After Refactoring (Using Hooks)

```typescript
// ~20 lines of state management
const initialData = { name: '', type: 'checking' };

const {
  open: dialogOpen,
  data: formData,
  isEditing,
  openDialog,
  closeDialog,
  setData: setFormData,
} = useDialog<AccountFormData>(initialData);

const [editingId, setEditingId] = useState<string | null>(null);

const { handleSubmit, isSubmitting, error } = useFormSubmit(
  async (data: AccountFormData) => {
    if (isEditing && editingId) {
      await dispatch(updateAccount({ id: editingId, data })).unwrap();
    } else {
      await dispatch(createAccount(data)).unwrap();
    }
  },
  () => {
    closeDialog();
    void dispatch(fetchAccounts());
  }
);

const handleOpenDialog = (account?: Account) => {
  if (account) {
    setEditingId(account.id);
    openDialog({ name: account.name, type: account.type });
  } else {
    setEditingId(null);
    openDialog();
  }
};
```

### Benefits

- **80% less boilerplate** for dialog and form state management
- **Consistent patterns** across all form components
- **Type-safe** with full TypeScript support
- **Easier maintenance** - fix bugs in one place
- **Better testing** - hooks can be tested independently

---

## Applying to Other Components

These hooks can be applied to any component with similar patterns:

### Candidates for Refactoring

1. **Currencies Page** (`/src/pages/Currencies/index.tsx`)
   - Has add/edit dialog with form submission
   - ~150 lines can be reduced to ~30 lines

2. **Securities Page** (`/src/pages/Securities/index.tsx`)
   - Has search and detail dialogs
   - Can use `useDialog` for dialog state management

3. **Financial Institutions** (`/src/pages/FinancialInstitutions/index.tsx`)
   - Has add/edit/delete dialogs
   - Perfect candidate for both hooks

4. **Account Detail** (`/src/pages/AccountDetail/index.tsx`)
   - Has multiple dialogs (holdings, transactions)
   - Can use `useDialog` for each dialog type

### Refactoring Steps

1. Identify dialog state management code
2. Replace with `useDialog` hook
3. Identify form submission code
4. Replace with `useFormSubmit` hook
5. Test with Playwright browser tools
6. Verify TypeScript and ESLint pass

---

## Testing

Both hooks are used in production code and tested via:

- **TypeScript**: Strict type checking ensures correct usage
- **ESLint**: Enforces React hooks rules
- **Playwright**: Browser tests verify real-world behavior

### Example Test Flow

```typescript
// Using Playwright MCP tools
browser_navigate(url="http://localhost:5173/accounts")
browser_click(element="Add Account button")
browser_fill_form(fields=[{ name: "Account Name", value: "Test" }])
browser_click(element="Submit button")
browser_snapshot() // Verify success
browser_console_messages(onlyErrors=true) // Check for errors
```

---

## Best Practices

1. **Always provide initial data** to `useDialog` matching your form structure
2. **Use descriptive aliases** when destructuring (e.g., `open: dialogOpen`)
3. **Handle validation separately** - hooks don't enforce validation
4. **Track IDs separately** when editing items that need IDs for updates
5. **Use `void`** with async handlers in event handlers to satisfy ESLint

### Common Pitfall: Editing Without ID

```typescript
// ❌ Wrong - loses track of which item to update
const { data, isEditing } = useDialog(initialData);
// No way to know the ID when submitting

// ✅ Correct - track ID separately
const { data, isEditing } = useDialog(initialData);
const [editingId, setEditingId] = useState<string | null>(null);

const handleEdit = (item: Item) => {
  setEditingId(item.id);  // Store ID
  openDialog(item);        // Store form data
};

const { handleSubmit } = useFormSubmit(async (data) => {
  if (isEditing && editingId) {  // Use stored ID
    await api.update(editingId, data);
  }
});
```

---

## Future Enhancements

Potential improvements to these hooks:

1. **Validation integration**: Add optional validation function to `useFormSubmit`
2. **Optimistic updates**: Add option for optimistic UI updates
3. **Undo/redo**: Track form history for undo functionality
4. **Auto-save**: Add debounced auto-save capability
5. **Multi-step forms**: Extend for wizard-style forms

---

**Last Updated**: November 10, 2025
**Status**: Production-ready
**Test Coverage**: Validated via Playwright browser tests
