import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PoliceTabParamList } from '../types';
import { PoliceHomeScreen } from '../screens/PoliceHomeScreen';
import { PoliceLookupScreen } from '../screens/PoliceLookupScreen';
import { PoliceHistoryScreen } from '../screens/PoliceHistoryScreen';
import { PoliceNotificationsScreen } from '../screens/PoliceNotificationsScreen';
import { PoliceProfileScreen } from '../screens/PoliceProfileScreen';
import { PoliceTheme } from '../theme/theme';

const Tab = createBottomTabNavigator<PoliceTabParamList>();

export const PoliceTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="PoliceLookup"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: PoliceTheme.colors.surface,
          borderTopColor: PoliceTheme.colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}>
      {/* 1. Home */}
      <Tab.Screen
        name="PoliceHome"
        component={PoliceHomeScreen as any}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />

      {/* 2. Search / Verify Citizen (CENTRAL & MOST IMPORTANT FUNCTION) */}
      <Tab.Screen
        name="PoliceLookup"
        component={PoliceLookupScreen as any}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centralTabBadge, focused && styles.centralTabBadgeActive]}>
              <Text style={{ fontSize: 20 }}>🔍</Text>
            </View>
          ),
        }}
      />

      {/* 3. History */}
      <Tab.Screen
        name="PoliceHistory"
        component={PoliceHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📜</Text>,
        }}
      />

      {/* 4. Notifications */}
      <Tab.Screen
        name="PoliceNotifications"
        component={PoliceNotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔔</Text>,
        }}
      />

      {/* 5. Profile */}
      <Tab.Screen
        name="PoliceProfile"
        component={PoliceProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centralTabBadge: {
    width: 42,
    height: 38,
    borderRadius: 12,
    backgroundColor: PoliceTheme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PoliceTheme.colors.border,
  },
  centralTabBadgeActive: {
    backgroundColor: PoliceTheme.colors.primaryContainer,
    borderColor: PoliceTheme.colors.primary,
  },
});

export default PoliceTabNavigator;
