/**
 * Test data for authentication E2E tests
 */

/**
 * Generate unique test user data with timestamps to avoid conflicts
 */
export const generateUniqueTestUser = () => {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'TestPassword123!',
  };
};

/**
 * Test data for validation scenarios
 */
export const validationTestData = {
  // Valid data
  validEmail: 'valid.email@example.com',
  validUsername: 'validuser',
  validPassword: 'ValidPass123!',

  // Invalid emails
  invalidEmails: [
    'notanemail',
    '@example.com',
    'user@',
    'user@.com',
    'user @example.com',
  ],

  // Short passwords (< 8 chars)
  shortPasswords: ['short', 'pass', '1234567'],

  // Short usernames (< 3 chars)
  shortUsernames: ['ab', 'x', '12'],

  // Mismatched passwords
  password: 'Password123!',
  mismatchedConfirm: 'DifferentPass123!',
};

/**
 * Test reset token for reset password tests
 */
export const resetPasswordTestData = {
  validToken: 'test-reset-token-12345',
  invalidToken: 'invalid-token',
  newPassword: 'NewSecurePassword123!',
};

/**
 * API error messages (from backend)
 */
export const apiErrorMessages = {
  duplicateUsername: 'Username already exists',
  duplicateEmail: 'Email already exists',
  invalidCredentials: 'Invalid credentials',
  userNotFound: 'User not found',
  invalidToken: 'Invalid or expired token',
};
