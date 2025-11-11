/**
 * Authentication API service
 *
 * Provides methods for user authentication, registration, and password management.
 * Handles OAuth2 password flow for login and JWT token management.
 * Uses the standardized BaseService pattern for consistent API interactions.
 */

import { BaseService } from './BaseService';
import type {
  LoginCredentials,
  RegisterData,
  TokenResponse,
  User,
} from '@/types';

/**
 * Service class for authentication-related API operations.
 * Handles login, registration, password reset, and user profile management.
 */
class AuthService extends BaseService {
  constructor() {
    super('auth');
  }

  /**
   * Login user and get JWT tokens.
   * Note: Backend expects application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
   *
   * @param credentials - Login credentials (username/email and password)
   * @returns Promise resolving to token response with access and refresh tokens
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.client.postForm<TokenResponse>(
      this.buildEndpoint('login/tokens'),
      formData
    );
  }

  /**
   * Register a new user.
   * @param data - Registration data (email, username, password)
   * @returns Promise resolving to created user object
   */
  async register(data: RegisterData): Promise<User> {
    return this.client.post<User, RegisterData>(
      this.buildEndpoint('register'),
      data
    );
  }

  /**
   * Request password reset email.
   * Sends email with reset token to user's registered email address.
   *
   * @param email - User's email address
   * @returns Promise resolving to success message
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }, { email: string }>(
      this.buildEndpoint('forgot-password'),
      { email }
    );
  }

  /**
   * Reset password with token.
   * Completes password reset flow using token from email.
   *
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @returns Promise resolving to success message
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }, { token: string; new_password: string }>(
      this.buildEndpoint('reset-password'),
      { token, new_password: newPassword }
    );
  }

  /**
   * Get current authenticated user profile.
   * Requires valid JWT token in Authorization header.
   *
   * @returns Promise resolving to current user object
   */
  async getCurrentUser(): Promise<User> {
    return this.client.get<User>(this.buildEndpoint('me'));
  }
}

/**
 * Global auth service instance.
 * Use this singleton for all authentication-related API calls.
 */
export const authService = new AuthService();

// Export individual methods for backward compatibility with existing code
// This allows gradual migration from function-based to class-based service usage
// Bind methods to avoid unbound method warnings
export const login = authService.login.bind(authService);
export const register = authService.register.bind(authService);
export const forgotPassword = authService.forgotPassword.bind(authService);
export const resetPassword = authService.resetPassword.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);
