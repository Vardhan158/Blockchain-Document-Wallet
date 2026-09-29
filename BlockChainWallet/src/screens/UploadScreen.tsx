import React, { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import tw from 'twrnc';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { DocumentType, ApprovedTag } from '../types/models';
import { VaultLogo } from '../components/VaultLogo';
import { VaultFolder } from '../components/DashboardArtwork';
import { pick, types as docTypes, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type Props = BottomTabScreenProps<MainTabParamList, 'Upload'>;

interface DocTypeItem {
  label: string;
  value: DocumentType;
  icon: string;
  defaultTag: ApprovedTag;
  description: string;
}

const DOCUMENT_TYPES: DocTypeItem[] = [
  { label: 'Aadhaar Card', value: 'AADHAAR', icon: '🪪', defaultTag: 'NORMAL', description: 'National identity card' },
  { label: 'PAN Card', value: 'PAN', icon: '💳', defaultTag: 'NORMAL', description: 'Tax identification card' },
  { label: 'Voter ID', value: 'VOTER_ID', icon: '🗳️', defaultTag: 'NORMAL', description: 'Electoral identity card' },
  { label: 'Driving Licence', value: 'DRIVING_LICENSE', icon: '🚘', defaultTag: 'VEHICLE', description: 'Motor vehicle driving permit' },
  { label: 'Vehicle RC', value: 'VEHICLE_RC', icon: '📑', defaultTag: 'VEHICLE', description: 'Vehicle registration certificate' },
  { label: 'Vehicle Insurance', value: 'VEHICLE_INSURANCE', icon: '🛡️', defaultTag: 'VEHICLE', description: 'Motor insurance policy' },
  { label: 'PUC Certificate', value: 'POLLUTION', icon: '🌿', defaultTag: 'VEHICLE', description: 'Pollution under control certificate' },
  { label: 'Passport', value: 'PASSPORT', icon: '🛂', defaultTag: 'NORMAL', description: 'International travel document' },
  { label: 'Marks Card', value: 'MARKS_CARD', icon: '🎓', defaultTag: 'NORMAL', description: 'Academic transcript & grade sheet' },
  { label: 'Degree Certificate', value: 'DEGREE_CERTIFICATE', icon: '📜', defaultTag: 'NORMAL', description: 'Educational degree certificate' },
  { label: 'Other', value: 'OTHER', icon: '📁', defaultTag: 'NORMAL', description: 'Other official document asset' },
];

export interface AttachedFileDetails {
  name: string;
  size: string;
  type: string;
  uri: string;
  source: 'CAMERA' | 'GALLERY' | 'FILES';
  format: 'PDF' | 'JPG' | 'JPEG' | 'PNG';
  sizeInBytes: number;
  width?: number;
  height?: number;
  fileCopyUri?: string | null;
}

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFormatFromMimeOrName = (mime?: string | null, name?: string | null): 'PDF' | 'JPG' | 'JPEG' | 'PNG' => {
  const m = (mime || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (m.includes('pdf') || n.endsWith('.pdf')) return 'PDF';
  if (m.includes('png') || n.endsWith('.png')) return 'PNG';
  if (m.includes('jpeg') || n.endsWith('.jpeg')) return 'JPEG';
  return 'JPG';
};

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'BlockChain Wallet needs camera access to capture your document photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission request error:', err);
    return false;
  }
};

