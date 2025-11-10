import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');

    // Check for login page elements
    await expect(page.locator('h4')).toContainText('Welcome back');
    await expect(page.locator('text=Log in to your Finance Manager account')).toBeVisible();
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');

    // Fill in credentials
    await page.fill('input[type="text"], input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Click login button
    await page.click('button:has-text("Log in")');

    // Wait for dashboard
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Verify we're on the dashboard
    await expect(page.locator('h2')).toContainText('Dashboard');
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should show remember me checkbox', async ({ page }) => {
    await page.goto('/');

    const rememberMe = page.locator('input[type="checkbox"]');
    await expect(rememberMe).toBeVisible();
    await expect(page.locator('text=Remember me for 30 days')).toBeVisible();
  });

  test('should have forgot password button', async ({ page }) => {
    await page.goto('/');

    const forgotPasswordButton = page.locator('button:has-text("Forgot password?")');
    await expect(forgotPasswordButton).toBeVisible();
  });

  test('should have social login options', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Or continue with')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
  });

  test('should have sign up link', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
    await expect(page.locator('button:has-text("Sign up")')).toBeVisible();
  });
});
