/**
 * Authentication validation schemas using Zod
 *
 * Provides validation for login, registration, password reset, and user management.
 * All schemas are TypeScript-strict mode compliant with exported types.
 */

import { z } from 'zod';

/**
 * Password validation rules
 * Enforces strong password requirements
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Email validation with proper format
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Username validation
 */
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .trim();

/**
 * Login Schema
 * Validates user login credentials
 * Username field accepts both username and email
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username or email is required')
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Registration Schema
 * Validates new user registration with password confirmation
 */
export const registerSchema = z.object({
  username: usernameSchema,

  email: emailSchema,

  password: passwordSchema,

  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

/**
 * Forgot Password Schema
 * Validates email for password reset request
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset Password Schema
 * Validates password reset with token and new password
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),

  password: passwordSchema,

  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

/**
 * Change Password Schema
 * Validates password change for authenticated users
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),

  newPassword: passwordSchema,

  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

/**
 * Update User Profile Schema
 * Validates user profile updates
 */
export const updateUserProfileSchema = z.object({
  email: emailSchema.optional(),

  username: usernameSchema.optional(),
}).refine(
  (data) => data.email !== undefined || data.username !== undefined,
  {
    message: 'At least one field must be provided',
  }
);

/**
 * Email Verification Schema
 * Validates email verification token
 */
export const emailVerificationSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
});

// Export TypeScript types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
