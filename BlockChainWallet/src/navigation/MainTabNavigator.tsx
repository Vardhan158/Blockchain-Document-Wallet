import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VaultIcon, IconName, GradientSurface } from '../components/DashboardArtwork';

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

function CurvedTabBarBackground({ height }: { height: number }) {
  const { width } = useWindowDimensions();
  const c = width / 2;
  const r = 40; // Curve cutout half-width
  const depth = 26; // Curve cutout depth

  const d = `
    M 0,16
    Q 0,0 16,0
    L ${c - r},0
    C ${c - r + 16},0 ${c - 18},${depth} ${c},${depth}
    C ${c + 18},${depth} ${c + r - 16},0 ${c + r},0
    L ${width - 16},0
    Q ${width},0 ${width},16
    L ${width},${height}
    L 0,${height}
    Z
  `;

  return (
    <View style={styles.svgWrapper}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={d} fill="#ffffff" />
      </Svg>
    </View>
  );
}

function VaultTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const barHeight = 58 + Math.max(insets.bottom, 10);

  return (
    <View style={[styles.container, { height: barHeight }]}>
      <CurvedTabBarBackground height={barHeight} />

      <View style={[styles.tabRow, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const isUpload = route.name === 'Upload';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          if (isUpload) {
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Upload document"
                key={route.key}
                style={styles.uploadTabContainer}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.88}>
                <View style={styles.uploadFab}>
                  <GradientSurface colors={['#7f53ff', '#5a38ff', '#3d25e6']} />
                  <VaultIcon name="plus" size={28} color="white" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityLabel={labels[route.name]}
              accessibilityState={{ selected: focused }}
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              onLongPress={onLongPress}>
              <View style={styles.iconContainer}>
                <VaultIcon
                  name={icons[route.name]}
                  size={22}
                  color={focused ? '#6242ff' : '#858da7'}
                />
              </View>
              <Text style={[styles.label, focused && styles.activeLabel]}>
                {labels[route.name]}
              </Text>
              <View style={[styles.dot, focused && styles.activeDot]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const renderTabBar = (props: BottomTabBarProps) => <VaultTabBar {...props} />;

export const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={renderTabBar}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Documents" component={DocumentsScreen} />
    <Tab.Screen name="Upload" component={UploadScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  svgWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    shadowColor: '#535694',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#858da7',
    marginTop: 2,
  },
  activeLabel: {
    color: '#6242ff',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  activeDot: {
    backgroundColor: '#6242ff',
  },
  uploadTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  uploadFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: '#5331f2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});

export default MainTabNavigator;
