import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { policeApi } from '../services/api';
import { PoliceTheme } from '../theme/theme';

function formatSearchTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today — ${timeStr}`;
    }
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — ${timeStr}`;
  } catch (e) {
    return 'Recently';
  }
}

export const PoliceHistoryScreen: React.FC<any> = ({ navigation }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isFreshSearching, setIsFreshSearching] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await policeApi.getSearchHistory();
      if (res && res.history) {
        setHistory(res.history);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // SECTION 42: FRESH AUTHORIZATION CHECK TRIGGER
  const handleFreshReQuery = async (userIdToReQuery: string) => {
    try {
      setIsFreshSearching(true);
      const freshData = await policeApi.lookupCitizenByUserId(userIdToReQuery);
      setIsFreshSearching(false);
      setSelectedEntry(null);

      if (freshData && freshData.user) {
        // Navigates to Inspection Screen with fresh backend data
        navigation.navigate('PoliceInspection', { lookupData: freshData });
      } else {
        Alert.alert('No Match', 'No citizen found matching the provided User ID.');
      }
    } catch (err: any) {
      setIsFreshSearching(false);
      Alert.alert('Lookup Error', err.response?.data?.message || 'Failed to re-query citizen User ID.');
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const timeFormatted = formatSearchTime(item.createdAt);
    const docCount = item.metadata?.matchingVehicleDocumentsCount || item.metadata?.matchingVehicleDocsCount || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedEntry(item)}
        activeOpacity={0.88}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>

          <View style={styles.titleCol}>
            <Text style={styles.userIdText}>{item.entityId}</Text>
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{docCount} Docs</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.historyMetaNote}>History metadata only (No file caching)</Text>
          <Text style={styles.viewDetailsText}>Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>📜</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>RECENT VERIFICATIONS</Text>
          <Text style={styles.headerSub}>Section 41 & 42 Search Audit History</Text>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.screenTitle}>Recent Verifications</Text>
        <Text style={styles.screenSub}>
          Audit-logged records of past citizen User ID searches. Metadata only stored.
        </Text>

        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchHistory}
              tintColor={PoliceTheme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No Recent Verifications</Text>
              <Text style={styles.emptySub}>
                Citizen User ID queries performed during your shift will appear here.
              </Text>
            </View>
          }
        />
      </View>

      {/* SECTION 42: SEARCH HISTORY DETAILS MODAL */}
      <Modal
        visible={selectedEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEntry(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search History Details</Text>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedEntry && (
              <View style={styles.modalBody}>
                {/* 1. User ID */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User ID:</Text>
                  <Text style={styles.detailValMonospace}>{selectedEntry.entityId}</Text>
                </View>

                {/* 2. Search Time */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Search Time:</Text>
                  <Text style={styles.detailVal}>
                    {new Date(selectedEntry.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* 3. Number of Verified Vehicle Documents */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Number of Vehicle Docs:</Text>
                  <Text style={styles.detailValHighlight}>
                    {selectedEntry.metadata?.matchingVehicleDocumentsCount || selectedEntry.metadata?.matchingVehicleDocsCount || 0} Document(s)
                  </Text>
                </View>

                {/* 4. Verification Result */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Verification Result:</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>✓ Success — Authorized Lookup</Text>
                  </View>
                </View>

                <View style={styles.metadataNoticeBox}>
                  <Text style={styles.metadataNoticeIcon}>🔒</Text>
                  <Text style={styles.metadataNoticeText}>
                    "History stores metadata only. No document images or files are cached locally for privacy compliance."
                  </Text>
                </View>

                {/* SECTION 42: FRESH AUTHORIZATION CHECK BUTTON */}
                <TouchableOpacity
                  style={[styles.reQueryBtn, isFreshSearching && styles.btnDisabled]}
                  onPress={() => handleFreshReQuery(selectedEntry.entityId)}
                  disabled={isFreshSearching}
                  activeOpacity={0.88}>
                  {isFreshSearching ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.reQueryBtnText}>🔄 Trigger Fresh Backend Re-Query</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setSelectedEntry(null)}>
                  <Text style={styles.closeModalBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  screenSub: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 28,
    gap: 10,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 18,
  },
  titleCol: {
    flex: 1,
  },
  userIdText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#A5B4FC',
    fontFamily: 'monospace',
  },
  timeText: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PoliceTheme.colors.border,
  },
  historyMetaNote: {
    fontSize: 10,
    color: PoliceTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '800',
    color: PoliceTheme.colors.primary,
  },
  emptyCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  emptySub: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  closeBtn: {
    fontSize: 20,
    color: PoliceTheme.colors.textMuted,
  },
  modalBody: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
  },
  detailValMonospace: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#A5B4FC',
    fontWeight: '800',
  },
  detailValHighlight: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '800',
  },
  resultBadge: {
    backgroundColor: PoliceTheme.colors.verifiedBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: PoliceTheme.colors.verifiedText,
  },
  metadataNoticeBox: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  metadataNoticeIcon: {
    fontSize: 16,
  },
  metadataNoticeText: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    lineHeight: 16,
    flex: 1,
    fontStyle: 'italic',
  },
  reQueryBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  reQueryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  closeModalBtn: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  closeModalBtnText: {
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PoliceHistoryScreen;
