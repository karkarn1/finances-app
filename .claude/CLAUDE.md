# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated:** November 11, 2025

## Project Overview

Finance Manager is a full-featured personal finance management web application built with React 18+, TypeScript, Material-UI, and Redux Toolkit. It provides users with tools to track their net worth, manage accounts, monitor investment portfolios, plan expenses and income, and work toward financial goals.

**Current Status**: Production-ready with comprehensive API integration for authentication, securities, accounts, holdings, currencies, and financial institutions.

## Development Commands

### Essential Commands

```bash
# Development
yarn dev                  # Start dev server at localhost:5173 (auto-opens browser)
yarn build                # Production build with TypeScript check (outputs to dist/)
yarn preview              # Preview production build

# Code Quality
yarn lint                 # Run ESLint (max 0 warnings enforced)
yarn lint:fix             # Auto-fix ESLint issues
yarn type-check           # TypeScript type checking without emit

# Unit Testing
yarn test                 # Run Jest tests
yarn test:watch           # Jest in watch mode
yarn test:coverage        # Coverage report

# E2E Testing
yarn test:e2e             # Run all Playwright tests
yarn test:e2e:ui          # Interactive test UI mode
yarn test:e2e:headed      # Run with visible browser
yarn test:e2e:debug       # Debug mode with breakpoints
yarn test:e2e:report      # View HTML test report
```

### Running Specific Tests

```bash
# Run specific E2E test file
yarn test:e2e e2e/dashboard.spec.ts

# Run tests matching pattern
yarn test:e2e --grep "should login"

# Run on specific browser
yarn test:e2e --project=chromium
yarn test:e2e --project=firefox
yarn test:e2e --project=webkit

# Run unit tests matching pattern
yarn test --testNamePattern="formatCurrency"
```

## Application Architecture

### High-Level Structure

The application follows a **feature-based architecture** with clear separation of concerns:

1. **State Management (Redux Toolkit + RTK Query)**
   - Centralized store in `src/store/`
   - 6 Redux slices: auth, securities, accounts, holdings, currencies, financialInstitutions
   - 5 RTK Query APIs for data fetching: accountsApi, securitiesApi, currenciesApi, institutionsApi, holdingsApi
   - Custom hooks `useAppDispatch` and `useAppSelector` for type-safe access
   - Normalized state shape with ID-based lookups

2. **Routing Strategy**
   - Client-side routing with React Router DOM v6
   - Lazy-loaded route components for code splitting
   - Protected routes requiring authentication
   - Layout wrapper providing consistent header/sidebar navigation

3. **Component Hierarchy**
   ```
   App (Router Provider)
   └── Layout (Header + Sidebar + Content)
       └── Page Components (Dashboard, Accounts, Securities, etc.)
           └── Feature Components (Charts, Cards, Forms, Tables)
               └── Base Components (Buttons, Inputs, Dialogs)
   ```

4. **Data Flow**
   - RTK Query for API calls → Automatic cache management → Component re-render
   - Redux slices for UI state → Actions → Reducers → Component re-render
   - Form submissions → Zod validation → RTK Query mutation → Optimistic updates

5. **Code Splitting Strategy** (configured in `vite.config.ts`)
   - **react-vendor**: `react`, `react-dom`, `react-router-dom`
   - **mui-core**: `@mui/material` (core components)
   - **mui-icons**: `@mui/icons-material`
   - **redux**: `@reduxjs/toolkit`, `react-redux`
   - **forms**: `react-hook-form`, `zod`
   - **charts**: `recharts`
   - **notifications**: `notistack`
   - Per-route chunks: Dashboard, Accounts, Securities, etc. (lazy loaded)
   - Sourcemaps enabled in production builds for debugging

### Path Aliases

Clean imports using TypeScript path aliases:

```typescript
import { useAppDispatch } from '@/hooks';
import Dashboard from '@pages/Dashboard';
import { formatCurrency } from '@utils';
import type { Account } from '@types';
import Header from '@components/Header';
```

