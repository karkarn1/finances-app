# Finance Manager

A comprehensive personal finance management web application built with React 18+, TypeScript, Material-UI, and Redux Toolkit. Track your net worth, manage accounts, monitor investments, plan expenses and income, and achieve financial goals with AI-powered insights.

![License](https://img.shields.io/badge/license-Private-red)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![Material-UI](https://img.shields.io/badge/MUI-5.16.7-blue)

## 🌟 Features

### Authentication & Security
- **🔐 User Authentication** - Secure JWT-based authentication
- **📝 User Registration** - Create new accounts with email/username
- **🔑 Password Management** - Secure password reset flow
- **🛡️ Protected Routes** - Client-side route protection

### Financial Tracking
- **📊 Dashboard** - Complete financial overview with interactive charts and metrics
- **💰 Account Management** - Track assets, liabilities, and investment accounts
- **📈 Portfolio Holdings** - Monitor investment performance across multiple timeframes
- **📊 Securities Tracking** - Search and track stocks, ETFs, and other securities
- **📉 Price Charts** - Historical price data with 8 timeframes (1D, 1W, 1M, 6M, YTD, 1Y, 5Y, ALL)
- **⚖️ Rebalancing** - Get intelligent portfolio rebalancing recommendations
- **💸 Expense Tracking** - Manage recurring expenses with category breakdowns
- **💵 Income Management** - Track multiple income sources and trends
- **🎯 Financial Goals** - Set and track progress toward financial milestones

### AI-Powered Insights
- **🤖 AI Financial Assistant** - Natural language queries for financial analysis
- **📉 Intelligent Visualizations** - Dynamic charts and data breakdowns
- **🎨 Quick Actions** - One-click expense, income, and portfolio analysis

### User Experience
- **🎨 Material Design** - Clean, modern interface with Material-UI
- **📱 Responsive** - Mobile-first design that works on all devices
- **🌓 Dark Mode** - Toggle between light and dark themes
- **♿️ Accessible** - WCAG 2.1 AA compliant
- **⚡️ Fast** - Optimized with code splitting and lazy loading

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0

### Installation

1. **Clone and navigate to the project:**
```bash
cd finances-app
```

2. **Install dependencies:**
```bash
yarn install
```

3. **Start the development server:**
```bash
yarn dev
```

The application will open at [http://localhost:5173](http://localhost:5173)

### Test Credentials
```
Email: a@gmail.com
Password: pass
```

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
- Net worth tracking with time period filters
- Asset vs. debt comparison charts
- Investment portfolio value trends
- Active financial goals

### Account Management
![Accounts](./screenshots/accounts.png)
- Asset, liability, and investment accounts
- Real-time balance updates
- Percentage change indicators

### Portfolio Holdings
![Holdings](./screenshots/holdings-overview.png)
- Complete holdings overview with gain/loss
- Performance metrics across multiple timeframes
- Portfolio allocation and distribution charts

## 🎯 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | User authentication |
| **Register** | `/register` | New user registration |
| **Forgot Password** | `/forgot-password` | Password reset request |
| **Reset Password** | `/reset-password` | Password reset with token |
| **Dashboard** | `/dashboard` | Financial overview with charts and AI assistant |
| **Accounts** | `/accounts` | Manage all financial accounts |
| **Holdings** | `/holdings` | Investment portfolio tracking |
| **Securities** | `/securities` | Search and browse securities |
| **Security Detail** | `/securities/:symbol` | View security details and price charts |
| **Rebalancing** | `/rebalancing` | Portfolio optimization tools |
| **Expenses** | `/expenses` | Recurring expense management |
| **Income** | `/income` | Income source tracking |
| **Goals** | `/goals` | Financial goal monitoring |
| **Settings** | `/settings` | User profile and preferences |

## 🛠️ Technology Stack

### Core
- **React** 18.3.1 - UI framework with hooks and concurrent features
- **TypeScript** 5.5.4 - Type-safe development with strict mode
- **Vite** 5.4.3 - Lightning-fast build tool and dev server

### UI & Styling
- **Material-UI (MUI)** 5.16.7 - Professional component library
- **Emotion** - CSS-in-JS styling solution
- **Material Icons** - Comprehensive icon set
- **Responsive Grid** - Mobile-first layout system

### State Management
- **Redux Toolkit** 2.2.7 - Modern Redux with less boilerplate
- **React Redux** 9.1.2 - Official React bindings

### Routing
- **React Router DOM** 6.26.0 - Declarative routing

### Charts & Visualizations
- **Recharts** 2.13.3 - Composable charting library
- Line charts - Net worth, assets, portfolio trends, security prices
- Pie charts - Allocation, expenses, income breakdown
- Bar charts - Account comparisons, gain/loss
- Stacked area charts - Category trends over time
- Historical price charts - OHLC data with multiple timeframes

### Development & Testing
- **ESLint** - Code quality and consistency
- **TypeScript** - Strict type checking
- **Jest** 29.7.0 - Unit testing framework
- **Playwright** 1.47.0 - E2E testing (6 browser configurations)
- **React Testing Library** 16.0.1 - Component testing
- **@testing-library/user-event** 14.5.2 - User interaction testing

## 📁 Project Structure

```
finances-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header/         # Application header
│   │   ├── Layout/         # Page layout wrapper
│   │   ├── Sidebar/        # Navigation sidebar
│   │   ├── Charts/         # Chart components
│   │   ├── Cards/          # Metric cards
│   │   ├── PriceChart/     # Securities price chart
│   │   └── ProtectedRoute/ # Auth route wrapper
│   ├── pages/              # Route components
│   │   ├── Login/          # User login
│   │   ├── Register/       # User registration
│   │   ├── ForgotPassword/ # Password reset request
│   │   ├── ResetPassword/  # Password reset with token
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Accounts/       # Account management
│   │   ├── Holdings/       # Portfolio holdings
│   │   ├── Securities/     # Securities search/list
│   │   ├── SecurityDetail/ # Security detail with charts
│   │   ├── Rebalancing/    # Rebalancing tools
│   │   ├── Expenses/       # Expense tracking
│   │   ├── Income/         # Income management
│   │   ├── Goals/          # Financial goals
│   │   └── Settings/       # User settings
│   ├── services/           # API service layer
│   │   ├── api.ts          # Base API client
│   │   ├── auth.ts         # Auth service
│   │   └── securities.ts   # Securities service
│   ├── hooks/              # Custom React hooks
│   │   └── index.ts        # Redux hooks
│   ├── store/              # Redux state
│   │   ├── slices/         # Redux slices
│   │   │   ├── authSlice.ts      # Authentication state
│   │   │   └── securitiesSlice.ts # Securities state
│   │   └── index.ts        # Store config
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   │   └── timeframes.ts   # Date range calculations
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   ├── theme.ts            # MUI theme
│   └── index.css           # Global styles
├── e2e/                     # E2E tests (Playwright)
│   ├── fixtures/           # Test data and credentials
│   │   ├── test-user.ts         # User test data
│   │   ├── auth-test-data.ts    # Auth test data
│   │   └── securities-test-data.ts # Securities test data
│   ├── helpers/            # Test utilities
│   │   └── navigation.ts   # Navigation helper
│   ├── auth.spec.ts        # Authentication tests (6 tests)
│   ├── auth-flows.spec.ts  # Auth flow tests (42 tests)
│   ├── navigation.spec.ts  # Navigation tests (9 tests)
│   ├── dashboard.spec.ts   # Dashboard tests (6 tests)
│   ├── accounts.spec.ts    # Accounts tests (6 tests)
│   ├── holdings.spec.ts    # Holdings tests (5 tests)
│   ├── expenses.spec.ts    # Expenses tests (7 tests)
│   └── securities.spec.ts  # Securities tests (29 tests)
├── public/                  # Static assets
├── screenshots/             # Application screenshots
├── CLAUDE.md               # AI assistant context
├── EXPLORATION_REPORT.md   # Detailed feature specs
├── package.json            # Dependencies
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 💻 Available Scripts

### Development
```bash
yarn dev          # Start development server (localhost:5173)
yarn build        # Build for production
yarn preview      # Preview production build
```

### Code Quality
```bash
yarn lint         # Run ESLint
yarn lint:fix     # Auto-fix ESLint issues
yarn type-check   # TypeScript type checking
```

### Testing
```bash
# Unit Tests
yarn test              # Run Jest unit tests
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Generate coverage report

# E2E Tests (Playwright)
yarn test:e2e          # Run all E2E tests
yarn test:e2e:ui       # Interactive test UI mode
yarn test:e2e:headed   # Run with visible browser
yarn test:e2e:debug    # Debug mode with breakpoints
yarn test:e2e:report   # View HTML test report
```

## 🧪 Testing

### E2E Testing with Playwright

**110 E2E tests** across **8 test suites** covering all major functionality:

- **auth.spec.ts** (6 tests) - Basic auth flows
- **auth-flows.spec.ts** (42 tests) - Complete authentication workflows (login, register, password reset)
- **securities.spec.ts** (29 tests) - Securities tracking (search, detail, charts, sync)
- **navigation.spec.ts** (9 tests) - Sidebar navigation, user profile
- **dashboard.spec.ts** (6 tests) - Metrics, charts, AI assistant
- **accounts.spec.ts** (6 tests) - Asset, liability, investment accounts
- **holdings.spec.ts** (5 tests) - Portfolio overview, performance, charts
- **expenses.spec.ts** (7 tests) - Expense tracking, categories, filters

**Browser Coverage:**
- ✅ Desktop: Chromium, Firefox, WebKit
- ✅ Mobile: Chrome (Android), Safari (iPhone), Safari (iPad)

**Test Structure:**
```
e2e/
├── fixtures/test-user.ts      # Test credentials and expected data
├── helpers/navigation.ts      # Reusable navigation helper
└── *.spec.ts                  # Test suites
```

**Running Specific Tests:**
```bash
# Run specific test file
yarn test:e2e e2e/dashboard.spec.ts

# Run tests matching pattern
yarn test:e2e --grep "should login"

# Run on specific browser
yarn test:e2e --project=chromium
```

## 🔧 Configuration

### Path Aliases

Clean imports with TypeScript path aliases:

```typescript
import { useAppDispatch } from '@/hooks';
import Dashboard from '@pages/Dashboard';
import { formatCurrency } from '@utils';
import type { Account } from '@types';
import Header from '@components/Header';
```

Available aliases:
- `@/*` → `src/`
- `@components/*` → `src/components/`
- `@pages/*` → `src/pages/`
- `@hooks/*` → `src/hooks/`
- `@utils/*` → `src/utils/`
- `@store/*` → `src/store/`
- `@types/*` → `src/types/`

### Environment Variables

Create a `.env` file in the root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_DARK_MODE=true
```

## 📊 Current Data

### Test Account Overview
- **Net Worth:** $251,401.22 (+7.89% from 1Y)
- **Total Assets:** $272,444.01
- **Total Debts:** $21,042.79
- **Portfolio Value:** $162,168.90 (+14.38% from 1Y)

### Accounts (6 total)
- 2 Asset Accounts: $57,770.50
- 2 Liability Accounts: $21,340.75
- 2 Investment Accounts: $214,930.70

### Holdings (6 positions)
- VTI (Vanguard Total Stock Market ETF)
- VXUS (Vanguard Total International Stock ETF)
- BND (Vanguard Total Bond Market ETF)

### Recurring Transactions
- 10 Expenses: $3,974.50/month
- 4 Income Sources: $11,544.00/month

### Financial Goals
- ✅ First $100K Net Worth (Achieved)
- ✅ Build $250K Investment Portfolio (Achieved)
- 🔄 Become Debt-Free (In Progress - $21,341 remaining)

## 🎨 Features in Detail

### Dashboard
- **Time Period Filters:** 1M, 3M, 6M, 1Y, ALL
- **Key Metrics:** Net worth, assets, debts, portfolio value
- **Charts:**
  - Net Worth Over Time (line chart)
  - Assets vs Debts (dual line chart)
  - Investment Portfolio Value (line chart)
- **Active Goals:** Progress tracking with estimates
- **AI Assistant:** Natural language financial queries

### Account Management
- **Asset Accounts:** Checking, Savings
- **Liability Accounts:** Credit Cards, Loans
- **Investment Accounts:** Brokerage, 401k
- **Features:** Add, edit, delete accounts
- **Metrics:** Balance, change percentage, account count

### Portfolio Holdings
- **Overview Tab:** All positions with gain/loss
- **Performance Tab:** Returns across 8 timeframes
- **Charts Tab:** Allocation and trend visualizations
- **Real-time Calculations:** Automatic gain/loss updates

### Expense & Income Tracking
- **Frequency Support:** Daily, Weekly, Bi-Weekly, Monthly
- **Auto-Conversion:** All frequencies to monthly equivalent
- **Categories:** Housing, Transportation, Food, Utilities, Entertainment, etc.
- **Charts:** Trends over time, category breakdown, by account
- **Filters:** Search, category, frequency, account

### Financial Goals
- **Goal Types:** Net Worth, Assets, Debt reduction
- **Progress Tracking:** Percentage complete with visual bars
- **Time Estimates:** Completion projections based on trends
- **Status Indicators:** On track, behind, achieved
- **Actions:** Edit goals, view details

## 🐛 Known Issues

### High Priority
- [ ] Rebalancing page shows NaN in some calculations
- [ ] Verify portfolio value calculations match holdings

### Medium Priority
- [ ] Add transaction history view
- [ ] Implement account transaction details
- [ ] Add data export (CSV, PDF)

See [CLAUDE.md](./CLAUDE.md) for complete TODO list.

## 📚 Documentation

- **[README.md](./README.md)** - This file (quick start guide)
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project context for AI assistants
- **[EXPLORATION_REPORT.md](./EXPLORATION_REPORT.md)** - Detailed feature specifications

## 🔐 Security

### Current Implementation
- Password fields with show/hide toggle
- Session management
- XSS protection via React
- HTTPS enforced in production

### Planned
- JWT token refresh
- Rate limiting
- Data encryption
- Audit logging

## ♿️ Accessibility

WCAG 2.1 AA compliant:
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios met
- ✅ Focus indicators visible

## 🌐 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## 🚀 Deployment

### Build for Production
```bash
yarn build
```

Output: `dist/` directory (optimized bundle)

### Preview Production Build
```bash
yarn preview
```

### Deployment Platforms
- ✅ Vercel (recommended)
- ✅ Netlify
- ✅ AWS S3 + CloudFront
- ✅ Docker

## 📈 Performance

### Optimizations
- Code splitting (vendor, MUI, Redux chunks)
- Tree shaking for unused code
- Lazy loading for routes
- Memoized calculations
- Debounced search inputs

### Bundle Size
- Optimized for production
- Source maps for debugging
- Minification and compression

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Run linter before committing: `yarn lint`
3. Ensure type check passes: `yarn type-check`
4. Write tests for new features
5. Update documentation as needed

## 📝 Code Quality Standards

Before committing:
- ✅ `yarn type-check` - Zero TypeScript errors
- ✅ `yarn lint` - Zero ESLint warnings
- ✅ `yarn test` - All unit tests passing
- ✅ `yarn test:e2e` - All E2E tests passing (110 tests)
- ✅ `yarn build` - Successful production build

## 📄 License

**Private** - Not for distribution

## 🆘 Support

For detailed feature specifications and development guidelines:
1. Review [CLAUDE.md](./CLAUDE.md) for project context
2. Check [EXPLORATION_REPORT.md](./EXPLORATION_REPORT.md) for feature details
3. Review existing code patterns
4. Test on multiple screen sizes
5. Verify accessibility compliance

## 🎯 Next Steps

1. **Fix Known Issues** - Address NaN calculations in rebalancing
2. **Add Transactions** - Implement transaction history view
3. **Data Export** - Add CSV/PDF export functionality
4. **Backend Integration** - Connect to REST API
5. **Enhanced AI** - Expand AI assistant capabilities
6. **Mobile App** - Consider React Native version

---

**Version:** 1.0.0
**Last Updated:** November 10, 2025
**Status:** ✅ Fully Functional
**Test Coverage:** 110 E2E tests across 8 test suites
**Live Demo:** http://localhost:5173/

Built with ❤️ using React, TypeScript, and Material-UI
