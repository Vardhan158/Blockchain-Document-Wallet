import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import tw from 'twrnc';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={tw`bg-red-950 border-b border-red-500/80 py-2.5 px-4 items-center`}>
      <View style={tw`flex-row items-center gap-1.5`}>
        <Text style={tw`text-sm`}>📡</Text>
        <Text style={tw`text-xs font-black text-red-300 tracking-wide uppercase`}>
          You're Offline
        </Text>
      </View>
      <Text style={tw`text-[11px] text-red-200 text-center font-semibold mt-0.5`}>
        Connect to the internet to upload or verify documents. Limited cached metadata displayed.
      </Text>
    </View>
  );
};

export default OfflineBanner;
