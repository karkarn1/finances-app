# Debounce Hooks Guide

## useDebounce

Debounces a value, delaying updates until the value stops changing.

### When to Use

- Search inputs (wait for user to stop typing)
- Filter inputs
- Any input that triggers expensive operations

### Usage

```typescript
import { useDebounce } from '@/hooks';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // Only runs 300ms after user stops typing
  fetchResults(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### API

- **value**: The value to debounce
- **delay**: Delay in milliseconds (default: 500ms)
- **Returns**: Debounced value

## useDebouncedCallback

Returns a debounced version of a callback function.

### When to Use

- Event handlers (onChange, onScroll, onResize)
- Functions that should be called less frequently
- API calls triggered by user actions

### Usage

```typescript
import { useDebouncedCallback } from '@/hooks';

const handleSearch = useDebouncedCallback((query: string) => {
  fetchResults(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

### API

- **callback**: Function to debounce
- **delay**: Delay in milliseconds (default: 500ms)
- **Returns**: Debounced callback function

## Choosing Between Hooks

**Use `useDebounce`** when:
- You need to debounce a state value
- You want to trigger effects based on the debounced value

**Use `useDebouncedCallback`** when:
- You need to debounce a function/handler
- You want to prevent excessive function calls

## Performance Tips

1. **Delay selection**:
   - Fast inputs (autocomplete): 200-300ms
   - Standard search: 300-500ms
   - Expensive operations: 500-1000ms

2. **Memory**: Both hooks clean up timers on unmount

3. **Dependencies**: useDebouncedCallback uses useCallback for stable reference

## Examples

### Example 1: Security Search (AccountDetail)

**Before (15 lines with manual debouncing):**
```typescript
const [securitySearchQuery, setSecuritySearchQuery] = useState('');

useEffect(() => {
  if (securitySearchQuery.trim().length >= 1) {
    const timer = setTimeout(() => {
      void dispatch(searchSecuritiesAsync(securitySearchQuery.trim()));
    }, 300);
    return () => clearTimeout(timer);
  }
  return undefined;
}, [securitySearchQuery, dispatch]);
```

**After (6 lines with useDebounce hook):**
```typescript
const [securitySearchQuery, setSecuritySearchQuery] = useState('');
const debouncedSecuritySearchQuery = useDebounce(securitySearchQuery, 300);

useEffect(() => {
  if (debouncedSecuritySearchQuery.trim().length >= 1) {
    void dispatch(searchSecuritiesAsync(debouncedSecuritySearchQuery.trim()));
  }
}, [debouncedSecuritySearchQuery, dispatch]);
```

**Benefits:**
- Reduced boilerplate by 60% (15 lines → 6 lines)
- Guaranteed cleanup on unmount (no memory leaks)
- Type-safe with TypeScript generics
- Reusable across components

### Example 2: Form Input Validation

```typescript
const [email, setEmail] = useState('');
const debouncedEmail = useDebounce(email, 500);

useEffect(() => {
  if (debouncedEmail) {
    validateEmail(debouncedEmail);
  }
}, [debouncedEmail]);

return (
  <TextField
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
);
```

### Example 3: Window Resize Handler

```typescript
const handleResize = useDebouncedCallback(() => {
  console.log('Window resized:', window.innerWidth, window.innerHeight);
}, 250);

useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

## TypeScript Support

Both hooks are fully typed with TypeScript generics:

```typescript
// useDebounce infers type from value
const searchTerm: string = 'test';
const debouncedSearch = useDebounce(searchTerm, 300); // Type: string

const count: number = 42;
const debouncedCount = useDebounce(count, 500); // Type: number

// useDebouncedCallback infers function signature
const handleSearch = useDebouncedCallback((query: string, limit: number) => {
  fetchResults(query, limit);
}, 300);

// TypeScript knows the parameter types
handleSearch('test', 10); // ✅ Valid
handleSearch('test'); // ❌ Error: missing 'limit' parameter
```

## Testing

When testing components that use debounce hooks, remember to account for the delay:

```typescript
// Example Playwright test
test('debounced search works', async ({ page }) => {
  await page.goto('http://localhost:3000/account-detail/1');

  // Type slowly to trigger debounce
  await page.fill('[data-testid="security-search"]', 'AAPL');

  // Wait for debounce delay (300ms) plus some buffer
  await page.waitForTimeout(500);

  // Verify results appear
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
});
```
