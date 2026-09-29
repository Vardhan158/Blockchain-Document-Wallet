import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList } from '../types';
import api from '../services/api';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceForgotPassword'>;

export const PoliceForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [otpDemo, setOtpDemo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter your Officer ID, Email, or Mobile Number.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call forgot password initiate API
      const res = await api.post('/police/forgot-password', {
        emailOrPhone: identifier.trim(),
      });

      setIsLoading(false);
      setOtpDemo(res.data.otpDemo || '');
      setStep(2);
      Alert.alert('OTP Sent', `A password reset OTP has been sent to your official email (${res.data.email}).`);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP. Please check credentials.');
    }
  };

  const handleResetPassword = async () => {
    if (!otpCode.trim() || otpCode.length !== 4) {
      setError('Please enter the 4-digit reset OTP code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await api.post('/police/forgot-password/reset', {
        email: identifier.trim(),
        otp: otpCode.trim(),
        newPassword,
      });

      setIsLoading(false);
      Alert.alert('Password Reset', 'Your officer password has been reset successfully. Please sign in.', [
        { text: 'Sign In', onPress: () => navigation.navigate('PoliceLogin') },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>OFFICER PASSWORD RECOVERY</Text>
          <Text style={styles.headerSub}>Government Identity Recovery</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.mainHeading}>Forgot Officer Password</Text>
          <Text style={styles.subHeading}>
            {step === 1
              ? 'Enter your Officer ID, Official Email, or Mobile Number to receive a password reset OTP.'
              : 'Enter the 4-digit OTP and set your new password.'}
          </Text>
        </View>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 1 ? (
            <View>
              <Text style={styles.label}>OFFICER ID / EMAIL / MOBILE NUMBER *</Text>
              <TextInput
                style={styles.input}
                placeholder="POL-8841 or officer@police.gov.in"
                placeholderTextColor="#64748B"
                value={identifier}
                onChangeText={text => {
                  setIdentifier(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Reset OTP →</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {otpDemo ? (
                <View style={styles.demoBanner}>
                  <Text style={styles.demoLabel}>📧 EMAIL RESET OTP</Text>
                  <Text style={styles.demoCode}>4-Digit Code: {otpDemo}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>ENTER 4-DIGIT RESET OTP *</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
                placeholderTextColor="#64748B"
                value={otpCode}
                onChangeText={text => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
              />

              <Text style={styles.label}>NEW PASSWORD *</Text>
              <TextInput
                style={styles.input}
                placeholder="New Password (8+ chars)"
                placeholderTextColor="#64748B"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Reset Password & Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.backLoginBtn}
          onPress={() => navigation.navigate('PoliceLogin')}>
          <Text style={styles.backLoginBtnText}>Back to Officer Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PoliceTheme.colors.background,
  },
  headerBar: {
    height: 64,
    backgroundColor: PoliceTheme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: PoliceTheme.colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: PoliceTheme.colors.textMain,
    fontWeight: '800',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: PoliceTheme.colors.badgeGold,
    fontWeight: '700',
    marginTop: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  subHeading: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  errorBox: {
    backgroundColor: PoliceTheme.colors.alertBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.alertText,
    marginBottom: 16,
  },
  errorText: {
    color: PoliceTheme.colors.alertText,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  demoBanner: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 1,
  },
  demoCode: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  otpInput: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: PoliceTheme.colors.primary,
    borderRadius: 14,
    height: 56,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  backLoginBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  backLoginBtnText: {
    color: PoliceTheme.colors.badgeGold,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PoliceForgotPasswordScreen;