export const UploadScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const { unreadCount } = useNotificationStore();

  const [isOffline, setIsOffline] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [title, setTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState<ApprovedTag>('NORMAL');
  const [attachedFile, setAttachedFile] = useState<AttachedFileDetails | null>(null);

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isProcessingSource, setIsProcessingSource] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return () => unsubscribe();
  }, []);

  const { uploadDocument, isUploading, error, clearError } = useDocumentStore();

  const handleSelectDocType = (item: DocTypeItem) => {
    setSelectedDocType(item.value);
    setSelectedTag(item.defaultTag);
    if (!title.trim() || title.startsWith('My ')) {
      setTitle(`My ${item.label}`);
    }
  };

  const handlePickSource = async (source: 'CAMERA' | 'GALLERY' | 'FILES') => {
    setShowSourceModal(false);

    try {
      setIsProcessingSource(true);
      const selectedItem = DOCUMENT_TYPES.find(d => d.value === selectedDocType);
      const baseName = (title.trim() || selectedItem?.label || 'document').toLowerCase().replace(/\s+/g, '_');

      if (source === 'CAMERA') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access in your device settings to take a photo of your document.'
          );
          setIsProcessingSource(false);
          return;
        }

        const response = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
        });

        if (response.didCancel) {
          setIsProcessingSource(false);
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Camera Error', response.errorMessage);
          setIsProcessingSource(false);
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          Alert.alert('Error', 'No photo captured. Please try again.');
          setIsProcessingSource(false);
          return;
        }

        const fileSize = asset.fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            `Photo size (${formatFileSize(fileSize)}) exceeds the 10 MB limit. Please take another photo with lower resolution.`
          );
          setIsProcessingSource(false);
          return;
        }

        const format = getFormatFromMimeOrName(asset.type, asset.fileName);
        const fileName = asset.fileName || `${baseName}_camera_${Date.now()}.jpg`;

        setAttachedFile({
          name: fileName,
          size: formatFileSize(fileSize),
          type: asset.type || 'image/jpeg',
          uri: asset.uri,
          source: 'CAMERA',
          format,
          sizeInBytes: fileSize,
          width: asset.width,
          height: asset.height,
        });
      } else if (source === 'GALLERY') {
        const response = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        });

        if (response.didCancel) {
          setIsProcessingSource(false);
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Gallery Error', response.errorMessage);
          setIsProcessingSource(false);
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          Alert.alert('Error', 'No image selected. Please try again.');
          setIsProcessingSource(false);
          return;
        }

        const fileSize = asset.fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            `Selected image (${formatFileSize(fileSize)}) exceeds the 10 MB limit. Please select a smaller image.`
          );
          setIsProcessingSource(false);
          return;
        }

        const format = getFormatFromMimeOrName(asset.type, asset.fileName);
        const fileName = asset.fileName || `${baseName}_gallery_${Date.now()}.${format.toLowerCase()}`;

        setAttachedFile({
          name: fileName,
          size: formatFileSize(fileSize),
          type: asset.type || (format === 'PNG' ? 'image/png' : 'image/jpeg'),
          uri: asset.uri,
          source: 'GALLERY',
          format,
          sizeInBytes: fileSize,
          width: asset.width,
          height: asset.height,
        });
      } else if (source === 'FILES') {
        let res: any = null;
        try {
          const pickerRes = await pick({
            type: [docTypes.pdf, docTypes.images],
          });
          if (Array.isArray(pickerRes) && pickerRes.length > 0) {
            res = pickerRes[0];
          }
        } catch (pickerErr: any) {
          if (isErrorWithCode(pickerErr) && pickerErr.code === errorCodes.OPERATION_CANCELED) {
            setIsProcessingSource(false);
            return;
          }
        }

        if (!res || !res.uri) {
          setIsProcessingSource(false);
          return;
        }

        const fileSize = res.size || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            `Selected file (${formatFileSize(fileSize)}) exceeds the 10 MB limit. Please choose a smaller document.`
          );
          setIsProcessingSource(false);
          return;
        }

        const format = getFormatFromMimeOrName(res.type, res.name);
        const fileName = res.name || `${baseName}_file_${Date.now()}.${format.toLowerCase()}`;

        setAttachedFile({
          name: fileName,
          size: formatFileSize(fileSize),
          type: res.type || (format === 'PDF' ? 'application/pdf' : 'image/jpeg'),
          uri: res.uri,
          source: 'FILES',
          format,
          sizeInBytes: fileSize,
        });
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        // User cancelled picker
      } else {
        console.error('File selection error:', err);
        Alert.alert('File Selection Failed', err?.message || 'Unable to open file picker.');
      }
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleOpenConfirmation = () => {
    if (!selectedDocType) {
      Alert.alert('Select Document Type', 'Please select a document type from Step 1 above.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your document.');
      return;
    }
    if (!attachedFile) {
      Alert.alert('Missing File', 'Please attach a document file from Camera, Gallery, or Files.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedDocType) return;
    setShowConfirmModal(false);

    const success = await uploadDocument(title.trim(), selectedDocType, selectedTag, attachedFile);
    if (success) {
      Alert.alert(
        'Upload Successful',
        'Your document has been submitted for admin verification. You will be notified once approved.',
        [
          {
            text: 'View Documents',
            onPress: () => {
              setTitle('');
              setAttachedFile(null);
              setSelectedDocType(null);
              navigation.navigate('Documents');
            },
          },
        ]
      );
    }
  };

  const currentTypeItem = DOCUMENT_TYPES.find(d => d.value === selectedDocType);

  return (
    <View style={tw`flex-1 bg-[#FAF2F8]/20`}>
      {/* Top Fixed Header Bar */}
      <View style={tw`h-15 bg-white flex-row items-center justify-between px-4 border-b border-slate-100 shadow-sm`}>
        <VaultLogo size="sm" subtitle="Upload Flow" />
        <View style={tw`flex-row items-center gap-2`}>
          <TouchableOpacity
            style={tw`w-9.5 h-9.5 rounded-full bg-slate-50 justify-center items-center relative shadow-sm border border-slate-100`}
            onPress={() => navigation.navigate('Notifications')}>
            <Text style={tw`text-base`}>🔔</Text>
            {unreadCount > 0 && <View style={tw`absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500`} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`w-8.5 h-8.5 rounded-full bg-indigo-600 justify-center items-center`}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={tw`text-white font-extrabold text-xs`}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4.5 pb-12`}
        showsVerticalScrollIndicator={false}>
        {/* Header Title with 3D Artwork */}
        <View style={tw`flex-row justify-between items-center mb-5`}>
          <View style={tw`flex-1 mr-2`}>
            <Text style={tw`text-2.5xl font-black text-slate-900 tracking-tight`}>
              Document Upload Flow
            </Text>
            <Text style={tw`text-xs text-slate-500 mt-1 leading-4`}>
              Submit official documents for cryptographic verification & blockchain record anchoring.
            </Text>
          </View>
          <View style={tw`w-28 h-22 opacity-90`}>
            <VaultFolder width={110} height={90} shield={true} />
          </View>
        </View>

        {error && (
          <View style={tw`bg-red-50 border border-red-200 rounded-xl p-3 mb-4`}>
            <Text style={tw`text-xs font-semibold text-red-600`}>{error}</Text>
          </View>
        )}

        {/* STEP 1: SELECT DOCUMENT TYPE */}
        <View style={tw`flex-row items-center gap-2 mb-3`}>
          <View style={tw`bg-indigo-600 px-2.5 py-0.5 rounded-md`}>
            <Text style={tw`text-[10px] font-black text-white tracking-wider`}>STEP 1</Text>
          </View>
          <Text style={tw`text-base font-extrabold text-slate-900`}>Select Document Type</Text>
        </View>

        {/* 3-Column Document Types Grid */}
        <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
          {DOCUMENT_TYPES.map(item => {
            const isSelected = selectedDocType === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={tw`w-[31%] rounded-xl p-3 items-center border shadow-sm ${isSelected
                    ? 'bg-indigo-50/80 border-1.5 border-indigo-600'
                    : 'bg-white border-slate-100'
                  }`}
                onPress={() => handleSelectDocType(item)}
                activeOpacity={0.85}>
                <Text style={tw`text-2.5xl mb-1.5`}>{item.icon}</Text>
                <Text
                  style={tw`text-[11px] text-center ${isSelected ? 'font-extrabold text-indigo-900' : 'font-bold text-slate-800'
                    }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* STEP 2: DETAILS & VISIBILITY SCOPING */}
        <View style={tw`flex-row items-center gap-2 mt-2 mb-3`}>
          <View style={tw`bg-indigo-600 px-2.5 py-0.5 rounded-md`}>
            <Text style={tw`text-[10px] font-black text-white tracking-wider`}>STEP 2</Text>
          </View>
          <Text style={tw`text-base font-extrabold text-slate-900`}>Details & Visibility Scoping</Text>
        </View>

        {/* Selected Type Summary Banner */}
        <View style={tw`bg-indigo-50/70 rounded-2xl p-3.5 flex-row items-center justify-between border border-indigo-200 mb-4`}>
          <View style={tw`flex-row items-center gap-3 flex-1`}>
            <Text style={tw`text-3xl`}>{currentTypeItem?.icon || '📂'}</Text>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-900`}>
                {currentTypeItem ? `Selected: ${currentTypeItem.label}` : 'Select a document type above'}
              </Text>
              <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>
                {currentTypeItem ? currentTypeItem.description : 'Tap any document card in Step 1 to select'}
              </Text>
            </View>
          </View>
          <View style={tw`w-8 h-8 rounded-full bg-indigo-100 justify-center items-center`}>
            <Text style={tw`text-xs text-indigo-600`}>✏️</Text>
          </View>
        </View>

        {/* Document Title Input */}
        <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>
          DOCUMENT TITLE *
        </Text>
        <TextInput
          style={tw`bg-white rounded-xl border border-slate-200 px-4 h-12 text-slate-900 text-sm font-semibold mb-4 shadow-sm`}
          placeholder="e.g. My Driving Licence 2026"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={text => {
            setTitle(text);
            if (error) clearError();
          }}
        />

        {/* DOCUMENT CATEGORY / TAG SELECTION */}
        <Text style={tw`text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5`}>
          DOCUMENT CATEGORY *
        </Text>
        <View style={tw`flex-row gap-2.5 mb-4`}>
          {/* Option 1: Vehicle */}
          <TouchableOpacity
            style={tw`flex-1 rounded-2xl p-3.5 border-1.5 ${selectedTag === 'VEHICLE'
                ? 'bg-indigo-50/80 border-indigo-600'
                : 'bg-white border-slate-100'
              }`}
            onPress={() => setSelectedTag('VEHICLE')}
            activeOpacity={0.85}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-2xl`}>🚘</Text>
                <Text style={tw`text-xs font-extrabold text-slate-900`}>Vehicle</Text>
              </View>
              <View style={tw`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedTag === 'VEHICLE' ? 'border-indigo-600' : 'border-slate-300'}`}>
                {selectedTag === 'VEHICLE' && <View style={tw`w-2.5 h-2.5 rounded-full bg-indigo-600`} />}
              </View>
            </View>
            <Text style={tw`text-[11px] text-slate-500 leading-4`}>
              This document may be shown to authorized police officers when they search using your User ID.
            </Text>
          </TouchableOpacity>

          {/* Option 2: Normal */}
          <TouchableOpacity
            style={tw`flex-1 rounded-2xl p-3.5 border-1.5 ${selectedTag === 'NORMAL'
                ? 'bg-indigo-50/80 border-indigo-600'
                : 'bg-white border-slate-100'
              }`}
            onPress={() => setSelectedTag('NORMAL')}
            activeOpacity={0.85}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-2xl`}>📁</Text>
                <Text style={tw`text-xs font-extrabold text-slate-900`}>Normal</Text>
              </View>
              <View style={tw`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedTag === 'NORMAL' ? 'border-indigo-600' : 'border-slate-300'}`}>
                {selectedTag === 'NORMAL' && <View style={tw`w-2.5 h-2.5 rounded-full bg-indigo-600`} />}
              </View>
            </View>
            <Text style={tw`text-[11px] text-slate-500 leading-4`}>
              This document remains within your personal document wallet and is not shown in normal police vehicle-document lookup.
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAG REVIEW NOTICE BANNER */}
        <View style={tw`bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5`}>
          <View style={tw`flex-row items-center gap-1.5 mb-1`}>
            <Text style={tw`text-xs`}>⚠️</Text>
            <Text style={tw`text-[11px] font-black text-amber-800 tracking-wider`}>TAG REVIEW NOTICE</Text>
          </View>
          <Text style={tw`text-[11px] text-amber-900 italic leading-4`}>
            Your selected category will be reviewed by an administrator. The administrator may change the category if the document does not match the selected type.
          </Text>
        </View>

        {/* STEP 3: SELECT SOURCE & DOCUMENT PREVIEW */}
        <View style={tw`flex-row items-center gap-2 mt-1 mb-3`}>
          <View style={tw`bg-indigo-600 px-2.5 py-0.5 rounded-md`}>
            <Text style={tw`text-[10px] font-black text-white tracking-wider`}>STEP 3</Text>
          </View>
          <Text style={tw`text-base font-extrabold text-slate-900`}>Select Source & Document Preview</Text>
        </View>

        {/* OFFLINE NOTICE */}
        {isOffline && (
          <View style={tw`bg-red-900 border-1.5 border-red-500 rounded-2xl p-3.5 mb-4`}>
            <Text style={tw`text-xs font-black text-red-200 mb-1`}>📡 You're Offline</Text>
            <Text style={tw`text-[11px] text-red-100 leading-4 font-semibold`}>
              Connect to the internet to upload or verify documents. Upload operations are disabled while offline.
            </Text>
          </View>
        )}

        {!attachedFile ? (
          /* File Attachment Trigger Card */
          <TouchableOpacity
            style={tw`bg-sky-50/60 rounded-2xl p-4 flex-row items-center justify-between border-1.5 border-dashed border-indigo-200 mb-6 ${isOffline || isProcessingSource ? 'opacity-60' : ''
              }`}
            onPress={() => !isOffline && !isProcessingSource && setShowSourceModal(true)}
            disabled={isOffline || isProcessingSource}
            activeOpacity={0.8}>
            <View style={tw`flex-row items-center gap-3 flex-1`}>
              <View style={tw`w-10 h-10 rounded-xl bg-indigo-100 justify-center items-center`}>
                {isProcessingSource ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <Text style={tw`text-xl text-indigo-600`}>📎</Text>
                )}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-extrabold text-slate-900`}>
                  {isProcessingSource ? 'Opening Document Picker...' : 'Choose Document Source & Select File'}
                </Text>
                <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>
                  Select from Camera, Gallery, or Device Files
                </Text>
              </View>
            </View>
            <View style={tw`w-7 h-7 rounded-full bg-indigo-100 justify-center items-center`}>
              <Text style={tw`text-xs font-bold text-indigo-600`}>›</Text>
            </View>
          </TouchableOpacity>
        ) : (
          /* REAL-TIME DOCUMENT PREVIEW CARD */
          <View style={tw`bg-slate-900 rounded-2xl p-4.5 border border-slate-700 mb-6 shadow-xl`}>
            {/* Header: Real-Time Status & Source Badge */}
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <View style={tw`flex-row items-center gap-1.5 bg-indigo-950/90 px-2.5 py-1 rounded-md border border-indigo-700/60`}>
                <View style={tw`w-2 h-2 rounded-full bg-emerald-400`} />
                <Text style={tw`text-[10px] font-black text-indigo-200 tracking-wider`}>REAL-TIME PREVIEW</Text>
              </View>
              <View style={tw`bg-slate-800 px-2.5 py-1 rounded-md border border-slate-600`}>
                <Text style={tw`text-[10px] font-extrabold text-emerald-400`}>
                  {attachedFile.source === 'CAMERA'
                    ? '📷 Camera Capture'
                    : attachedFile.source === 'GALLERY'
                      ? '🖼️ Photo Gallery'
                      : '📁 Device File'}
                </Text>
              </View>
            </View>

            {/* REAL VISUAL DISPLAY: Image or PDF Card */}
            {attachedFile.format === 'PDF' ? (
              /* PDF Card Preview */
              <TouchableOpacity
                style={tw`bg-slate-950 rounded-xl p-5 border border-rose-900/40 mb-3 items-center justify-center relative overflow-hidden`}
                onPress={() => setShowFullPreview(true)}
                activeOpacity={0.88}>
                <View style={tw`w-14 h-14 rounded-2xl bg-rose-500/20 items-center justify-center mb-2 border border-rose-500/40`}>
                  <Text style={tw`text-3xl`}>📄</Text>
                </View>
                <View style={tw`bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-500/50 mb-1.5`}>
                  <Text style={tw`text-[10px] font-black text-rose-300 tracking-wider`}>PDF DOCUMENT</Text>
                </View>
                <Text style={tw`text-xs font-bold text-white text-center px-3`} numberOfLines={1}>
                  {attachedFile.name}
                </Text>
                <Text style={tw`text-[11px] text-slate-400 mt-1`}>
                  {attachedFile.size} • Tap to view details
                </Text>
              </TouchableOpacity>
            ) : (
              /* REAL LIVE IMAGE PREVIEW */
              <TouchableOpacity
                style={tw`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-3`}
                onPress={() => setShowFullPreview(true)}
                activeOpacity={0.9}>
                <Image
                  source={{ uri: attachedFile.uri }}
                  style={tw`w-full h-52 bg-slate-950`}
                  resizeMode="contain"
                />
                {/* Format Pill on Top-Left */}
                <View style={tw`absolute top-2.5 left-2.5 bg-black/75 px-2.5 py-0.5 rounded-md border border-white/20`}>
                  <Text style={tw`text-[10px] font-black text-indigo-300`}>{attachedFile.format}</Text>
                </View>
                {/* Full preview Pill on Top-Right */}
                <View style={tw`absolute top-2.5 right-2.5 bg-black/75 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-white/20`}>
                  <Text style={tw`text-[10px]`}>🔍</Text>
                  <Text style={tw`text-[10px] font-bold text-white`}>Full Preview</Text>
                </View>
                {/* Dimensions overlay bar */}
                {attachedFile.width && attachedFile.height ? (
                  <View style={tw`absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-1 flex-row justify-between items-center`}>
                    <Text style={tw`text-[10px] text-slate-300 font-mono`}>
                      {attachedFile.width} × {attachedFile.height} px
                    </Text>
                    <Text style={tw`text-[10px] text-indigo-300 font-bold`}>Tap to zoom</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            )}

            {/* REAL METADATA ROWS */}
            <View style={tw`bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-3 space-y-1.5`}>
              <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-800/80`}>
                <Text style={tw`text-[11px] text-slate-400 font-semibold`}>Document Type</Text>
                <Text style={tw`text-xs text-white font-bold`}>{currentTypeItem?.label || 'Official Document'}</Text>
              </View>

              <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-800/80`}>
                <Text style={tw`text-[11px] text-slate-400 font-semibold`}>File Name</Text>
                <Text style={tw`text-xs text-white font-bold flex-1 text-right ml-3 font-mono`} numberOfLines={1}>
                  {attachedFile.name}
                </Text>
              </View>

              <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-800/80`}>
                <Text style={tw`text-[11px] text-slate-400 font-semibold`}>File Size</Text>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text style={tw`text-xs text-white font-bold font-mono`}>{attachedFile.size}</Text>
                  <View style={tw`bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40`}>
                    <Text style={tw`text-[9px] font-black text-emerald-400`}>&lt; 10 MB VALID</Text>
                  </View>
                </View>
              </View>

              <View style={tw`flex-row justify-between items-center py-1`}>
                <Text style={tw`text-[11px] text-slate-400 font-semibold`}>MIME Type</Text>
                <Text style={tw`text-xs text-indigo-300 font-bold font-mono`}>{attachedFile.type}</Text>
              </View>
            </View>

            {/* BUTTONS: REPLACE, REMOVE, CONTINUE */}
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity
                style={tw`flex-1 bg-slate-800 rounded-xl h-11 justify-center items-center border border-slate-700 flex-row gap-1`}
                onPress={() => setShowSourceModal(true)}
                activeOpacity={0.85}>
                <Text style={tw`text-sm`}>🔄</Text>
                <Text style={tw`text-white font-bold text-xs`}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`w-11 bg-rose-950/60 rounded-xl h-11 justify-center items-center border border-rose-800/60`}
                onPress={() => {
                  Alert.alert('Remove Document', 'Are you sure you want to remove this attached file?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => setAttachedFile(null) },
                  ]);
                }}
                activeOpacity={0.85}>
                <Text style={tw`text-sm`}>🗑️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-1.8 bg-indigo-600 rounded-xl h-11 justify-center items-center shadow-md shadow-indigo-600/30 ${isUploading ? 'opacity-60' : ''
                  }`}
                onPress={handleOpenConfirmation}
                disabled={isUploading}
                activeOpacity={0.88}>
                <Text style={tw`text-white font-extrabold text-sm`}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Select Source Modal */}
      <Modal
        visible={showSourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceModal(false)}>
        <View style={tw`flex-1 bg-black/80 justify-center p-6`}>
          <View style={tw`bg-white rounded-2xl p-5 shadow-2xl`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-lg font-extrabold text-slate-900`}>Select Document Source</Text>
              <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                <Text style={tw`text-xl text-slate-400 p-1`}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={tw`text-xs text-slate-500 mb-4`}>
              Capture or choose your document in real-time from device:
            </Text>

            {/* Source Option 1: Camera */}
            <TouchableOpacity
              style={tw`bg-slate-50 rounded-xl p-3.5 flex-row items-center gap-3 mb-2.5 border border-slate-200`}
              onPress={() => handlePickSource('CAMERA')}
              activeOpacity={0.85}>
              <View style={tw`w-11 h-11 rounded-xl bg-indigo-600 justify-center items-center`}>
                <Text style={tw`text-xl`}>📷</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-extrabold text-slate-900`}>Camera</Text>
                <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>
                  Capture photo directly using device camera (JPG / PNG)
                </Text>
              </View>
            </TouchableOpacity>

            {/* Source Option 2: Gallery */}
            <TouchableOpacity
              style={tw`bg-slate-50 rounded-xl p-3.5 flex-row items-center gap-3 mb-2.5 border border-slate-200`}
              onPress={() => handlePickSource('GALLERY')}
              activeOpacity={0.85}>
              <View style={tw`w-11 h-11 rounded-xl bg-sky-600 justify-center items-center`}>
                <Text style={tw`text-xl`}>🖼️</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-extrabold text-slate-900`}>Gallery</Text>
                <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>
                  Select photo from image gallery (JPG / JPEG / PNG)
                </Text>
              </View>
            </TouchableOpacity>

            {/* Source Option 3: Files */}
            <TouchableOpacity
              style={tw`bg-slate-50 rounded-xl p-3.5 flex-row items-center gap-3 mb-2.5 border border-slate-200`}
              onPress={() => handlePickSource('FILES')}
              activeOpacity={0.85}>
              <View style={tw`w-11 h-11 rounded-xl bg-purple-600 justify-center items-center`}>
                <Text style={tw`text-xl`}>📁</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-extrabold text-slate-900`}>Files</Text>
                <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>
                  Choose document from device storage (PDF / Images)
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-slate-100 rounded-xl py-3 items-center mt-1`}
              onPress={() => setShowSourceModal(false)}>
              <Text style={tw`text-slate-700 font-bold text-xs`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULL SCREEN DOCUMENT / IMAGE PREVIEW MODAL */}
      <Modal
        visible={showFullPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullPreview(false)}>
        <View style={tw`flex-1 bg-black/95 justify-between`}>
          {/* Top Bar */}
          <View style={tw`pt-12 pb-3 px-4 bg-black/60 flex-row justify-between items-center border-b border-white/10`}>
            <View style={tw`flex-1 mr-3`}>
              <Text style={tw`text-sm font-bold text-white`} numberOfLines={1}>
                {attachedFile?.name || 'Document Preview'}
              </Text>
              <Text style={tw`text-[11px] text-slate-400 mt-0.5`}>
                {attachedFile?.size} • {attachedFile?.type}
              </Text>
            </View>
            <TouchableOpacity
              style={tw`w-9 h-9 rounded-full bg-white/20 items-center justify-center`}
              onPress={() => setShowFullPreview(false)}>
              <Text style={tw`text-white font-bold text-base`}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Center Image or PDF Card */}
          <View style={tw`flex-1 items-center justify-center p-4`}>
            {attachedFile?.format === 'PDF' ? (
              <View style={tw`items-center justify-center p-8 bg-slate-900 rounded-2xl border border-slate-800`}>
                <Text style={tw`text-6xl mb-3`}>📄</Text>
                <Text style={tw`text-base font-extrabold text-white mb-1`}>{attachedFile.name}</Text>
                <Text style={tw`text-xs text-slate-400 mb-4`}>{attachedFile.size} • PDF Document</Text>
                <View style={tw`bg-indigo-600/20 border border-indigo-500/40 rounded-xl px-4 py-2`}>
                  <Text style={tw`text-xs text-indigo-300 font-semibold`}>
                    PDF ready for blockchain verification
                  </Text>
                </View>
              </View>
            ) : attachedFile?.uri ? (
              <Image
                source={{ uri: attachedFile.uri }}
                style={tw`w-full h-full`}
                resizeMode="contain"
              />
            ) : null}
          </View>

          {/* Bottom Bar */}
          <View style={tw`pb-8 pt-3 px-5 bg-black/60 flex-row justify-between items-center border-t border-white/10`}>
            <Text style={tw`text-xs text-slate-400`}>
              Source: {attachedFile?.source === 'CAMERA' ? '📷 Camera' : attachedFile?.source === 'GALLERY' ? '🖼️ Gallery' : '📁 Files'}
            </Text>
            <TouchableOpacity
              style={tw`bg-indigo-600 px-4 py-2 rounded-xl`}
              onPress={() => setShowFullPreview(false)}>
              <Text style={tw`text-xs font-bold text-white`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPLOAD CONFIRMATION MODAL */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={tw`flex-1 bg-black/80 justify-center p-6`}>
          <View style={tw`bg-white rounded-2xl p-5 shadow-2xl`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-lg font-extrabold text-slate-900`}>Upload Confirmation</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Text style={tw`text-xl text-slate-400 p-1`}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={tw`text-xs text-slate-500 mb-4`}>
              Please review your document details before final submission:
            </Text>

            {/* Confirmation Summary Card with Real-Time File Info */}
            <View style={tw`bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 space-y-2`}>
              <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-200`}>
                <Text style={tw`text-xs text-slate-500 font-semibold`}>Document Type:</Text>
                <Text style={tw`text-xs text-slate-900 font-bold`}>{currentTypeItem?.label}</Text>
              </View>

              <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-200`}>
                <Text style={tw`text-xs text-slate-500 font-semibold`}>Tag:</Text>
                <View
                  style={tw`px-2.5 py-1 rounded-md ${selectedTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'
                    }`}>
                  <Text style={tw`text-[11px] font-black text-white font-mono`}>
                    {selectedTag === 'VEHICLE' ? '🚗 Vehicle' : '📁 Normal'}
                  </Text>
                </View>
              </View>

              {/* Real File Card in Confirmation */}
              <View style={tw`flex-row items-center gap-3 pt-2`}>
                {attachedFile?.format === 'PDF' ? (
                  <View style={tw`w-12 h-12 rounded-lg bg-rose-100 items-center justify-center border border-rose-300`}>
                    <Text style={tw`text-xl`}>📄</Text>
                  </View>
                ) : attachedFile?.uri ? (
                  <Image
                    source={{ uri: attachedFile.uri }}
                    style={tw`w-12 h-12 rounded-lg bg-slate-200 border border-slate-300`}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={tw`w-12 h-12 rounded-lg bg-slate-200 items-center justify-center`}>
                    <Text style={tw`text-xl`}>📁</Text>
                  </View>
                )}
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs text-slate-900 font-bold`} numberOfLines={1}>
                    {attachedFile?.name || 'Document'}
                  </Text>
                  <Text style={tw`text-[11px] text-slate-500 mt-0.5 font-mono`}>
                    {attachedFile?.size || 'Unknown size'} • {attachedFile?.format || 'PDF'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={tw`text-[11px] text-slate-600 text-center mb-5 italic leading-4`}>
              By confirming, your document SHA-256 hash will be generated and queued for administrator verification.
            </Text>

            {/* Submit for Verification Button */}
            <TouchableOpacity
              style={tw`bg-indigo-600 rounded-xl h-12 justify-center items-center shadow-lg shadow-indigo-600/30 mb-2.5 ${isUploading ? 'opacity-60' : ''
                }`}
              onPress={handleFinalSubmit}
              disabled={isUploading}
              activeOpacity={0.88}>
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={tw`text-white font-extrabold text-sm`}>Submit for Verification</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-slate-100 rounded-xl py-3 items-center`}
              onPress={() => setShowConfirmModal(false)}>
              <Text style={tw`text-slate-700 font-bold text-xs`}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UploadScreen;
