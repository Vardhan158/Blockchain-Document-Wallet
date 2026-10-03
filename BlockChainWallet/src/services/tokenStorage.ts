import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAME = 'com.blockchainwallet.security.tokens';
let unlockedSession: StoredTokens | null = null;

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Hardware-backed Token Storage Service using React Native Keychain.
 * Automatically saves session upon registration / login and prompts for
 * fingerprint/biometrics on subsequent app launches to bypass login.
 */
export const tokenStorage = {
  /**
   * Securely saves access token & refresh token in Keystore.
   */
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    const tokenPayload = JSON.stringify({
      accessToken,
      refreshToken: refreshToken || '',
    });

    // Do not fall back to an unprotected Keychain entry here. A returning
    // wallet must be unlocked with the device biometric (or its configured
    // device passcode), rather than silently entering Home without a prompt.
    await Keychain.setGenericPassword('vault_session', tokenPayload, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    });

    unlockedSession = { accessToken, refreshToken: refreshToken || null };
    await AsyncStorage.setItem('has_logged_in_before', 'true');
  },

  /**
   * Securely retrieves tokens and prompts for Fingerprint / Biometric authentication.
   */
  async getTokens(): Promise<StoredTokens> {
    if (unlockedSession) return unlockedSession;

    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
        authenticationPrompt: {
          title: 'Unlock Blockchain Wallet',
          subtitle: 'Touch fingerprint sensor',
          description: 'Use your fingerprint, enrolled biometric, or phone unlock to open your wallet.',
          cancel: 'Use Password',
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
      console.warn('Biometric session unlock skipped or cancelled', e);
    }

    // Fallback check for session tokens in AsyncStorage if Keychain is empty
    try {
      const legacyToken = await AsyncStorage.getItem('auth_token');
      const legacyRefresh = await AsyncStorage.getItem('auth_refresh_token');
      if (legacyToken) {
        unlockedSession = {
          accessToken: legacyToken,
          refreshToken: legacyRefresh || null,
        };
        return unlockedSession;
      }
    } catch (e) {}

    return {
      accessToken: null,
      refreshToken: null,
    };
  },

  /**
   * Clears saved tokens on user logout.
   */
  async clearTokens(): Promise<void> {
    unlockedSession = null;
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    } catch (e) {
      console.warn('Keychain reset error:', e);
    }
    await AsyncStorage.removeItem('has_logged_in_before');
    await AsyncStorage.removeItem('auth_user');
  },
};

export default tokenStorage;
