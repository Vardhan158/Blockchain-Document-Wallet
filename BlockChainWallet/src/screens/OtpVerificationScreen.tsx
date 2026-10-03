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
import { GradientSurface, VaultIcon } from '../components/DashboardArtwork';

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
    if (res.success) {
      // verifyOtp persists the session in the hardware-backed keychain and
      // updates the auth store. RootNavigator then replaces Auth with Main,
      // so a newly registered user lands in the dashboard immediately.
      // There is deliberately no password-login step after registration.
      return;
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
      style={tw`flex-1 bg-[#fafbff]`}>
      <View pointerEvents="none" style={tw`absolute inset-0`}>
        <GradientSurface colors={['#ECE9FF', '#FFFFFF', '#E6F4FF']} />
      </View>
      <View pointerEvents="none" style={tw`absolute top-0 left-0 right-0 h-64 opacity-80`}>
        <GradientSurface colors={['#C8BEFF', '#EAE6FF', '#DDF7FF']} />
      </View>
      <ScrollView
        contentContainerStyle={tw`p-5 justify-center flex-grow`}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-8`}>
            <View style={tw`w-13 h-13 rounded-2xl overflow-hidden items-center justify-center shadow-sm`}>
              <GradientSurface />
              <VaultIcon name="shield" color="white" size={27} />
            </View>
            <View style={tw`ml-3`}>
              <Text style={tw`text-xl font-black tracking-wide text-slate-900`}>VAULT / ID</Text>
              <Text style={tw`text-[11px] font-bold text-slate-500 mt-0.5`}>Digital Document Vault</Text>
            </View>
          </View>
          <Text style={tw`text-[10px] font-black tracking-widest text-blue-700 text-center mb-2`}>EMAIL IDENTITY VERIFICATION</Text>
          <Text style={tw`text-3xl font-black text-slate-900 text-center`}>Verify your email ID</Text>
          <Text style={tw`text-sm text-slate-500 text-center mt-3 leading-5 px-3`}>
            Enter the 4-digit OTP code sent to your registered email address:{' '}
            <Text style={tw`text-indigo-600 font-extrabold`}>{email}</Text>
          </Text>
        </View>

        {/* Form Card */}
        <View style={tw`bg-white rounded-3xl p-5 border border-white shadow-sm space-y-4`}>
          {error && (
            <View style={tw`bg-red-50 border border-red-200 rounded-xl p-3 mb-2`}>
              <Text style={tw`text-xs font-semibold text-red-600 text-center`}>{error}</Text>
            </View>
          )}

          {infoMessage && !error && (
            <View style={tw`bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-2`}>
              <Text style={tw`text-xs font-semibold text-emerald-700 text-center`}>{infoMessage}</Text>
            </View>
          )}

          {/* Real-time Email Delivery Confirmation */}
          <View style={tw`bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 items-center mb-4`}>
            <Text style={tw`text-[10px] font-black text-emerald-600 tracking-wider mb-1`}>EMAIL DISPATCHED</Text>
            <Text style={tw`text-[11px] text-slate-600 text-center leading-4`}>
              A 4-digit verification code has been sent to <Text style={tw`text-slate-900 font-bold`}>{email}</Text>.
            </Text>
          </View>

          {/* VISIBLE 4-DIGIT OTP SELECTION INPUT */}
          <Text style={tw`text-[10px] font-black text-slate-600 uppercase tracking-wider text-center mb-3`}>
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
                      ? 'bg-indigo-50 border-indigo-500'
                      : isCurrent
                      ? 'bg-white border-indigo-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                  <Text style={tw`text-2xl font-black text-slate-900 text-center font-mono`}>{digit}</Text>
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
            style={tw`bg-indigo-600 rounded-2xl h-13 justify-center items-center shadow-lg shadow-indigo-600/30 overflow-hidden ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.88}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <GradientSurface />
                <Text style={tw`text-white font-black text-base`}>Verify & Open Dashboard</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-white rounded-2xl h-13 justify-center items-center border border-indigo-100 mt-2 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleResendOtp}
            disabled={isLoading}
            activeOpacity={0.88}>
            <Text style={tw`text-indigo-600 font-bold text-sm`}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login link */}
        <View style={tw`items-center mt-6`}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-indigo-600 text-xs font-extrabold`}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;
