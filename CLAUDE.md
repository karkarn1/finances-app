# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finance Manager is a full-featured personal finance management web application built with React 18+, TypeScript, Material-UI, and Redux. It provides users with tools to track their net worth, manage accounts, monitor investment portfolios, plan expenses and income, and work toward financial goals with an AI-powered assistant.

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

1. **State Management (Redux Toolkit)**
   - Centralized store in `src/store/`
   - Feature slices for auth, accounts, holdings, expenses, income, goals
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
       └── Page Components (Dashboard, Accounts, etc.)
           └── Feature Components (Charts, Cards, Forms)
               └── Base Components (Buttons, Inputs, etc.)
   ```

4. **Data Flow**
   - API calls → Redux actions → Redux state → Component re-render
   - Form submissions → Validation → Redux actions → Optimistic updates
   - AI queries → External service → Response → Component state

5. **Code Splitting Strategy** (configured in `vite.config.ts`)
   - Vendor chunk: `react`, `react-dom`, `react-router-dom`
   - MUI chunk: `@mui/material`, `@mui/icons-material`
   - Redux chunk: `@reduxjs/toolkit`, `react-redux`
   - Per-route chunks: Dashboard, Accounts, etc. (lazy loaded)
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
- Auto-start dev server at localhost:3000 (webServer config)
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

**NavigationHelper Pattern:**
All tests use a centralized navigation helper to reduce duplication:
```typescript
const nav = new NavigationHelper(page);
await nav.login(testUser.email, testUser.password);
await nav.navigateToDashboard();
```

**Test Data:**
- Test user: `a@gmail.com` / `pass`
- Expected values defined in `fixtures/test-user.ts`
- Consistent data across all test suites

### Unit Tests (Jest + React Testing Library)

**Note:** Unit test infrastructure is configured but test files need to be created.

When implementing:
- Component rendering and interaction tests
- Utility function tests (currency formatting, calculations)
- Redux slice tests (actions, reducers, selectors)
- Custom hook tests
- Jest environment: `jsdom` for DOM testing
- Coverage reports available via `yarn test:coverage`

## Current Application State

**Live at:** http://localhost:3000/

**Test User:**
- Name: Alex Johnson
- Email: alex.johnson@example.com
- Net Worth: $251,401.22 (+7.89% YoY)

**Data Summary:**
- 6 Accounts: 2 assets, 2 liabilities, 2 investments
- 6 Holdings: VTI, VXUS, BND across accounts
- 10 Expenses: $3,974.50/month total
- 4 Income Sources: $11,544.00/month total
- 3 Financial Goals: 2 achieved, 1 in progress

## Technology Stack

### Core
- **React** 18.3.1 - Hooks, concurrent features
- **TypeScript** 5.5.4 - Strict mode enabled
- **Vite** 5.4.3 - Dev server and build tool

### UI & Styling
- **Material-UI (MUI)** 5.16.7 - Component library
- **Emotion** - CSS-in-JS
- **Responsive Grid** - Mobile-first layout

### State & Routing
- **Redux Toolkit** 2.2.7 - State management
- **React Redux** 9.1.2 - React bindings
- **React Router DOM** 6.26.0 - Client-side routing

### Testing
- **Playwright** 1.47.0 - E2E testing (6 browser configs)
- **Jest** 29.7.0 - Unit testing
- **React Testing Library** 16.0.1 - Component testing
- **@testing-library/user-event** 14.5.2 - User interactions

## Key Data Models

### Accounts
```typescript
interface Account {
  id: string;
  name: string;
  category: 'Checking' | 'Savings' | 'Credit Card' | 'Loan' | 'Brokerage' | '401k';
  type: 'asset' | 'liability' | 'investment';
  balance: number;
  change: number; // percentage
}
```

### Holdings
```typescript
interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: { amount: number; percentage: number };
  account: string;
}
```

### Recurring Transactions
```typescript
interface RecurringTransaction {
  id: string;
  name: string;
  category: string;
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  amount: number;
  monthlyEquivalent: number;
  account: string;
  type: 'expense' | 'income';
}
```

### Financial Goals
```typescript
interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  type: 'Net Worth Value' | 'Assets Value' | 'Debt Value';
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100
  estimatedCompletion: string | 'Achieved!';
  monthlyRate: number;
  status: 'On track' | 'Paying down' | 'Achieved' | 'Behind';
}
```

## Known Issues & Priorities

### High Priority
1. **Rebalancing Calculations** - NaN values in deviation calculations (src/pages/Rebalancing/)
2. **Portfolio Value Discrepancies** - Verify calculations match holdings
3. **Performance Data** - Validate historical performance calculations

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

### State Management
- Redux for global state (auth, accounts, holdings, etc.)
- Local state (useState) for component-specific UI state
- Keep state normalized and flat
- Use selectors for derived data
- Custom hooks for complex logic

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

## API Integration (Future)

Currently using mock data. When implementing backend:

### Implemented Endpoints
- `POST /api/v1/auth/register` - User registration (✅ Implemented)
- `POST /api/v1/auth/login` - User authentication (✅ Implemented)
- `POST /api/v1/auth/forgot-password` - Request password reset (✅ Implemented)
- `POST /api/v1/auth/reset-password` - Reset password with token (✅ Implemented)
- `GET /api/v1/auth/me` - Get current user (✅ Implemented)
- `PATCH /api/v1/users/me` - Update user profile (✅ Implemented)
- `GET /api/v1/securities/search?q={query}` - Search securities (✅ Implemented)
- `GET /api/v1/securities/{symbol}` - Get security details (✅ Implemented)
- `POST /api/v1/securities/{symbol}/sync` - Sync from Yahoo Finance (✅ Implemented)
- `GET /api/v1/securities/{symbol}/prices` - Historical prices (✅ Implemented)

### Required Endpoints (Future)
- `GET /api/v1/accounts` - Fetch all accounts
- `POST /api/v1/accounts` - Create account
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account
- `GET /api/v1/holdings` - Fetch portfolio holdings
- `GET /api/v1/expenses` - Fetch recurring expenses
- `GET /api/v1/income` - Fetch income sources
- `GET /api/v1/goals` - Fetch financial goals
- `GET /api/v1/dashboard/metrics` - Dashboard summary

## Performance Optimizations

### Build Configuration (`vite.config.ts`)
- **Code splitting**: Manual chunks for vendor, MUI, and Redux
- **Sourcemaps**: Enabled in production for debugging
- **Output directory**: `dist/`
- **Dev server**: Port 5173, auto-opens browser, non-strict port

### Runtime Optimizations
- Lazy loading for route components
- Memoized expensive calculations (implement as needed)
- Debounced search inputs (implement as needed)

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

## Documentation Files

1. **README.md** - Quick start and feature overview
2. **CLAUDE.md** - This file (development guide for AI assistants)
3. **EXPLORATION_REPORT.md** - Detailed exploration with screenshots
4. **playwright.config.ts** - E2E test configuration

---

**Last Updated:** November 10, 2025
**Application Status:** Fully Functional with Real API Integration for Auth & Securities
**Test Coverage:** 110 E2E tests across 8 test suites
