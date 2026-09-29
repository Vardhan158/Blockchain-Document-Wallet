import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tokenStorage from '../services/tokenStorage';
import { PoliceTheme } from '../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { policeApi } from '../services/api';

export const PoliceProfileScreen: React.FC<any> = ({ navigation }) => {
  const [officer, setOfficer] = React.useState<any>({});
  React.useEffect(() => { policeApi.getProfile().then(data => setOfficer(data.officer || data)).catch(async () => {
    const cached = await AsyncStorage.getItem('officer_data');
    if (cached) setOfficer(JSON.parse(cached));
  }); }, []);
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out Officer Session',
      'Are you sure you want to sign out of the Government Officer Inspection Terminal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const tokens = await tokenStorage.getTokens();
            try { await policeApi.logout(tokens.refreshToken); } catch (_) { /* local logout still proceeds */ }
            await tokenStorage.clearTokens();
            navigation.navigate('PoliceLogin');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>👤</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>OFFICER PROFILE & BADGE</Text>
          <Text style={styles.headerSub}>Enclave Credentials Verified</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Officer Credentials</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.nameText}>{officer.fullName || 'Officer'}</Text>
              <Text style={styles.rankText}>Rank: {officer.rankDesignation || '—'}</Text>
              <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>ID #{officer.employeeId || officer.badgeNumber || '—'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Police Station:</Text>
            <Text style={styles.val}>{officer.policeStation || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.val}>{officer.district || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>District / State:</Text>
            <Text style={styles.val}>{officer.state || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Official Email:</Text>
            <Text style={styles.val}>{officer.email || '—'}</Text>
          </View>
          <View style={styles.detailRow}><Text style={styles.label}>Official Mobile:</Text><Text style={styles.val}>{officer.phone || '—'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>Account Status:</Text><Text style={styles.val}>{officer.status || '—'}</Text></View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Change Password', 'Use the Security settings flow to change your password.') }><Text style={styles.actionText}>Change Password</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Security', 'Your session, approved role, and document access are protected by the backend.') }><Text style={styles.actionText}>Security</Text></TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.88}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out of Inspection Terminal</Text>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
    marginBottom: 16,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PoliceTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metaCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  rankText: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.badgeGold,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
  },
  divider: {
    height: 1,
    backgroundColor: PoliceTheme.colors.border,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  label: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  val: {
    fontSize: 12,
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.alertText,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },
  actionText: { color: PoliceTheme.colors.textMain, fontWeight: '800', textAlign: 'center' },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    color: PoliceTheme.colors.alertText,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default PoliceProfileScreen;
