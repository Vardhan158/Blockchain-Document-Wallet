import React, { useState } from 'react';
import { MainTabNavigator } from './MainTabNavigator';
import { AppLockScreen } from '../components/AppLockScreen';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Renders Home first, then places the native biometric gate over it. This
 * gives the same visual sequence as a wallet app: splash -> Home -> biometric
 * prompt, without exposing usable dashboard controls before authentication.
 */
export const SecureMainNavigator: React.FC = () => {
  const token = useAuthStore(state => state.token);
  const [isLocked, setIsLocked] = useState(!token);

  return (
    <>
      <MainTabNavigator />
      {isLocked ? <AppLockScreen onUnlocked={() => setIsLocked(false)} /> : null}
    </>
  );
};

export default SecureMainNavigator;
