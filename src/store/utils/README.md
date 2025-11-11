# Redux Utilities Guide

## Async State Helpers

Reusable utilities for managing loading and error states in Redux slices.

### Basic Usage

For slices with a single loading state:

```typescript
import { createAsyncReducers, initialAsyncState } from '@/store/utils/asyncHelpers';

interface MyState extends AsyncState {
  data: MyData[];
}

const asyncHelpers = createAsyncReducers<MyState>('mySlice');

const initialState: MyState = {
  ...initialAsyncState,
  data: [],
};

// In extraReducers:
builder
  .addCase(fetchData.pending, asyncHelpers.pending)
  .addCase(fetchData.fulfilled, (state, action) => {
    asyncHelpers.fulfilled(state);
    state.data = action.payload;
  })
  .addCase(fetchData.rejected, asyncHelpers.rejected);
```

### Multiple Loading States

For slices with independent async operations:

```typescript
import { createAsyncReducersWithKey, MultiLoadingAsyncState } from '@/store/utils/asyncHelpers';

interface MyState extends MultiLoadingAsyncState {
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}

const loadingHelpers = createAsyncReducersWithKey<MyState>('isLoading');
const searchHelpers = createAsyncReducersWithKey<MyState>('isSearching');

const initialState: MyState = {
  ...initialAsyncState,
  isSearching: false,
  data: [],
};

// In extraReducers:
builder
  .addCase(searchData.pending, searchHelpers.pending)
  .addCase(searchData.fulfilled, (state, action) => {
    searchHelpers.fulfilled(state);
    state.results = action.payload;
  })
  .addCase(searchData.rejected, searchHelpers.rejected)

  .addCase(fetchData.pending, loadingHelpers.pending)
  .addCase(fetchData.fulfilled, (state, action) => {
    loadingHelpers.fulfilled(state);
    state.data = action.payload;
  })
  .addCase(fetchData.rejected, loadingHelpers.rejected);
```

## Benefits

- ✅ Eliminates 20-30 lines of boilerplate per slice
- ✅ Consistent error handling across all slices
- ✅ Type-safe with TypeScript generics
- ✅ Centralized logging and debugging
- ✅ Easy to extend with additional functionality

## Migration Examples

### Before (Manual State Management)

```typescript
// ~90 lines for 3 async operations
.addCase(fetchData.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(fetchData.fulfilled, (state, action) => {
  state.isLoading = false;
  state.data = action.payload;
})
.addCase(fetchData.rejected, (state, action) => {
  state.isLoading = false;
  state.error = formatErrorMessage(action.error);
})
// ... repeat for createData, updateData, deleteData
```

### After (Using Helpers)

```typescript
// ~30 lines for 3 async operations
const asyncHelpers = createAsyncReducers<MyState>('mySlice');

.addCase(fetchData.pending, asyncHelpers.pending)
.addCase(fetchData.fulfilled, (state, action) => {
  asyncHelpers.fulfilled(state);
  state.data = action.payload;
})
.addCase(fetchData.rejected, asyncHelpers.rejected)
// ... same pattern for createData, updateData, deleteData
```

## Real-World Examples

See these files for complete implementations:

1. **authSlice.ts** - Single loading state for auth operations
2. **accountsSlice.ts** - Single loading state for CRUD operations
3. **securitiesSlice.ts** - Multiple loading states (search, fetch, sync, prices)

## API Reference

### `createAsyncReducers<T>(sliceName?: string)`

Creates standard async reducers for slices with single loading state.

**Parameters:**
- `sliceName` (optional): Name used for error logging

**Returns:** Object with `pending`, `fulfilled`, and `rejected` reducers

### `createAsyncReducersWithKey<T>(loadingKey: string)`

Creates async reducers for a specific loading flag.

**Parameters:**
- `loadingKey`: Name of the loading state property (e.g., 'isSearching')

**Returns:** Object with `pending`, `fulfilled`, and `rejected` reducers

### `initialAsyncState`

Default async state object:
```typescript
{
  isLoading: false,
  error: null,
}
```

### `resetAsyncState<T>(state: T)`

Resets async state to initial values. Useful for cleanup.

## Error Handling

All helpers automatically:
- Use `formatErrorMessage` for consistent error formatting
- Log errors to console (when `sliceName` provided)
- Clear loading states on error
- Preserve existing state data

## TypeScript Support

All helpers are fully type-safe with generic constraints:
- `AsyncState` - Base interface for single loading state
- `MultiLoadingAsyncState` - Extended interface for multiple loading states
- Type inference from state interface ensures compile-time safety
