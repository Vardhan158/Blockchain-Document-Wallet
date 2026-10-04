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
 * Requires Fingerprint / Biometric authentication on every app launch.
 */
export const tokenStorage = {
  /**
   * Securely saves access token & refresh token in Keystore protected by Biometrics.
   */
  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    const tokenPayload = JSON.stringify({
      accessToken,
      refreshToken: refreshToken || '',
    });

    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    } catch (_) {}

    try {
      // Save in hardware Keystore protected by Biometrics
      await Keychain.setGenericPassword('vault_session', tokenPayload, {
        service: SERVICE_NAME,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        storage: Keychain.STORAGE_TYPE.AES_GCM,
      });
    } catch (e1) {
      console.warn('Biometric save with BIOMETRY_ANY failed, trying BIOMETRY_ANY_OR_DEVICE_PASSCODE:', e1);
      try {
        await Keychain.setGenericPassword('vault_session', tokenPayload, {
          service: SERVICE_NAME,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          storage: Keychain.STORAGE_TYPE.AES_GCM,
        });
      } catch (e2) {
        console.warn('Biometric secure storage is unavailable:', e2);
        throw new Error('A fingerprint or device screen lock is required to secure this wallet.');
      }
    }

    unlockedSession = { accessToken, refreshToken: refreshToken || null };
    await AsyncStorage.setItem('has_logged_in_before', 'true');
  },

  /**
   * Securely retrieves tokens.
   * When forcePrompt is true (default on app startup), it clears the in-memory cache
   * and forces the native Fingerprint / Biometric dialog to appear.
   */
  async getTokens(forcePrompt = false): Promise<StoredTokens> {
    if (!forcePrompt && unlockedSession) {
      return unlockedSession;
    }

    // Force clearing in-memory session to ensure fresh biometric verification
    unlockedSession = null;

    const authPrompt = {
      title: 'Unlock Blockchain Wallet',
      subtitle: 'Touch fingerprint sensor',
      description: 'Use your fingerprint or phone unlock to open your wallet.',
      cancel: 'Cancel',
    };

    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
        // This is required by Android's Keychain bridge to configure the
        // native BiometricPrompt as a biometric-gated read, rather than only
        // providing the prompt's display text.
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        authenticationPrompt: authPrompt,
      });

      if (credentials && credentials.password) {
        // Upgrade legacy non-biometric storage (KeystoreAESGCM_NoAuth) to Biometric storage
        if (credentials.storage === Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH || (credentials.storage as string) === 'KeystoreAESGCM_NoAuth') {
          try {
            await Keychain.setGenericPassword('vault_session', credentials.password, {
              service: SERVICE_NAME,
              accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
              accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
              storage: Keychain.STORAGE_TYPE.AES_GCM,
            });
            // The legacy entry was readable without a biometric prompt. Read
            // the newly protected entry again so Android displays its native
            // "Unlock Blockchain Wallet" dialog before Home is opened.
            return tokenStorage.getTokens(true);
          } catch (error) {
            console.warn('Unable to upgrade the legacy session to biometric protection:', error);
            return { accessToken: null, refreshToken: null };
          }
        }

        const parsed = JSON.parse(credentials.password);
        unlockedSession = {
          accessToken: parsed.accessToken || null,
          refreshToken: parsed.refreshToken || null,
        };
        return unlockedSession;
      }
    } catch (e) {
      console.warn('Biometric session unlock failed or cancelled:', e);
    }

    return {
      accessToken: null,
      refreshToken: null,
    };
  },

  /**
   * Clears in-memory session cache so the next access requires fresh Biometric verification.
   */
  lockSession(): void {
    unlockedSession = null;
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
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_refresh_token');
  },
};

export default tokenStorage;
