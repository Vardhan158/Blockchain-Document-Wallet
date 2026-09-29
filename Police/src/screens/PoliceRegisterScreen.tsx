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

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceRegister'>;

export const PoliceRegisterScreen: React.FC<Props> = ({ navigation }) => {
  // Section 10 & 12 Flow Steps: REGISTER -> VERIFY_OTP -> PENDING_APPROVAL
  const [step, setStep] = useState<'REGISTER' | 'VERIFY_OTP'>('REGISTER');

  // Section 11 Registration Screen Fields
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rankDesignation, setRankDesignation] = useState('Inspector');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Section 11 Accuracy Confirmation Checkbox
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Optional Section 8 fields
  const [department, setDepartment] = useState('Traffic Enforcement Unit');
  const [stationCode, setStationCode] = useState('');
  const [serviceNumber, setServiceNumber] = useState('');

  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpDemo, setOtpDemo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterOfficer = async () => {
    if (!fullName.trim() || !employeeId.trim() || !rankDesignation.trim() || !policeStation.trim() || !district.trim() || !state.trim() || !phone.trim() || !email.trim() || !password) {
      setError('Please fill in all required official registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    // SECTION 11 CHECKBOX VALIDATION
    if (!isConfirmed) {
      setError('Please check the confirmation box verifying that all submitted official information is accurate.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await api.post('/police/register', {
        fullName: fullName.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        badgeNumber: employeeId.trim().toUpperCase(),
        rankDesignation: rankDesignation.trim(),
        policeStation: policeStation.trim(),
        district: district.trim(),
        state: state.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        department: department.trim(),
        stationCode: stationCode.trim(),
        serviceNumber: serviceNumber.trim(),
      });

      setIsLoading(false);
      setOtpDemo(res.data.otpDemo || '');
      setStep('VERIFY_OTP');

      Alert.alert(
        'Verify Official Contact',
        `Step 2/3: A 4-digit verification OTP has been sent to your official contact email (${email.trim()}).`
      );
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to submit officer registration.');
    }
  };

  const handleVerifyOfficerOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 4) {
      setError('Please enter the 4-digit OTP sent to your email/mobile.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await api.post('/police/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otpCode.trim(),
      });

      setIsLoading(false);

      // SECTION 13: Navigate to Pending Approval Screen
      navigation.navigate('PolicePendingApproval', {
        officer: {
          employeeId: employeeId.trim().toUpperCase(),
          policeStation: policeStation.trim(),
          email: email.trim(),
        },
        email: email.trim(),
        password,
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
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
          <Text style={styles.headerTitle}>GOVERNMENT OFFICER REGISTRATION</Text>
          <Text style={styles.headerSub}>
            {step === 'REGISTER'
              ? 'Step 1: Enter Officer Information'
              : 'Step 2: Verify Official Contact'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.mainHeading}>
            {step === 'REGISTER' ? 'Officer Registration' : 'Verify Official Contact'}
          </Text>
          <Text style={styles.subHeading}>
            {step === 'REGISTER'
              ? 'Submit your official government credentials for administrator verification.'
              : `Enter the 4-digit verification code sent to ${email}.`}
          </Text>
        </View>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'REGISTER' ? (
            <View>
              {/* 1. Full Name */}
              <Text style={styles.label}>FULL NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#64748B"
                value={fullName}
                onChangeText={setFullName}
              />

              {/* 2. Police / Employee ID */}
              <Text style={styles.label}>POLICE EMPLOYEE ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. POL-8841"
                placeholderTextColor="#64748B"
                value={employeeId}
                onChangeText={text => setEmployeeId(text.toUpperCase())}
                autoCapitalize="characters"
              />

              {/* 3. Rank */}
              <Text style={styles.label}>RANK *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Inspector / Sub-Inspector"
                placeholderTextColor="#64748B"
                value={rankDesignation}
                onChangeText={setRankDesignation}
              />

              {/* 4. Police Station */}
              <Text style={styles.label}>POLICE STATION *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Central Traffic Police Station"
                placeholderTextColor="#64748B"
                value={policeStation}
                onChangeText={setPoliceStation}
              />

              {/* 5. District & State */}
              <View style={styles.rowTwo}>
                <View style={styles.colFlex}>
                  <Text style={styles.label}>DISTRICT *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Bangalore Urban"
                    placeholderTextColor="#64748B"
                    value={district}
                    onChangeText={setDistrict}
                  />
                </View>

                <View style={styles.colFlex}>
                  <Text style={styles.label}>STATE *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Karnataka"
                    placeholderTextColor="#64748B"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              {/* 6. Official Phone */}
              <Text style={styles.label}>OFFICIAL PHONE *</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 9876543210"
                placeholderTextColor="#64748B"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* 7. Official Email */}
              <Text style={styles.label}>OFFICIAL EMAIL *</Text>
              <TextInput
                style={styles.input}
                placeholder="officer@police.gov.in"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* 8. Passwords */}
              <Text style={styles.label}>PASSWORD *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.label}>CONFIRM PASSWORD *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {/* SECTION 11 CHECKBOX: ACCURACY CONFIRMATION */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsConfirmed(!isConfirmed)}
                activeOpacity={0.85}>
                <View style={[styles.checkboxSquare, isConfirmed && styles.checkboxSquareChecked]}>
                  {isConfirmed && <Text style={styles.checkmarkIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  "I confirm that the submitted information is accurate and belongs to me."
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleRegisterOfficer}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Registration →</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* SECTION 12 STEP 2: VERIFY OFFICIAL CONTACT OTP */
            <View style={styles.otpStepContainer}>
              {otpDemo ? (
                <View style={styles.demoBanner}>
                  <Text style={styles.demoLabel}>📧 OFFICIAL CONTACT OTP DISPATCHED</Text>
                  <Text style={styles.demoCode}>4-Digit Code: {otpDemo}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>ENTER 4-DIGIT VERIFICATION OTP *</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
                placeholderTextColor="#64748B"
                value={otpCode}
                onChangeText={text => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleVerifyOfficerOtp}
                disabled={isLoading}
                activeOpacity={0.88}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Verify OTP & Submit to Admin</Text>
                )}
              </TouchableOpacity>

              <View style={styles.adminMandatoryNotice}>
                <Text style={styles.noticeIcon}>🔒</Text>
                <Text style={styles.noticeText}>
                  "Contact verification does NOT automatically authorize police access. Admin approval remains mandatory."
                </Text>
              </View>
            </View>
          )}
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
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  colFlex: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: PoliceTheme.colors.primary,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderColor: PoliceTheme.colors.primary,
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: PoliceTheme.colors.textMain,
    fontWeight: '600',
    lineHeight: 16,
    fontStyle: 'italic',
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
  otpStepContainer: {
    paddingVertical: 10,
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
  adminMandatoryNotice: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  noticeIcon: {
    fontSize: 16,
  },
  noticeText: {
    fontSize: 11,
    color: PoliceTheme.colors.badgeGold,
    lineHeight: 16,
    flex: 1,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});

export default PoliceRegisterScreen;
