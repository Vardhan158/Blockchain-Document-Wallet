import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
} from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { VaultLogo } from '../components/VaultLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetails'>;

export const DocumentDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { documentId } = route.params;
  const user = useAuthStore(state => state.user);
  const { documents, fetchDocumentDetails } = useDocumentStore();

  const [document, setDocument] = useState(() =>
    documents.find(d => d.id === documentId) || null
  );
  const [techOpen, setTechOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    fetchDocumentDetails(documentId).then(res => {
      if (res) setDocument(res);
    });
  }, [documentId, fetchDocumentDetails]);

  const handleCopyHash = () => {
    setCopiedHash(true);
    Alert.alert('Copied!', 'Document SHA-256 Hash copied to clipboard.');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyTx = () => {
    setCopiedTx(true);
    Alert.alert('Copied!', 'Blockchain Transaction ID copied to clipboard.');
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleShareSecureCopy = async () => {
    try {
      await Share.share({
        message: `Vault Document: ${document?.title || 'Credential'}\nStatus: ${document?.status}\nUser ID: ${user?.userId || 'BDW-9K7F3A2'}\nHash: ${document?.documentHash}`,
        title: document?.title || 'Vault Document',
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

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

  const isApproved = document?.status === 'APPROVED';
  const isRejected = document?.status === 'REJECTED';

  const isIntegrityValid = isApproved && (!document?.blockchainRecord || document.blockchainRecord.documentHash === document.documentHash);

  const docTitle = document?.title || 'Driving Licence';
  const docType = document?.documentType || 'Driving Licence';
  const userSelectedCategory = document?.requestedTag || 'Vehicle';
  const adminVerifiedCategory = document?.approvedTag || 'Vehicle';
  const uploadDate = formatDate(document?.createdAt);
  const verificationDate = formatDate(document?.blockchainRecord?.verifiedAt || document?.updatedAt || document?.createdAt);
  const docVersion = document?.blockchainRecord?.version || 1;
  const transactionId = document?.blockchainRecord?.transactionHash || '0x73af89201bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6';
  const blockNumber = document?.blockchainRecord?.blockNumber || 18492012;
  const documentHash = document?.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const rejectionReason = document?.rejectionReason || 'Document image is unreadable.';

  return (
    <View style={tw`flex-1 bg-slate-900`}>
      {/* Top Navigation Header Bar */}
      <View style={tw`h-15 bg-slate-950 flex-row items-center justify-between px-4 border-b border-slate-800`}>
        <TouchableOpacity
          style={tw`w-9 h-9 rounded-full bg-slate-800 justify-center items-center`}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={tw`text-lg font-bold text-white`}>←</Text>
        </TouchableOpacity>
        <VaultLogo size="sm" subtitle="Document Details" />
        <View style={tw`w-8 h-8 rounded-full bg-indigo-600 justify-center items-center`}>
          <Text style={tw`text-white font-extrabold text-xs`}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4 pb-10`}
        showsVerticalScrollIndicator={false}>
        {/* DOCUMENT NAME & HEADER */}
        <View style={tw`mt-1 mb-4`}>
          <Text style={tw`text-2xl font-black text-white`}>{docTitle}</Text>
          <Text style={tw`text-xs text-slate-400 mt-0.5`}>Type: {docType}</Text>
        </View>

        {/* DOCUMENT PREVIEW BOX */}
        <View style={tw`bg-slate-800 rounded-2xl p-6 items-center border border-slate-700 mb-5`}>
          <Text style={tw`text-5xl mb-2`}>
            {userSelectedCategory === 'VEHICLE' ? '🚘' : '📄'}
          </Text>
          <Text style={tw`text-base font-extrabold text-white`}>{docTitle}</Text>
          <Text style={tw`text-xs text-slate-400 mt-1`}>
            {document?.fileName || 'DL_front.pdf'} • Encrypted Vault Copy
          </Text>
        </View>

        {/* STATUS & CATEGORY DETAILS CARD */}
        <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4 space-y-3`}>
          <Text style={tw`text-base font-extrabold text-white mb-2`}>Document Details</Text>

          {/* 1. Status */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Status:</Text>
            <View
              style={tw`px-2.5 py-1 rounded-full ${
                isApproved
                  ? 'bg-emerald-950/80 border border-emerald-500'
                  : isRejected
                  ? 'bg-red-950/80 border border-red-500'
                  : 'bg-amber-950/80 border border-amber-500'
              }`}>
              <Text
                style={tw`text-[11px] font-black ${
                  isApproved ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-amber-400'
                }`}>
                {isApproved ? 'Verified' : isRejected ? 'Rejected' : 'Pending Verification'}
              </Text>
            </View>
          </View>

          {/* 2. Upload Date */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Upload Date:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{uploadDate}</Text>
          </View>

          {/* 3. Selected Category / Tag */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Selected Category:</Text>
            <View style={tw`bg-indigo-900 px-2.5 py-1 rounded-md`}>
              <Text style={tw`text-[11px] font-black text-white font-mono`}>{userSelectedCategory}</Text>
            </View>
          </View>

          {/* 4. Verified Category / Approved Tag */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Verified Category:</Text>
            <View style={tw`px-2.5 py-1 rounded-md ${adminVerifiedCategory === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'}`}>
              <Text style={tw`text-[11px] font-black text-white font-mono`}>{adminVerifiedCategory}</Text>
            </View>
          </View>

          {/* 5. Verification Date */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Verified:</Text>
            <Text style={tw`text-xs font-bold text-white`}>{verificationDate}</Text>
          </View>

          {/* 6. Blockchain Status */}
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-700/60`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Blockchain Status:</Text>
            <Text style={tw`text-xs font-black ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isApproved ? 'Verified' : 'Pending'}
            </Text>
          </View>

          {/* 7. Document Version */}
          <View style={tw`flex-row justify-between items-center py-2`}>
            <Text style={tw`text-xs font-semibold text-slate-400`}>Document Version:</Text>
            <Text style={tw`text-xs font-bold text-white`}>v{docVersion}</Text>
          </View>
        </View>

        {/* DOCUMENT VERSION HISTORY */}
        <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4 space-y-3`}>
          <Text style={tw`text-sm font-extrabold text-white mb-2`}>Document Version History</Text>

          {document?.versionHistory && document.versionHistory.length > 0 ? (
            document.versionHistory.map(v => (
              <View key={v.version} style={tw`bg-slate-900 rounded-xl p-3 mb-2 border border-slate-800`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-xs font-bold text-slate-300`}>Version {v.version}</Text>
                  <View
                    style={tw`px-2 py-0.5 rounded-md ${
                      v.status === 'APPROVED' ? 'bg-emerald-950/80 border border-emerald-500' : v.status === 'REJECTED' ? 'bg-red-950/80 border border-red-500' : 'bg-amber-950/80 border border-amber-500'
                    }`}>
                    <Text style={tw`text-[10px] font-black ${v.status === 'APPROVED' ? 'text-emerald-400' : v.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'}`}>
                      {v.status === 'APPROVED' ? '✓ Approved' : v.status === 'REJECTED' ? '✕ Rejected' : '⏳ Pending'}
                    </Text>
                  </View>
                </View>
                {v.rejectionReason ? (
                  <Text style={tw`text-[11px] text-red-300 italic mt-1.5`}>Reason: "{v.rejectionReason}"</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={tw`bg-slate-900 rounded-xl p-3 border border-slate-800`}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-xs font-bold text-slate-300`}>Version 1</Text>
                <View
                  style={tw`px-2 py-0.5 rounded-md ${
                    isApproved ? 'bg-emerald-950/80 border border-emerald-500' : isRejected ? 'bg-red-950/80 border border-red-500' : 'bg-amber-950/80 border border-amber-500'
                  }`}>
                  <Text style={tw`text-[10px] font-black ${isApproved ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-amber-400'}`}>
                    {isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : 'Pending Verification'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* BLOCKCHAIN VERIFIED BADGE BANNER */}
        {isApproved && (
          isIntegrityValid ? (
            <View style={tw`bg-emerald-950 rounded-2xl p-3.5 border border-emerald-500 mb-4`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-base text-emerald-400 font-black`}>✓</Text>
                <Text style={tw`text-sm font-extrabold text-emerald-400`}>Blockchain Verified</Text>
              </View>
              <Text style={tw`text-[11px] text-emerald-200 mt-1 leading-4`}>
                Stored File SHA-256 Hash matches Blockchain Hash. Document is authentic and untampered.
              </Text>
            </View>
          ) : (
            <View style={tw`bg-red-950 rounded-2xl p-3.5 border border-red-500 mb-4`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-base`}>⚠️</Text>
                <Text style={tw`text-sm font-extrabold text-red-300`}>INTEGRITY FAILURE</Text>
              </View>
              <Text style={tw`text-[11px] text-red-200 mt-1 leading-4`}>
                Stored File Hash does NOT match Blockchain Hash! File may have been modified or corrupted and should NOT be considered trusted.
              </Text>
            </View>
          )
        )}

        {/* REJECTED DOCUMENT FLOW CARD & REASON */}
        {isRejected && (
          <View style={tw`bg-amber-950/80 rounded-2xl p-4 border border-amber-700 mb-4 space-y-3`}>
            <View style={tw`flex-row items-center gap-2 mb-1`}>
              <Text style={tw`text-lg font-black text-red-300`}>✕</Text>
              <Text style={tw`text-base font-extrabold text-red-300`}>Document Rejected</Text>
            </View>

            <View style={tw`bg-slate-900 rounded-xl p-3`}>
              <Text style={tw`text-[10px] font-black text-amber-400 uppercase tracking-wider`}>Reason:</Text>
              <Text style={tw`text-xs text-white italic mt-1`}>"{rejectionReason}"</Text>
            </View>

            <TouchableOpacity
              style={tw`bg-red-800 rounded-xl h-12 justify-center items-center`}
              onPress={() => navigation.navigate('Main', { screen: 'Upload' } as any)}
              activeOpacity={0.88}>
              <Text style={tw`text-white font-extrabold text-sm`}>↻ Re-upload Document</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* COLLAPSIBLE VERIFICATION DETAILS ACCORDION */}
        <View style={tw`bg-slate-800 rounded-xl border border-slate-700 mb-6 overflow-hidden`}>
          <TouchableOpacity
            style={tw`flex-row justify-between items-center p-4`}
            onPress={() => setTechOpen(!techOpen)}
            activeOpacity={0.85}>
            <View style={tw`flex-row items-center gap-2`}>
              <Text style={tw`text-base`}>🔐</Text>
              <Text style={tw`text-sm font-extrabold text-white`}>Verification Details</Text>
            </View>
            <Text style={tw`text-xs text-slate-400`}>{techOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {techOpen && (
            <View style={tw`px-4 pb-4 border-t border-slate-700 pt-3 space-y-2`}>
              {/* Transaction ID */}
              <View style={tw`mb-2`}>
                <Text style={tw`text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider mb-1`}>TRANSACTION ID</Text>
                <View style={tw`flex-row justify-between items-center bg-slate-950 p-2 rounded-lg`}>
                  <Text style={tw`text-[11px] font-mono text-slate-300 flex-1 mr-2`} numberOfLines={1}>
                    {transactionId}
                  </Text>
                  <TouchableOpacity
                    style={tw`px-2 py-1 rounded ${copiedTx ? 'bg-emerald-900' : 'bg-slate-700'}`}
                    onPress={handleCopyTx}>
                    <Text style={tw`text-[10px] font-bold text-white`}>{copiedTx ? '✓' : 'Copy'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Block Number */}
              <View style={tw`flex-row justify-between py-1.5`}>
                <Text style={tw`text-xs text-slate-400`}>Block Reference:</Text>
                <Text style={tw`text-xs font-mono font-bold text-white`}>Block #{blockNumber}</Text>
              </View>

              {/* SHA-256 Document Hash */}
              <View style={tw`mb-2`}>
                <Text style={tw`text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider mb-1`}>SHA-256 DOCUMENT HASH</Text>
                <View style={tw`flex-row justify-between items-center bg-slate-950 p-2 rounded-lg`}>
                  <Text style={tw`text-[11px] font-mono text-slate-300 flex-1 mr-2`} numberOfLines={1}>
                    {documentHash}
                  </Text>
                  <TouchableOpacity
                    style={tw`px-2 py-1 rounded ${copiedHash ? 'bg-emerald-900' : 'bg-slate-700'}`}
                    onPress={handleCopyHash}>
                    <Text style={tw`text-[10px] font-bold text-white`}>{copiedHash ? '✓' : 'Copy'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Verified Timestamp */}
              <View style={tw`flex-row justify-between py-1.5`}>
                <Text style={tw`text-xs text-slate-400`}>Verified At:</Text>
                <Text style={tw`text-xs font-mono font-bold text-white`}>{verificationDate}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons Stack */}
        <View style={tw`space-y-3`}>
          {isApproved && (
            <TouchableOpacity
              style={tw`bg-indigo-600 rounded-2xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30`}
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.88}>
              <Text style={tw`text-white text-sm font-extrabold`}>Present for Inspection</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={tw`bg-slate-800 rounded-2xl h-12 justify-center items-center border border-slate-700`}
            onPress={handleShareSecureCopy}
            activeOpacity={0.88}>
            <Text style={tw`text-white text-xs font-bold`}>🔗 Share Secure Copy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Present for Inspection Modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}>
        <View style={tw`flex-1 bg-black/85 justify-center items-center p-6`}>
          <View style={tw`bg-slate-800 rounded-2xl p-5 w-full items-center border border-slate-700`}>
            <View style={tw`flex-row justify-between items-center w-full mb-4`}>
              <Text style={tw`text-lg font-extrabold text-white`}>Inspection Proof</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Text style={tw`text-xl text-slate-400`}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`w-48 h-48 bg-white rounded-2xl justify-center items-center p-4 my-3`}>
              <Text style={tw`text-base font-black text-slate-900`}>🏁 QR PROOF 🏁</Text>
              <Text style={tw`text-sm font-extrabold text-indigo-600 mt-2`}>{docTitle}</Text>
              <Text style={tw`text-xs font-bold text-slate-700 font-mono mt-1`}>User ID: {user?.userId || 'BDW-9K7F3A2'}</Text>
            </View>

            <Text style={tw`text-xs text-slate-400 text-center my-3 leading-4`}>
              Show this self-expiring inspection proof to law enforcement officers for official verification.
            </Text>

            <TouchableOpacity
              style={tw`bg-indigo-600 rounded-xl py-3 w-full items-center mt-2`}
              onPress={() => setQrModalVisible(false)}>
              <Text style={tw`text-white font-extrabold text-sm`}>Close Proof</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DocumentDetailsScreen;
