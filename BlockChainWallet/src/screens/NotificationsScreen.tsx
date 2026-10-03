import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationItem } from '../types/models';
import { GradientSurface, VaultIcon } from '../components/DashboardArtwork';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = BottomTabScreenProps<MainTabParamList, 'Notifications'>;

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Recently';
  }
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'DOCUMENT_APPROVED':
    case 'APPROVAL':
      return '✅';
    case 'DOCUMENT_REJECTED':
    case 'REJECTION':
      return '❌';
    case 'DOCUMENT_TAG_CHANGED':
    case 'TAG_CHANGE':
      return '🏷️';
    case 'DOCUMENT_UNDER_REVIEW':
      return '⏳';
    case 'SECURITY_ALERT':
      return '🛡️';
    case 'ACCOUNT_UPDATE':
      return '👤';
    default:
      return '🔔';
  }
}

export const NotificationsScreen: React.FC<Props> = () => {
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isLoading,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const renderNotifItem = ({ item }: { item: NotificationItem }) => {
    const icon = getNotificationIcon(item.type);
    const timeAgo = formatRelativeTime(item.createdAt);

    return (
      <TouchableOpacity
        style={tw`rounded-2xl p-4 border mb-2.5 shadow-md ${
          item.read
            ? 'bg-white border-slate-200'
            : 'bg-[#fbfaff] border-1.5 border-indigo-200'
        }`}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.85}>
        <View style={tw`flex-row items-center mb-2`}>
          <Text style={tw`text-xl mr-3`}>{icon}</Text>

          <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-extrabold text-slate-800`}>{item.title}</Text>
            <Text style={tw`text-[11px] font-semibold text-slate-500 mt-0.5`}>{timeAgo}</Text>
          </View>

          {!item.read && (
            <View style={tw`flex-row items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500`}>
              <View style={tw`w-1.5 h-1.5 rounded-full bg-indigo-400`} />
              <Text style={tw`text-[10px] font-black text-indigo-300`}>New</Text>
            </View>
          )}
        </View>

        <Text style={tw`text-xs text-slate-600 leading-4`}>{item.message}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#faf9ff]`} edges={['top']}>
      <View style={[tw`absolute top-0 left-0 right-0`, { height: 210 }]}>
        <GradientSurface colors={['#b2a1ff', '#bccbff', '#cef8fb']} />
      </View>
      <View style={tw`h-18 flex-row items-center px-5`}>
        <View style={tw`w-11 h-11 rounded-2xl overflow-hidden items-center justify-center`}>
          <GradientSurface />
          <VaultIcon name="shield" color="white" size={23} />
        </View>
        <View style={tw`ml-3 flex-1`}>
          <Text style={tw`text-[17px] font-black tracking-wider text-[#171438]`}>VAULT / ID</Text>
          <Text style={tw`text-[11px] font-semibold text-slate-500`}>Alerts & activity</Text>
        </View>
        <View style={tw`w-10 h-10 rounded-2xl bg-white items-center justify-center`}>
          <VaultIcon name="bell" size={21} />
        </View>
      </View>

      <View style={[tw`flex-1 bg-[#fafbfff5] overflow-hidden px-5 pt-5`, { borderTopLeftRadius: 32, borderTopRightRadius: 32 }]}>
        <View style={tw`flex-row items-center justify-between mb-5`}>
          <View>
            <Text style={tw`text-[10px] font-black tracking-widest text-indigo-600`}>WALLET ACTIVITY</Text>
            <Text style={tw`text-[27px] font-black text-[#171438] mt-0.5`}>Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              activeOpacity={0.8}
              style={tw`rounded-xl bg-indigo-100 px-3 py-2`}>
              <Text style={tw`text-[11px] font-extrabold text-indigo-700`}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={sortedNotifications}
          keyExtractor={item => item.id}
          renderItem={renderNotifItem}
          style={tw`mt-3`}
          contentContainerStyle={tw`pb-7 gap-2.5`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchNotifications}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View style={tw`items-center justify-center py-14`}>
              <View style={tw`w-12 h-12 rounded-2xl bg-indigo-100 items-center justify-center mb-3`}>
                <Text style={tw`text-xl`}>🔔</Text>
              </View>
              <Text style={tw`text-base font-bold text-slate-800`}>No notifications yet</Text>
              <Text style={tw`text-xs text-slate-500 text-center mt-1 px-6 leading-4`}>
                You will receive real-time alerts when administrators verify or update your document categories.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
