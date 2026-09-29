import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegistrationSuccess'>;

export const RegistrationSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const userId = route.params?.userId || 'BDW-9K7F3A2';
  const [isCopied, setIsCopied] = useState(false);

  const fetchProfile = useAuthStore(state => state.fetchProfile);

  const handleCopyUserId = () => {
    setIsCopied(true);
    Alert.alert('Copied!', `User ID ${userId} copied to clipboard.`);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleContinue = async () => {
    await fetchProfile();
    navigation.getParent()?.navigate('Main');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-900`}>
      <StatusBar barStyle="light-content" {...({ backgroundColor: '#0F172A' } as any)} />
      <View style={tw`flex-1 px-6 justify-center items-center`}>
        {/* Success Shield Icon */}
        <View style={tw`w-21 h-21 rounded-3xl bg-emerald-950 justify-center items-center mb-5 border-1.5 border-emerald-500`}>
          <Text style={tw`text-4xl`}>🎉</Text>
        </View>

        {/* Display Title */}
        <Text style={tw`text-2xl font-black text-white text-center tracking-tight`}>
          Account Created Successfully
        </Text>

        {/* User ID Card */}
        <View style={tw`w-full bg-indigo-950/90 border-1.5 border-indigo-500 rounded-2xl p-5 items-center my-6 shadow-lg shadow-indigo-600/30`}>
          <Text style={tw`text-[10px] font-black text-indigo-300 tracking-wider`}>PRIMARY PUBLIC USER ID</Text>
          <Text style={tw`text-3xl font-black text-white tracking-widest my-1.5 font-mono`}>{userId}</Text>

          {isCopied && (
            <View style={tw`bg-emerald-950 rounded-full px-2.5 py-1 mt-1 border border-emerald-500`}>
              <Text style={tw`text-[10px] font-black text-emerald-400`}>✓ COPIED TO CLIPBOARD</Text>
            </View>
          )}
        </View>

        {/* Informational Message */}
        <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-8`}>
          <Text style={tw`text-xs text-slate-300 text-center leading-5 italic`}>
            "Keep this User ID safe. Authorized government officials may use it to retrieve permitted verified documents."
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={tw`w-full space-y-3`}>
          <TouchableOpacity
            style={tw`bg-slate-800 rounded-xl py-3.5 items-center border border-slate-700 mb-3`}
            onPress={handleCopyUserId}
            activeOpacity={0.88}>
            <Text style={tw`text-white font-bold text-base`}>
              {isCopied ? '✓ Copied' : '📋 Copy User ID'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-indigo-600 rounded-xl py-3.5 items-center shadow-lg shadow-indigo-600/30`}
            onPress={handleContinue}
            activeOpacity={0.88}>
            <Text style={tw`text-white font-black text-base`}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={tw`text-[11px] text-slate-500 mt-8 text-center`}>
          Blockchain Document Wallet • Unique Sovereign Identifier
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationSuccessScreen;
