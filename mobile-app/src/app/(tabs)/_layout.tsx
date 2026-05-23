import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { MicFAB } from '../../components/MicFAB';
import { C } from '../../constants/colors';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <View style={{
      width: 38, height: 30, alignItems: 'center', justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: focused ? C.emerald50 : 'transparent',
    }}>
      <Feather name={name} size={20} color={focused ? C.emerald600 : C.slate400} />
    </View>
  );
}

export default function TabLayout() {
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown:       false,
          tabBarStyle: {
            backgroundColor: C.white,
            borderTopWidth:  1,
            borderTopColor:  C.slate100,
            minHeight:       68,
            paddingBottom:   8,
            paddingTop:      6,
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: -4 },
            shadowOpacity:   0.06,
            shadowRadius:    12,
            elevation:       12,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarActiveTintColor:   C.emerald600,
          tabBarInactiveTintColor: C.slate400,
        }}
      >
        <Tabs.Screen name="home"     options={{ title: 'Home',     tabBarIcon: ({ focused }) => <TabIcon name="home"        focused={focused} /> }} />
        <Tabs.Screen name="expenses" options={{ title: 'Expenses', tabBarIcon: ({ focused }) => <TabIcon name="pie-chart"   focused={focused} /> }} />
        <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-2" focused={focused} /> }} />
        <Tabs.Screen name="alerts"   options={{ title: 'Alerts',   tabBarIcon: ({ focused }) => <TabIcon name="bell"        focused={focused} />, tabBarBadge: unread > 0 ? unread : undefined }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile',  tabBarIcon: ({ focused }) => <TabIcon name="user"        focused={focused} /> }} />
      </Tabs>
      <MicFAB />
    </View>
  );
}