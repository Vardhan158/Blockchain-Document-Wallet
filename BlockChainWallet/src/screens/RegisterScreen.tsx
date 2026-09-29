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
  Modal,
  FlatList,
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { VaultLogo } from '../components/VaultLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const MONTHS = [
  { label: 'January', val: '01' },
  { label: 'February', val: '02' },
  { label: 'March', val: '03' },
  { label: 'April', val: '04' },
  { label: 'May', val: '05' },
  { label: 'June', val: '06' },
  { label: 'July', val: '07' },
  { label: 'August', val: '08' },
  { label: 'September', val: '09' },
  { label: 'October', val: '10' },
  { label: 'November', val: '11' },
  { label: 'December', val: '12' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');

  // Date of Birth Select State
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ label: string; val: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [activePickerModal, setActivePickerModal] = useState<'DAY' | 'MONTH' | 'YEAR' | null>(null);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuthStore();

  // Password Requirement Checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setValidationError('Full Name is required.');
      return false;
    }

    if (!selectedDay || !selectedMonth || !selectedYear) {
      setValidationError('Please select your complete Date of Birth (Day, Month, Year).');
      return false;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!phone.trim() || cleanPhone.length < 8) {
      setValidationError('Mobile Number must contain a valid phone number.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError('Email format must be valid (e.g. user@example.com).');
      return false;
    }

    if (!isPasswordValid) {
      setValidationError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    const dobFormatted = `${selectedYear}-${selectedMonth?.val}-${String(selectedDay).padStart(2, '0')}`;

    const res = await register({
      fullName: fullName.trim(),
      dob: dobFormatted,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      gender: gender.trim(),
      address: address.trim(),
    });

    if (res.success && res.requiresVerification) {
      navigation.navigate('OtpVerification', {
        email: email.trim().toLowerCase(),
        otpDemo: res.otpDemo,
      });
    }
  };

  const activeError = validationError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-[#FAF2F8]/20`}>
      <ScrollView
        contentContainerStyle={tw`p-6 pt-10 justify-center flex-grow`}
        keyboardShouldPersistTaps="handled">
        {/* Top Back Button */}
        <View style={tw`flex-row justify-between items-center mb-5`}>
          <TouchableOpacity
            style={tw`w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-slate-100`}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={tw`text-base font-bold text-slate-700`}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={tw`items-center mb-6`}>
          <VaultLogo size="lg" subtitle="Create Account" />
          <Text style={tw`text-xs text-slate-500 text-center mt-2.5 leading-4 px-4`}>
            Register your official details to issue your Sovereign Digital Document ID.
          </Text>
        </View>

        {/* Form Container Card */}
        <View style={tw`bg-white rounded-3xl p-5 border border-slate-100 shadow-xl space-y-3.5`}>
          {activeError && (
            <View style={tw`bg-red-50 border border-red-200 rounded-xl p-3 mb-2`}>
              <Text style={tw`text-xs font-bold text-red-600 text-center leading-4`}>{activeError}</Text>
            </View>
          )}

          {/* Full Name */}
          <View>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>FULL NAME *</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-3.5`}>
              <Text style={tw`text-base text-slate-400 mr-2.5`}>👤</Text>
              <TextInput
                style={tw`flex-1 text-slate-900 text-sm font-semibold p-0`}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  if (validationError) setValidationError(null);
                  if (error) clearError();
                }}
              />
            </View>
          </View>

          {/* Date of Birth Select Row */}
          <View style={tw`mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>
              DATE OF BIRTH * (SELECT DAY, MONTH, YEAR)
            </Text>
            <View style={tw`flex-row gap-2 mb-2`}>
              {/* Day Selector */}
              <TouchableOpacity
                style={tw`flex-1 h-12 px-3 rounded-xl flex-row items-center justify-between border ${
                  selectedDay ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50 border-slate-200'
                }`}
                onPress={() => setActivePickerModal('DAY')}
                activeOpacity={0.8}>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text style={tw`text-xs`}>📅</Text>
                  <Text style={tw`text-xs ${selectedDay ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {selectedDay ? `${selectedDay}` : 'Day'}
                  </Text>
                </View>
                <Text style={tw`text-[10px] text-slate-400`}>▼</Text>
              </TouchableOpacity>

              {/* Month Selector */}
              <TouchableOpacity
                style={tw`flex-1 h-12 px-3 rounded-xl flex-row items-center justify-between border ${
                  selectedMonth ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50 border-slate-200'
                }`}
                onPress={() => setActivePickerModal('MONTH')}
                activeOpacity={0.8}>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text style={tw`text-xs`}>📅</Text>
                  <Text style={tw`text-xs ${selectedMonth ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {selectedMonth ? selectedMonth.label.slice(0, 3) : 'Month'}
                  </Text>
                </View>
                <Text style={tw`text-[10px] text-slate-400`}>▼</Text>
              </TouchableOpacity>

              {/* Year Selector */}
              <TouchableOpacity
                style={tw`flex-1 h-12 px-3 rounded-xl flex-row items-center justify-between border ${
                  selectedYear ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50 border-slate-200'
                }`}
                onPress={() => setActivePickerModal('YEAR')}
                activeOpacity={0.8}>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text style={tw`text-xs`}>📅</Text>
                  <Text style={tw`text-xs ${selectedYear ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {selectedYear ? `${selectedYear}` : 'Year'}
                  </Text>
                </View>
                <Text style={tw`text-[10px] text-slate-400`}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Selected DOB Confirmation Banner */}
            {selectedDay && selectedMonth && selectedYear ? (
              <View style={tw`bg-emerald-50 rounded-lg p-2 border border-emerald-300 mb-2`}>
                <Text style={tw`text-xs font-bold text-emerald-800 text-center`}>
                  📅 Selected DOB: {selectedDay} {selectedMonth.label} {selectedYear}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Mobile Number */}
          <View style={tw`mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>MOBILE NUMBER *</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-3.5`}>
              <Text style={tw`text-base text-slate-400 mr-2.5`}>📞</Text>
              <TextInput
                style={tw`flex-1 text-slate-900 text-sm font-semibold p-0`}
                placeholder="+91 9876543210"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  if (validationError) setValidationError(null);
                  if (error) clearError();
                }}
                keyboardType="phone-pad"
              />
              <View style={tw`flex-row items-center gap-1 bg-slate-200/60 px-2 py-1 rounded-md`}>
                <Text style={tw`text-xs`}>🇮🇳</Text>
                <Text style={tw`text-[10px] font-bold text-slate-600`}>▼</Text>
              </View>
            </View>
          </View>

          {/* Email Address */}
          <View style={tw`mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>EMAIL ADDRESS *</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-3.5`}>
              <Text style={tw`text-base text-slate-400 mr-2.5`}>✉️</Text>
              <TextInput
                style={tw`flex-1 text-slate-900 text-sm font-semibold p-0`}
                placeholder="e.g. rahul@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (validationError) setValidationError(null);
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={tw`mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>PASSWORD *</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-3.5`}>
              <Text style={tw`text-base text-slate-400 mr-2.5`}>🔒</Text>
              <TextInput
                style={tw`flex-1 text-slate-900 text-sm font-semibold p-0`}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (validationError) setValidationError(null);
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={tw`text-base text-slate-400 p-1`}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements Helper */}
          {password.length > 0 && (
            <View style={tw`bg-slate-50 p-2.5 rounded-xl border border-slate-200`}>
              <Text style={tw`text-[11px] font-semibold ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasMinLength ? '✓' : '•'} Min 8 characters
              </Text>
              <Text style={tw`text-[11px] font-semibold ${hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasUpper ? '✓' : '•'} 1 Uppercase letter (A-Z)
              </Text>
              <Text style={tw`text-[11px] font-semibold ${hasLower ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasLower ? '✓' : '•'} 1 Lowercase letter (a-z)
              </Text>
              <Text style={tw`text-[11px] font-semibold ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasNumber ? '✓' : '•'} 1 Number (0-9)
              </Text>
              <Text style={tw`text-[11px] font-semibold ${hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasSpecial ? '✓' : '•'} 1 Special character (!@#$%^&*)
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <View style={tw`mt-2`}>
            <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>CONFIRM PASSWORD *</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-3.5`}>
              <Text style={tw`text-base text-slate-400 mr-2.5`}>🔒</Text>
              <TextInput
                style={tw`flex-1 text-slate-900 text-sm font-semibold p-0`}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (validationError) setValidationError(null);
                  if (error) clearError();
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={tw`text-base text-slate-400 p-1`}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Fields Divider Pill */}
          <View style={tw`items-center my-3.5 border-b border-slate-100 pb-2`}>
            <View style={tw`bg-indigo-50/90 px-3.5 py-1 rounded-full border border-indigo-100`}>
              <Text style={tw`text-[10px] font-black text-indigo-600 tracking-wider uppercase`}>OPTIONAL DETAILS</Text>
            </View>
          </View>

          {/* Gender Selector (Optional) */}
          <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>GENDER (OPTIONAL)</Text>
          <View style={tw`flex-row gap-2.5 mb-2`}>
            {[
              { label: 'Male', icon: '♂️' },
              { label: 'Female', icon: '♀️' },
              { label: 'Other', icon: '👤' },
            ].map(g => (
              <TouchableOpacity
                key={g.label}
                style={tw`flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5 border ${
                  gender === g.label
                    ? 'bg-indigo-50/90 border-indigo-600'
                    : 'bg-slate-50 border-slate-200'
                }`}
                onPress={() => setGender(gender === g.label ? '' : g.label)}>
                <Text style={tw`text-xs`}>{g.icon}</Text>
                <Text style={tw`text-xs ${gender === g.label ? 'font-black text-indigo-900' : 'font-semibold text-slate-700'}`}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Address (Optional) */}
          <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>ADDRESS (OPTIONAL)</Text>
          <View style={tw`flex-row items-start bg-slate-50 border border-slate-200 rounded-xl p-3`}>
            <Text style={tw`text-base text-slate-400 mr-2 mt-0.5`}>📍</Text>
            <TextInput
              style={tw`flex-1 text-slate-900 text-sm font-semibold p-0 h-14`}
              placeholder="Street address, City, State, Pincode"
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={tw`bg-indigo-600 rounded-2xl h-13 justify-center items-center mt-5 shadow-lg shadow-indigo-600/30 flex-row gap-2 ${
              isLoading ? 'opacity-60' : ''
            }`}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.88}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={tw`text-white font-black text-base`}>Create Account</Text>
                <Text style={tw`text-white font-bold text-base`}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row justify-center items-center mt-6 mb-5`}>
          <Text style={tw`text-xs text-slate-500`}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-xs font-black text-indigo-600`}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date of Birth Selection Modals */}
      <Modal
        visible={activePickerModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePickerModal(null)}>
        <View style={tw`flex-1 bg-black/80 justify-center p-6`}>
          <View style={tw`bg-white rounded-2xl p-5 shadow-2xl max-h-[70%]`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-lg font-extrabold text-slate-900`}>
                Select {activePickerModal === 'DAY' ? 'Day' : activePickerModal === 'MONTH' ? 'Month' : 'Year'}
              </Text>
              <TouchableOpacity onPress={() => setActivePickerModal(null)}>
                <Text style={tw`text-xl text-slate-400 p-1`}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* List options depending on active modal */}
            {activePickerModal === 'DAY' && (
              <FlatList
                data={DAYS}
                keyExtractor={item => item.toString()}
                numColumns={4}
                contentContainerStyle={tw`gap-2 py-2`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={tw`flex-1 m-1 bg-slate-50 rounded-xl py-3 items-center border ${
                      selectedDay === item ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                    }`}
                    onPress={() => {
                      setSelectedDay(item);
                      setActivePickerModal(null);
                      if (validationError) setValidationError(null);
                    }}>
                    <Text style={tw`text-sm ${selectedDay === item ? 'font-black text-white' : 'font-bold text-slate-800'}`}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {activePickerModal === 'MONTH' && (
              <FlatList
                data={MONTHS}
                keyExtractor={item => item.val}
                contentContainerStyle={tw`py-1`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={tw`py-3 px-4 rounded-xl mb-1.5 bg-slate-50 border ${
                      selectedMonth?.val === item.val ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                    }`}
                    onPress={() => {
                      setSelectedMonth(item);
                      setActivePickerModal(null);
                      if (validationError) setValidationError(null);
                    }}>
                    <Text style={tw`text-sm ${selectedMonth?.val === item.val ? 'font-black text-white' : 'font-bold text-slate-800'}`}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {activePickerModal === 'YEAR' && (
              <FlatList
                data={YEARS}
                keyExtractor={item => item.toString()}
                numColumns={3}
                contentContainerStyle={tw`gap-2 py-2`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={tw`flex-1 m-1 bg-slate-50 rounded-xl py-3 items-center border ${
                      selectedYear === item ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                    }`}
                    onPress={() => {
                      setSelectedYear(item);
                      setActivePickerModal(null);
                      if (validationError) setValidationError(null);
                    }}>
                    <Text style={tw`text-sm ${selectedYear === item ? 'font-black text-white' : 'font-bold text-slate-800'}`}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
