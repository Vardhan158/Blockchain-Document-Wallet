import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentStore } from '../store/useDocumentStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { OfflineBanner } from '../components/OfflineBanner';
import {
  GradientSurface,
  VaultFolder,
  VaultIcon,
  IconName,
} from '../components/DashboardArtwork';
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;
type Filter = 'All Documents' | 'Vehicle Documents' | 'Personal Documents';
const filters: Filter[] = [
  'All Documents',
  'Vehicle Documents',
  'Personal Documents',
];
const palettes = [
  { bg: '#eff6ff', border: '#dceaff', color: '#28a5ff', label: '#596990' },
  { bg: '#edfbf5', border: '#c7f4e4', color: '#00b77e', label: '#009963' },
  { bg: '#fff8e4', border: '#fff0ca', color: '#ffb500', label: '#eb9200' },
  { bg: '#fff0f2', border: '#ffd3dc', color: '#ff4565', label: '#ef2547' },
];
export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const { documents, fetchDocuments, isLoading, error } = useDocumentStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<Filter>('All Documents');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const refresh = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchDocuments(), fetchNotifications()]);
  }, [fetchProfile, fetchDocuments, fetchNotifications]);
  useFocusEffect(
    useCallback(() => {
      refresh();
      const interval = setInterval(() => {
        refresh();
      }, 6000);
      return () => clearInterval(interval);
    }, [refresh]),
  );
  const userId = user?.userId;
  const filtered = documents.filter(
    doc =>
      filter === 'All Documents' ||
      doc.approvedTag ===
        (filter === 'Vehicle Documents' ? 'VEHICLE' : 'NORMAL'),
  );
  const counts = [
    filtered.length,
    filtered.filter(d => d.status === 'APPROVED').length,
    filtered.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW')
      .length,
    filtered.filter(d => d.status === 'REJECTED').length,
  ];
  const openDocuments = () =>
    navigation.navigate(
      'Documents',
      filter === 'All Documents'
        ? undefined
        : { initialTag: filter === 'Vehicle Documents' ? 'VEHICLE' : 'NORMAL' },
    );
  const actions: {
    label: string;
    icon: IconName;
    color: string;
    bg: string;
    route: 'Upload' | 'Documents' | 'UserId' | 'Notifications';
  }[] = [
    {
      label: 'Upload\nDocument',
      icon: 'upload',
      color: '#6342ff',
      bg: '#f1eeff',
      route: 'Upload',
    },
    {
      label: 'View\nDocuments',
      icon: 'document',
      color: '#009df2',
      bg: '#edf7ff',
      route: 'Documents',
    },
    {
      label: 'View\nUser ID',
      icon: 'id',
      color: '#a038ff',
      bg: '#f8efff',
      route: 'UserId',
    },
    {
      label: 'Notifications',
      icon: 'bell',
      color: '#f36522',
      bg: '#fff5ed',
      route: 'Notifications',
    },
  ];
  return (
    <View style={s.screen}>
      <View style={[s.topGlow, { height: insets.top + 185 }]}>
        <GradientSurface colors={['#b2a1ff', '#bccbff', '#cef8fb']} />
      </View>
      <ScrollView
        style={{ marginTop: insets.top }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingTop: 8, paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#6342ff"
          />
        }
      >
        <View style={s.sheet}>
          <OfflineBanner />
          <View style={s.header}>
            <View style={s.logo}>
              <GradientSurface />
              <VaultIcon name="shield" color="white" size={26} />
            </View>
            <View style={s.brand}>
              <Text style={s.brandTitle}>VAULT / ID</Text>
              <Text style={s.brandSubtitle}>Digital Document Vault</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation.navigate('Notifications')}
              style={s.headerButton}
            >
              <VaultIcon name="bell" size={23} />
              {unreadCount > 0 && <View style={s.unread} />}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Your profile"
              onPress={() => navigation.navigate('Profile')}
              style={s.avatar}
            >
              <Text style={s.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={s.welcome}>
            <View pointerEvents="none" style={s.heroArt}>
              <VaultFolder width={145} height={120} />
            </View>
            <Text style={[s.welcomeTitle, width < 370 && s.compactTitle]}>
              Welcome, {user?.fullName?.split(' ')[0] || 'there'}
            </Text>
            <Text style={s.welcomeSubtitle}>
              Your secure digital identity & documents
            </Text>
          </View>
          <View style={s.identity}>
            <GradientSurface />
            <View style={s.identityTop}>
              <Text style={s.eyebrow}>PRIMARY PUBLIC USER ID</Text>
              <View style={s.verified}>
                <VaultIcon name="shield" size={12} color="#61ffda" />
                <Text style={s.verifiedText}>
                  {user?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </Text>
              </View>
            </View>
            <Text
              selectable
              adjustsFontSizeToFit
              numberOfLines={1}
              style={s.publicId}
            >
              {userId || 'ID unavailable'}
            </Text>
            <View style={s.idButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={!userId}
                style={s.idButton}
                onPress={() => {
                  if (userId) {
                    Clipboard.setString(userId);
                    setCopied(true);
                  }
                }}
              >
                <VaultIcon name={copied ? 'check' : 'copy'} size={18} />
                <Text style={s.idButtonText}>
                  {copied ? 'Copied' : 'Copy ID'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={!userId}
                style={s.idButton}
                onPress={() => setShowQr(true)}
              >
                <VaultIcon name="qr" size={18} />
                <Text style={s.idButtonText}>Show QR</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[s.qrDecoration, width < 370 && s.hidden]}
              pointerEvents="none"
            >
              <VaultIcon name="qr" size={40} color="#969aff" />
            </View>
          </View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Dashboard Summary</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Filter dashboard documents"
              style={s.filter}
              onPress={() => setShowFilter(true)}
            >
              <Text style={s.filterText}>{filter}</Text>
              <VaultIcon name="chevron" size={13} color="#546081" />
            </TouchableOpacity>
          </View>
          <View style={s.summaryGrid}>
            {(
              ['Total Documents', 'Approved', 'Pending', 'Rejected'] as const
            ).map((label, i) => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${counts[i]}. View documents`}
                key={label}
                onPress={openDocuments}
                style={[
                  s.summary,
                  {
                    backgroundColor: palettes[i].bg,
                    borderColor: palettes[i].border,
                  },
                ]}
              >
                <View
                  style={[
                    s.summaryIcon,
                    { backgroundColor: palettes[i].color },
                  ]}
                >
                  <VaultIcon
                    name={
                      (['document', 'check', 'clock', 'close'] as IconName[])[i]
                    }
                    size={21}
                    color="white"
                  />
                </View>
                <View style={s.summaryText}>
                  <Text style={[s.summaryLabel, { color: palettes[i].label }]}>
                    {label}
                  </Text>
                  <Text style={s.count}>{counts[i]}</Text>
                </View>
                <View style={s.summaryArt}>
                  <VaultIcon
                    name={
                      (
                        ['document', 'check', 'clock', 'document'] as IconName[]
                      )[i]
                    }
                    size={48}
                    color={palettes[i].color}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate('Documents')}
            >
              <Text style={s.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.actions}>
            {actions.map(action => (
              <TouchableOpacity
                accessibilityRole="button"
                key={action.route}
                onPress={() => navigation.navigate(action.route)}
                style={[
                  s.action,
                  {
                    backgroundColor: action.bg,
                    borderColor: `${action.color}20`,
                  },
                ]}
              >
                <View
                  style={[
                    s.actionIcon,
                    { backgroundColor: `${action.color}28` },
                  ]}
                >
                  <VaultIcon
                    name={action.icon}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={[s.actionLabel, width < 370 && s.compactAction]}>
                  {action.label}
                </Text>
                <View
                  style={[
                    s.actionArrow,
                    {
                      backgroundColor: `${action.color}13`,
                      borderColor: `${action.color}25`,
                    },
                  ]}
                >
                  <VaultIcon name="arrow" size={15} color={action.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Vault Activity</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={openDocuments}
            >
              <Text style={s.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          {error ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Unable to load documents</Text>
              <Text style={s.emptyDescription}>{error}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={refresh}
                style={s.uploadButton}
              >
                <Text style={s.uploadText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={s.empty}>
              <VaultFolder width={68} height={47} shield={false} />
              <Text style={s.emptyTitle}>
                {isLoading
                  ? 'Loading documents…'
                  : documents.length
                  ? 'No matching documents'
                  : 'No Documents Yet'}
              </Text>
              <Text style={s.emptyDescription}>
                Upload your first document to start building your{'\n'}secure
                document wallet.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                style={s.uploadButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <VaultIcon name="plus" color="white" size={22} />
                <Text style={s.uploadText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.activity}>
              {[...filtered]
                .sort(
                  (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                )
                .slice(0, 3)
                .map(doc => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={doc.id}
                    style={s.activityRow}
                    onPress={() =>
                      navigation.navigate('DocumentDetails', {
                        documentId: doc.id,
                      })
                    }
                  >
                    <VaultIcon name="document" color="#6543ff" />
                    <View style={s.activityText}>
                      <Text style={s.documentTitle}>{doc.title}</Text>
                      <Text style={s.documentType}>
                        {doc.documentType.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <Text
                      style={[
                        s.status,
                        doc.status === 'APPROVED'
                          ? s.approvedStatus
                          : doc.status === 'REJECTED'
                          ? s.rejectedStatus
                          : s.pendingStatus,
                      ]}
                    >
                      {doc.status.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={showQr || showFilter}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowQr(false);
          setShowFilter(false);
        }}
      >
        <View style={s.modalBackdrop}>
          <View accessibilityViewIsModal style={s.modal}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                {showQr ? 'Your Digital User ID' : 'Show documents'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={() => {
                  setShowQr(false);
                  setShowFilter(false);
                }}
                hitSlop={12}
              >
                <VaultIcon name="close" />
              </TouchableOpacity>
            </View>
            {showQr && userId ? (
              <View style={s.qrContent}>
                <QRCode value={userId} size={210} color="#231b63" />
                <Text selectable style={s.qrId}>
                  {userId}
                </Text>
                <Text style={s.emptyDescription}>{user?.fullName}</Text>
              </View>
            ) : (
              filters.map(item => (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === item }}
                  key={item}
                  style={s.filterOption}
                  onPress={() => {
                    setFilter(item);
                    setShowFilter(false);
                  }}
                >
                  <Text style={s.documentTitle}>{item}</Text>
                  {filter === item && (
                    <VaultIcon name="check" color="#6342ff" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
const s = StyleSheet.create({
  hidden: { display: 'none' },
  approvedStatus: { color: '#009963' },
  rejectedStatus: { color: '#ef2547' },
  pendingStatus: { color: '#bd8100' },
  screen: { flex: 1, backgroundColor: '#fafbff' },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0 },
  scroll: { flexGrow: 1 },
  sheet: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#fafbfff5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { flex: 1 },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
    color: '#090a23',
  },
  brandSubtitle: { fontSize: 10, color: '#596383', marginTop: 1 },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  unread: {
    position: 'absolute',
    right: 5,
    top: 4,
    width: 8,
    height: 8,
    backgroundColor: '#ff354d',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  avatar: {
    width: 37,
    height: 37,
    borderRadius: 22,
    backgroundColor: '#6140ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  avatarText: { fontSize: 17, color: 'white', fontWeight: '700' },
  welcome: { paddingTop: 31, paddingBottom: 20, minHeight: 99 },
  heroArt: { position: 'absolute', right: -11, bottom: -24, opacity: 0.85 },
  welcomeTitle: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: '#08081e',
    zIndex: 1,
  },
  compactTitle: { fontSize: 24 },
  welcomeSubtitle: { fontSize: 12, color: '#626b88', marginTop: 4, zIndex: 1 },
  identity: {
    borderRadius: 18,
    padding: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8e7bff',
    minHeight: 130,
    elevation: 7,
    shadowColor: '#4131a5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    marginBottom: 17,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#e6deff',
    flexShrink: 1,
  },
  verified: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#52edcc',
    borderRadius: 16,
    backgroundColor: '#075077',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 9, fontWeight: '800', color: '#61ffda' },
  publicId: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginTop: 4,
    marginBottom: 13,
  },
  idButtons: { flexDirection: 'row', gap: 10 },
  idButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f2ff',
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingVertical: 9,
  },
  idButtonText: { fontSize: 12, color: '#242055', fontWeight: '600' },
  qrDecoration: { position: 'absolute', right: 12, bottom: 20, opacity: 0.45 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 17,
    letterSpacing: -0.5,
    color: '#0c0b25',
    fontWeight: '800',
    flexShrink: 1,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e5f4',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: '#ffffff88',
    maxWidth: '46%',
  },
  filterText: { fontSize: 10, color: '#424a6b', flexShrink: 1 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  summary: {
    width: '48%',
    flexGrow: 1,
    minHeight: 77,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    overflow: 'hidden',
    gap: 12,
  },
  summaryIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  summaryText: { zIndex: 1, flex: 1 },
  summaryLabel: { fontSize: 10, fontWeight: '500' },
  count: { fontSize: 27, fontWeight: '800', color: '#070822', marginTop: 1 },
  summaryArt: {
    position: 'absolute',
    right: 9,
    bottom: 6,
    opacity: 0.18,
    transform: [{ rotate: '7deg' }],
  },
  viewAll: { color: '#6241ff', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 7, marginBottom: 19 },
  action: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    padding: 10,
    minHeight: 119,
    alignItems: 'flex-start',
  },
  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#11102a',
    lineHeight: 14,
    minHeight: 29,
  },
  compactAction: { fontSize: 9 },
  actionArrow: {
    borderRadius: 14,
    width: 23,
    height: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  empty: {
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0fb',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#7878b2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#11112a',
    fontWeight: '800',
    marginTop: 1,
  },
  emptyDescription: {
    color: '#6c7393',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 3,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#6442ff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 22,
    marginTop: 7,
  },
  uploadText: { color: 'white', fontSize: 12, fontWeight: '700' },
  activity: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#edf0fb',
    paddingHorizontal: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  activityText: { flex: 1 },
  documentTitle: { fontSize: 13, color: '#171438', fontWeight: '600' },
  documentType: { fontSize: 10, color: '#7b819b', marginTop: 3 },
  status: { fontSize: 9, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#15102e88',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  qrContent: { alignItems: 'center', paddingTop: 20, paddingBottom: 12 },
  qrId: { color: '#352377', fontSize: 20, fontWeight: '800', marginTop: 20 },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
});
export default HomeScreen;
