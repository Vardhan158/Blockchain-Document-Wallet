import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { VaultLogo } from '../components/VaultLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const email = route.params?.email || '';
  const initialDemoOtp = route.params?.otpDemo || '';

  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(initialDemoOtp);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const inputRef = useRef<any>(null);

  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuthStore();

  const handleVerify = async () => {
    if (!otp.trim() || otp.trim().length !== 4) {
      Alert.alert('Invalid Input', 'Please enter the 4-digit OTP sent to your email.');
      return;
    }

    const res = await verifyOtp(email, otp.trim());
    if (res.success && res.userId) {
      navigation.navigate('RegistrationSuccess', { userId: res.userId });
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    const result = await resendOtp(email);
    if (result.success) {
      if (result.otpDemo) {
        setDemoOtp(result.otpDemo);
      }
      setInfoMessage(result.message);
      Alert.alert('OTP Sent', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-slate-900`}>
      <ScrollView
        contentContainerStyle={tw`p-6 justify-center flex-grow`}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={tw`items-center mb-6`}>
          <VaultLogo size="lg" subtitle="Email Identity Verification" />
          <Text style={tw`text-2xl font-black text-white mt-3.5`}>Verify your email ID</Text>
          <Text style={tw`text-xs text-slate-400 text-center mt-2 leading-4 px-3`}>
            Enter the 4-digit OTP code sent to your registered email address:{' '}
            <Text style={tw`text-indigo-300 font-extrabold`}>{email}</Text>
          </Text>
        </View>

        {/* Form Card */}
        <View style={tw`bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4`}>
          {error && (
            <View style={tw`bg-red-950/80 border border-red-500 rounded-xl p-3 mb-2`}>
              <Text style={tw`text-xs font-semibold text-red-300 text-center`}>{error}</Text>
            </View>
          )}

          {infoMessage && !error && (
            <View style={tw`bg-emerald-950/80 border border-emerald-500 rounded-xl p-3 mb-2`}>
              <Text style={tw`text-xs font-semibold text-emerald-300 text-center`}>{infoMessage}</Text>
            </View>
          )}

          {/* Real-time Email Delivery Confirmation */}
          <View style={tw`bg-indigo-950 border-1.5 border-indigo-500 rounded-xl p-3.5 items-center mb-4`}>
            <Text style={tw`text-[10px] font-black text-emerald-400 tracking-wider mb-1`}>📧 REAL-TIME EMAIL DISPATCHED</Text>
            <Text style={tw`text-[11px] text-slate-300 text-center leading-4`}>
              A 4-digit verification code has been sent directly to <Text style={tw`text-white font-bold`}>{email}</Text> via Brevo Email Service.
            </Text>
          </View>

          {/* VISIBLE 4-DIGIT OTP SELECTION INPUT */}
          <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider text-center mb-3`}>
            ENTER 4-DIGIT OTP *
          </Text>

          <Pressable
            style={tw`flex-row justify-center gap-3 mb-6`}
            onPress={() => inputRef.current?.focus()}>
            {[0, 1, 2, 3].map(index => {
              const digit = otp[index] || '';
              const isCurrent = otp.length === index || (otp.length === 4 && index === 3);

              return (
                <View
                  key={index}
                  style={tw`w-14 h-15 rounded-2xl justify-center items-center border-1.5 ${
                    digit !== ''
                      ? 'bg-indigo-950 border-indigo-500'
                      : isCurrent
                      ? 'bg-slate-900 border-indigo-400'
                      : 'bg-slate-900 border-slate-700'
                  }`}>
                  <Text style={tw`text-2xl font-black text-white text-center font-mono`}>{digit}</Text>
                </View>
              );
            })}
          </Pressable>

          {/* Transparent Input capturing touch events */}
          <TextInput
            ref={inputRef}
            style={tw`absolute opacity-0 w-0 h-0`}
            value={otp}
            onChangeText={text => {
              setOtp(text.replace(/[^0-9]/g, '').slice(0, 4));
              if (error) clearError();
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            secureTextEntry={false}
          />

          {/* Action Buttons */}
          <TouchableOpacity
            style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.88}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={tw`text-white font-black text-base`}>Verify OTP & Activate</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-slate-900 rounded-xl h-12 justify-center items-center border border-slate-700 mt-2 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleResendOtp}
            disabled={isLoading}
            activeOpacity={0.88}>
            <Text style={tw`text-slate-200 font-bold text-sm`}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login link */}
        <View style={tw`items-center mt-6`}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-indigo-400 text-xs font-extrabold`}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;
