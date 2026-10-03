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

function CurvedTabBarBackground({ height, width }: { height: number; width: number }) {
  const c = width / 2;
  const r = 66; // Curve cutout half-width
  const depth = 45; // Concave dip depth
  const cr = 42; // Pill outer corner radius

  const d = `
    M ${cr},0
    L ${c - r},0
    C ${c - r + 25},0 ${c - 30},${depth} ${c},${depth}
    C ${c + 30},${depth} ${c + r - 25},0 ${c + r},0
    L ${width - cr},0
    Q ${width},0 ${width},${cr}
    L ${width},${height - cr}
    Q ${width},${height} ${width - cr},${height}
    L ${cr},${height}
    Q 0,${height} 0,${height - cr}
    L 0,${cr}
    Q 0,0 ${cr},0
    Z
  `;

  return (
    <View style={styles.svgWrapper}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={d}
          fill="#ffffff"
          stroke="#d2d9ee"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

function VaultTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const pillWidth = width - 32; // 16px margin on left and right
  const pillHeight = 72;
  const bottomMargin = Math.max(insets.bottom, 14);
  const fabClearance = 30;

  return (
    <View style={[styles.outerContainer, { height: pillHeight + bottomMargin + fabClearance, paddingTop: fabClearance, paddingBottom: bottomMargin, paddingHorizontal: 16 }]}>
      <View style={[styles.pillContainer, { width: pillWidth, height: pillHeight }]}>
        <CurvedTabBarBackground width={pillWidth} height={pillHeight} />

        <View style={styles.tabRow}>
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
                    <VaultIcon name="plus" size={32} color="white" />
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
                    size={26}
                    color={focused ? '#542cff' : '#7d89aa'}
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
  outerContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pillContainer: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svgWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    shadowColor: '#3d447a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
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
    paddingTop: 7,
  },
  iconContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7d89aa',
    marginTop: 3,
  },
  activeLabel: {
    color: '#542cff',
    fontWeight: '900',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -31,
    shadowColor: '#5331f2',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    elevation: 11,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
});

export default MainTabNavigator;