Available aliases configured in both `tsconfig.json` and `vite.config.ts`:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@store/` → `src/store/`
- `@types/` → `src/types/`

## Testing Architecture

### E2E Tests (Playwright)

**Configuration:** `playwright.config.ts`
- 6 browser projects: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, iPad
- Dev server configured at localhost:5173 (webServer config)
- Screenshots on failure, videos on first retry
- Trace on first retry for debugging
- Parallel execution across browsers
- HTML, list, and JSON reporters

**Test Structure:** `e2e/`
```
e2e/
├── fixtures/
│   └── test-user.ts         # Test credentials and expected data
├── helpers/
│   └── navigation.ts        # NavigationHelper class
├── auth-flows.spec.ts       # Complete authentication workflows (42 tests)
├── securities.spec.ts       # Securities tracking (29 tests)
├── navigation.spec.ts       # Navigation & sidebar (9 tests)
├── dashboard.spec.ts        # Dashboard functionality (6 tests)
├── accounts.spec.ts         # Account management (6 tests)
├── holdings.spec.ts         # Portfolio holdings (6 tests)
├── expenses.spec.ts         # Expense tracking (5 tests)
└── goals.spec.ts            # Financial goals (7 tests)
```

**Total: 110 E2E tests across 8 test suites**

**NavigationHelper Pattern:**
All tests use a centralized navigation helper to reduce duplication:
```typescript
const nav = new NavigationHelper(page);
await nav.login(testUser.email, testUser.password);
await nav.navigateToDashboard();
```

**Test Data:**
- Test user: `testuser` / `test@example.com` / `testpasswd`
- Expected values defined in `fixtures/test-user.ts`
- Consistent data across all test suites

### Unit Tests (Jest + React Testing Library)

**Current Status**: 14 unit tests (infrastructure configured, more needed)

**Test Coverage**:
- Component rendering tests
- Utility function tests (currency formatting, calculations)
- Custom hook tests
- Jest environment: `jsdom` for DOM testing
- Coverage reports available via `yarn test:coverage`

**Future Tests Needed**:
- Redux slice tests (actions, reducers, selectors)
- More component interaction tests
- Form validation tests
- Error handling tests

## Current Application State

**Live at:** http://localhost:5173/

**Test User:**
- Username: testuser
- Email: test@example.com
- Password: testpasswd

## Technology Stack

### Core
- **React** 18.3.1 - Hooks, concurrent features
- **TypeScript** 5.5.4 - Strict mode enabled
- **Vite** 5.4.3 - Dev server and build tool

### UI & Styling
- **Material-UI (MUI)** 5.16.7 - Component library
- **Emotion** - CSS-in-JS (required by MUI)
- **Responsive Grid** - Mobile-first layout

### State & Routing
- **Redux Toolkit** 2.2.7 - State management
- **RTK Query** - Data fetching and caching
- **React Redux** 9.1.2 - React bindings
- **React Router DOM** 6.26.0 - Client-side routing

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Charts & Visualization
- **Recharts** 3.3.0 - Data visualization

### Notifications
- **notistack** 3.0.2 - Toast notifications

### Testing
- **Playwright** 1.47.0 - E2E testing (6 browser configs)
- **Jest** 29.7.0 - Unit testing
- **React Testing Library** 16.0.1 - Component testing
- **@testing-library/user-event** 14.5.2 - User interactions

## Architecture Details

### State Management

**Dual Approach: Redux Slices + RTK Query**

**Redux Slices** (`src/store/slices/`) - UI state and client-side data:
1. **authSlice**: User authentication state, tokens
2. **securitiesSlice**: Selected security, UI filters (deprecated - use RTK Query)
3. **accountsSlice**: UI state (deprecated - use RTK Query)
4. **holdingsSlice**: UI state (deprecated - use RTK Query)
5. **currenciesSlice**: UI state (deprecated - use RTK Query)
6. **financialInstitutionsSlice**: UI state (deprecated - use RTK Query)

**RTK Query APIs** (`src/store/api/`) - Server data fetching with auto-caching:
1. **accountsApi**: Full CRUD for accounts + balance history
2. **securitiesApi**: Search, details, sync, historical prices
3. **currenciesApi**: CRUD, exchange rate syncing
4. **institutionsApi**: Full CRUD for financial institutions
5. **holdingsApi**: Full CRUD for holdings per account

**Migration Status**:
- ✅ Authentication fully integrated (Redux slice + API calls)
- ✅ Securities fully migrated to RTK Query
- ✅ Accounts fully migrated to RTK Query
- ✅ Holdings fully migrated to RTK Query
- ✅ Currencies fully migrated to RTK Query
- ✅ Financial Institutions fully migrated to RTK Query
- 🚧 Dashboard metrics need backend endpoints (currently mock data)

### Custom Hooks (`src/hooks/`)

**6 custom hooks for common patterns:**

1. **useDebounce** - Debounce values (search inputs)
2. **useDebouncedCallback** - Debounce function calls
3. **useDialog** - Dialog state management (open/close)
4. **useFormSubmit** - Form submission with error handling
5. **useApiCall** - Generic API call wrapper with loading/error states
6. **useZodForm** - React Hook Form + Zod validation integration

**Example Usage**:
```typescript
// useZodForm for validated forms
const { register, handleSubmit, formState } = useZodForm(schema);

