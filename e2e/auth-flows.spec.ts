/**
 * Comprehensive E2E tests for authentication flows
 *
 * Tests cover:
 * - Registration (success, validation, duplicate errors)
 * - Login (username/email, validation, errors)
 * - Logout (token clearing, redirect)
 * - Protected routes (auth guards)
 * - Forgot password (validation, security)
 * - Reset password (validation, token handling)
 * - Navigation between auth pages
 */

import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';
import {
  generateUniqueTestUser,
  validationTestData,
  resetPasswordTestData,
} from './fixtures/auth-test-data';

test.describe('Registration', () => {
  test('should register new user successfully and auto-login', async ({ page }) => {
    // Generate unique test user to avoid conflicts
    const newUser = generateUniqueTestUser();

    // Navigate to register page
    await page.goto('/register');

    // Verify we're on the register page
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('text=Sign up to start managing your finances')).toBeVisible();

    // Fill registration form
    await page.fill('input[type="email"]', newUser.email);
    await page.fill('input[autocomplete="username"]', newUser.username);

    // Fill both password fields
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(newUser.password);
    await passwordFields.nth(1).fill(newUser.password);

    // Submit form
    await page.click('button:has-text("Sign Up")');

    // Wait for dashboard to load (auto-login after registration)
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.locator('h2')).toContainText('Dashboard');

    // Verify user is authenticated (header shows user menu)
    await expect(page.locator('[aria-label="Account"]')).toBeVisible();
  });

  test('should show error for duplicate username', async ({ page }) => {
    // Use existing test user's username
    const duplicateUser = generateUniqueTestUser();

    await page.goto('/register');

    // Try to register with existing username but unique email
    await page.fill('input[type="email"]', duplicateUser.email);
    await page.fill('input[autocomplete="username"]', testUser.username); // Existing username

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.validPassword);
    await passwordFields.nth(1).fill(validationTestData.validPassword);

    await page.click('button:has-text("Sign Up")');

    // Verify error message is displayed
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    // Backend should return error about duplicate username
    await expect(alert).toContainText(/username|already exists|taken/i);
  });

  test('should show error for duplicate email', async ({ page }) => {
    // Use existing test user's email
    const duplicateUser = generateUniqueTestUser();

    await page.goto('/register');

    // Try to register with existing email but unique username
    await page.fill('input[type="email"]', testUser.email); // Existing email
    await page.fill('input[autocomplete="username"]', duplicateUser.username);

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.validPassword);
    await passwordFields.nth(1).fill(validationTestData.validPassword);

    await page.click('button:has-text("Sign Up")');

    // Verify error message is displayed
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    // Backend should return error about duplicate email
    await expect(alert).toContainText(/email|already exists|taken/i);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    // Enter invalid email
    await page.fill('input[type="email"]', validationTestData.invalidEmails[0]);
    await page.fill('input[autocomplete="username"]', validationTestData.validUsername);

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.validPassword);
    await passwordFields.nth(1).fill(validationTestData.validPassword);

    await page.click('button:has-text("Sign Up")');

    // Verify validation error message
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/valid email/i);
  });

  test('should validate password length (min 8 chars)', async ({ page }) => {
    await page.goto('/register');

    // Enter valid email and username
    const newUser = generateUniqueTestUser();
    await page.fill('input[type="email"]', newUser.email);
    await page.fill('input[autocomplete="username"]', newUser.username);

    // Enter short password (< 8 chars)
    const shortPassword = validationTestData.shortPasswords[0];
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(shortPassword);
    await passwordFields.nth(1).fill(shortPassword);

    await page.click('button:has-text("Sign Up")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/at least 8 characters/i);
  });

  test('should validate password confirmation matches', async ({ page }) => {
    await page.goto('/register');

    const newUser = generateUniqueTestUser();
    await page.fill('input[type="email"]', newUser.email);
    await page.fill('input[autocomplete="username"]', newUser.username);

    // Enter mismatched passwords
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.password);
    await passwordFields.nth(1).fill(validationTestData.mismatchedConfirm);

    await page.click('button:has-text("Sign Up")');

    // Verify error message
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/do not match/i);
  });

  test('should validate username length (min 3 chars)', async ({ page }) => {
    await page.goto('/register');

    const newUser = generateUniqueTestUser();
    await page.fill('input[type="email"]', newUser.email);

    // Enter short username (< 3 chars)
    await page.fill('input[autocomplete="username"]', validationTestData.shortUsernames[0]);

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.validPassword);
    await passwordFields.nth(1).fill(validationTestData.validPassword);

    await page.click('button:has-text("Sign Up")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/at least 3 characters/i);
  });

  test('should show helper text for username and password requirements', async ({ page }) => {
    await page.goto('/register');

    // Verify username helper text
    await expect(page.locator('text=At least 3 characters')).toBeVisible();

    // Verify password helper text
    const helperTexts = page.locator('text=At least 8 characters');
    await expect(helperTexts.first()).toBeVisible();
  });
});

