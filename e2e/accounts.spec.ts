import { test, expect } from '@playwright/test';
import { testUser, expectedData } from './fixtures/test-user';
import { NavigationHelper } from './helpers/navigation';

test.describe('Accounts Management', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);
    await nav.navigateToAccounts();
  });

  test('should display accounts page', async ({ page }) => {
    await expect(page.locator('h2:has-text("Account Management")')).toBeVisible();
    await expect(page.locator('text=Track and manage all your financial accounts')).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.locator('text=Total Assets')).toBeVisible();
    await expect(page.locator('text=Total Liabilities')).toBeVisible();
    await expect(page.locator('text=Total Investments')).toBeVisible();

    // Check values
    await expect(page.locator(`text=${expectedData.accounts.totalAssets}`)).toBeVisible();
    await expect(page.locator(`text=${expectedData.accounts.totalLiabilities}`)).toBeVisible();
    await expect(page.locator(`text=${expectedData.accounts.totalInvestments}`)).toBeVisible();
  });

  test('should display asset accounts', async ({ page }) => {
    await expect(page.locator('text=Asset Accounts')).toBeVisible();
    await expect(page.locator('text=Checking, savings, and cash accounts')).toBeVisible();
    await expect(page.locator('text=Primary Checking')).toBeVisible();
    await expect(page.locator('text=High Yield Savings')).toBeVisible();
  });

  test('should display liability accounts', async ({ page }) => {
    await expect(page.locator('text=Liability Accounts')).toBeVisible();
    await expect(page.locator('text=Credit cards, loans, and debts')).toBeVisible();
    await expect(page.locator('text=Chase Credit Card')).toBeVisible();
    await expect(page.locator('text=Car Loan')).toBeVisible();
  });

  test('should display investment accounts', async ({ page }) => {
    await expect(page.locator('text=Investment Accounts')).toBeVisible();
    await expect(page.locator('text=Brokerage and retirement accounts')).toBeVisible();
    await expect(page.locator('text=Vanguard Brokerage')).toBeVisible();
    await expect(page.locator('text=401(k)')).toBeVisible();
  });

  test('should have add account button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Account")');
    await expect(addButton).toBeVisible();
  });

  test('should display account balances and changes', async ({ page }) => {
    // Check for percentage changes
    await expect(page.locator('text=%').first()).toBeVisible();

    // Check for edit buttons on accounts
    const editButtons = page.locator('button[aria-label*="edit"], button >> svg');
    await expect(editButtons.first()).toBeVisible();
  });
});
