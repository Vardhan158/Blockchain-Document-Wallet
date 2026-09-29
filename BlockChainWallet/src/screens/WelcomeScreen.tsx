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
import { VaultIcon } from '../components/DashboardArtwork';
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
        {...({ barStyle: 'light-content', backgroundColor: '#0F172A' } as any)}
      />
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingHorizontal: 24, minHeight: height - 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={s.badge}>
          <VaultIcon name="shield" size={72} color="#c4e2e6" />
        </View>
        <Text style={s.title}>
          {info.title === 'Blockchain Document Wallet' ? (
            <>Blockchain Document{'\n'}Wallet</>
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
            <Text style={s.button}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.button}>Login</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.footer}>SHA-256 Encrypted • User ID Scoped Access</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F172A' },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 18,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#24334B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  tagline: {
    color: '#98A8C0',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 340,
  },
  actions: { width: '100%', marginTop: 32, gap: 16 },
  primary: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#5042E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5042E8',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  secondary: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#30415A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { color: '#fff', fontSize: 18, fontWeight: '900' },
  footer: {
    color: '#667995',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 34,
  },
});
export default WelcomeScreen;
