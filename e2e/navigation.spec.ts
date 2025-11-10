import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';
import { NavigationHelper } from './helpers/navigation';

test.describe('Navigation', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);
  });

  test('should display main navigation sections', async ({ page }) => {
    await expect(page.locator('text=OVERVIEW')).toBeVisible();
    await expect(page.locator('text=PORTFOLIO')).toBeVisible();
    await expect(page.locator('text=PLANNING')).toBeVisible();
    await expect(page.locator('text=ACCOUNT')).toBeVisible();
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await nav.navigateToDashboard();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
  });

  test('should navigate to Accounts', async ({ page }) => {
    await nav.navigateToAccounts();
    await expect(page.locator('h2:has-text("Account Management")')).toBeVisible();
  });

  test('should navigate to Holdings', async ({ page }) => {
    await nav.navigateToHoldings();
    await expect(page.locator('h2:has-text("Portfolio Holdings")')).toBeVisible();
  });

  test('should navigate to Rebalancing', async ({ page }) => {
    await nav.navigateToRebalancing();
    await expect(page.locator('h2:has-text("Portfolio Rebalancing")')).toBeVisible();
  });

  test('should navigate to Expenses', async ({ page }) => {
    await nav.navigateToExpenses();
    await expect(page.locator('h2:has-text("Recurring Expenses")')).toBeVisible();
  });

  test('should navigate to Income', async ({ page }) => {
    await nav.navigateToIncome();
    await expect(page.locator('h2:has-text("Recurring Income")')).toBeVisible();
  });

  test('should navigate to Goals', async ({ page }) => {
    await nav.navigateToGoals();
    await expect(page.locator('h2:has-text("Financial Goals")')).toBeVisible();
  });

  test('should navigate to Settings', async ({ page }) => {
    await nav.navigateToSettings();
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();
  });

  test('should display user profile in header', async ({ page }) => {
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
  });

  test('should have collapse sidebar button', async ({ page }) => {
    const collapseButton = page.locator('button:has-text("Collapse")');
    await expect(collapseButton).toBeVisible();
  });

  test('should display Finance Manager branding', async ({ page }) => {
    await expect(page.locator('text=Finance Manager')).toBeVisible();
    await expect(page.locator('text=Manage your wealth')).toBeVisible();
  });
});
