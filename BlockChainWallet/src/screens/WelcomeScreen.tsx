import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import api from '../services/api';
import { GradientSurface, VaultIcon } from '../components/DashboardArtwork';
type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { height } = useWindowDimensions();
  const [info, setInfo] = useState({
    title: 'Blockchain Document Wallet',
    tagline: 'Securely manage and verify your important documents.',
  });
  useEffect(() => {
    api
      .get('/welcome')
      .then(r => {
        if (r.data?.appName)
          setInfo({ title: r.data.appName, tagline: r.data.tagline });
      })
      .catch(() => {});
  }, []);
  return (
    <SafeAreaView style={s.screen}>
      <StatusBar
        {...({ barStyle: 'dark-content', backgroundColor: '#B2A1FF' } as any)}
      />
      <View style={s.topGlow}>
        <GradientSurface colors={['#b2a1ff', '#bccbff', '#cef8fb']} />
      </View>
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingHorizontal: 24, minHeight: height - 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={s.header}>
          <View style={s.logo}>
            <GradientSurface />
            <VaultIcon name="shield" size={29} color="white" />
          </View>
          <View>
            <Text style={s.brand}>VAULT / ID</Text>
            <Text style={s.brandSubtitle}>Digital Document Vault</Text>
          </View>
        </View>
        <View style={s.badge}>
          <VaultIcon name="shield" size={58} color="#6342ff" />
        </View>
        <Text style={s.eyebrow}>YOUR DIGITAL IDENTITY</Text>
        <Text style={s.title}>
          {info.title === 'Blockchain Document Wallet' ? (
            <>Your documents, secured.</>
          ) : (
            info.title
          )}
        </Text>
        <Text style={s.tagline}>{info.tagline}</Text>
        <View style={s.actions}>
          <TouchableOpacity
            style={s.primary}
            onPress={() => navigation.navigate('Register')}
          >
            <GradientSurface />
            <Text style={s.button}>Create Account</Text>
            <VaultIcon name="arrow" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.secondaryButton}>Unlock with Fingerprint</Text>
            <VaultIcon name="shield" size={20} color="#6342ff" />
          </TouchableOpacity>
        </View>
        <Text style={s.footer}>SHA-256 Encrypted • User ID Scoped Access</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFBFF' },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 235 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 18,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, width: '100%', marginBottom: 32 },
  logo: { width: 55, height: 55, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#171438', fontWeight: '900', fontSize: 19, letterSpacing: 1 },
  brandSubtitle: { color: '#64748B', fontWeight: '700', fontSize: 11, marginTop: 2 },
  badge: {
    width: 94,
    height: 94,
    borderRadius: 30,
    backgroundColor: '#F0EDFF',
    borderWidth: 1,
    borderColor: '#DED8FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 21,
  },
  eyebrow: { color: '#6342FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  title: {
    color: '#171438',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  tagline: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 340,
  },
  actions: { width: '100%', marginTop: 31, gap: 13 },
  primary: {
    height: 54,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    shadowColor: '#6342ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  secondary: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryButton: { color: '#4935D9', fontSize: 15, fontWeight: '900' },
  footer: {
    color: '#7B819B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 34,
  },
});
export default WelcomeScreen;
