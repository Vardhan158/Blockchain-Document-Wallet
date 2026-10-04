import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { tokenStorage } from '../services/tokenStorage';
import { GradientSurface, VaultIcon } from '../components/DashboardArtwork';
import { User } from '../types/models';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedUser, setSavedUser] = useState<User | null>(null);
  const [isCheckingSavedUser, setIsCheckingSavedUser] = useState(true);

  const { login, initAuth, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then(value => {
      if (value) {
        setSavedUser(JSON.parse(value));
        // Automatically pop up fingerprint prompt when returning user is detected!
        setTimeout(() => {
          handleBiometricUnlock();
        }, 300);
      }
    }).catch(() => {}).finally(() => setIsCheckingSavedUser(false));
  }, []);

  const handleBiometricUnlock = async () => {
    const unlocked = await initAuth();
    if (unlocked) {
      navigation.getParent()?.navigate('Main');
    }
  };

  const handleUseAnotherAccount = async () => {
    await tokenStorage.clearTokens();
    clearError();
    setSavedUser(null);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing Field',
        'Please enter your email address and password.',
      );
      return;
    }
    const result = await login(email.trim().toLowerCase(), password);
    if (result.success) {
      navigation.getParent()?.navigate('Main');
    } else if (result.requiresVerification && result.email) {
      navigation.navigate('OtpVerification', { email: result.email });
    }
  };

  // Once a wallet has registered on this phone, its login page is intentionally
  // biometric-only. The email/password form is only shown when no local wallet
  // is enrolled, or after the user explicitly chooses a different account.
  if (isCheckingSavedUser) {
    return (
      <View style={[styles.screen, styles.loadingScreen]}>
        <ActivityIndicator color="#6542ff" />
      </View>
    );
  }

  if (savedUser) {
    return (
      <View style={styles.screen}>
        <View style={styles.dashboardGlow}>
          <GradientSurface colors={['#b7a3ff', '#c4d2ff', '#d9fbff']} />
        </View>
        <View style={[styles.content, styles.biometricOnlyContent]}>
          <View style={styles.dashboardHeader}>
            <View style={styles.logo}>
              <GradientSurface colors={['#6e40ff', '#4a35d9', '#3349dc']} />
              <VaultIcon name="shield" color="white" size={32} />
            </View>
            <View style={styles.dashboardBrand}>
              <Text style={styles.brand}>VAULT / ID</Text>
              <Text style={styles.subtitle}>Digital Document Vault</Text>
            </View>
            <View style={styles.loginAvatar}>
              <Text style={styles.loginAvatarText}>{savedUser.fullName.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.biometricOnlyBody}>
            <Text style={styles.dashboardEyebrow}>SECURE WALLET ACCESS</Text>
            <Text style={styles.welcomeHeading}>Welcome back, {savedUser.fullName.split(' ')[0]}</Text>
            <Text style={styles.intro}>Use your fingerprint to open your dashboard.</Text>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Unlock dashboard with fingerprint"
              disabled={isLoading}
              style={[styles.biometricCard, isLoading && styles.disabled]}
              onPress={handleBiometricUnlock}>
              <View style={styles.fingerprintCircle}><VaultIcon name="shield" color="#6542ff" size={32} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.biometricTitle}>{isLoading ? 'Authenticating…' : 'Unlock with Fingerprint'}</Text>
                <Text style={styles.biometricSubtitle}>Your protected session will open the dashboard.</Text>
              </View>
              {isLoading ? <ActivityIndicator color="#6542ff" /> : <VaultIcon name="chevron" color="#6542ff" size={21} />}
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" onPress={handleUseAnotherAccount} style={styles.differentAccount}>
              <Text style={styles.differentAccountText}>Use a different account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <View style={styles.dashboardGlow}>
        <GradientSurface colors={['#b7a3ff', '#c4d2ff', '#d9fbff']} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        {/* Logo & Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.logo}>
            <GradientSurface colors={['#6e40ff', '#4a35d9', '#3349dc']} />
            <VaultIcon name="shield" color="white" size={32} />
          </View>
          <View style={styles.dashboardBrand}>
            <Text style={styles.brand}>VAULT / ID</Text>
            <Text style={styles.subtitle}>Digital Document Vault</Text>
          </View>
          <View style={styles.loginAvatar}>
            <Text style={styles.loginAvatarText}>U</Text>
          </View>
        </View>

        <View style={styles.dashboardHero}>
          <Text style={styles.dashboardEyebrow}>SECURE WALLET ACCESS</Text>
          <Text style={styles.welcomeHeading}>Welcome</Text>
          <Text style={styles.intro}>Unlock your digital identity and documents securely.</Text>
        </View>

        <View style={styles.savedWalletCard}>
          <GradientSurface />
          <View style={styles.savedWalletIcon}><VaultIcon name="shield" color="#6d50ff" size={23} /></View>
          <View style={styles.savedWalletText}>
            <Text style={styles.savedWalletLabel}>SAVED WALLET</Text>
            <Text numberOfLines={1} style={styles.savedWalletName}>New or different account</Text>
            <Text numberOfLines={1} style={styles.savedWalletEmail}>Sign in once to enable fingerprint unlock</Text>
          </View>
          <View style={styles.verifiedPill}><VaultIcon name="check" color="#55ffd5" size={14} /><Text style={styles.verifiedPillText}>SECURE</Text></View>
        </View>

        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Unlock with fingerprint" disabled={isLoading} style={[styles.biometricCard, isLoading && styles.disabled]} onPress={handleBiometricUnlock}>
          <View style={styles.fingerprintCircle}><VaultIcon name="shield" color="#6542ff" size={32} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.biometricTitle}>{isLoading ? 'Authenticating…' : 'Unlock with Fingerprint'}</Text>
            <Text style={styles.biometricSubtitle}>Use your enrolled biometric or device lock</Text>
          </View>
          {isLoading ? <ActivityIndicator color="#6542ff" /> : <VaultIcon name="chevron" color="#6542ff" size={21} />}
        </TouchableOpacity>

        <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>OR SIGN IN WITH PASSWORD</Text><View style={styles.orLine} /></View>

        {/* Form Container Card */}
        <View style={styles.card}>
          {error && (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Address */}
          <Field
            label="EMAIL ADDRESS *"
            icon="document"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChangeText={(v: string) => {
              setEmail(v);
              if (error) clearError();
            }}
            keyboardType="email-address"
          />

          {/* Password */}
          <Field
            label="PASSWORD *"
            icon="shield"
            placeholder="••••••••"
            value={password}
            onChangeText={(v: string) => {
              setPassword(v);
              if (error) clearError();
            }}
            secureTextEntry={!showPassword}
            right={
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? 'Hide password' : 'Show password'
                }
                onPress={() => setShowPassword(v => !v)}
              >
                <VaultIcon name={showPassword ? 'eye' : 'eye'} size={20} color="#64748B" />
              </TouchableOpacity>
            }
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In CTA Button */}
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isLoading}
            style={[styles.submit, isLoading && styles.disabled]}
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitText}>Sign In</Text>
                <VaultIcon name="arrow" color="white" size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Create Account Link Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.link}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  right,
}: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <VaultIcon name={icon} size={20} color="#64748B" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFBFF' },
  loadingScreen: { alignItems: 'center', justifyContent: 'center' },
  dashboardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 270 },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  dashboardBrand: { flex: 1 },
  loginAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e0ff', alignItems: 'center', justifyContent: 'center' },
  loginAvatarText: { color: '#6542ff', fontWeight: '900', fontSize: 17 },
  dashboardHero: { marginTop: 4 },
  dashboardEyebrow: { color: '#6242ff', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textAlign: 'center' },
  savedWalletCard: { minHeight: 100, borderRadius: 22, overflow: 'hidden', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  savedWalletIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  savedWalletText: { flex: 1 },
  savedWalletLabel: { color: '#d9d2ff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  savedWalletName: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  savedWalletEmail: { color: '#e5e1ff', fontSize: 11, marginTop: 3 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)' },
  verifiedPillText: { color: '#55ffd5', fontSize: 8, fontWeight: '900' },
  biometricCard: { backgroundColor: '#fff', borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: '#e6e0ff', shadowColor: '#6040ff', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  fingerprintCircle: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0edff' },
  biometricTitle: { color: '#161235', fontSize: 16, fontWeight: '900' },
  biometricSubtitle: { color: '#75809a', fontSize: 11, marginTop: 4 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#dfe3ec' },
  orText: { color: '#8490a7', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  content: { padding: 22, paddingTop: 44, paddingBottom: 30 },
  biometricOnlyContent: { flex: 1 },
  biometricOnlyBody: { flex: 1, justifyContent: 'center' },
  differentAccount: { alignSelf: 'center', paddingVertical: 20, paddingHorizontal: 12 },
  differentAccountText: { color: '#6542ff', fontSize: 13, fontWeight: '800' },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  backText: {
    fontSize: 28,
    lineHeight: 32,
    color: '#0F172A',
    fontWeight: '300',
    marginTop: -2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  welcomeHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: -0.5,
  },
  intro: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrap: {
    height: 50,
    borderRadius: 14,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  forgot: { alignItems: 'flex-end', marginTop: 2, marginBottom: 18 },
  forgotText: { color: '#4F46E5', fontWeight: '800', fontSize: 13 },
  submit: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: 'white', fontSize: 16, fontWeight: '900' },
  disabled: { opacity: 0.65 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748B', fontSize: 13 },
  link: { color: '#4F46E5', fontWeight: '900', fontSize: 13 },
});

export default LoginScreen;
