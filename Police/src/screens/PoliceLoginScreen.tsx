import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList } from '../types';
import api from '../services/api';
import tokenStorage from '../services/tokenStorage';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceLogin'>;

export const PoliceLoginScreen: React.FC<Props> = ({ navigation }) => {
  // Section 15: Officer ID / Email / Mobile Number Input
  const [officerIdentifier, setOfficerIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOfficerLogin = async () => {
    if (!officerIdentifier.trim() || !password) {
      setError('Please enter your Officer ID, Email, or Mobile Number and Password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/police/login', {
        officerIdentifier: officerIdentifier.trim(),
        password,
      });

      setIsLoading(false);
      // SECTION 17: Save 12h Access Token & Refresh Token in hardware Keychain
      const token = response.data.accessToken || response.data.token;
      if (token) {
        await tokenStorage.saveTokens(token, response.data.refreshToken);
      }

      // SECTION 18: Successful Login -> Police Home Dashboard
      navigation.navigate('PoliceHome', { officer: response.data.officer });
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.status === 403 && err.response?.data?.status === 'PENDING_APPROVAL') {
        navigation.navigate('PolicePendingApproval', {
          email: officerIdentifier,
          password,
        });
      } else {
        // Section 16 Error Message Handling
        setError(err.response?.data?.message || 'Invalid officer credentials. Please check Officer ID / Email and Password.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>👮</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>GOVERNMENT OFFICER PORTAL</Text>
          <Text style={styles.headerSub}>Official Inspection Login</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.mainHeading}>Officer Sign In</Text>
          <Text style={styles.subHeading}>
            Sign in with your verified Officer ID, Official Email, or Mobile Number to access citizen vehicle inspection tools.
          </Text>
        </View>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* SECTION 15: OFFICER ID / EMAIL / MOBILE NUMBER */}
          <Text style={styles.label}>OFFICER ID / EMAIL / MOBILE NUMBER *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. POL-8841, officer@police.gov.in or mobile"
            placeholderTextColor="#64748B"
            value={officerIdentifier}
            onChangeText={text => {
              setOfficerIdentifier(text);
              if (error) setError(null);
            }}
            autoCapitalize="none"
          />

          {/* SECTION 15: PASSWORD */}
          <Text style={styles.label}>PASSWORD *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (error) setError(null);
            }}
            secureTextEntry
          />

          {/* SECTION 15 LINK: FORGOT PASSWORD */}
          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => navigation.navigate('PoliceForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION 15 BUTTON 1: LOGIN */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleOfficerLogin}
            disabled={isLoading}
            activeOpacity={0.88}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Officer Sign In →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SECTION 15 BUTTON 3: REGISTER AS POLICE OFFICER */}
        <View style={styles.registerOptionBox}>
          <Text style={styles.registerOptionText}>New Government Officer? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PoliceRegister')}>
            <Text style={styles.registerOptionLink}>Register as Police Officer</Text>
          </TouchableOpacity>
        </View>
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
  badgeBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: PoliceTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIcon: {
    fontSize: 20,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  subHeading: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
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
    letterSpacing: 1,
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 2,
  },
  forgotText: {
    color: PoliceTheme.colors.badgeGold,
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  registerOptionBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerOptionText: {
    color: PoliceTheme.colors.textMuted,
    fontSize: 13,
  },
  registerOptionLink: {
    color: PoliceTheme.colors.badgeGold,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default PoliceLoginScreen;