// useDialog for modal management
const { open, handleOpen, handleClose } = useDialog();

// useDebounce for search inputs
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

### Components (`src/components/`)

**20 reusable components:**

**Layout Components**:
- `Layout` - Main layout wrapper with header and sidebar
- `Header` - Top navigation bar with user menu
- `Sidebar` - Left navigation menu

**Data Display**:
- `DataTable` - Reusable table with sorting, pagination
- `MetricCard` - Dashboard metric cards
- `PriceChart` - Price history visualization
- `PerformanceChart` - Portfolio performance over time
- `AllocationChart` - Asset allocation pie chart

**Forms & Inputs**:
- `SearchBar` - Autocomplete search component
- `DateRangePicker` - Date range selection
- `CurrencyInput` - Currency-formatted input

**Feedback**:
- `LoadingSpinner` - Loading indicator
- `ErrorAlert` - Error message display
- `SuccessMessage` - Success toast

**Dialogs**:
- `ConfirmDialog` - Confirmation dialog
- `FormDialog` - Form in dialog modal

### Pages (`src/pages/`)

**14 page components:**

**Authentication (4 pages)**:
- `Login` - Login form with JWT authentication
- `Register` - User registration
- `ForgotPassword` - Password reset request
- `ResetPassword` - Password reset with token

**Dashboard (1 page)**:
- `Dashboard` - Portfolio overview (⚠️ uses mock data for metrics)

**Securities (2 pages)**:
- `Securities` - Search and list securities (✅ real API)
- `SecurityDetail` - Security details and price history (✅ real API)

**Accounts (2 pages)**:
- `Accounts` - Account listing (✅ real API)
- `AccountDetail` - Account details and balance history (✅ real API)

**Holdings (1 page)**:
- `Holdings` - Portfolio holdings (✅ real API)

**Currencies (2 pages)**:
- `Currencies` - Currency listing (✅ real API)
- `CurrencyDetail` - Currency details and exchange rates (✅ real API)

**Financial Institutions (1 page)**:
- `FinancialInstitutions` - Institution management (✅ real API)

**Other (1 page)**:
- `NotFound` - 404 error page

## API Integration Status

### ✅ Fully Integrated (Real API)

**Authentication** - RTK Query + Redux slice:
- POST `/api/v1/auth/register` - User registration
- POST `/api/v1/auth/login` - JWT authentication
- POST `/api/v1/auth/forgot-password` - Password reset request
- POST `/api/v1/auth/reset-password` - Password reset with token
- GET `/api/v1/auth/me` - Get current user
- PATCH `/api/v1/users/me` - Update user profile

