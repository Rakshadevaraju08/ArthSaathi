import { Redirect, Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { MicFAB } from '../../components/MicFAB';
import { C } from '../../constants/colors';
import { useStore } from '../../store';

function TabIcon({
  name,
  label,
  focused,
}: {
  name: keyof typeof Feather.glyphMap;
  label: string;
  focused: boolean;
}) {
  return (
    <View className="w-[50px] items-center justify-center pt-1.5">
      <View className={`mb-1 h-8 w-12 items-center justify-center rounded-xl ${focused ? 'bg-emerald-50' : 'bg-transparent'}`}>
        <Feather name={name} size={20} color={focused ? C.emerald600 : C.slate400} />
      </View>
      <Text
        className={focused ? 'font-bold text-emerald-600' : 'font-medium text-slate-400'}
        style={{ fontSize: 10 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const isRegistered = useStore((s) => s.isRegistered);

  if (!isRegistered) {
    return <Redirect href="/signup" />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: C.white,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            height: 68,
            paddingBottom: 8,
            paddingTop: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 12,
          },
          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          },
          tabBarActiveTintColor: C.emerald600,
          tabBarInactiveTintColor: C.slate400,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="ledger"
          options={{
            title: 'Ledger',
            tabBarIcon: ({ focused }) => <TabIcon name="pie-chart" label="Ledger" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="business"
          options={{
            href: null,
            tabBarIcon: () => <View style={{ width: 60 }} />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-2" label="Insights" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} />,
          }}
        />
      </Tabs>

      <MicFAB />
    </View>
  );
}
