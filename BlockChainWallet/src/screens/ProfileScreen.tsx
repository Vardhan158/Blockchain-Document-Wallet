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
import { SafeAreaView } from 'react-native-safe-area-context';
import { VaultLogo } from '../components/VaultLogo';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = () => {
  const { user, logout, fetchProfile } = useAuthStore();

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
    <SafeAreaView style={tw`flex-1 bg-slate-900`} edges={['top']}>
      <View style={tw`h-15 bg-slate-950 flex-row items-center px-4 border-b border-slate-800`}>
        <VaultLogo size="sm" subtitle="User Profile" />
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4.5 pb-10`}
        showsVerticalScrollIndicator={false}>
        <Text style={tw`text-xl font-black text-white mb-4`}>My Profile</Text>

        {/* PROFILE HEADER CARD & AVATAR */}
        <View style={tw`bg-indigo-950/90 rounded-2xl p-5 border-1.5 border-indigo-500 mb-5 shadow-xl`}>
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-14 h-14 rounded-full bg-indigo-600 justify-center items-center border-2 border-indigo-400`}>
              <Text style={tw`text-2xl font-black text-white`}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-black text-white`}>{user?.fullName || 'Rahul Sharma'}</Text>
              <Text style={tw`text-xs text-indigo-300 mt-0.5`}>{user?.email || 'rahul.sharma@example.com'}</Text>
              <View style={tw`bg-emerald-950/80 px-2 py-0.5 rounded-full self-start mt-1.5 border border-emerald-500`}>
                <Text style={tw`text-[9px] font-extrabold text-emerald-400`}>✓ VERIFIED SOVEREIGN ACCOUNT</Text>
              </View>
            </View>
          </View>

          <View style={tw`h-px bg-white/10 my-3.5`} />

          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-[10px] font-black text-indigo-300 tracking-wider`}>USER ID:</Text>
            <Text style={tw`text-base font-black text-white font-mono`}>{user?.userId || 'BDW-9K7F3A2'}</Text>
          </View>
        </View>

        {/* PROFILE DETAILS CARD */}
        <View style={tw`bg-slate-800 rounded-2xl p-4.5 border border-slate-700 mb-5 space-y-3`}>
          <Text style={tw`text-base font-extrabold text-white mb-2`}>Account Information</Text>

          {/* 1. Name */}
          <View style={tw`flex-row justify-between items-center py-2.5 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Name:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{user?.fullName || 'Rahul Sharma'}</Text>
          </View>

          {/* 2. Mobile Number */}
          <View style={tw`flex-row justify-between items-center py-2.5 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Mobile Number:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{user?.phone || '+91 9876543210'}</Text>
          </View>

          {/* 3. Email */}
          <View style={tw`flex-row justify-between items-center py-2.5 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Email:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{user?.email || 'rahul.sharma@example.com'}</Text>
          </View>

          {/* 4. Date of Birth */}
          <View style={tw`flex-row justify-between items-center py-2.5 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Date of Birth:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{user?.dob || '15 May 1998'}</Text>
          </View>

          {/* 5. User ID */}
          <View style={tw`flex-row justify-between items-center py-2.5 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>User ID:</Text>
            <Text style={tw`text-xs font-black text-indigo-300 font-mono`}>
              {user?.userId || 'BDW-9K7F3A2'}
            </Text>
          </View>

          {/* 6. Account Creation Date */}
          <View style={tw`flex-row justify-between items-center py-2.5`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Account Creation Date:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{formatDate(user?.createdAt)}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS STACK */}
        <Text style={tw`text-base font-extrabold text-white mb-3`}>Account Actions</Text>
        <View style={tw`space-y-3`}>
          {/* Button 1: Edit Profile */}
          <TouchableOpacity
            style={tw`bg-slate-800 rounded-2xl h-12 flex-row items-center px-4 border border-slate-700 gap-3 mb-2.5`}
            onPress={() => {
              setEmailStep('IDLE');
              setEditModalVisible(true);
            }}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>✏️</Text>
            <Text style={tw`text-xs font-bold text-white`}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Button 2: Change Password */}
          <TouchableOpacity
            style={tw`bg-slate-800 rounded-2xl h-12 flex-row items-center px-4 border border-slate-700 gap-3 mb-2.5`}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🔑</Text>
            <Text style={tw`text-xs font-bold text-white`}>Change Password</Text>
          </TouchableOpacity>

          {/* Button 3: Security */}
          <TouchableOpacity
            style={tw`bg-slate-800 rounded-2xl h-12 flex-row items-center px-4 border border-slate-700 gap-3 mb-2.5`}
            onPress={() => setSecurityModalVisible(true)}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🛡️</Text>
            <Text style={tw`text-xs font-bold text-white`}>Security & Encryption</Text>
          </TouchableOpacity>

          {/* Button 4: Logout */}
          <TouchableOpacity
            style={tw`bg-amber-950/80 rounded-2xl h-12 flex-row items-center px-4 border border-amber-800 gap-3 mt-2`}
            onPress={handleLogout}
            activeOpacity={0.88}>
            <Text style={tw`text-base`}>🚪</Text>
            <Text style={tw`text-xs font-bold text-red-300`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL & SENSITIVE EMAIL CHANGE FLOW */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={tw`flex-1 bg-black/85 justify-center p-5`}>
          <View style={tw`bg-slate-800 rounded-2xl p-5 border border-slate-700 max-h-[90%]`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-base font-extrabold text-white`}>
                {emailStep === 'IDLE'
                  ? 'Edit Profile Information'
                  : emailStep === 'OLD_OTP'
                  ? 'Verify Current Email OTP'
                  : 'Verify New Email OTP'}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            {emailStep === 'IDLE' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>FULL NAME *</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                  placeholderTextColor="#64748B"
                />

                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>MOBILE NUMBER</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Mobile Number"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />

                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>DATE OF BIRTH</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
                  value={editDob}
                  onChangeText={setEditDob}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748B"
                />

                <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>EMAIL ADDRESS (Requires Verification)</Text>
                <TextInput
                  style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
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
        <View style={tw`flex-1 bg-black/85 justify-center p-5`}>
          <View style={tw`bg-slate-800 rounded-2xl p-5 border border-slate-700`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-base font-extrabold text-white`}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>CURRENT PASSWORD *</Text>
            <TextInput
              style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>NEW PASSWORD *</Text>
            <TextInput
              style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password (8+ chars)"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <Text style={tw`text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-2 mb-1.5`}>CONFIRM NEW PASSWORD *</Text>
            <TextInput
              style={tw`bg-slate-900 border-1.5 border-slate-700 rounded-xl h-12 px-3.5 text-white text-sm mb-3`}
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
        <View style={tw`flex-1 bg-black/85 justify-center p-5`}>
          <View style={tw`bg-slate-800 rounded-2xl p-5 border border-slate-700`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-base font-extrabold text-white`}>Security & Encryption</Text>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`bg-slate-900 rounded-xl p-3.5 mb-2.5 border border-slate-800`}>
              <Text style={tw`text-xs font-extrabold text-white`}>🔐 AES-256-CBC File Encryption</Text>
              <Text style={tw`text-[11px] text-slate-400 mt-1 leading-4`}>All document buffers are encrypted before writing to storage.</Text>
            </View>

            <View style={tw`bg-slate-900 rounded-xl p-3.5 mb-2.5 border border-slate-800`}>
              <Text style={tw`text-xs font-extrabold text-white`}>⛓️ SHA-256 Blockchain Ledger</Text>
              <Text style={tw`text-[11px] text-slate-400 mt-1 leading-4`}>Immutable on-chain verification prevents document tampering.</Text>
            </View>

            <View style={tw`bg-slate-900 rounded-xl p-3.5 mb-2.5 border border-slate-800`}>
              <Text style={tw`text-xs font-extrabold text-white`}>🔑 Keychain Token Isolation</Text>
              <Text style={tw`text-[11px] text-slate-400 mt-1 leading-4`}>Access & Refresh tokens are isolated in hardware secure storage.</Text>
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
