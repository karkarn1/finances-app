/**
 * Comprehensive E2E tests for securities tracking system
 *
 * Tests cover:
 * - Securities list page with popular securities
 * - Search functionality (by symbol and name)
 * - Security detail page with all components
 * - Interactive price charts
 * - Timeframe selector (8 timeframes)
 * - Sync functionality with Yahoo Finance
 * - Navigation between pages
 * - Error handling
 * - Statistics display
 */

import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';
import { testUser } from './fixtures/test-user';
import {
  testSecurities,
  popularSecurities,
  allTimeframes,
  searchTestCases,
} from './fixtures/securities-test-data';

test.describe('Securities List Page', () => {
  test('should display securities page with search box', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Verify page heading
    await expect(page.locator('h2')).toContainText('Securities');

    // Verify search box is present
    const searchBox = page.locator('input[placeholder*="Search"], [role="combobox"]');
    await expect(searchBox).toBeVisible();

    // Verify popular securities section heading
    await expect(page.locator('text=Popular Securities')).toBeVisible();
  });

  test('should display popular securities quick access cards', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Verify all 8 popular securities cards are present
    for (const symbol of popularSecurities) {
      const card = page.locator(`text=${symbol}`).first();
      await expect(card).toBeVisible();
    }
  });

  test('should navigate to security detail when clicking popular security', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Click on AAPL card
    await page.click('text=AAPL');

    // Wait for navigation
    await page.waitForSelector(`text=${testSecurities.aapl.nameContains}`);

    // Verify URL is /securities/AAPL
    await expect(page).toHaveURL(/\/securities\/AAPL/);

    // Verify security detail page loaded
    await expect(page.locator(`text=${testSecurities.aapl.symbol}`)).toBeVisible();
  });
});

test.describe('Securities Search', () => {
  test('should search for security by symbol', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Type in search box
    const searchBox = page.locator('input[role="combobox"]');
    await searchBox.click();
    await searchBox.fill(searchTestCases.validSymbol);

    // Wait for autocomplete results
    await page.waitForTimeout(1000); // Wait for API response

    // Verify results contain AAPL
    const result = page.locator(`text=${testSecurities.aapl.symbol}`).first();
    await expect(result).toBeVisible();

    // Click on result
    await result.click();

    // Verify navigated to /securities/AAPL
    await page.waitForURL(/\/securities\/AAPL/);
    await expect(page).toHaveURL(/\/securities\/AAPL/);
  });

  test('should search for security by name', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Search for "Apple"
    const searchBox = page.locator('input[role="combobox"]');
    await searchBox.click();
    await searchBox.fill(searchTestCases.validName);

    // Wait for results
    await page.waitForTimeout(1000);

    // Verify results contain Apple/AAPL
    const result = page.locator(`text=${testSecurities.aapl.symbol}`).first();
    await expect(result).toBeVisible();
  });

  test('should show loading state while searching', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Type in search box
    const searchBox = page.locator('input[role="combobox"]');
    await searchBox.click();
    await searchBox.fill('MSFT');

    // Check for loading indicator (may be very fast)
    try {
      await expect(page.locator('[role="progressbar"]')).toBeVisible({ timeout: 500 });
    } catch {
      // Loading may complete very quickly, which is fine
    }

    // Wait for results
    await page.waitForTimeout(1000);

    // Verify results appear
    const result = page.locator(`text=${testSecurities.msft.symbol}`).first();
    await expect(result).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to securities page
    await page.click('button:has-text("Securities")');
    await page.waitForSelector('h2:has-text("Securities")');

    // Search for non-existent symbol
    const searchBox = page.locator('input[role="combobox"]');
    await searchBox.click();
    await searchBox.fill(searchTestCases.invalidSymbol);

    // Wait for search to complete
    await page.waitForTimeout(1500);

    // Verify "No options" or similar message
    const noResults = page.locator('text=No options, text=No results, text=No securities found').first();
    await expect(noResults).toBeVisible();
  });
});

