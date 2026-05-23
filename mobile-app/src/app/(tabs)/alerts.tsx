import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutLeft, Layout } from 'react-native-reanimated';
import { BellOff } from 'lucide-react-native';
import { useStore } from '../../store';
import { NotifCard } from '../../components/ui/NotifCard';
import { C } from '../../constants/colors';

export default function AlertsScreen() {
  const notifications = useStore((s) => s.notifications);
  const markNotifRead = useStore((s) => s.markNotifRead);
  const unread = notifications.filter((n) => !n.read);
  const read   = notifications.filter((n) =>  n.read);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-slate-100">
        <View>
          <Text className="text-base font-bold text-slate-800">Alerts</Text>
          <Text className="text-xs text-slate-500">{unread.length} unread</Text>
        </View>
        {unread.length > 0 && (
          <View className="w-7 h-7 rounded-full bg-rose-500 items-center justify-center">
            <Text className="text-xs font-bold text-white">{unread.length}</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {unread.length === 0 && read.length === 0 ? (
          <View className="items-center py-16">
            <BellOff size={48} color={C.slate300} />
            <Text className="text-sm text-slate-500 mt-3">All caught up!</Text>
          </View>
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New</Text>
                {unread.map((n, i) => (
                  <Animated.View
                    key={n.id}
                    entering={FadeInDown.delay(i * 60).springify()}
                    exiting={FadeOutLeft}
                    layout={Layout.springify()}
                    className="mb-2"
                  >
                    <NotifCard notif={n} onDismiss={markNotifRead} />
                  </Animated.View>
                ))}
              </>
            )}
            {read.length > 0 && (
              <>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Earlier</Text>
                {read.map((n, i) => (
                  <Animated.View key={n.id} entering={FadeInDown.delay(i * 40).springify()} className="mb-2 opacity-60">
                    <NotifCard notif={n} onDismiss={() => {}} />
                  </Animated.View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}