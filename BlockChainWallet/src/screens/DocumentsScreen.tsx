import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { useDocumentStore } from '../store/useDocumentStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { DocumentItem } from '../types/models';
import { GradientSurface, VaultIcon, VaultFolder } from '../components/DashboardArtwork';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Documents'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ActiveFilter = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'VEHICLE' | 'NORMAL';

export const DocumentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { documents, fetchDocuments, isLoading } = useDocumentStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
      fetchNotifications();
      const interval = setInterval(() => {
        fetchDocuments();
        fetchNotifications();
      }, 6000);
      return () => clearInterval(interval);
    }, [fetchDocuments, fetchNotifications]),
  );

  useEffect(() => {
    if (route.params?.initialTag) {
      setActiveFilter(route.params.initialTag);
    }
  }, [route.params]);

  // Document Counts
  const totalCount = documents.length;
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const pendingCount = documents.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length;
  const rejectedCount = documents.filter(d => d.status === 'REJECTED').length;
  const vehicleCount = documents.filter(d => d.approvedTag === 'VEHICLE').length;
  const normalCount = documents.filter(d => d.approvedTag === 'NORMAL').length;

  // Filtering Logic
  const filteredDocs = documents.filter(doc => {
    let matchesFilter = true;
    if (activeFilter === 'APPROVED') matchesFilter = doc.status === 'APPROVED';
    else if (activeFilter === 'PENDING') matchesFilter = doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW';
    else if (activeFilter === 'REJECTED') matchesFilter = doc.status === 'REJECTED';
    else if (activeFilter === 'VEHICLE') matchesFilter = doc.approvedTag === 'VEHICLE';
    else if (activeFilter === 'NORMAL') matchesFilter = doc.approvedTag === 'NORMAL';

    const matchesSearch =
      !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getDocIcon = (type: string, tag: string) => {
    if (tag === 'VEHICLE' || type.includes('VEHICLE') || type.includes('DRIVING')) return '🚘';
    if (type.includes('PASSPORT')) return '🛂';
    if (type.includes('DEGREE') || type.includes('MARKS')) return '🎓';
    if (type.includes('PAN')) return '💳';
    if (type.includes('AADHAAR') || type.includes('VOTER')) return '🪪';
    if (type.includes('INSURANCE') || type.includes('POLLUTION')) return '🛡️';
    return '📄';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '27 Sep 2026';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return '27 Sep 2026';
    }
  };

  const renderDocCard = ({ item }: { item: DocumentItem }) => {
    const isApproved = item.status === 'APPROVED';
    const isPending = item.status === 'PENDING' || item.status === 'UNDER_REVIEW';
    const isRejected = item.status === 'REJECTED';

    const selectedTagDisplay = item.requestedTag || item.approvedTag || 'Vehicle';
    const approvedTagDisplay = item.approvedTag || 'Vehicle';

    return (
      <TouchableOpacity
        style={s.docCard}
        onPress={() => navigation.navigate('DocumentDetails', { documentId: item.id })}
        activeOpacity={0.88}>

        {/* Card Header */}
        <View style={s.docHeader}>
          <View style={s.docIconTextRow}>
            <View style={s.docIconBox}>
              <Text style={s.docIcon}>{getDocIcon(item.documentType, item.approvedTag)}</Text>
            </View>
            <View style={s.docTitleBox}>
              <Text style={s.docTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.docType}>{item.documentType.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          <View style={[s.statusBadge, isApproved ? s.statusApprovedBg : isPending ? s.statusPendingBg : s.statusRejectedBg]}>
            <Text style={[s.statusText, isApproved ? s.statusApproved : isPending ? s.statusPending : s.statusRejected]}>
              {isApproved ? 'Verified' : isPending ? 'Pending' : 'Rejected'}
            </Text>
          </View>
        </View>

        {/* Blockchain Badge */}
        {isApproved && (
          <View style={s.blockchainBadge}>
            <Text style={s.blockchainText}>✓ Blockchain Verified</Text>
          </View>
        )}

        {/* Details Grid */}
        <View style={s.detailsGrid}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Uploaded:</Text>
            <Text style={s.detailVal}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Selected Tag:</Text>
            <View style={s.tagBoxGray}>
              <Text style={s.tagText}>{selectedTagDisplay}</Text>
            </View>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Approved Tag:</Text>
            <View style={[s.tagBoxColor, approvedTagDisplay === 'VEHICLE' ? s.tagVehicle : s.tagNormal]}>
              <Text style={s.tagTextWhite}>{approvedTagDisplay}</Text>
            </View>
          </View>
        </View>

        {/* Rejected Reason UI */}
        {isRejected && (
          <View style={s.rejectFlow}>
            <View style={s.rejectBox}>
              <Text style={s.rejectLabel}>Reason:</Text>
              <Text style={s.rejectReason}>"{item.rejectionReason || 'Uploaded image is unclear.'}"</Text>
            </View>
            <View style={s.rejectActions}>
              <TouchableOpacity
                style={s.viewReasonBtn}
                onPress={() => navigation.navigate('DocumentDetails', { documentId: item.id })}>
                <Text style={s.viewReasonText}>View Reason</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.reuploadBtn} onPress={() => navigation.navigate('Upload')}>
                <Text style={s.reuploadText}>↻ Re-upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Card Footer */}
        <View style={s.cardFooter}>
          <Text style={s.cardId}>ID: {item.id}</Text>
          <Text style={s.cardViewDetails}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={s.listHeaderContent}>
      {/* Search Bar */}
      <View style={s.searchBar}>
        <VaultIcon name="eye" size={16} color="#7b819b" />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, type, or ID..."
          placeholderTextColor="#7b819b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearSearch}>
            <VaultIcon name="close" size={12} color="#7b819b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterScroll}
        style={s.filterContainer}>
        {[
          ['ALL', `All (${totalCount})`],
          ['APPROVED', `Approved (${approvedCount})`],
          ['PENDING', `Pending (${pendingCount})`],
          ['REJECTED', `Rejected (${rejectedCount})`],
          ['VEHICLE', `🚗 Vehicle (${vehicleCount})`],
          ['NORMAL', `📁 Normal (${normalCount})`],
        ].map(([key, label]) => {
          const isActive = activeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.filterChip, isActive && s.filterChipActive]}
              onPress={() => setActiveFilter(key as ActiveFilter)}>
              <Text style={[s.filterText, isActive && s.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={s.screen}>
      <View style={[s.topGlow, { height: insets.top + 160 }]}>
        <GradientSurface colors={['#b2a1ff', '#bccbff', '#cef8fb']} />
      </View>

      <View style={[s.headerRow, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerBrand}>
          <View style={s.logo}>
            <GradientSurface />
            <VaultIcon name="shield" color="white" size={24} />
          </View>
          <View>
            <Text style={s.brandTitle}>MY VAULT</Text>
            <Text style={s.brandSubtitle}>Manage Documents</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('Notifications')}
          style={s.headerButton}>
          <VaultIcon name="bell" size={23} color="#171438" />
          {unreadCount > 0 && <View style={s.unread} />}
        </TouchableOpacity>
      </View>

      <View style={s.sheet}>
        <FlatList
          data={filteredDocs}
          keyExtractor={item => item.id}
          renderItem={renderDocCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchDocuments} tintColor="#6342ff" />
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <VaultFolder width={72} height={52} shield={false} />
              <Text style={s.emptyTitle}>No documents found</Text>
              <Text style={s.emptyDesc}>
                No documents match the filter ({activeFilter}).{'\n'}Try uploading a new document.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fafbff' },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.3, color: '#090a23' },
  brandSubtitle: { fontSize: 10, color: '#596383', marginTop: 1 },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#4131a5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unread: {
    position: 'absolute',
    right: 7,
    top: 6,
    width: 8,
    height: 8,
    backgroundColor: '#ff354d',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fafbfff5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  scrollContent: { padding: 16, paddingTop: 20 },
  listHeaderContent: { marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0fb',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    shadowColor: '#7878b2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#171438', marginLeft: 8 },
  clearSearch: { padding: 4 },
  filterContainer: { maxHeight: 42, marginBottom: 4 },
  filterScroll: { gap: 8, paddingRight: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0fb',
  },
  filterChipActive: { backgroundColor: '#6442ff', borderColor: '#6442ff' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#596383' },
  filterTextActive: { color: '#ffffff' },

  // Document Cards
  docCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf0fb',
    shadowColor: '#7878b2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  docIconTextRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10, paddingRight: 8 },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f5f2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: { fontSize: 22 },
  docTitleBox: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '800', color: '#090a23' },
  docType: { fontSize: 11, color: '#7b819b', marginTop: 2, fontWeight: '600' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusApprovedBg: { backgroundColor: '#edfbf5', borderColor: '#c7f4e4' },
  statusPendingBg: { backgroundColor: '#fff8e4', borderColor: '#fff0ca' },
  statusRejectedBg: { backgroundColor: '#fff0f2', borderColor: '#ffd3dc' },
  statusText: { fontSize: 10, fontWeight: '800' },
  statusApproved: { color: '#009963' },
  statusPending: { color: '#bd8100' },
  statusRejected: { color: '#ef2547' },

  blockchainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1fafe',
    borderWidth: 1,
    borderColor: '#bbf0ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  blockchainText: { fontSize: 10, fontWeight: '800', color: '#009df2' },

  detailsGrid: { backgroundColor: '#fafbff', borderRadius: 14, padding: 12, gap: 6, borderWidth: 1, borderColor: '#edf0fb' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#7b819b' },
  detailVal: { fontSize: 12, fontWeight: '700', color: '#090a23' },
  tagBoxGray: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800', color: '#475569', fontFamily: 'monospace' },
  tagBoxColor: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagVehicle: { backgroundColor: '#6342ff' },
  tagNormal: { backgroundColor: '#009df2' },
  tagTextWhite: { fontSize: 10, fontWeight: '800', color: 'white', fontFamily: 'monospace' },

  rejectFlow: { marginTop: 12 },
  rejectBox: { backgroundColor: '#fff0f2', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#ffd3dc', marginBottom: 8 },
  rejectLabel: { fontSize: 9, fontWeight: '800', color: '#ef2547', letterSpacing: 0.5 },
  rejectReason: { fontSize: 11, color: '#9f1229', fontStyle: 'italic', marginTop: 3 },
  rejectActions: { flexDirection: 'row', gap: 8 },
  viewReasonBtn: { flex: 1, backgroundColor: 'white', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#edf0fb' },
  viewReasonText: { fontSize: 11, fontWeight: '700', color: '#596383' },
  reuploadBtn: { flex: 1, backgroundColor: '#ef2547', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  reuploadText: { fontSize: 11, fontWeight: '800', color: 'white' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#edf0fb' },
  cardId: { fontSize: 10, fontFamily: 'monospace', color: '#a0aabf', fontWeight: '600' },
  cardViewDetails: { fontSize: 11, fontWeight: '800', color: '#6342ff' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#090a23', marginTop: 12 },
  emptyDesc: { fontSize: 12, color: '#7b819b', textAlign: 'center', marginTop: 6, lineHeight: 18 },
});

export default DocumentsScreen;
