import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { VaultLogo } from '../components/VaultLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'UserId'>;

export const UserIdScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const [copiedId, setCopiedId] = useState(false);

  const userId = user?.userId || 'BDW-9K7F3A2';
  const userName = user?.fullName || 'Rahul Sharma';

  const handleCopyId = () => {
    setCopiedId(true);
    Alert.alert('Copied!', `User ID ${userId} copied to clipboard.`);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleShareId = async () => {
    try {
      await Share.share({
        message: `Official Sovereign Document User ID: ${userId}\nHolder: ${userName}\nAuthorized officials can query permitted vehicle credentials using this User ID.`,
        title: 'My Sovereign User ID',
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-900`}>
      {/* Header Bar */}
      <View style={tw`h-15 bg-slate-950 flex-row items-center justify-between px-4 border-b border-slate-800`}>
        <TouchableOpacity
          style={tw`w-9 h-9 rounded-full bg-slate-800 justify-center items-center`}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={tw`text-lg font-bold text-white`}>←</Text>
        </TouchableOpacity>
        <VaultLogo size="sm" subtitle="User ID" />
        <View style={tw`w-8.5 h-8.5 rounded-full bg-indigo-600 justify-center items-center`}>
          <Text style={tw`text-white font-extrabold text-xs`}>
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-5 pb-10`}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={tw`text-2xl font-black text-white`}>My User ID</Text>
        <Text style={tw`text-xs text-slate-400 mt-1 mb-5`}>
          Your primary public identifier for official government & police verifications.
        </Text>

        {/* DEDICATED USER ID CARD */}
        <View style={tw`bg-indigo-950/90 rounded-2xl p-5 border-1.5 border-indigo-500 mb-5 shadow-xl`}>
          <View style={tw`flex-row justify-between items-center mb-3.5`}>
            <View style={tw`w-9 h-9 rounded-xl bg-white/10 justify-center items-center`}>
              <Text style={tw`text-xl`}>🛡️</Text>
            </View>
            <View style={tw`bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500`}>
              <Text style={tw`text-[10px] font-black text-emerald-400`}>✓ ACTIVE & VERIFIED</Text>
            </View>
          </View>

          <Text style={tw`text-[10px] font-black text-indigo-300 tracking-wider`}>SOVEREIGN PUBLIC USER ID</Text>
          <Text style={tw`text-3xl font-black text-white tracking-widest my-2 font-mono`}>{userId}</Text>
          <Text style={tw`text-sm font-bold text-slate-300 mb-4`}>Holder: {userName}</Text>

          {/* BUTTONS: COPY ID & SHARE ID */}
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={tw`flex-1 h-12 rounded-xl justify-center items-center border ${
                copiedId ? 'bg-emerald-900 border-emerald-400' : 'bg-white/10 border-white/25'
              }`}
              onPress={handleCopyId}
              activeOpacity={0.88}>
              <Text style={tw`text-white font-bold text-sm`}>
                {copiedId ? '✓ Copied!' : '📋 Copy ID'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-1 h-12 rounded-xl justify-center items-center bg-indigo-600 shadow-lg shadow-indigo-600/30`}
              onPress={handleShareId}
              activeOpacity={0.88}>
              <Text style={tw`text-white font-extrabold text-sm`}>🔗 Share ID</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QR CODE MATRIX */}
        <View style={tw`bg-slate-800 rounded-2xl p-5 items-center border border-slate-700 mb-5`}>
          <Text style={tw`text-base font-extrabold text-white mb-3.5`}>Field Verification QR Code</Text>
          <View style={tw`w-48 h-48 bg-white rounded-2xl justify-center items-center p-4 mb-3`}>
            <Text style={tw`text-lg font-black text-slate-900`}>🏁 OFFICIAL QR 🏁</Text>
            <Text style={tw`text-sm font-extrabold text-indigo-600 mt-2 font-mono`}>{userId}</Text>
            <Text style={tw`text-xs font-bold text-slate-700 mt-0.5`}>{userName}</Text>
          </View>
          <Text style={tw`text-xs text-slate-400 text-center leading-4`}>
            Scanning this QR code provides authorized traffic officers instant verification of your vehicle-tagged credentials.
          </Text>
        </View>

        {/* SECURITY NOTICE */}
        <View style={tw`bg-slate-950 rounded-2xl p-4 border-1.5 border-slate-700`}>
          <View style={tw`flex-row items-center gap-2 mb-1.5`}>
            <Text style={tw`text-base`}>🔐</Text>
            <Text style={tw`text-[11px] font-black text-indigo-400 tracking-wider`}>SECURITY NOTICE</Text>
          </View>
          <Text style={tw`text-xs text-slate-300 leading-5 italic`}>
            "Only share your User ID with authorized officials when required."
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserIdScreen;
