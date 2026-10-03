import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { VaultLogo } from '../components/VaultLogo';
import { GradientSurface } from '../components/DashboardArtwork';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

function IdentityField({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={tw`flex-row items-center py-3 ${last ? '' : 'border-b border-slate-100'}`}>
      <View style={tw`w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3`}>
        <View style={tw`w-3 h-3 rounded-full bg-blue-600`} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-400`}>{label}</Text>
        <Text numberOfLines={1} style={tw`text-[13px] font-bold text-slate-800 mt-0.5`}>{value}</Text>
      </View>
    </View>
  );
}

export const ProfileScreen: React.FC<Props> = () => {
  const { user, logout, fetchProfile } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDob, setEditDob] = useState(user?.dob || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Email Change Verification Flow (Section 47)
  const [emailStep, setEmailStep] = useState<'IDLE' | 'OLD_OTP' | 'NEW_OTP'>('IDLE');
  const [oldEmailOtp, setOldEmailOtp] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');
  const [otpDemoCode, setOtpDemoCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditPhone(user.phone || '');
      setEditDob(user.dob || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '27 September 2026';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return '27 September 2026';
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);

      // 1. Check if email was modified -> Requires Section 47 Sensitive Verification Flow!
      if (editEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
        const res = await api.post('/auth/change-email/initiate', {
          newEmail: editEmail.trim(),
        });

        setOtpDemoCode(res.data.otpDemo || '');
        setEmailStep('OLD_OTP');
        setIsUpdating(false);
        Alert.alert(
          'Email Verification Required',
          `Step 1/2: Verification OTP sent to your current email address (${user?.email}).`
        );
        return;
      }

      // 2. Standard Profile Fields Update (Name, Phone, DOB)
      await api.put('/auth/profile', {
        fullName: editName.trim(),
        phone: editPhone.trim(),
        dob: editDob.trim(),
      });

      await fetchProfile();
      setIsUpdating(false);
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your profile information was saved successfully.');
    } catch (err: any) {
      setIsUpdating(false);
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile.');
    }
  };

  // Section 47 Step 1 Verification: OTP to Old Email
  const handleVerifyOldEmailOtp = async () => {
    try {
      setIsUpdating(true);
      const res = await api.post('/auth/change-email/verify-old', {
        otp: oldEmailOtp.trim(),
        newEmail: editEmail.trim(),
      });

      setOtpDemoCode(res.data.otpDemo || '');
      setEmailStep('NEW_OTP');
      setIsUpdating(false);
      Alert.alert(
        'Current Email Verified!',
        `Step 2/2: Verification OTP sent to your requested new email (${editEmail}).`
      );
    } catch (err: any) {
      setIsUpdating(false);
      Alert.alert('OTP Verification Failed', err.response?.data?.message || 'Invalid OTP code.');
    }
  };

  // Section 47 Step 2 Verification: OTP to New Email & Update
  const handleVerifyNewEmailOtp = async () => {
    try {
      setIsUpdating(true);
      await api.post('/auth/change-email/verify-new', {
        otp: newEmailOtp.trim(),
        newEmail: editEmail.trim(),
      });

      await fetchProfile();
      setIsUpdating(false);
      setEmailStep('IDLE');
      setEditModalVisible(false);
      Alert.alert('Email Updated!', 'Your email address has been updated successfully after 2-factor email verification.');
    } catch (err: any) {
      setIsUpdating(false);
      Alert.alert('OTP Verification Failed', err.response?.data?.message || 'Invalid OTP code.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Validation Error', 'Please enter your current password and new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setIsChangingPass(false);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password Changed', 'Your password has been changed successfully.');
    } catch (err: any) {
      setIsChangingPass(false);
      Alert.alert('Error', err.response?.data?.message || 'Could not change password.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out of Vault Wallet',
      'Are you sure you want to sign out of your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#fafbff]`} edges={[]}>
      <View style={[tw`absolute top-0 left-0 right-0`, { height: insets.top + 160 }]}>
        <GradientSurface colors={['#b2a1ff', '#bccbff', '#cef8fb']} />
      </View>
      <View style={[tw`flex-row items-center px-4`, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <VaultLogo size="sm" subtitle="User Profile" />
      </View>

      <ScrollView
        style={[tw`flex-1 bg-[#fafbfff5] overflow-hidden`, { borderTopLeftRadius: 32, borderTopRightRadius: 32 }]}
        contentContainerStyle={tw`p-4.5 pt-5 pb-10`}
        showsVerticalScrollIndicator={false}>
        <Text style={tw`text-[10px] font-black tracking-widest text-blue-700 mb-1`}>DIGITAL IDENTITY</Text>
        <Text style={tw`text-2xl font-black text-slate-900 mb-4`}>My Profile</Text>

        {/* PROFILE HEADER CARD & AVATAR */}
        <View style={tw`bg-[#0b63ce] rounded-2xl p-5 border border-blue-500 mb-5 shadow-sm`}>
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-14 h-14 rounded-full bg-white justify-center items-center border-2 border-blue-200`}>
              <Text style={tw`text-2xl font-black text-blue-700`}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-black text-white`}>{user?.fullName || 'Rahul Sharma'}</Text>
              <Text style={tw`text-xs text-blue-100 mt-0.5`}>{user?.email || 'rahul.sharma@example.com'}</Text>
              <View style={tw`bg-emerald-950/80 px-2 py-0.5 rounded-full self-start mt-1.5 border border-emerald-500`}>
                <Text style={tw`text-[9px] font-extrabold text-emerald-400`}>✓ VERIFIED SOVEREIGN ACCOUNT</Text>
              </View>
            </View>
          </View>

          <View style={tw`h-px bg-white/30 my-3.5`} />

          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-[10px] font-black text-blue-100 tracking-wider`}>DIGITAL USER ID</Text>
            <Text style={tw`text-base font-black text-white font-mono`}>{user?.userId || 'BDW-9K7F3A2'}</Text>
          </View>
        </View>

        {/* PROFILE DETAILS CARD */}
        <View style={tw`bg-white rounded-3xl p-4.5 border border-slate-200 mb-5 shadow-sm`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <View>
              <Text style={tw`text-base font-black text-slate-900`}>Account Information</Text>
              <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>Your verified digital identity details</Text>
            </View>
            <View style={tw`bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1`}><Text style={tw`text-[9px] font-black text-emerald-600`}>VERIFIED</Text></View>
          </View>

          <IdentityField label="Full Name" value={user?.fullName || 'Rahul Sharma'} />
          <IdentityField label="Mobile Number" value={user?.phone || '+91 9876543210'} />
          <IdentityField label="Email Address" value={user?.email || 'rahul.sharma@example.com'} />
          <IdentityField label="Date of Birth" value={user?.dob || '15 May 1998'} />
          <IdentityField label="Digital User ID" value={user?.userId || 'BDW-9K7F3A2'} />
          <IdentityField label="Account Created" value={formatDate(user?.createdAt)} last />
        </View>

        {/* ACTION BUTTONS STACK */}
        <Text style={tw`text-[10px] font-black tracking-widest text-blue-700 mb-1`}>ACCOUNT & SECURITY</Text>
        <Text style={tw`text-xl font-black text-slate-900 mb-3`}>Account Actions</Text>
        <View style={tw`bg-white rounded-3xl border border-slate-200 px-4 mb-4 shadow-sm`}>
          {/* Button 1: Edit Profile */}
          <TouchableOpacity
            style={tw`h-16 flex-row items-center border-b border-slate-100 gap-3`}
            onPress={() => {
              setEmailStep('IDLE');
              setEditModalVisible(true);
            }}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>✏️</Text>
            <View style={tw`flex-1`}><Text style={tw`text-sm font-bold text-slate-800`}>Edit Profile</Text><Text style={tw`text-[10px] text-slate-500 mt-0.5`}>Update identity and contact details</Text></View>
            <Text style={tw`text-xl text-blue-600`}>›</Text>
          </TouchableOpacity>

          {/* Button 2: Change Password */}
          <TouchableOpacity
            style={tw`h-16 flex-row items-center border-b border-slate-100 gap-3`}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🔑</Text>
            <View style={tw`flex-1`}><Text style={tw`text-sm font-bold text-slate-800`}>Change Password</Text><Text style={tw`text-[10px] text-slate-500 mt-0.5`}>Manage your sign-in credentials</Text></View>
            <Text style={tw`text-xl text-blue-600`}>›</Text>
          </TouchableOpacity>

          {/* Button 3: Security */}
          <TouchableOpacity
            style={tw`h-16 flex-row items-center gap-3`}
            onPress={() => setSecurityModalVisible(true)}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🛡️</Text>
            <View style={tw`flex-1`}><Text style={tw`text-sm font-bold text-slate-800`}>Security & Encryption</Text><Text style={tw`text-[10px] text-slate-500 mt-0.5`}>Review wallet protection settings</Text></View>
            <Text style={tw`text-xl text-blue-600`}>›</Text>
          </TouchableOpacity>

          {/* Button 4: Logout */}
          <TouchableOpacity
            style={tw`bg-white rounded-2xl h-14 flex-row items-center px-4 border-1.5 border-red-200 gap-3 mt-5 mb-4`}
            onPress={handleLogout}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🚪</Text>
            <View style={tw`flex-1`}><Text style={tw`text-sm font-black text-red-600`}>Sign out securely</Text><Text style={tw`text-[10px] text-red-400 mt-0.5`}>Remove this wallet session from this device</Text></View>
            <View style={tw`w-8 h-8 rounded-full bg-red-50 items-center justify-center`}><Text style={tw`text-lg font-black text-red-500`}>›</Text></View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL & SENSITIVE EMAIL CHANGE FLOW */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={tw`flex-1 bg-slate-900/40 justify-end`}>
          <View style={tw`bg-[#fafbff] rounded-t-3xl p-5 border-t border-slate-200 max-h-[90%]`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View><Text style={tw`text-[10px] font-black tracking-widest text-blue-700 mb-1`}>DIGITAL IDENTITY</Text><Text style={tw`text-lg font-black text-slate-900`}>
                {emailStep === 'IDLE'
                  ? 'Edit Profile Information'
                  : emailStep === 'OLD_OTP'
                  ? 'Verify Current Email OTP'
                  : 'Verify New Email OTP'}
              </Text></View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            {emailStep === 'IDLE' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>FULL NAME *</Text>
                <TextInput
                  style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                  placeholderTextColor="#64748B"
                />

                <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>MOBILE NUMBER</Text>
                <TextInput
                  style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Mobile Number"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />

                <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>DATE OF BIRTH</Text>
                <TextInput
                  style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
                  value={editDob}
                  onChangeText={setEditDob}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748B"
                />

                <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>EMAIL ADDRESS (Requires Verification)</Text>
                <TextInput
                  style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center mt-4 shadow-lg shadow-indigo-600/30`}
                  onPress={handleSaveProfile}
                  disabled={isUpdating}>
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={tw`text-white font-extrabold text-sm`}>Save Profile Changes</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* STEP 1: OTP TO OLD EMAIL */}
            {emailStep === 'OLD_OTP' && (
              <View style={tw`py-2`}>
                <View style={tw`bg-indigo-950 rounded-xl p-3.5 border border-indigo-500 mb-3.5`}>
                  <Text style={tw`text-[10px] font-black text-emerald-400 tracking-wider`}>STEP 1 OF 2: CURRENT EMAIL OTP</Text>
                  <Text style={tw`text-xs text-slate-300 mt-1 leading-4`}>
                    A 4-digit OTP has been sent to your current email address ({user?.email}) to verify this sensitive email change request.
                  </Text>
                  {otpDemoCode ? (
                    <Text style={tw`text-base font-black text-white font-mono mt-2`}>OTP Code: {otpDemoCode}</Text>
                  ) : null}
                </View>

                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1.5`}>ENTER OTP SENT TO CURRENT EMAIL *</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-indigo-500 rounded-xl h-12 px-3.5 text-white text-base font-black text-center font-mono mb-4`}
                  value={oldEmailOtp}
                  onChangeText={setOldEmailOtp}
                  placeholder="• • • •"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <TouchableOpacity
                  style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30`}
                  onPress={handleVerifyOldEmailOtp}
                  disabled={isUpdating}>
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={tw`text-white font-extrabold text-sm`}>Verify Current Email OTP →</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: OTP TO NEW EMAIL */}
            {emailStep === 'NEW_OTP' && (
              <View style={tw`py-2`}>
                <View style={tw`bg-indigo-950 rounded-xl p-3.5 border border-indigo-500 mb-3.5`}>
                  <Text style={tw`text-[10px] font-black text-emerald-400 tracking-wider`}>STEP 2 OF 2: NEW EMAIL OTP</Text>
                  <Text style={tw`text-xs text-slate-300 mt-1 leading-4`}>
                    Current email verified! Now enter the 4-digit OTP sent to your requested NEW email address ({editEmail}).
                  </Text>
                  {otpDemoCode ? (
                    <Text style={tw`text-base font-black text-white font-mono mt-2`}>OTP Code: {otpDemoCode}</Text>
                  ) : null}
                </View>

                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1.5`}>ENTER OTP SENT TO NEW EMAIL *</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-indigo-500 rounded-xl h-12 px-3.5 text-white text-base font-black text-center font-mono mb-4`}
                  value={newEmailOtp}
                  onChangeText={setNewEmailOtp}
                  placeholder="• • • •"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <TouchableOpacity
                  style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30`}
                  onPress={handleVerifyNewEmailOtp}
                  disabled={isUpdating}>
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={tw`text-white font-extrabold text-sm`}>Verify & Finalize Email Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={tw`flex-1 bg-slate-900/40 justify-end`}>
          <View style={tw`bg-[#fafbff] rounded-t-3xl p-5 border-t border-slate-200`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View><Text style={tw`text-[10px] font-black tracking-widest text-blue-700 mb-1`}>ACCOUNT SECURITY</Text><Text style={tw`text-lg font-black text-slate-900`}>Change Password</Text></View>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>CURRENT PASSWORD *</Text>
            <TextInput
              style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>NEW PASSWORD *</Text>
            <TextInput
              style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password (8+ chars)"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <Text style={tw`text-[10px] font-black text-blue-700 uppercase tracking-wider mt-2 mb-1.5`}>CONFIRM NEW PASSWORD *</Text>
            <TextInput
              style={tw`bg-white border border-slate-200 rounded-xl h-12 px-3.5 text-slate-900 text-sm mb-3`}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <TouchableOpacity
              style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center mt-4 shadow-lg shadow-indigo-600/30`}
              onPress={handleChangePassword}
              disabled={isChangingPass}>
              {isChangingPass ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={tw`text-white font-extrabold text-sm`}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SECURITY & ENCRYPTION STATUS MODAL */}
      <Modal
        visible={securityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecurityModalVisible(false)}>
        <View style={tw`flex-1 bg-slate-900/40 justify-end`}>
          <View style={tw`bg-[#fafbff] rounded-t-3xl p-5 border-t border-slate-200`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View><Text style={tw`text-[10px] font-black tracking-widest text-blue-700 mb-1`}>WALLET PROTECTION</Text><Text style={tw`text-lg font-black text-slate-900`}>Security & Encryption</Text></View>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`bg-white rounded-2xl p-3.5 mb-2.5 border border-blue-100`}>
              <Text style={tw`text-xs font-extrabold text-slate-900`}>🔐 AES-256-CBC File Encryption</Text>
              <Text style={tw`text-[11px] text-slate-500 mt-1 leading-4`}>All document buffers are encrypted before writing to storage.</Text>
            </View>

            <View style={tw`bg-white rounded-2xl p-3.5 mb-2.5 border border-blue-100`}>
              <Text style={tw`text-xs font-extrabold text-slate-900`}>⛓️ SHA-256 Blockchain Ledger</Text>
              <Text style={tw`text-[11px] text-slate-500 mt-1 leading-4`}>Immutable on-chain verification prevents document tampering.</Text>
            </View>

            <View style={tw`bg-white rounded-2xl p-3.5 mb-2.5 border border-blue-100`}>
              <Text style={tw`text-xs font-extrabold text-slate-900`}>🔑 Keychain Token Isolation</Text>
              <Text style={tw`text-[11px] text-slate-500 mt-1 leading-4`}>Access & Refresh tokens are isolated in hardware secure storage.</Text>
            </View>

            <TouchableOpacity
              style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center mt-3 shadow-lg shadow-indigo-600/30`}
              onPress={() => setSecurityModalVisible(false)}>
              <Text style={tw`text-white font-extrabold text-sm`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
