import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';
import { NavigationHelper } from './helpers/navigation';

test.describe('Portfolio Holdings', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);
    await nav.navigateToHoldings();
  });

  test('should display holdings page', async ({ page }) => {
    await expect(page.locator('h2:has-text("Portfolio Holdings")')).toBeVisible();
    await expect(page.locator('text=Track investment positions and performance across all accounts')).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Total Cost Basis')).toBeVisible();
    await expect(page.locator('text=Total Gain/Loss')).toBeVisible();
  });

  test('should have tabs', async ({ page }) => {
    await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Performance")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Charts")')).toBeVisible();
  });

  test('should display holdings in overview tab', async ({ page }) => {
    // Check for common holdings
    await expect(page.locator('text=VTI')).toBeVisible();
    await expect(page.locator('text=VXUS')).toBeVisible();
    await expect(page.locator('text=BND')).toBeVisible();

    // Check table headers
    await expect(page.locator('text=Symbol')).toBeVisible();
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Quantity')).toBeVisible();
    await expect(page.locator('text=Market Value')).toBeVisible();
    await expect(page.locator('text=Gain/Loss')).toBeVisible();
  });

  test('should switch to performance tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Performance")');

    // Check for performance timeframes
    await expect(page.locator('text=1 Day')).toBeVisible();
    await expect(page.locator('text=1 Week')).toBeVisible();
    await expect(page.locator('text=1 Month')).toBeVisible();
    await expect(page.locator('text=1 Year')).toBeVisible();
  });

  test('should switch to charts tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Charts")');

    // Check for chart sections
    await expect(page.locator('text=Portfolio Allocation')).toBeVisible();
    await expect(page.locator('text=Gain/Loss by Holding')).toBeVisible();
  });

  test('should have add holding button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Holding")');
    await expect(addButton).toBeVisible();
  });
});
