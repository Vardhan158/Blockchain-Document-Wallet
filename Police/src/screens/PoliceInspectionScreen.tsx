import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList, VehicleDocument } from '../types';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceInspection'>;

export const PoliceInspectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { lookupData } = route.params;
  const { user, vehicleDocuments } = lookupData;

  const renderDocCard = ({ item }: { item: VehicleDocument }) => {
    const expiryDateDisplay = (item as any).expiryDate || '28 Nov 2038';
    const blockNum = item.blockchainRecord?.blockNumber || 18492012;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('DocumentView', { document: item, citizen: user })
        }
        activeOpacity={0.88}>
        {/* Card Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIconText}>🚗</Text>
          </View>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardType}>Type: {item.documentType}</Text>
          </View>

          {/* SECTION 26: VERIFICATION BADGE */}
          <View style={styles.badgeApproved}>
            <Text style={styles.textApproved}>✓ Verified</Text>
          </View>
        </View>

        {/* SECTION 28: DOCUMENT CARD METADATA GRID */}
        <View style={styles.metaBox}>
          {/* Valid Until */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Valid Until:</Text>
            <Text style={styles.metaValHighlight}>{expiryDateDisplay}</Text>
          </View>

          {/* Blockchain Status */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Blockchain:</Text>
            <Text style={styles.metaValGreen}>Verified (Block #{blockNum})</Text>
          </View>
        </View>

        {/* SECTION 28: VIEW DOCUMENT BUTTON */}
        <TouchableOpacity
          style={styles.viewDocumentBtn}
          onPress={() =>
            navigation.navigate('DocumentView', { document: item, citizen: user })
          }
          activeOpacity={0.88}>
          <Text style={styles.viewDocumentBtnText}>View Document →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>CITIZEN VEHICLE INSPECTION</Text>
          <Text style={styles.headerSub}>User ID: {user.userId}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* SECTION 24: CITIZEN FOUND CARD (LIMITED SAFE IDENTIFYING INFORMATION) */}
        <View style={styles.citizenFoundCard}>
          <View style={styles.citizenFoundHeader}>
            <Text style={styles.citizenFoundIcon}>👤</Text>
            <Text style={styles.citizenFoundTitle}>Citizen Found</Text>
            <View style={styles.activeAccountTag}>
              <Text style={styles.activeAccountText}>
                {user.accountStatus || 'ACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.citizenDetailGrid}>
            <View style={styles.citizenDetailRow}>
              <Text style={styles.citizenLabel}>Name:</Text>
              <Text style={styles.citizenVal}>{user.fullName}</Text>
            </View>

            <View style={styles.citizenDetailRow}>
              <Text style={styles.citizenLabel}>User ID:</Text>
              <Text style={styles.citizenValMonospace}>{user.userId}</Text>
            </View>

            <View style={styles.citizenDetailRow}>
              <Text style={styles.citizenLabel}>Account:</Text>
              <Text style={styles.citizenValGreen}>
                {user.accountStatus || 'Active'}
              </Text>
            </View>

            <View style={styles.citizenDetailRow}>
              <Text style={styles.citizenLabel}>Year of Birth:</Text>
              <Text style={styles.citizenVal}>{user.yearOfBirth || '2003'}</Text>
            </View>
          </View>

          <View style={styles.privacyProtectionNotice}>
            <Text style={styles.privacyNoticeIcon}>🔒</Text>
            <Text style={styles.privacyNoticeText}>
              "Private information (Home Address, Email, Mobile, Aadhaar, PAN) is strictly protected and hidden."
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>
          Authorized Vehicle Credentials ({vehicleDocuments.length})
        </Text>

        <FlatList
          data={vehicleDocuments}
          keyExtractor={item => item.documentId}
          renderItem={renderDocCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No Verified Vehicle Documents</Text>
              <Text style={styles.emptySub}>
                This user currently has no approved vehicle-related documents available for police verification.
              </Text>
            </View>
          }
        />
      </View>
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
    fontSize: 13,
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  citizenFoundCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    marginBottom: 20,
  },
  citizenFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  citizenFoundIcon: {
    fontSize: 20,
  },
  citizenFoundTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
  },
  activeAccountTag: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeAccountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  citizenDetailGrid: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  citizenDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  citizenLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  citizenVal: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  citizenValMonospace: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#A5B4FC',
    fontWeight: '800',
  },
  citizenValGreen: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '800',
  },
  privacyProtectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  privacyNoticeIcon: {
    fontSize: 12,
  },
  privacyNoticeText: {
    fontSize: 11,
    color: '#A5B4FC',
    fontStyle: 'italic',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  viewDocumentBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  viewDocumentBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  cardType: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
  },
  badgeApproved: {
    backgroundColor: PoliceTheme.colors.verifiedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textApproved: {
    fontSize: 11,
    fontWeight: '800',
    color: PoliceTheme.colors.verifiedText,
  },
  metaBox: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    fontWeight: '600',
  },
  metaValGreen: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '800',
  },
  metaValHighlight: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: PoliceTheme.colors.badgeGold,
    fontWeight: '800',
  },
  metaValMonospace: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
  },
  tagVehicle: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagVehicleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PoliceTheme.colors.border,
  },
  docIdText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: PoliceTheme.colors.textMuted,
  },
  inspectLink: {
    fontSize: 12,
    fontWeight: '800',
    color: PoliceTheme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  emptySub: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
});

export default PoliceInspectionScreen;
