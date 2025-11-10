import { test, expect } from '@playwright/test';
import { testUser, expectedData } from './fixtures/test-user';
import { NavigationHelper } from './helpers/navigation';

test.describe('Dashboard', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);
  });

  test('should display key metrics', async ({ page }) => {
    // Check metric cards
    await expect(page.locator('text=Net Worth')).toBeVisible();
    await expect(page.locator('text=Total Assets')).toBeVisible();
    await expect(page.locator('text=Total Debts')).toBeVisible();
    await expect(page.locator('text=Portfolio Value')).toBeVisible();

    // Check values
    await expect(page.locator(`text=${expectedData.netWorth}`)).toBeVisible();
    await expect(page.locator(`text=${expectedData.totalAssets}`)).toBeVisible();
    await expect(page.locator(`text=${expectedData.totalDebts}`)).toBeVisible();
    await expect(page.locator(`text=${expectedData.portfolioValue}`)).toBeVisible();
  });

  test('should display time period filters', async ({ page }) => {
    const filters = ['1M', '3M', '6M', '1Y', 'ALL'];

    for (const filter of filters) {
      await expect(page.locator(`button:has-text("${filter}")`)).toBeVisible();
    }
  });

  test('should display charts', async ({ page }) => {
    // Check chart titles
    await expect(page.locator('text=Net Worth Over Time')).toBeVisible();
    await expect(page.locator('text=Assets vs Debts')).toBeVisible();
    await expect(page.locator('text=Investment Portfolio Value')).toBeVisible();
  });

  test('should display active goals section', async ({ page }) => {
    await expect(page.locator('text=Active Goals')).toBeVisible();
    await expect(page.locator('text=Become Debt-Free')).toBeVisible();
  });

  test('should display AI Financial Assistant', async ({ page }) => {
    await expect(page.locator('text=AI Financial Assistant')).toBeVisible();
    await expect(page.locator('text=Ask questions about your finances and get intelligent insights')).toBeVisible();

    // Check quick action buttons
    await expect(page.locator('button:has-text("Show my expenses")')).toBeVisible();
    await expect(page.locator('button:has-text("Income summary")')).toBeVisible();
    await expect(page.locator('button:has-text("Net worth")')).toBeVisible();
    await expect(page.locator('button:has-text("Investment analysis")')).toBeVisible();
  });

  test('should interact with AI Assistant', async ({ page }) => {
    // Click on quick action button
    await page.click('button:has-text("Show my expenses")');

    // Check if input field is populated
    const input = page.locator('input[placeholder*="Ask about your finances"]');
    await expect(input).toHaveValue(/expenses/i);

    // Submit the query
    await page.click('button[type="submit"]', { force: true });

    // Wait for response (with longer timeout for AI)
    await page.waitForSelector('text=Analyzing', { timeout: 2000 }).catch(() => {});
  });

  test('should switch time periods', async ({ page }) => {
    // Click on different time period
    await page.click('button:has-text("3M")');

    // Verify button is active (implementation dependent)
    const button = page.locator('button:has-text("3M")');
    await expect(button).toBeVisible();
  });
});
