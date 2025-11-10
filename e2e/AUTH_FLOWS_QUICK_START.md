# Auth Flows E2E Tests - Quick Start Guide

## Prerequisites

**Backend must be running:**
```bash
cd finances-api
make start
# Verify: http://localhost:8000/docs
```

**Test user must exist:**
- Email: `a@gmail.com`
- Password: `pass`

## Run Tests

### All Auth Flow Tests
```bash
cd finances-app
yarn test:e2e e2e/auth-flows.spec.ts
```

### Specific Test Suites
```bash
# Registration tests only
yarn test:e2e --grep "Registration"

# Login tests only
yarn test:e2e --grep "Login"

# Logout tests only
yarn test:e2e --grep "Logout"

# Protected routes tests
yarn test:e2e --grep "Protected Routes"

# Forgot password tests
yarn test:e2e --grep "Forgot Password"

# Reset password tests
yarn test:e2e --grep "Reset Password"

# Navigation tests
yarn test:e2e --grep "Navigation Between Auth Pages"
```

### Single Browser
```bash
# Chromium only (fastest)
yarn test:e2e --project=chromium e2e/auth-flows.spec.ts

# Firefox only
yarn test:e2e --project=firefox e2e/auth-flows.spec.ts

# Mobile Chrome only
yarn test:e2e --project="Mobile Chrome" e2e/auth-flows.spec.ts
```

### Interactive/Debug Mode
```bash
# Best for development - see tests run in browser
yarn test:e2e:ui e2e/auth-flows.spec.ts

# Run with visible browser
yarn test:e2e:headed e2e/auth-flows.spec.ts

# Debug specific test
yarn test:e2e:debug --grep "should register new user"
```

## View Results

### HTML Report
```bash
yarn test:e2e:report
# Opens in browser with screenshots, videos, traces
```

### Test Results Location
- Screenshots: `test-results/[test-name]/test-failed-1.png`
- Videos: `test-results/[test-name]/video.webm`
- Traces: `test-results/[test-name]/trace.zip`

### View Trace
```bash
yarn playwright show-trace test-results/[test-name]/trace.zip
```

## Expected Results

**Total Tests:** 42 unique tests
**Browser Projects:** 6 (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, iPad)
**Total Executions:** 252 (42 × 6)

**Expected Output:**
```
Running 252 tests using 6 workers
  252 passed (2m 30s)
```

## Test Breakdown

| Suite | Tests | Coverage |
|-------|-------|----------|
| Registration | 8 | New user signup, validation, duplicates |
| Login | 6 | Username/email login, validation, persistence |
| Logout | 4 | Token cleanup, redirects, guards |
| Protected Routes | 5 | Auth guards, route protection |
| Forgot Password | 6 | Password reset request, validation |
| Reset Password | 7 | Token handling, password update |
| Navigation | 6 | Page transitions, links |

## Troubleshooting

### Backend Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:8000
Fix: cd finances-api && make start
```

### Test User Doesn't Exist
```
Error: Invalid credentials (in login tests)
Fix: Create user a@gmail.com with password 'pass'
```

### Port Already in Use
```
Error: Port 3000 is already in use
Fix: Kill process on port 3000 or update playwright.config.ts
```

### Tests Timeout
```
Error: Timeout 30000ms exceeded
Fix: Increase timeout in playwright.config.ts or check network
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Start Backend
  run: |
    cd finances-api
    docker-compose up -d
    sleep 10  # Wait for services

- name: Run Auth E2E Tests
  run: |
    cd finances-app
    yarn test:e2e e2e/auth-flows.spec.ts

- name: Upload Test Results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: finances-app/playwright-report/
```

## Development Workflow

### 1. Make Auth Changes
Edit files in `src/pages/Login`, `src/pages/Register`, etc.

### 2. Run Tests Interactively
```bash
yarn test:e2e:ui e2e/auth-flows.spec.ts
```

### 3. Fix Issues
Watch tests run, fix failures, re-run automatically

### 4. Run Full Suite
```bash
yarn test:e2e e2e/auth-flows.spec.ts
```

### 5. Commit Changes
Only commit if all tests pass

## More Information

See `e2e/AUTH_FLOWS_TEST_SUMMARY.md` for:
- Detailed test descriptions
- Test data and fixtures
- Selectors and patterns
- Maintenance guidelines
- Coverage analysis

---

**Quick Reference:** 42 tests covering all authentication flows
**Files:** `e2e/auth-flows.spec.ts`, `e2e/fixtures/auth-test-data.ts`
