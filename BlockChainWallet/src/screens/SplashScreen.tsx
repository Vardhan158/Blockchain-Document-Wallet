import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    const checkAuthStatus = async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1200));
      // initAuth reads the session from the protected Keychain. For a
      // registered user this displays Android's fingerprint prompt while the
      // splash is still visible; Home is never shown until it succeeds.
      const isAuthenticated = await initAuth();

      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    };

    checkAuthStatus();
  }, [initAuth, navigation]);

  return (
    <View style={tw`flex-1 bg-slate-900 justify-between items-center py-15 px-6`}>
      {/* Logo & Header */}
      <View style={tw`items-center mt-20`}>
        <View style={tw`w-20 h-20 rounded-3xl bg-slate-800 justify-center items-center mb-5 border-1.5 border-indigo-500 shadow-xl shadow-indigo-600/30`}>
          <Text style={tw`text-4xl`}>🛡️</Text>
        </View>
        <Text style={tw`text-2xl font-black text-white tracking-tight text-center`}>
          Blockchain Document Wallet
        </Text>
        <Text style={tw`text-xs text-slate-400 mt-2 text-center`}>
          Secure User ID Based Document Vault
        </Text>
      </View>

      {/* Loader */}
      <View style={tw`items-center`}>
        <ActivityIndicator size="small" color="#818CF8" style={tw`mb-3`} />
        <Text style={tw`text-[10px] font-extrabold text-indigo-300 tracking-wider font-mono`}>
          UNLOCKING SECURE SESSION...
        </Text>
      </View>

      {/* Footer */}
      <Text style={tw`text-[10px] text-slate-500 tracking-wide text-center`}>
        End-to-End Cryptographically Secured • Real-time Backend Auth
      </Text>
    </View>
  );
};

export default SplashScreen;
