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
    // Store user data locally for fallback
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
  identifier: string,
  password: string,
  loginType: 'email' | 'phone' = 'email'
): Promise<{ success: boolean; error?: string }> {
  try {
    const credentials: any = {
      password,
      loginType,
    };

    // Set the appropriate field based on login type
    if (loginType === 'email') {
      credentials.email = identifier;
    } else {
      credentials.phone = identifier;
    }

    const result = await signIn('credentials', {
      redirect: false,
      ...credentials,
    });

    if (result?.error) {
      return {
        success: false,
        error:
          loginType === 'email'
            ? 'Invalid email or password. Please try again.'
            : 'Invalid phone or password. Please try again.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}
