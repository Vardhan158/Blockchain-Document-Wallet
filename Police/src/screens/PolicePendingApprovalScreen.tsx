import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList } from '../types';
import api from '../services/api';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PolicePendingApproval'>;

export const PolicePendingApprovalScreen: React.FC<Props> = ({ route, navigation }) => {
  const { officer, email, password } = route.params || {};

  const officerId = officer?.employeeId || officer?.badgeNumber || 'POL-8841';
  const policeStation = officer?.policeStation || 'Central Traffic Police Station';
  const officialEmail = email || officer?.email || 'officer@police.gov.in';

  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    if (!officialEmail || !password) {
      Alert.alert('Sign In Required', 'Please return to the login screen and sign in.');
      navigation.navigate('PoliceLogin');
      return;
    }

    try {
      setIsChecking(true);
      const res = await api.post('/police/login', {
        email: officialEmail,
        password,
      });

      setIsChecking(false);
      Alert.alert('Account Approved!', 'Congratulations! Your government officer account has been approved by an administrator.', [
        {
          text: 'Proceed to Citizen Inspection',
          onPress: () => navigation.navigate('PoliceLookup'),
        },
      ]);
    } catch (err: any) {
      setIsChecking(false);
      if (err.response?.status === 403 && err.response?.data?.status === 'PENDING_APPROVAL') {
        Alert.alert('Still Pending', 'Your account is still awaiting administrator review. Please check again later.');
      } else {
        Alert.alert('Status Check', err.response?.data?.message || 'Could not verify status. Please try again.');
      }
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>👮</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>GOVERNMENT OFFICER PORTAL</Text>
          <Text style={styles.headerSub}>Section 13: Pending Approval</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Status Icon Header */}
        <View style={styles.iconHeader}>
          <View style={styles.pendingBadgeBox}>
            <Text style={styles.hourglassIcon}>⏳</Text>
          </View>
          <Text style={styles.mainTitle}>Registration Submitted</Text>
          <Text style={styles.messageText}>
            Your government officer account is awaiting administrator verification. You will be able to access citizen document verification after your account has been approved.
          </Text>
        </View>

        {/* SECTION 13: OFFICER DETAILS SUMMARY CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Officer Application Summary</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Pending Approval</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Officer ID:</Text>
            <Text style={styles.infoValMonospace}>{officerId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Police Station:</Text>
            <Text style={styles.infoVal}>{policeStation}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application Status:</Text>
            <Text style={styles.infoValGold}>Status: Pending Approval</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Official Email:</Text>
            <Text style={styles.infoVal}>{officialEmail}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.checkBtn, isChecking && styles.btnDisabled]}
          onPress={handleCheckStatus}
          disabled={isChecking}
          activeOpacity={0.88}>
          {isChecking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkBtnText}>🔄 Check Approval Status</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLoginBtn}
          onPress={() => navigation.navigate('PoliceLogin')}
          activeOpacity={0.85}>
          <Text style={styles.backLoginBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    alignItems: 'center',
  },
  iconHeader: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  pendingBadgeBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: PoliceTheme.colors.badgeGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hourglassIcon: {
    fontSize: 28,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  messageText: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PoliceTheme.colors.border,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.badgeGold,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PoliceTheme.colors.badgeGold,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: PoliceTheme.colors.badgeGold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoLabel: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
  },
  infoValMonospace: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#A5B4FC',
    fontWeight: '900',
  },
  infoValGold: {
    fontSize: 13,
    color: PoliceTheme.colors.badgeGold,
    fontWeight: '800',
  },
  checkBtn: {
    width: '100%',
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  backLoginBtn: {
    width: '100%',
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  backLoginBtnText: {
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PolicePendingApprovalScreen;
