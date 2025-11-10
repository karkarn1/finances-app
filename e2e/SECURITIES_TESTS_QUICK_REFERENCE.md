# Securities Tests - Quick Reference

## Run Commands

```bash
# All tests, all browsers (174 executions)
yarn test:e2e e2e/securities.spec.ts

# Single browser
yarn test:e2e e2e/securities.spec.ts --project=chromium

# Interactive UI
yarn test:e2e:ui e2e/securities.spec.ts

# Specific suite
yarn test:e2e e2e/securities.spec.ts --grep "Search"

# With browser visible
yarn test:e2e:headed e2e/securities.spec.ts
```

## Prerequisites

1. Backend running: `cd finances-api && make start`
2. Test user: `a@gmail.com` / `pass`
3. Frontend: Auto-starts (or `yarn dev`)

## Test Suites (29 tests)

1. **Securities List Page** (3 tests)
   - Display page with search
   - Popular securities cards
   - Navigate to detail

2. **Securities Search** (4 tests)
   - Search by symbol
   - Search by name
   - Loading state
   - Empty results

3. **Security Detail Page** (3 tests)
   - Load all components
   - Display information
   - Back button

4. **Price Chart** (2 tests)
   - Default timeframe
   - Chart with data

5. **Timeframe Selector** (5 tests)
   - All 8 timeframes
   - Switch 1M→1W
   - Switch 1W→1Y
   - Chart updates
   - Sequential testing

6. **Sync Functionality** (4 tests)
   - Display sync button
   - Successful sync
   - Loading state
   - Chart refresh

7. **Navigation** (4 tests)
   - Dashboard→List
   - List→Detail
   - Detail→List
   - Direct URL

8. **Error Handling** (2 tests)
   - Invalid symbol
   - No data message

9. **Security Statistics** (2 tests)
   - Display cards
   - Market cap format

## Files

- `e2e/securities.spec.ts` - Main test suite
- `e2e/fixtures/securities-test-data.ts` - Test data
- `e2e/helpers/navigation.ts` - Navigation helper (updated)
- `e2e/SECURITIES_TESTS_README.md` - Full documentation

## Test Data

**Popular Securities**: AAPL, MSFT, GOOGL, AMZN, TSLA, SPY, QQQ, VTI

**Timeframes**: 1D, 1W, 1M (default), 6M, YTD, 1Y, 5Y, ALL

**Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari, iPad

## Key Notes

- **Sync tests**: 35-second timeout (Yahoo Finance API)
- **Real backend required**: Not mocked
- **Test isolation**: Each test includes login
- **Expected flakes**: Yahoo Finance rate limits possible

## Troubleshooting

**Sync timeout**: Increase timeout or check Yahoo Finance API
**Search fails**: Verify backend running at localhost:8000
**Chart not rendering**: Check price data endpoint
**Auth fails**: Verify test user exists

## View Report

```bash
yarn test:e2e:report
```

---
29 tests × 6 browsers = 174 executions