**Securities** - RTK Query (securitiesApi):
- GET `/api/v1/securities/search?q={query}` - Search securities
- GET `/api/v1/securities/{symbol}` - Get security details
- POST `/api/v1/securities/{symbol}/sync` - Sync from Yahoo Finance
- GET `/api/v1/securities/{symbol}/prices` - Historical prices with intervals

**Accounts** - RTK Query (accountsApi):
- GET `/api/v1/accounts` - List user's accounts
- POST `/api/v1/accounts` - Create account
- GET `/api/v1/accounts/{id}` - Get account details
- PATCH `/api/v1/accounts/{id}` - Update account
- DELETE `/api/v1/accounts/{id}` - Delete account
- GET `/api/v1/accounts/{id}/values` - Balance history

**Holdings** - RTK Query (holdingsApi):
- GET `/api/v1/holdings` - List holdings (by user or account)
- POST `/api/v1/holdings` - Create holding
- GET `/api/v1/holdings/{id}` - Get holding details
- PATCH `/api/v1/holdings/{id}` - Update holding
- DELETE `/api/v1/holdings/{id}` - Delete holding

**Currencies** - RTK Query (currenciesApi):
- GET `/api/v1/currencies` - List currencies
- POST `/api/v1/currencies` - Create currency
- GET `/api/v1/currencies/{code}` - Get currency details
- POST `/api/v1/currencies/{code}/rates` - Sync exchange rates

**Financial Institutions** - RTK Query (institutionsApi):
- GET `/api/v1/financial-institutions` - List institutions
- POST `/api/v1/financial-institutions` - Create institution
- GET `/api/v1/financial-institutions/{id}` - Get institution
- PATCH `/api/v1/financial-institutions/{id}` - Update institution
- DELETE `/api/v1/financial-institutions/{id}` - Delete institution

### ❌ Not Yet Integrated (Needs Backend Endpoints)

**Dashboard Metrics**:
- GET `/api/v1/dashboard/metrics` - Dashboard summary (needs implementation)
  - Currently using mock data in Dashboard component

**Transactions** (Planned):
- GET `/api/v1/transactions` - List transactions
- POST `/api/v1/transactions` - Create transaction
- Full CRUD operations

**Budget Tracking** (Planned):
- GET `/api/v1/budgets` - List budgets
- Budget vs. actual tracking

**Goals** (Planned):
- GET `/api/v1/goals` - List financial goals
- Goal progress tracking

## Data Models

### Key TypeScript Interfaces

