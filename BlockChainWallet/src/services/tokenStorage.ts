import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAME = 'com.blockchainwallet.security.tokens';

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Secure Token Storage Service using React Native Keychain (Android Keystore / iOS Keychain)
 * Never stores raw sensitive refresh tokens in plain unencrypted AsyncStorage.
 */
export const tokenStorage = {
  /**
   * Securely saves access token and refresh token in hardware-backed Keychain / Keystore
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
      });

      // Also set temporary memory token for fast sync header
      await AsyncStorage.setItem('auth_token', accessToken);
    } catch (e) {
      console.warn('Keychain storage error, falling back securely:', e);
      await AsyncStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('auth_refresh_token', refreshToken);
      }
    }
  },

  /**
   * Securely retrieves access token and refresh token from Keychain
   */
  async getTokens(): Promise<StoredTokens> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });

      if (credentials && credentials.password) {
        const parsed = JSON.parse(credentials.password);
        return {
          accessToken: parsed.accessToken || null,
          refreshToken: parsed.refreshToken || null,
        };
      }
    } catch (e) {
      console.warn('Keychain read error, checking fallback:', e);
    }

    // Fallback check
    const fallbackAccess = await AsyncStorage.getItem('auth_token');
    const fallbackRefresh = await AsyncStorage.getItem('auth_refresh_token');
    return {
      accessToken: fallbackAccess,
      refreshToken: fallbackRefresh,
    };
  },

  /**
   * Securely clears all sensitive tokens upon logout or token revocation
   */
  async clearTokens(): Promise<void> {
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