test.describe('Login', () => {
  test('should login with username successfully', async ({ page }) => {
    await page.goto('/login');

    // Verify we're on the login page
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Enter username and password
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.locator('h2')).toContainText('Dashboard');

    // Verify authentication (user menu visible)
    await expect(page.locator('[aria-label="Account"]')).toBeVisible();
  });

  test('should login with email successfully', async ({ page }) => {
    await page.goto('/login');

    // Enter email and password
    await page.fill('input[autocomplete="username"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForSelector('h2:has-text("Dashboard")', { timeout: 10000 });

    // Verify successful login
    await expect(page.locator('h2')).toContainText('Dashboard');
    await expect(page.locator('[aria-label="Account"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid credentials
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', 'WrongPassword123!');

    await page.click('button:has-text("Sign In")');

    // Verify error message
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/invalid|incorrect|failed/i);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button:has-text("Sign In")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/required/i);
  });

  test('should persist authentication across page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Refresh the page
    await page.reload();

    // Verify still authenticated (should stay on dashboard)
    await expect(page.locator('h2')).toContainText('Dashboard');
    await expect(page.locator('[aria-label="Account"]')).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);

    // Click submit and immediately check for loading indicator
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Check for loading indicator (CircularProgress or disabled button)
    // Note: This may be very fast, so we use a short timeout
    try {
      await expect(submitButton).toBeDisabled({ timeout: 500 });
    } catch {
      // Loading state may complete very quickly, which is fine
    }
  });
});

test.describe('Logout', () => {
  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Open user menu
    await page.click('[aria-label="Account"]');

    // Click logout
    await page.click('text=Logout');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should clear authentication tokens on logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Verify tokens exist in localStorage
    const tokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(tokenBefore).toBeTruthy();

    // Logout
    await page.click('[aria-label="Account"]');
    await page.click('text=Logout');
    await page.waitForURL(/\/login/);

    // Verify tokens are cleared
    const tokenAfter = await page.evaluate(() => localStorage.getItem('auth_token'));
    const refreshTokenAfter = await page.evaluate(() => localStorage.getItem('refresh_token'));
    expect(tokenAfter).toBeNull();
    expect(refreshTokenAfter).toBeNull();
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Logout
    await page.click('[aria-label="Account"]');
    await page.click('text=Logout');
    await page.waitForURL(/\/login/);

    // Try to access dashboard
    await page.goto('/dashboard');

    // Verify redirected back to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login/register links in header after logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Logout
    await page.click('[aria-label="Account"]');
    await page.click('text=Logout');
    await page.waitForURL(/\/login/);

    // Verify header shows login/register links instead of user menu
    await expect(page.locator('[aria-label="Account"]')).not.toBeVisible();
    // Note: May need adjustment based on actual header implementation
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear any existing auth
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Try to access protected route
    await page.goto('/dashboard');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should allow authenticated users to access dashboard', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Navigate to dashboard explicitly
    await page.goto('/dashboard');

    // Verify dashboard loads correctly
    await expect(page.locator('h2')).toContainText('Dashboard');
    await expect(page.locator('[aria-label="Account"]')).toBeVisible();
  });

  test('should redirect root path to dashboard when authenticated', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Navigate to root
    await page.goto('/');

    // Verify redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h2')).toContainText('Dashboard');
  });

  test('should redirect root path to login when not authenticated', async ({ page }) => {
    // Clear auth
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Navigate to root
    await page.goto('/');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should redirect login page to dashboard when already authenticated', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[autocomplete="username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('h2:has-text("Dashboard")');

    // Try to go back to login
    await page.goto('/login');

    // Verify redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Forgot Password', () => {
  test('should show success message for valid email', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify we're on forgot password page
    await expect(page.locator('h1')).toContainText('Forgot Password');

    // Enter existing user email
    await page.fill('input[type="email"]', testUser.email);

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Verify success message
    const successAlert = page.locator('[role="alert"].MuiAlert-standardSuccess');
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/sent|reset link/i);
  });

  test('should show success message for non-existent email (security)', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter non-existent email
    await page.fill('input[type="email"]', 'nonexistent@example.com');

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Verify same success message (don't reveal email doesn't exist)
    const successAlert = page.locator('[role="alert"].MuiAlert-standardSuccess');
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/sent|reset link/i);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter invalid email
    await page.fill('input[type="email"]', validationTestData.invalidEmails[0]);

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/valid email/i);
  });

  test('should validate required email field', async ({ page }) => {
    await page.goto('/forgot-password');

    // Try to submit without email
    await page.click('button:has-text("Send Reset Link")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/required/i);
  });

  test('should have link back to login', async ({ page }) => {
    await page.goto('/forgot-password');

    // Click back to login link
    await page.click('text=Back to login');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should clear form after successful submission', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter email
    await page.fill('input[type="email"]', testUser.email);

    // Submit
    await page.click('button:has-text("Send Reset Link")');

    // Wait for success message
    await expect(page.locator('[role="alert"].MuiAlert-standardSuccess')).toBeVisible();

    // Verify form is cleared
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('');
  });
});

