import { test, expect } from '@playwright/test';
import { testUser, expectedData } from './fixtures/test-user';
import { NavigationHelper } from './helpers/navigation';

test.describe('Expenses Management', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.login(testUser.email, testUser.password);
    await nav.navigateToExpenses();
  });

  test('should display expenses page', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recurring Expenses")')).toBeVisible();
    await expect(page.locator('text=Manage your recurring expenses and track spending patterns')).toBeVisible();
  });

  test('should display total monthly expenses', async ({ page }) => {
    await expect(page.locator('text=Total Monthly Expenses')).toBeVisible();
    await expect(page.locator(`text=${expectedData.expenses.totalMonthly}`)).toBeVisible();
  });

  test('should display expense charts', async ({ page }) => {
    await expect(page.locator('text=Expenses Over Time')).toBeVisible();
    await expect(page.locator('text=Expense Categories')).toBeVisible();
    await expect(page.locator('text=Expenses by Category Over Time')).toBeVisible();
  });

  test('should display expense list', async ({ page }) => {
    await expect(page.locator('text=Expense List')).toBeVisible();

    // Check for common expenses
    await expect(page.locator('text=Rent/Mortgage')).toBeVisible();
    await expect(page.locator('text=Car Payment')).toBeVisible();
    await expect(page.locator('text=Groceries')).toBeVisible();
  });

  test('should have search and filters', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search expenses"]')).toBeVisible();
    await expect(page.locator('text=All Categories')).toBeVisible();
    await expect(page.locator('text=All Frequencies')).toBeVisible();
  });

  test('should have add expense button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Expense")');
    await expect(addButton).toBeVisible();
  });

  test('should display expense categories', async ({ page }) => {
    // Common expense categories
    await expect(page.locator('text=Housing')).toBeVisible();
    await expect(page.locator('text=Transportation')).toBeVisible();
    await expect(page.locator('text=Food')).toBeVisible();
    await expect(page.locator('text=Utilities')).toBeVisible();
  });
});