**User:**
```typescript
interface User {
  id: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Account:**
```typescript
interface Account {
  id: string;
  userId: string;
  institutionId?: string;
  name: string;
  accountType: AccountType;
  currencyCode: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  TFSA = 'TFSA',
  RRSP = 'RRSP',
  FHSA = 'FHSA',
  MARGIN = 'MARGIN',
  CREDIT_CARD = 'CREDIT_CARD',
  LINE_OF_CREDIT = 'LINE_OF_CREDIT',
  PAYMENT_PLAN = 'PAYMENT_PLAN',
  MORTGAGE = 'MORTGAGE',
}
```

**Holding:**
```typescript
interface Holding {
  id: string;
  accountId: string;
  securityId: string;
  quantity: number;
  averageCost: number;
  createdAt: string;
  updatedAt: string;
  security?: Security; // Populated by backend
}
```

**Security:**
```typescript
interface Security {
  id: string;
  symbol: string;
  name: string;
  assetClass?: string;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Currency:**
```typescript
interface Currency {
  code: string; // PRIMARY KEY (e.g., "USD", "CAD")
  name: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}
```

**FinancialInstitution:**
```typescript
interface FinancialInstitution {
  id: string;
  userId: string;
  name: string;
  institutionType?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Development Guidelines

### Code Quality

**TypeScript Strict Mode** (`tsconfig.json`):
- All strict mode flags enabled including:
  - `noUnusedLocals`, `noUnusedParameters`
  - `noFallthroughCasesInSwitch`, `noImplicitReturns`
  - `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
  - `noPropertyAccessFromIndexSignature`
- Zero tolerance for type errors - build will fail
- Functional components with hooks only

**ESLint Configuration**:
- TypeScript ESLint plugin with strict rules
- React hooks plugin for rules of hooks
- React refresh plugin for HMR
- Max warnings set to 0 - all warnings must be fixed

### Component Structure
```typescript
// Preferred pattern
import { FC } from 'react';

interface ComponentProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
}

export const Component: FC<ComponentProps> = ({ title, value, onChange }) => {
  // Hooks at the top
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectData);

  // Event handlers
  const handleChange = (newValue: number) => {
    onChange(newValue);
  };

  // Render
  return (
    // JSX
  );
};
```

### State Management Best Practices

**When to use Redux Slices:**
- Client-side UI state (selected tab, filters, dialog open/close)
- Global app state (authentication, theme)

**When to use RTK Query:**
- Server data fetching (accounts, holdings, securities)
- CRUD operations with automatic caching
- Optimistic updates

**Example RTK Query Usage:**
```typescript
// In component
const { data: accounts, isLoading, error } = useGetAccountsQuery();
const [createAccount] = useCreateAccountMutation();

const handleCreate = async (accountData) => {
  try {
    await createAccount(accountData).unwrap();
    // Success notification
  } catch (err) {
    // Error handling
  }
};
```

### Testing Best Practices

**E2E Tests:**
- Use NavigationHelper for common navigation
- Define expected data in fixtures
- Test user workflows, not implementation
- Use meaningful test descriptions
- Keep tests isolated and independent

**Unit Tests:**
- Test utilities and helpers thoroughly
- Mock external dependencies
- Test edge cases and error states
- Aim for >80% coverage on business logic

## Known Issues & Priorities

### High Priority
1. **Dashboard Metrics API Integration** - Backend endpoints needed
2. **Rebalancing Calculations** - NaN values in deviation calculations (src/pages/Rebalancing/)
3. **More Unit Tests** - Infrastructure ready, need more test coverage

### Medium Priority
- Transaction history view
- Account transaction details
- Data export (CSV, PDF)
- Budget vs. actual tracking
- Recurring transaction editing

### Low Priority
- Dark mode refinements
- Financial institution data import
- Tutorial/onboarding flow
- Advanced portfolio analytics

## Performance Optimizations

### Build Configuration (`vite.config.ts`)
- **Code splitting**: 7 manual chunks (react, mui-core, mui-icons, redux, forms, charts, notifications)
- **Sourcemaps**: Enabled in production for debugging
- **Output directory**: `dist/`
- **Dev server**: Port 5173, auto-opens browser, non-strict port

### Runtime Optimizations
- Lazy loading for route components (React.lazy)
- Memoized expensive calculations (implement as needed)
- Debounced search inputs (useDebounce hook)
- RTK Query automatic caching and deduplication

### Monitoring
- Bundle size: Check output after `yarn build`
- Initial load time and Time to Interactive (TTI)
- Core Web Vitals metrics

## Accessibility

WCAG 2.1 AA compliant:
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios met
- Focus indicators visible

## Recent Changes

### November 11, 2025
- **Currency model refactor**: Currency `code` is now primary key (was UUID `id`)
- Updated all currency references to use `code` instead of `id`
- Updated TypeScript types to match backend schema

### November 10, 2025
- Account Detail page refactored with custom hooks
- Added useZodForm, useDialog, useApiCall, useFormSubmit hooks
- Improved form validation with Zod schemas
- Enhanced error handling throughout

### Previous Updates
- Full RTK Query migration for accounts, holdings, currencies, institutions
- Comprehensive E2E test coverage (110 tests)
- Securities tracking fully integrated
- Authentication flow complete

## Documentation Files

1. **README.md** - Quick start and feature overview
2. **CLAUDE.md** - This file (development guide for AI assistants)
3. **playwright.config.ts** - E2E test configuration

---

**Last Updated:** November 11, 2025
**Application Status:** Production-ready with comprehensive API integration
**Test Coverage:** 110 E2E tests + 14 unit tests
**Port:** http://localhost:5173