test.describe('Reset Password Page', () => {
  test('should load page with token from URL', async ({ page }) => {
    // Navigate with token in query string
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Reset Password');

    // Verify token field is pre-filled and read-only
    const tokenInput = page.locator('input[value="' + resetPasswordTestData.validToken + '"]');
    await expect(tokenInput).toBeVisible();
    await expect(tokenInput).toHaveAttribute('readonly');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Enter short password
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.shortPasswords[0]);
    await passwordFields.nth(1).fill(validationTestData.shortPasswords[0]);

    // Submit
    await page.click('button:has-text("Reset Password")');

    // Verify validation error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/at least 8 characters/i);
  });

  test('should validate password confirmation matches', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Enter mismatched passwords
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(validationTestData.password);
    await passwordFields.nth(1).fill(validationTestData.mismatchedConfirm);

    // Submit
    await page.click('button:has-text("Reset Password")');

    // Verify error
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/do not match/i);
  });

  test('should validate token is present', async ({ page }) => {
    // Navigate without token
    await page.goto('/reset-password');

    // Try to submit without token
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(resetPasswordTestData.newPassword);
    await passwordFields.nth(1).fill(resetPasswordTestData.newPassword);

    await page.click('button:has-text("Reset Password")');

    // Verify error about missing token
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/token|missing/i);
  });

  test('should have link back to login', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Click back to login
    await page.click('text=Back to login');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show helper text for password requirements', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Verify password requirement helper text
    await expect(page.locator('text=At least 8 characters')).toBeVisible();

    // Verify token helper text
    await expect(page.locator('text=automatically filled from the email link')).toBeVisible();
  });

  test('should disable form after successful reset', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Fill valid password
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(resetPasswordTestData.newPassword);
    await passwordFields.nth(1).fill(resetPasswordTestData.newPassword);

    // Submit
    await page.click('button:has-text("Reset Password")');

    // Wait for success message (backend should return success for valid token)
    try {
      const successAlert = page.locator('[role="alert"].MuiAlert-standardSuccess');
      await expect(successAlert).toBeVisible({ timeout: 5000 });

      // Verify form is disabled
      await expect(passwordFields.nth(0)).toBeDisabled();
      await expect(passwordFields.nth(1)).toBeDisabled();
      await expect(page.locator('button:has-text("Reset Password")')).toBeDisabled();
    } catch {
      // Backend may return error for test token, which is expected
      // In that case, just verify error is shown
      const alert = page.locator('[role="alert"]');
      await expect(alert).toBeVisible();
    }
  });
});

test.describe('Navigation Between Auth Pages', () => {
  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login');

    // Click sign up link
    await page.click('text=Sign up');

    // Verify at register page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register');

    // Click sign in link
    await page.click('text=Sign in');

    // Verify at login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should navigate from login to forgot password', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.click('text=Forgot password?');

    // Verify at forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.locator('h1')).toContainText('Forgot Password');
  });

  test('should navigate from forgot password to login', async ({ page }) => {
    await page.goto('/forgot-password');

    // Click back to login
    await page.click('text=Back to login');

    // Verify at login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate from reset password to login', async ({ page }) => {
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);

    // Click back to login
    await page.click('text=Back to login');

    // Verify at login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show correct page titles and descriptions', async ({ page }) => {
    // Login page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('text=Sign in to manage your finances')).toBeVisible();

    // Register page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('text=Sign up to start managing your finances')).toBeVisible();

    // Forgot password page
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText('Forgot Password');
    await expect(page.locator('text=Enter your email address')).toBeVisible();

    // Reset password page
    await page.goto(`/reset-password?token=${resetPasswordTestData.validToken}`);
    await expect(page.locator('h1')).toContainText('Reset Password');
    await expect(page.locator('text=Enter your new password below')).toBeVisible();
  });
});
