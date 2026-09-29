import React, { useState } from 'react';
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
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import api from '../services/api';
import { VaultLogo } from '../components/VaultLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDemo, setOtpDemo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Send OTP to Mobile / Email
  const handleInitiateReset = async () => {
    if (!emailOrPhone.trim()) {
      setError('Please enter your mobile number or email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.post('/auth/forgot-password/initiate', {
        emailOrPhone: emailOrPhone.trim(),
      });

      setTargetEmail(res.data.email);
      setOtpDemo(res.data.otpDemo || '');
      setIsLoading(false);
      setStep(2);
      Alert.alert('OTP Sent', `A 4-digit reset OTP has been sent to ${res.data.email}.`);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email or mobile.');
    }
  };

  // Step 2: Verify 4-Digit OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 4) {
      setError('Please enter the 4-digit OTP code sent to your email.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/forgot-password/verify', {
        email: targetEmail,
        otp: otp.trim(),
      });

      setIsLoading(false);
      setStep(3);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    }
  };

  // Step 3: Set New Password & Return to Login
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/forgot-password/reset', {
        email: targetEmail,
        otp: otp.trim(),
        newPassword,
      });

      setIsLoading(false);
      Alert.alert('Success!', 'Your password has been reset successfully. Please sign in with your new password.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Could not reset password. Please check requirements.');
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
          <VaultLogo size="lg" subtitle="Password Recovery" />
          <Text style={tw`text-2xl font-extrabold text-white mt-3.5`}>
            {step === 1
              ? 'Forgot Password'
              : step === 2
              ? 'Verify Reset OTP'
              : 'Set New Password'}
          </Text>
          <Text style={tw`text-xs text-slate-400 text-center mt-2 leading-4 px-3`}>
            {step === 1
              ? 'Enter your registered mobile number or email address to receive a 4-digit verification code.'
              : step === 2
              ? `Enter the 4-digit OTP sent to ${targetEmail}.`
              : 'Enter your new password below.'}
          </Text>
        </View>

        {/* Card */}
        <View style={tw`bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl`}>
          {error && (
            <View style={tw`bg-red-950/80 border border-red-500 rounded-xl p-3 mb-3`}>
              <Text style={tw`color-red-300 text-xs font-semibold text-center`}>{error}</Text>
            </View>
          )}

          {/* STEP 1: ENTER MOBILE / EMAIL */}
          {step === 1 && (
            <View>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                REGISTERED EMAIL OR MOBILE NUMBER *
              </Text>
              <TextInput
                style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-4`}
                placeholder="email@example.com or +919876543210"
                placeholderTextColor="#64748B"
                value={emailOrPhone}
                onChangeText={text => {
                  setEmailOrPhone(text);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />

              <TouchableOpacity
                style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center mt-2 shadow-lg shadow-indigo-600/30 ${isLoading ? 'opacity-60' : ''}`}
                onPress={handleInitiateReset}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={tw`color-white font-extrabold text-sm`}>Send Reset OTP →</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <View>
              {otpDemo ? (
                <View style={tw`bg-indigo-950 border-1.5 border-indigo-500 rounded-xl p-3.5 items-center mb-5`}>
                  <Text style={tw`text-[10px] font-black text-emerald-400 tracking-wider`}>📧 EMAIL OTP DISPATCHED</Text>
                  <Text style={tw`text-xl font-black text-white tracking-widest mt-1 font-mono`}>
                    4-Digit OTP Code: {otpDemo}
                  </Text>
                </View>
              ) : null}

              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                ENTER 4-DIGIT RESET OTP *
              </Text>
              <TextInput
                style={tw`bg-slate-900 border-1.5 border-indigo-500 rounded-2xl h-14 text-white text-2xl font-black text-center tracking-widest mb-5 font-mono`}
                placeholder="• • • •"
                placeholderTextColor="#64748B"
                value={otp}
                onChangeText={text => {
                  setOtp(text.replace(/[^0-9]/g, '').slice(0, 4));
                  if (error) setError(null);
                }}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />

              <TouchableOpacity
                style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30 ${isLoading ? 'opacity-60' : ''}`}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={tw`color-white font-extrabold text-sm`}>Verify OTP →</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <View>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                NEW PASSWORD *
              </Text>
              <TextInput
                style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-4`}
                placeholder="New Password (8+ chars)"
                placeholderTextColor="#64748B"
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry
                autoFocus
              />

              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                CONFIRM NEW PASSWORD *
              </Text>
              <TextInput
                style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-4`}
                placeholder="Confirm New Password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry
              />

              <TouchableOpacity
                style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center mt-2 shadow-lg shadow-indigo-600/30 ${isLoading ? 'opacity-60' : ''}`}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={tw`color-white font-extrabold text-sm`}>Reset Password & Return to Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Return to Login */}
        <View style={tw`items-center mt-6`}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-indigo-400 text-xs font-extrabold`}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
