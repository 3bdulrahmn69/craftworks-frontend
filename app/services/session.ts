import { signIn } from 'next-auth/react';
import { tokenUtils, AuthResponse } from './auth';

/**
 * Creates a NextAuth session from authentication response data
 * This is used after successful registration to avoid duplicate API calls
 */
export async function createSessionFromAuthData(
  authData: AuthResponse
): Promise<boolean> {
  try {
    // Store token and user data locally first
    tokenUtils.setToken(authData.token);
    tokenUtils.setUserData(authData.user);

    // Create NextAuth session with the existing auth data
    const result = await signIn('credentials', {
      redirect: false,
      token: authData.token,
      userData: JSON.stringify(authData.user),
    });

    if (result?.error) {
      tokenUtils.clearAll();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to create session from auth data:', error);
    tokenUtils.clearAll();
    return false;
  }
}

/**
 * Login using NextAuth only (no duplicate API calls)
 */
export async function loginWithNextAuth(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      return {
        success: false,
        error: 'Invalid email or password. Please try again.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}
