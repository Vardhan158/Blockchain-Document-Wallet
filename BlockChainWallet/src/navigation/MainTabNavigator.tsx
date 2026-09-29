import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VaultIcon, IconName } from '../components/DashboardArtwork';
const Tab = createBottomTabNavigator<MainTabParamList>();
const icons: Record<string, IconName> = {
  Home: 'home',
  Documents: 'folder',
  Upload: 'plus',
  Notifications: 'bell',
  Profile: 'shield',
};
const labels: Record<string, string> = {
  Home: 'Home',
  Documents: 'Docs',
  Upload: 'Upload',
  Notifications: 'Alerts',
  Profile: 'Profile',
};
function VaultTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const upload = route.name === 'Upload';
        return (
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityLabel={labels[route.name]}
            accessibilityState={{ selected: focused }}
            key={route.key}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
          >
            <View style={upload ? styles.upload : styles.icon}>
              <VaultIcon
                name={icons[route.name]}
                size={upload ? 31 : 23}
                color={upload ? 'white' : focused ? '#6242ff' : '#858da7'}
              />
            </View>
            {!upload && (
              <>
                <Text style={[styles.label, focused && styles.active]}>
                  {labels[route.name]}
                </Text>
                <View style={[styles.dot, focused && styles.activeDot]} />
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
export const MainTabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={props => <VaultTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Documents" component={DocumentsScreen} />
    <Tab.Screen name="Upload" component={UploadScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 11,
    shadowColor: '#a1a4d3',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 49,
  },
  icon: { height: 25, justifyContent: 'center' },
  label: { fontSize: 11, color: '#76809c', marginTop: 3 },
  active: { color: '#6242ff', fontWeight: '600' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  activeDot: { backgroundColor: '#6242ff' },
  upload: {
    width: 53,
    height: 53,
    borderRadius: 29,
    backgroundColor: '#6040ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -17,
    shadowColor: '#6547e8',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 7,
  },
});
export default MainTabNavigator;
