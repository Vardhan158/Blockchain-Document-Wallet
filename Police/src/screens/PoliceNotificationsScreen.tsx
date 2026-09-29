import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { policeApi } from '../services/api';
import { PoliceTheme } from '../theme/theme';

interface PoliceNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  read?: boolean;
}

export const PoliceNotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<PoliceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => {
    const loadNotifs = () => {
      policeApi.getNotifications().then(data => setNotifications(data.notifications || [])).catch(() => {}).finally(() => setLoading(false));
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 6000);
    return () => clearInterval(interval);
  }, []));
  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeIcon}>🔔</Text>
        </View>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>OFFICER ALERTS & NOTIFICATIONS</Text>
          <Text style={styles.headerSub}>Official Department Bulletins</Text>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.screenTitle}>Official Notifications</Text>

        {loading ? <ActivityIndicator color={PoliceTheme.colors.badgeGold} /> : <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.notifIcon}>
                  {item.type === 'ALERT' ? '🛡️' : item.type === 'UPDATE' ? '📢' : '⛓️'}
                </Text>
                <View style={styles.titleCol}>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />}
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
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  card: {
    backgroundColor: PoliceTheme.colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: PoliceTheme.colors.textMain,
  },
  timeText: {
    fontSize: 11,
    color: PoliceTheme.colors.textMuted,
    marginTop: 2,
  },
  messageText: {
    fontSize: 13,
    color: PoliceTheme.colors.textMuted,
    lineHeight: 18,
  },
});

export default PoliceNotificationsScreen;
