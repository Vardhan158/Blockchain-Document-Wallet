import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList } from '../types';
import { policeApi } from '../services/api';
import tokenStorage from '../services/tokenStorage';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceHome'>;

export const PoliceHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const officerData = route.params?.officer || {
    badgeNumber: 'POL-8841',
    fullName: 'Ramesh Kumar',
    department: 'Central Traffic Enforcement',
    policeStation: 'Central Traffic Police Station',
    rank: 'Inspector',
  };

  const officerName = officerData.fullName || 'Ramesh Kumar';
  const officerId = officerData.badgeNumber || officerData.employeeId || 'POL-8841';
  const officerRank = officerData.rank || officerData.rankDesignation || 'Inspector';
  const policeStation = officerData.policeStation || 'Central Traffic Police Station';

  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await policeApi.getSearchHistory();
      if (res && res.history) {
        setSearchHistory(res.history);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
            await tokenStorage.clearTokens();
            navigation.navigate('PoliceLogin');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>👮</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>GOVERNMENT INSPECTION DASHBOARD</Text>
          <Text style={styles.headerSub}>Officer ID: {officerId}</Text>
        </View>
        <TouchableOpacity style={styles.logoutHeaderBtn} onPress={handleLogout}>
          <Text style={styles.logoutHeaderIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchHistory}
            tintColor={PoliceTheme.colors.primary}
          />
        }>
        {/* SECTION 18: HEADER GREETING */}
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeLabel}>Welcome,</Text>
          <Text style={styles.officerNameHeading}>Officer {officerName}</Text>
        </View>

        {/* SECTION 18: OFFICER IDENTITY BADGE CARD */}
        <View style={styles.officerBadgeCard}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeGoldBox}>
              <Text style={styles.badgeGoldText}>🎖️ OFFICIAL BADGE</Text>
            </View>
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activePillText}>DUTY ACTIVE</Text>
            </View>
          </View>

          <Text style={styles.cardIdLabel}>OFFICER ID</Text>
          <Text style={styles.cardIdVal}>{officerId}</Text>

          <View style={styles.badgeDivider} />

          <View style={styles.badgeGrid}>
            <View style={styles.badgeCol}>
              <Text style={styles.badgeMetaLabel}>Rank</Text>
              <Text style={styles.badgeMetaVal}>{officerRank}</Text>
            </View>

            <View style={styles.badgeCol}>
              <Text style={styles.badgeMetaLabel}>Police Station</Text>
              <Text style={styles.badgeMetaVal}>{policeStation}</Text>
            </View>
          </View>
        </View>

        {/* SECTION 18: PRIMARY ACTION - VERIFY CITIZEN */}
        <TouchableOpacity
          style={styles.primaryCtaBtn}
          onPress={() => navigation.navigate('PoliceLookup')}
          activeOpacity={0.88}>
          <View style={styles.primaryCtaIconBox}>
            <Text style={styles.primaryCtaIcon}>🔍</Text>
          </View>
          <View style={styles.primaryCtaTextCol}>
            <Text style={styles.primaryCtaTitle}>Verify Citizen</Text>
            <Text style={styles.primaryCtaSub}>
              Query citizen User ID (BDW-XXXXXXX) for vehicle credentials
            </Text>
          </View>
          <Text style={styles.primaryCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* SECTION 18: OPTIONAL STATISTICS CARDS */}
        <Text style={styles.sectionTitle}>Shift Inspection Statistics</Text>
        <View style={styles.statsGrid}>
          {/* Stat 1: Today's Verifications */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Verifications</Text>
            <Text style={styles.statVal}>14</Text>
          </View>

          {/* Stat 2: Total Searches */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Searches</Text>
            <Text style={styles.statVal}>88</Text>
          </View>

          {/* Stat 3: Last Login */}
          <View style={[styles.statCard, { width: '100%' }]}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Last Login:</Text>
              <Text style={styles.statValSmall}>Today, 09:15 AM (Enclave Authenticated)</Text>
            </View>
          </View>
        </View>

        {/* SECTION 18: RECENT SEARCHES HISTORY */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Searches History</Text>
          <TouchableOpacity onPress={fetchHistory}>
            <Text style={styles.refreshLink}>Refresh 🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyList}>
          {searchHistory.length === 0 ? (
            <View style={styles.emptyHistoryCard}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyTitle}>No Recent Searches</Text>
              <Text style={styles.emptySub}>
                Your recent citizen User ID inspection logs will appear here during duty.
              </Text>
            </View>
          ) : (
            searchHistory.slice(0, 4).map(item => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyIcon}>🔍</Text>
                  <View>
                    <Text style={styles.historyTargetId}>Target User ID: {item.entityId}</Text>
                    <Text style={styles.historyMeta}>
                      Found {item.metadata?.matchingVehicleDocumentsCount || 0} vehicle document(s)
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Read-Only Safety Banner */}
        <View style={styles.readOnlyNotice}>
          <Text style={styles.noticeIcon}>🔒</Text>
          <Text style={styles.noticeText}>
            "Police officers are strictly read-only users. They cannot modify citizen information or documents."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    fontFamily: 'monospace',
  },
  logoutHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutHeaderIcon: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  greetingSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  welcomeLabel: {
    fontSize: 14,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  officerNameHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
    marginTop: 2,
  },
  officerBadgeCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: PoliceTheme.colors.primary,
    marginBottom: 20,
  },
  badgeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGoldBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.badgeGold,
  },
  badgeGoldText: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  cardIdLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.primary,
    letterSpacing: 1.2,
  },
  cardIdVal: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  badgeDivider: {
    height: 1,
    backgroundColor: PoliceTheme.colors.border,
    marginVertical: 14,
  },
  badgeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeCol: {
    flex: 1,
  },
  badgeMetaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: PoliceTheme.colors.textMuted,
  },
  badgeMetaVal: {
    fontSize: 13,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
    marginTop: 2,
  },
  primaryCtaBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  primaryCtaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCtaIcon: {
    fontSize: 22,
  },
  primaryCtaTextCol: {
    flex: 1,
  },
  primaryCtaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  primaryCtaSub: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
    lineHeight: 16,
  },
  primaryCtaArrow: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PoliceTheme.colors.textMuted,
  },
  statVal: {
    fontSize: 26,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
    marginTop: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshLink: {
    fontSize: 12,
    fontWeight: '800',
    color: PoliceTheme.colors.primary,
  },
  historyList: {
    gap: 10,
    marginBottom: 24,
  },
  emptyHistoryCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  emptySub: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyIcon: {
    fontSize: 18,
  },
  historyTargetId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A5B4FC',
    fontFamily: 'monospace',
  },
  historyMeta: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
  },
  historyTime: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  readOnlyNotice: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  noticeIcon: {
    fontSize: 18,
  },
  noticeText: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default PoliceHomeScreen;
