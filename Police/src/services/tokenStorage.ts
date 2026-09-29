import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAME = 'com.police.security.tokens';

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * SECTION 17: SECURE TOKEN STORAGE SERVICE USING REACT NATIVE KEYCHAIN
 * Uses Android Keystore / iOS Keychain hardware-backed encryption.
 * Never stores authentication tokens as plain unencrypted values in AsyncStorage.
 */
export const tokenStorage = {
  /**
   * Securely saves 15m Access Token & 7d Refresh Token in Keychain
   */
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const tokenPayload = JSON.stringify({
        accessToken,
        refreshToken: refreshToken || '',
      });

      await Keychain.setGenericPassword('officer_session', tokenPayload, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });

      await AsyncStorage.setItem('officer_access_active', 'true');
    } catch (e) {
      console.warn('Keychain storage error in Police App:', e);
      await AsyncStorage.setItem('officer_access_active', 'true');
    }
  },

  /**
   * Securely retrieves Access Token and Refresh Token from Keychain
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
      console.warn('Keychain read error in Police App:', e);
    }

    return {
      accessToken: null,
      refreshToken: null,
    };
  },

  /**
   * Securely clears all sensitive tokens upon officer logout or token revocation
   */
  async clearTokens(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    } catch (e) {
      console.warn('Keychain reset error in Police App:', e);
    }
    await AsyncStorage.removeItem('officer_access_active');
    await AsyncStorage.removeItem('officer_data');
    await AsyncStorage.removeItem('police_document_preview_cache');
    await AsyncStorage.removeItem('police_citizen_cache');
  },
};

export default tokenStorage;
