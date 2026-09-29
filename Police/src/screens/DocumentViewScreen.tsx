import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList, ExpiryStatus, RevocationStatus } from '../types';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'DocumentView'>;

function computeExpiryStatus(docType: string, isExplicitExpired?: boolean): { status: ExpiryStatus; label: string } {
  if (['MARKS_CARD', 'DEGREE_CERTIFICATE', 'AADHAAR'].includes(docType.toUpperCase())) {
    return { status: 'NOT_APPLICABLE', label: 'N/A (Non-Expiring Asset)' };
  }
  if (isExplicitExpired) {
    return { status: 'EXPIRED', label: 'Expired' };
  }
  return { status: 'VALID', label: 'Valid' };
}

export const DocumentViewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { document, citizen } = route.params;

  const [techOpen, setTechOpen] = useState(false);

  const bcRecord = document.blockchainRecord;
  const txHash = bcRecord?.transactionHash || '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8';
  const blockNum = bcRecord?.blockNumber || 18492012;
  const docHash = document.documentHash || bcRecord?.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const approvalDate = bcRecord?.verifiedAt
    ? new Date(bcRecord.verifiedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '21 September 2026';

  const docTitle = document.title || 'Driving Licence';
  const citizenName = citizen.fullName || 'Rahul Kumar';
  const docVersion = (document as any).version || (bcRecord as any)?.version || 1;

  // SECTION 45: 4-TUPLE RECOMMENDED STATUS MODEL EVALUATION
  const verificationStatus = document.verificationStatus || 'APPROVED';
  const revocationStatus: RevocationStatus = bcRecord && (bcRecord.status === 'REJECTED' || bcRecord.valid === false) ? 'REVOKED' : 'ACTIVE';
  const isIntegrityVerified = bcRecord && docHash === document.documentHash && revocationStatus === 'ACTIVE';
  const blockchainIntegrity = isIntegrityVerified ? 'VERIFIED' : 'INTEGRITY_FAILED';

  // SECTION 46: EXPIRY STATUS (NOT_APPLICABLE | VALID | EXPIRING_SOON | EXPIRED)
  const isExplicitExpired = (document as any).isExpired === true;
  const { status: expiryStatus, label: expiryStatusLabel } = computeExpiryStatus(document.documentType, isExplicitExpired);
  const expiryDateText = (document as any).expiryDate || (expiryStatus === 'NOT_APPLICABLE' ? 'Non-Expiring Document' : '18 March 2032');

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
          <Text style={styles.headerTitle}>DOCUMENT DETAILS</Text>
          <Text style={styles.headerSub}>Read-Only Officer Inspection</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.docTitle}>{docTitle}</Text>
          <Text style={styles.docType}>Type: {document.documentType}</Text>
        </View>

        {/* SECTION 30: SECURE SHORT-LIVED DOCUMENT PREVIEW BOX */}
        <View style={styles.previewBox}>
          <View style={styles.previewHeaderRow}>
            <Text style={styles.previewHeaderTitle}>DOCUMENT PREVIEW</Text>
            <View style={styles.shortLivedBadge}>
              <Text style={styles.shortLivedBadgeText}>🔒 15m STREAM</Text>
            </View>
          </View>

          <View style={styles.previewCardBody}>
            <Text style={styles.previewEmblem}>🚗</Text>
            <Text style={styles.previewTitle}>{docTitle}</Text>
            <Text style={styles.previewSub}>
              Citizen: {citizenName} • ID: {citizen.userId}
            </Text>
          </View>

          <Text style={styles.streamNoticeText}>
            "Backend streams a short-lived secure document response. No permanent public URLs provided."
          </Text>
        </View>

        {/* SECTION 35 & 45: PROMINENT WARNINGS FOR REVOKED OR INTEGRITY FAILURE */}
        {revocationStatus === 'REVOKED' ? (
          <View style={styles.revokedCard}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.revokedTitle}>Record Revoked</Text>
            </View>
            <Text style={styles.revokedText}>
              This document record has been revoked on the blockchain ledger. Do NOT mark valid.
            </Text>
          </View>
        ) : !isIntegrityVerified ? (
          <View style={styles.integrityWarningCard}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.integrityWarningTitle}>Document Integrity Warning</Text>
            </View>
            <Text style={styles.integrityWarningBody}>
              The stored document does not match its blockchain verification record. Do NOT mark or consider the document valid.
            </Text>
          </View>
        ) : null}

        {/* SECTION 45 & 46: RECOMMENDED DOCUMENT STATUS MODEL (4-TUPLE) */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>4-Tuple Document Status Model</Text>

          {/* 1. Verification Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>verificationStatus:</Text>
            <View style={styles.badgeApproved}>
              <Text style={styles.textApproved}>{verificationStatus}</Text>
            </View>
          </View>

          {/* 2. Revocation Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>revocationStatus:</Text>
            <View style={revocationStatus === 'REVOKED' ? styles.badgeRevoked : styles.badgeValid}>
              <Text style={revocationStatus === 'REVOKED' ? styles.textRevoked : styles.textValid}>
                {revocationStatus}
              </Text>
            </View>
          </View>

          {/* 3. Expiry Status (NOT_APPLICABLE | VALID | EXPIRING_SOON | EXPIRED) */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>expiryStatus:</Text>
            <View
              style={[
                styles.badgePill,
                expiryStatus === 'NOT_APPLICABLE'
                  ? styles.badgeNa
                  : expiryStatus === 'EXPIRED'
                  ? styles.badgeRevoked
                  : styles.badgeValid,
              ]}>
              <Text
                style={[
                  styles.badgePillText,
                  expiryStatus === 'NOT_APPLICABLE'
                    ? styles.textNa
                    : expiryStatus === 'EXPIRED'
                    ? styles.textRevoked
                    : styles.textValid,
                ]}>
                {expiryStatus}
              </Text>
            </View>
          </View>

          {/* 4. Blockchain Integrity */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>blockchainIntegrity:</Text>
            <Text style={isIntegrityVerified ? styles.detailValGreen : styles.textRevoked}>
              {blockchainIntegrity}
            </Text>
          </View>

          {/* Additional Metadata */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiration Date:</Text>
            <Text style={expiryStatus === 'EXPIRED' ? styles.textRevoked : styles.detailValGold}>
              {expiryDateText}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Citizen:</Text>
            <Text style={styles.detailValHighlight}>{citizenName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Approved Category:</Text>
            <View style={styles.tagVehicle}>
              <Text style={styles.tagVehicleText}>Vehicle</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verification Date:</Text>
            <Text style={styles.detailVal}>{approvalDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Document Version:</Text>
            <Text style={styles.detailVal}>v{docVersion}</Text>
          </View>
        </View>

        {/* SECTION 36: TECHNICAL VERIFICATION DETAILS COLLAPSIBLE ACCORDION */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setTechOpen(!techOpen)}
            activeOpacity={0.88}>
            <View style={styles.accordionTitleRow}>
              <Text style={styles.techIcon}>🔐</Text>
              <Text style={styles.accordionTitle}>Technical Verification Details</Text>
            </View>
            <Text style={styles.chevronIcon}>{techOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {techOpen && (
            <View style={styles.accordionBody}>
              {/* Blockchain Transaction Reference */}
              <View style={styles.techBlock}>
                <Text style={styles.techBlockLabel}>BLOCKCHAIN TRANSACTION REFERENCE</Text>
                <Text style={styles.techBlockVal} numberOfLines={1}>{txHash}</Text>
              </View>

              {/* Block Number */}
              <View style={styles.techRow}>
                <Text style={styles.techRowLabel}>Block Number:</Text>
                <Text style={styles.techRowVal}>Block #{blockNum}</Text>
              </View>

              {/* Document Hash */}
              <View style={styles.techBlock}>
                <Text style={styles.techBlockLabel}>DOCUMENT SHA-256 HASH</Text>
                <Text style={styles.techBlockVal} numberOfLines={1}>{docHash}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Read Only Police Protection Banner */}
        <View style={styles.readOnlyBanner}>
          <Text style={styles.readOnlyIcon}>🔒</Text>
          <View style={styles.readOnlyCol}>
            <Text style={styles.readOnlyTitle}>READ-ONLY OFFICER MODE ACTIVE</Text>
            <Text style={styles.readOnlyText}>
              "Police officers are strictly read-only users. They cannot modify citizen information or documents."
            </Text>
          </View>
        </View>
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
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  docType: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 20,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
    letterSpacing: 1,
  },
  shortLivedBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shortLivedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  previewCardBody: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewEmblem: {
    fontSize: 44,
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  previewSub: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    marginTop: 4,
  },
  streamNoticeText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  revokedCard: {
    backgroundColor: '#451A03',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningIcon: {
    fontSize: 20,
  },
  revokedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FCA5A5',
  },
  revokedText: {
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 18,
    fontWeight: '600',
  },
  integrityWarningCard: {
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    marginBottom: 20,
  },
  integrityWarningTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FCA5A5',
  },
  integrityWarningBody: {
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 18,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  detailValHighlight: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '800',
  },
  detailValGreen: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '800',
  },
  detailValGold: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: PoliceTheme.colors.badgeGold,
    fontWeight: '800',
  },
  badgeApproved: {
    backgroundColor: PoliceTheme.colors.verifiedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeValid: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  badgeRevoked: {
    backgroundColor: '#7F1D1D',
  },
  badgeNa: {
    backgroundColor: '#334155',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textApproved: {
    fontSize: 11,
    fontWeight: '800',
    color: PoliceTheme.colors.verifiedText,
  },
  textValid: {
    color: '#34D399',
  },
  textRevoked: {
    color: '#FCA5A5',
    fontWeight: '800',
  },
  textNa: {
    color: '#CBD5E1',
  },
  tagVehicle: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagVehicleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accordionCard: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techIcon: {
    fontSize: 16,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  chevronIcon: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: PoliceTheme.colors.border,
    paddingTop: 12,
  },
  techBlock: {
    marginBottom: 10,
  },
  techBlockLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#818CF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  techBlockVal: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#CBD5E1',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  techRowLabel: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
  },
  techRowVal: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: PoliceTheme.colors.textMain,
    fontWeight: '700',
  },
  readOnlyBanner: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  readOnlyIcon: {
    fontSize: 22,
  },
  readOnlyCol: {
    flex: 1,
  },
  readOnlyTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
    letterSpacing: 1,
  },
  readOnlyText: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default DocumentViewScreen;