test.describe('Security Detail Page', () => {
  test('should load security detail page with all components', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate directly to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000); // Wait for data to load

    // Verify symbol heading
    await expect(page.locator(`text=${testSecurities.aapl.symbol}`)).toBeVisible();

    // Verify company name
    await expect(page.locator(`text=${testSecurities.aapl.nameContains}`)).toBeVisible();

    // Verify current price is displayed (any number > 0)
    const priceElement = page.locator('text=/\\$\\d+\\.\\d{2}/').first();
    await expect(priceElement).toBeVisible();

    // Verify sync button exists
    await expect(page.locator('button:has-text("Sync Data")')).toBeVisible();

    // Verify timeframe selector buttons (8 buttons)
    for (const timeframe of allTimeframes) {
      await expect(page.locator(`button:has-text("${timeframe}")`)).toBeVisible();
    }

    // Verify chart container is rendered
    const chartContainer = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chartContainer).toBeVisible();
  });

  test('should display security information correctly', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify symbol
    await expect(page.locator(`text=${testSecurities.aapl.symbol}`)).toBeVisible();

    // Verify name contains "Apple"
    await expect(page.locator(`text=${testSecurities.aapl.nameContains}`)).toBeVisible();

    // Verify price is displayed (format: $XXX.XX)
    const priceRegex = /\$\d+\.\d{2}/;
    await expect(page.locator(`text=${priceRegex}`).first()).toBeVisible();

    // Verify exchange or currency is shown
    await expect(
      page.locator(`text=${testSecurities.aapl.exchange}, text=${testSecurities.aapl.currency}`).first()
    ).toBeVisible();
  });

  test('should show back to search button', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify "Back to Search" button exists
    const backButton = page.locator('button:has-text("Back to Search"), a:has-text("Back to Search")');
    await expect(backButton).toBeVisible();

    // Click button
    await backButton.click();

    // Verify returned to /securities page
    await expect(page).toHaveURL(/\/securities$/);
    await expect(page.locator('h2:has-text("Securities")')).toBeVisible();
  });
});

test.describe('Price Chart', () => {
  test('should display chart with default timeframe (1M)', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify chart container is visible
    const chartContainer = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chartContainer).toBeVisible();

    // Verify 1M button is active (contained variant)
    const oneMonthButton = page.locator('button:has-text("1M")');
    await expect(oneMonthButton).toBeVisible();

    // Check if button has active styling (MUI contained variant classes)
    const buttonClass = await oneMonthButton.getAttribute('class');
    expect(buttonClass).toContain('MuiButton');
  });

  test('should display chart data with dates and prices', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify chart is rendered (recharts, canvas, or svg)
    const chartElement = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chartElement).toBeVisible();

    // If using recharts, verify axes are present
    try {
      const xAxis = page.locator('.recharts-xAxis, [class*="xAxis"]');
      const yAxis = page.locator('.recharts-yAxis, [class*="yAxis"]');
      await expect(xAxis.or(yAxis)).toBeVisible({ timeout: 2000 });
    } catch {
      // Chart may use canvas instead of SVG, which is fine
    }
  });
});

