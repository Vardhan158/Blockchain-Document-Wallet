import React, { useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { GradientSurface, VaultIcon } from '../components/DashboardArtwork';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing Field',
        'Please enter your email address and password.',
      );
      return;
    }
    const result = await login(email.trim().toLowerCase(), password);
    if (result.requiresVerification && result.email) {
      navigation.navigate('OtpVerification', { email: result.email });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <View style={styles.glow}>
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
        <View style={styles.header}>
          <View style={styles.logo}>
            <GradientSurface colors={['#6e40ff', '#4a35d9', '#3349dc']} />
            <VaultIcon name="shield" color="white" size={32} />
          </View>
          <View>
            <Text style={styles.brand}>VAULT / ID</Text>
            <Text style={styles.subtitle}>Sign In to Digital Vault</Text>
          </View>
        </View>

        {/* Welcome Back & Description */}
        <Text style={styles.welcomeHeading}>Welcome Back</Text>
        <Text style={styles.intro}>
          Enter your email and password to access your{'\n'}blockchain document wallet.
        </Text>

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
  screen: { flex: 1, backgroundColor: '#FAF2F8' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  content: { padding: 22, paddingTop: 44, paddingBottom: 30 },
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
