import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  onUnlocked: () => void;
}

/** Full-screen lock shown whenever a signed-in wallet returns from background. */
export const AppLockScreen: React.FC<Props> = ({ onUnlocked }) => {
  const initAuth = useAuthStore(state => state.initAuth);
  const [isUnlocking, setIsUnlocking] = useState(true);

  const unlock = useCallback(async () => {
    setIsUnlocking(true);
    const unlocked = await initAuth();
    setIsUnlocking(false);
    if (unlocked) onUnlocked();
  }, [initAuth, onUnlocked]);

  useEffect(() => {
    unlock();
  }, [unlock]);

  return (
    <View style={tw`absolute inset-0 z-50 bg-slate-900 justify-center items-center px-7`}>
      <Text style={tw`text-3xl mb-4`}>🔒</Text>
      <Text style={tw`text-xl font-black text-white text-center`}>Wallet Locked</Text>
      <Text style={tw`text-sm text-slate-400 text-center mt-3 mb-7`}>
        Use your fingerprint to continue to Home.
      </Text>
      {isUnlocking ? (
        <ActivityIndicator color="#818CF8" />
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Unlock wallet with fingerprint"
          onPress={unlock}
          style={tw`bg-indigo-600 rounded-xl px-6 py-3`}>
          <Text style={tw`text-white font-extrabold text-sm`}>UNLOCK WITH FINGERPRINT</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AppLockScreen;