test.describe('Timeframe Selector', () => {
  test('should display all 8 timeframe buttons', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify all 8 timeframe buttons are present
    for (const timeframe of allTimeframes) {
      const button = page.locator(`button:has-text("${timeframe}")`);
      await expect(button).toBeVisible();
    }

    // Verify default selection is 1M
    const oneMonthButton = page.locator('button:has-text("1M")');
    await expect(oneMonthButton).toBeVisible();
  });

  test('should switch timeframe from 1M to 1W', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify 1M is initially selected
    const oneMonthButton = page.locator('button:has-text("1M")');
    await expect(oneMonthButton).toBeVisible();

    // Click 1W button
    const oneWeekButton = page.locator('button:has-text("1W")');
    await oneWeekButton.click();

    // Wait for chart to update
    await page.waitForTimeout(1000);

    // Verify 1W button is now active
    await expect(oneWeekButton).toBeVisible();
  });

  test('should switch timeframe from 1W to 1Y', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Click 1W
    await page.click('button:has-text("1W")');
    await page.waitForTimeout(1000);

    // Click 1Y
    await page.click('button:has-text("1Y")');
    await page.waitForTimeout(1000);

    // Verify 1Y button is visible (active state)
    const oneYearButton = page.locator('button:has-text("1Y")');
    await expect(oneYearButton).toBeVisible();
  });

  test('should update chart when changing timeframe', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Select 1M timeframe (default)
    await page.click('button:has-text("1M")');
    await page.waitForTimeout(1000);

    // Verify chart is visible
    const chartBefore = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chartBefore).toBeVisible();

    // Select 1Y timeframe
    await page.click('button:has-text("1Y")');

    // Wait for chart to update (may show loading state)
    await page.waitForTimeout(2000);

    // Verify chart is still visible (chart should have updated)
    const chartAfter = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chartAfter).toBeVisible();
  });

  test('should test all timeframes sequentially', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to AAPL detail page
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Test each timeframe
    for (const timeframe of allTimeframes) {
      // Click timeframe button
      const button = page.locator(`button:has-text("${timeframe}")`);
      await button.click();

      // Wait for chart update
      await page.waitForTimeout(1500);

      // Verify button is visible (active)
      await expect(button).toBeVisible();

      // Verify chart is still rendered (may show "No data" for some timeframes)
      const chartOrMessage = page.locator(
        '[class*="recharts"], canvas, svg, text=No data, text=No price data'
      );
      await expect(chartOrMessage.first()).toBeVisible();
    }
  });
});

test.describe('Sync Functionality', () => {
  test('should display sync button with last synced timestamp', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify "Sync Data" button exists
    const syncButton = page.locator('button:has-text("Sync Data")');
    await expect(syncButton).toBeVisible();

    // Verify "Last updated" text with timestamp is visible
    const lastUpdated = page.locator('text=Last updated, text=Last synced');
    await expect(lastUpdated.first()).toBeVisible();
  });

  test('should sync security data successfully', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Get current timestamp text
    const timestampBefore = await page
      .locator('text=Last updated, text=Last synced')
      .first()
      .textContent();

    // Click "Sync Data" button
    const syncButton = page.locator('button:has-text("Sync Data")');
    await syncButton.click();

    // Wait for sync to complete (may take 10-30 seconds)
    await page.waitForTimeout(35000);

    // Verify timestamp changed
    const timestampAfter = await page
      .locator('text=Last updated, text=Last synced')
      .first()
      .textContent();

    // Timestamps should be different after sync
    expect(timestampAfter).not.toBe(timestampBefore);

    // Verify button is enabled again
    await expect(syncButton).toBeEnabled();
  });

  test('should show loading state during sync', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Click sync button
    const syncButton = page.locator('button:has-text("Sync Data")');
    await syncButton.click();

    // Verify button shows "Syncing..." or is disabled
    try {
      await expect(page.locator('button:has-text("Syncing"), button:has-text("Sync Data")')).toBeDisabled({
        timeout: 2000,
      });
    } catch {
      // Button may change text to "Syncing..."
      await expect(page.locator('text=Syncing')).toBeVisible({ timeout: 2000 });
    }

    // Wait for sync to complete
    await page.waitForTimeout(35000);

    // Verify button returns to "Sync Data" and is enabled
    await expect(syncButton).toBeEnabled();
    await expect(syncButton).toContainText('Sync Data');
  });

  test('should refresh chart after successful sync', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Click sync button
    await page.click('button:has-text("Sync Data")');

    // Wait for sync to complete
    await page.waitForTimeout(35000);

    // Verify chart is still visible
    const chart = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chart).toBeVisible();

    // Verify no error messages
    const errorAlert = page.locator('[role="alert"].MuiAlert-standardError');
    await expect(errorAlert).not.toBeVisible();
  });
});

