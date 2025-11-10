/**
 * Authentication API service
 */

import type {
  LoginCredentials,
  RegisterData,
  TokenResponse,
  User,
} from '@/types';
import { apiClient, apiClientFormData } from './api';

/**
 * Login user and get tokens
 * Note: Backend expects application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
 */
export const login = async (
  credentials: LoginCredentials
): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  return apiClientFormData<TokenResponse>('/auth/login/tokens', formData);
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<User> => {
  return apiClient<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Request password reset email
 */
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiClient<User>('/auth/me');
};
