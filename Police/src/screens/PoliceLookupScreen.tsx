import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoliceStackParamList } from '../types';
import { policeApi } from '../services/api';
import { PoliceTheme } from '../theme/theme';

type Props = NativeStackScreenProps<PoliceStackParamList, 'PoliceLookup'>;

export const PoliceLookupScreen: React.FC<Props> = ({ navigation }) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchUserId = async (idToSearch?: string) => {
    const targetId = (idToSearch || userIdInput).trim().toUpperCase();

    // SECTION 21: FRONTEND FORMAT VALIDATION (BDW-XXXXXXX)
    const userIdRegex = /^BDW-[A-Z0-9]{7}$/i;
    if (!targetId || !userIdRegex.test(targetId)) {
      Alert.alert('Invalid Input', 'Please enter a valid User ID.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await policeApi.lookupCitizenByUserId(targetId);
      setIsLoading(false);

      if (data && data.user) {
        navigation.navigate('PoliceInspection', { lookupData: data });
      } else {
        Alert.alert('No Match', 'No citizen found matching the provided User ID.');
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response ? (err.response.data?.message || 'Please enter a valid User ID.') : "You're Offline\nCitizen verification requires an active internet connection.";
      Alert.alert('Lookup Error', msg);
    }
  };

  const handleDemoLookup = () => {
    setUserIdInput('BDW-9K7F3A2');
    handleSearchUserId('BDW-9K7F3A2');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>👮</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>POLICE INSPECTION TERMINAL</Text>
          <Text style={styles.headerSub}>Officer Badge #8841 • Traffic Enforcement</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Module Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainHeading}>Citizen Identity Verification</Text>
          <Text style={styles.subHeading}>
            Enter a citizen's public User ID to query authorized vehicle credentials.
          </Text>
        </View>

        {/* Search Card */}
        <View style={styles.card}>
          <Text style={styles.label}>ENTER CITIZEN USER ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. BDW-9K7F3A2"
            placeholderTextColor="#64748B"
            value={userIdInput}
            onChangeText={text => setUserIdInput(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.searchBtn, isLoading && styles.btnDisabled]}
            onPress={() => handleSearchUserId()}
            disabled={isLoading}
            activeOpacity={0.88}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.searchBtnText}>🔍 Query Citizen User ID</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoLookup}
            activeOpacity={0.8}>
            <Text style={styles.demoBtnText}>⚡ Try Demo User ID (BDW-9K7F3A2)</Text>
          </TouchableOpacity>
        </View>

        {/* Data Access Scoping Rules Box */}
        <View style={styles.scopingRulesBox}>
          <View style={styles.scopingHeader}>
            <Text style={styles.scopingIcon}>🛡️</Text>
            <Text style={styles.scopingTitle}>POLICE DATA SCOPING RULES</Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleCheck}>✓ ACCESSIBLE VEHICLE DOCUMENTS:</Text>
            <Text style={styles.ruleDesc}>
              • Driving Licence (Approved + Vehicle Tag){'\n'}
              • Vehicle RC (Approved + Vehicle Tag){'\n'}
              • Vehicle Insurance (Approved + Vehicle Tag){'\n'}
              • Pollution Certificate (Approved + Vehicle Tag)
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleCross}>✕ RESTRICTED PRIVATE DOCUMENTS:</Text>
            <Text style={styles.ruleDesc}>
              • Aadhaar Card, PAN Card, Passports{'\n'}
              • Marks Cards, Academic Certificates{'\n'}
              • Pending, Rejected, or Normal-tagged files
            </Text>
          </View>
        </View>

        {/* Read-Only Notice */}
        <View style={styles.readOnlyNotice}>
          <Text style={styles.noticeIcon}>🔒</Text>
          <Text style={styles.noticeText}>
            "Police officers are strictly read-only users. They cannot modify citizen information or documents."
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: PoliceTheme.colors.textMain,
  },
  subHeading: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: PoliceTheme.colors.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: PoliceTheme.colors.primary,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  searchBtn: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  demoBtn: {
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  demoBtnText: {
    color: PoliceTheme.colors.badgeGold,
    fontWeight: '700',
    fontSize: 12,
  },
  scopingRulesBox: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
    marginBottom: 16,
  },
  scopingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scopingIcon: {
    fontSize: 16,
  },
  scopingTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: PoliceTheme.colors.badgeGold,
    letterSpacing: 1,
  },
  ruleItem: {
    marginBottom: 10,
  },
  ruleCheck: {
    fontSize: 11,
    fontWeight: '800',
    color: PoliceTheme.colors.verifiedText,
  },
  ruleCross: {
    fontSize: 11,
    fontWeight: '800',
    color: PoliceTheme.colors.alertText,
  },
  ruleDesc: {
    fontSize: 12,
    color: PoliceTheme.colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
    paddingLeft: 8,
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

export default PoliceLookupScreen;
