import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAME = 'com.blockchainwallet.security.tokens';
let unlockedSession: StoredTokens | null = null;

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Secure Token Storage Service using React Native Keychain (Android Keystore / iOS Keychain).
 * A saved session is protected by the currently enrolled biometric set, so reopening
 * the wallet requires the phone's native fingerprint/biometric prompt.
 */
export const tokenStorage = {
  /**
   * Securely saves access token and refresh token in hardware-backed Keychain / Keystore.
 * BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE invalidates the token if enrolled
 * biometrics change, while retaining the phone lock-code fallback.
   */
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const tokenPayload = JSON.stringify({
        accessToken,
        refreshToken: refreshToken || '',
      });

      await Keychain.setGenericPassword('vault_session', tokenPayload, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        authenticationPrompt: {
          title: 'Enable biometric sign-in',
          subtitle: 'Protect your Blockchain Wallet session',
          description: 'Use your fingerprint, enrolled biometric, or device lock to unlock the wallet.',
          cancel: 'Use password',
        },
      });

      unlockedSession = { accessToken, refreshToken: refreshToken || null };
      // Remove legacy unprotected token copies after the protected item is saved.
      await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token']);
    } catch (e) {
      // Do not save tokens in AsyncStorage: that would bypass biometric protection.
      console.warn('Unable to save biometric-protected session', e);
      throw e;
    }
  },

  /**
   * Securely retrieves access token and refresh token from Keychain
   */
  async getTokens(): Promise<StoredTokens> {
    if (unlockedSession) return unlockedSession;

    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
        authenticationPrompt: {
          title: 'Unlock Blockchain Wallet',
          subtitle: 'Sign in with your fingerprint',
          description: 'Use your fingerprint, enrolled biometric, or device lock to access your saved wallet session.',
          cancel: 'Use password',
        },
      });

      if (credentials && credentials.password) {
        const parsed = JSON.parse(credentials.password);
        unlockedSession = {
          accessToken: parsed.accessToken || null,
          refreshToken: parsed.refreshToken || null,
        };
        return unlockedSession;
      }
    } catch (e) {
      // Cancellation or a biometric mismatch returns the user to password login.
      console.warn('Biometric session unlock was not completed', e);
    }

    return {
      accessToken: null,
      refreshToken: null,
    };
  },

  /**
   * Securely clears all sensitive tokens upon logout or token revocation
   */
  async clearTokens(): Promise<void> {
    unlockedSession = null;
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    } catch (e) {
      console.warn('Keychain reset error:', e);
    }
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_refresh_token');
    await AsyncStorage.removeItem('auth_user');
  },
};

export default tokenStorage;
