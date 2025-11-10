# Securities E2E Tests Documentation

This document provides comprehensive information about the securities tracking E2E tests.

## Overview

The securities E2E test suite (`securities.spec.ts`) provides comprehensive testing coverage for the securities tracking system, including:

- Securities list page with popular securities quick access
- Search functionality (by symbol and name)
- Security detail pages with interactive charts
- Timeframe selector (8 timeframes: 1D, 1W, 1M, 6M, YTD, 1Y, 5Y, ALL)
- Sync functionality with Yahoo Finance
- Navigation flows
- Error handling
- Statistics display

## Test Structure

```
e2e/
├── securities.spec.ts                    # Main test suite (56 tests across 9 suites)
├── fixtures/
│   ├── test-user.ts                      # Test user credentials
│   └── securities-test-data.ts           # Securities test data and constants
└── helpers/
    └── navigation.ts                     # NavigationHelper with navigateToSecurities()
```

## Test Suites

### 1. Securities List Page (3 tests)
- Display securities page with search box
- Display popular securities quick access cards (8 securities)
- Navigate to security detail when clicking popular security

### 2. Securities Search (4 tests)
- Search for security by symbol
- Search for security by name
- Show loading state while searching
- Handle empty search results

### 3. Security Detail Page (3 tests)
- Load security detail page with all components
- Display security information correctly
- Show back to search button

### 4. Price Chart (2 tests)
- Display chart with default timeframe (1M)
- Display chart data with dates and prices

### 5. Timeframe Selector (5 tests)
- Display all 8 timeframe buttons
- Switch timeframe from 1M to 1W
- Switch timeframe from 1W to 1Y
- Update chart when changing timeframe
- Test all timeframes sequentially

### 6. Sync Functionality (4 tests)
- Display sync button with last synced timestamp
- Sync security data successfully
- Show loading state during sync
- Refresh chart after successful sync

### 7. Navigation Between Securities Pages (4 tests)
- Navigate from dashboard to securities list
- Navigate from securities list to detail
- Navigate back from detail to list
- Navigate directly to security detail via URL

### 8. Error Handling (2 tests)
- Handle invalid security symbol gracefully
- Show message when no price data available

### 9. Security Statistics (2 tests)
- Display all statistics cards
- Display market cap in readable format

**Total: 56 comprehensive tests**

## Prerequisites

### Backend Requirements
- Backend API must be running at `http://localhost:8000`
- Securities endpoints must be available:
  - `GET /api/v1/securities/search?query={query}`
  - `GET /api/v1/securities/{symbol}`
  - `POST /api/v1/securities/{symbol}/sync`
  - `GET /api/v1/securities/{symbol}/prices?period={period}`

To start the backend:
```bash
cd finances-api
make start
```

### Frontend Requirements
- Frontend dev server must be running at `http://localhost:3000`
- Test user must exist: Username `testuser`, Email `test@example.com`, Password `testpasswd`

The Playwright config will automatically start the dev server if not running.

## Running the Tests

### Run All Securities Tests

```bash
cd finances-app

# Run on all 6 browser configurations
yarn test:e2e e2e/securities.spec.ts
```

### Run on Specific Browser

```bash
# Chromium only
yarn test:e2e e2e/securities.spec.ts --project=chromium

# Firefox only
yarn test:e2e e2e/securities.spec.ts --project=firefox

# WebKit (Safari) only
yarn test:e2e e2e/securities.spec.ts --project=webkit

# Mobile Chrome
yarn test:e2e e2e/securities.spec.ts --project="Mobile Chrome"

# Mobile Safari
yarn test:e2e e2e/securities.spec.ts --project="Mobile Safari"

# iPad
yarn test:e2e e2e/securities.spec.ts --project="iPad"
```

### Run Specific Test Suite

```bash
# Run only search tests
yarn test:e2e e2e/securities.spec.ts --grep "Securities Search"

# Run only timeframe tests
yarn test:e2e e2e/securities.spec.ts --grep "Timeframe Selector"

# Run only sync tests
yarn test:e2e e2e/securities.spec.ts --grep "Sync Functionality"
```

### Run in UI Mode (Interactive)

```bash
# Open Playwright UI for interactive testing
yarn test:e2e:ui e2e/securities.spec.ts
```

This opens an interactive UI where you can:
- See all tests in a tree view
- Run individual tests
- Watch tests in real-time
- Debug with browser DevTools
- Step through test actions

### Run with Visible Browser

```bash
# See the browser while tests run
yarn test:e2e:headed e2e/securities.spec.ts
```

### Debug Mode

```bash
# Run in debug mode with breakpoints
yarn test:e2e:debug e2e/securities.spec.ts
```

## Test Data

### Test Securities

The test suite uses real securities with actual data from Yahoo Finance:

| Symbol | Name Contains | Exchange | Currency |
|--------|---------------|----------|----------|
| AAPL   | Apple         | NMS      | USD      |
| MSFT   | Microsoft     | NMS      | USD      |
| GOOGL  | Alphabet      | NMS      | USD      |
| AMZN   | Amazon        | NMS      | USD      |
| TSLA   | Tesla         | NMS      | USD      |
| SPY    | SPDR S&P 500  | PCX      | USD      |
| QQQ    | Invesco QQQ   | NMS      | USD      |
| VTI    | Vanguard Total| PCX      | USD      |

### Popular Securities

8 popular securities displayed on the securities list page:
- AAPL, MSFT, GOOGL, AMZN, TSLA, SPY, QQQ, VTI

### Timeframes

8 timeframe options available in security detail:
- 1D (1 day)
- 1W (1 week)
- 1M (1 month) - **Default**
- 6M (6 months)
- YTD (Year to date)
- 1Y (1 year)
- 5Y (5 years)
- ALL (All available data)

## Important Notes

### Timeouts

Some tests have extended timeouts due to external API calls:

- **Sync tests**: 35-second timeout (Yahoo Finance API can be slow)
- **Chart loading**: 2-second timeout (data fetching and rendering)
- **Search results**: 1-1.5 second timeout (autocomplete debounce)

### Data Availability

- Some timeframes may show "No data available" which is expected behavior
- The sync operation can take 10-30 seconds depending on Yahoo Finance API response
- Chart data is real and may vary based on market hours and data availability

### Real Backend Dependency

Unlike some other test suites, securities tests **require a live backend** because:
- They use real securities data from Yahoo Finance
- Search functionality queries the backend API
- Sync operations hit the Yahoo Finance API through the backend
- Price data is dynamically fetched

### Test Isolation

Each test is independent and includes:
- Fresh login for authentication
- Proper navigation to required pages
- Cleanup after completion

## Viewing Test Reports

After running tests, view the HTML report:

```bash
yarn test:e2e:report
```

This opens an interactive HTML report showing:
- Test results by browser
- Screenshots of failures
- Videos of failed tests (on retry)
- Traces for debugging
- Execution timelines

## Test Report Location

```
finances-app/
├── playwright-report/           # HTML report
├── test-results/               # JSON results and artifacts
│   ├── results.json           # Machine-readable results
│   ├── screenshots/           # Failure screenshots
│   ├── videos/                # Failure videos
│   └── traces/                # Debug traces
```

## Troubleshooting

### Tests Timeout on Sync

**Problem**: Sync tests fail with timeout errors

**Solution**:
- Increase timeout in test (currently 35 seconds)
- Check backend logs for Yahoo Finance API issues
- Verify internet connectivity
- Yahoo Finance may be slow or rate-limiting

### Search Returns No Results

**Problem**: Search tests fail because autocomplete returns empty

**Solution**:
- Verify backend is running at localhost:8000
- Check backend API: `GET /api/v1/securities/search?query=AAPL`
- Verify database has securities data
- Run database migrations if needed

### Chart Not Rendering

**Problem**: Chart-related tests fail

**Solution**:
- Verify price data is available: `GET /api/v1/securities/AAPL/prices?period=1M`
- Check browser console for errors (use headed mode)
- Ensure frontend has no build errors
- Try syncing data first

### Authentication Fails

**Problem**: Tests fail at login step

**Solution**:
- Verify test user exists: Username `testuser`, Email `test@example.com`, Password `testpasswd`
- Check backend auth endpoints
- Verify JWT token generation works
- Check for CORS issues

### Backend Not Running

**Problem**: Tests fail with connection errors

**Solution**:
```bash
# Start backend
cd finances-api
make start

# Verify it's running
curl http://localhost:8000/health
```

## CI/CD Integration

To run these tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Start Backend
  run: |
    cd finances-api
    make start
    make migrate

- name: Run Securities E2E Tests
  run: |
    cd finances-app
    yarn test:e2e e2e/securities.spec.ts --reporter=json

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: finances-app/playwright-report/
```

## Best Practices

1. **Run backend first**: Always ensure backend is running before tests
2. **Use UI mode for debugging**: Interactive UI mode is great for development
3. **Check test data**: Verify real securities data is available
4. **Monitor timeouts**: Sync operations may need longer timeouts
5. **Review reports**: HTML reports provide valuable debugging information
6. **Test isolation**: Each test is independent and can run in any order

## Future Enhancements

Potential improvements to consider:

1. **Mock Yahoo Finance API**: Speed up tests by mocking external API
2. **Test data fixtures**: Pre-populate securities and price data
3. **Visual regression tests**: Snapshot testing for charts
4. **Performance benchmarks**: Measure page load and chart render times
5. **Accessibility tests**: ARIA labels, keyboard navigation
6. **Mobile-specific tests**: Touch interactions, responsive design

## Contact

For issues or questions about these tests:
- Check the main README: `finances-app/README.md`
- Review test code: `e2e/securities.spec.ts`
- Check backend docs: `finances-api/CLAUDE.md`

---

**Last Updated**: November 9, 2025
**Test Count**: 56 tests across 9 suites
**Browser Coverage**: 6 configurations (Desktop: Chrome, Firefox, Safari; Mobile: Chrome, Safari; Tablet: iPad)