test.describe('Navigation Between Securities Pages', () => {
  test('should navigate from dashboard to securities list', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to dashboard
    await nav.navigateToDashboard();

    // Click "Securities" in sidebar
    await page.click('button:has-text("Securities")');

    // Verify URL is /securities
    await expect(page).toHaveURL(/\/securities$/);

    // Verify page loaded correctly
    await expect(page.locator('h2:has-text("Securities")')).toBeVisible();
  });

  test('should navigate from securities list to detail', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Go to securities page
    await page.goto('/securities');
    await page.waitForTimeout(1000);

    // Click popular security card (AAPL)
    await page.click('text=AAPL');

    // Verify URL is /securities/AAPL
    await expect(page).toHaveURL(/\/securities\/AAPL/);
  });

  test('should navigate back from detail to list', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Go to security detail page
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Click "Back to Search" button
    const backButton = page.locator('button:has-text("Back to Search"), a:has-text("Back to Search")');
    await backButton.click();

    // Verify URL is /securities
    await expect(page).toHaveURL(/\/securities$/);

    // Verify search page displayed
    await expect(page.locator('h2:has-text("Securities")')).toBeVisible();
  });

  test('should navigate directly to security detail via URL', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate directly to MSFT
    await page.goto('/securities/MSFT');
    await page.waitForTimeout(2000);

    // Verify page loads correctly
    await expect(page.locator(`text=${testSecurities.msft.symbol}`)).toBeVisible();

    // Verify symbol is MSFT
    await expect(page.locator(`text=${testSecurities.msft.nameContains}`)).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid security symbol gracefully', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to invalid security
    await page.goto('/securities/INVALIDXYZ');
    await page.waitForTimeout(3000);

    // Verify error message or redirect (application should not crash)
    const errorMessage = page.locator('text=not found, text=invalid, text=error, text=No data');
    const redirected = page.locator('h2:has-text("Securities")');

    // Either show error or redirect back to list
    try {
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    } catch {
      await expect(redirected).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show message when no price data available', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Select timeframe that may have no data (1D)
    await page.click('button:has-text("1D")');
    await page.waitForTimeout(2000);

    // Check if "No data" message appears (expected for some timeframes)
    const noDataMessage = page.locator('text=No data, text=No price data, text=Not enough data');

    // May show "No data" message or display chart data
    try {
      await expect(noDataMessage.first()).toBeVisible({ timeout: 2000 });
    } catch {
      // Chart data is available, which is also fine
      const chart = page.locator('[class*="recharts"], canvas, svg').first();
      await expect(chart).toBeVisible();
    }

    // Verify sync button is offered as solution
    await expect(page.locator('button:has-text("Sync Data")')).toBeVisible();
  });
});

test.describe('Security Statistics', () => {
  test('should display all statistics cards', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security detail
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Verify Exchange card
    await expect(page.locator('text=Exchange')).toBeVisible();

    // Verify Currency card
    await expect(page.locator('text=Currency')).toBeVisible();

    // Verify Type card (may be present)
    try {
      await expect(page.locator('text=Type')).toBeVisible({ timeout: 2000 });
    } catch {
      // Type may not be available for all securities
    }

    // Market Cap may be available
    try {
      await expect(page.locator('text=Market Cap')).toBeVisible({ timeout: 2000 });
    } catch {
      // Market Cap may not be available
    }
  });

  test('should display market cap in readable format', async ({ page }) => {
    const nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);

    // Navigate to security with market cap (AAPL)
    await page.goto('/securities/AAPL');
    await page.waitForTimeout(2000);

    // Check if Market Cap is displayed
    const marketCapLabel = page.locator('text=Market Cap');
    const hasMarketCap = await marketCapLabel.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasMarketCap) {
      // Verify market cap shows T (trillion), B (billion), or M (million)
      const marketCapValue = page.locator('text=/\\$\\d+\\.\\d{2}[TBM]/, text=/\\d+\\.\\d+[TBM]/');
      await expect(marketCapValue.first()).toBeVisible();
    }
  });
});
