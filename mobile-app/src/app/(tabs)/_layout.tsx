import { Tabs, Redirect } from 'expo-router';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { MicFAB } from '../../components/MicFAB';
import { C } from '../../constants/colors';
import { useStore } from '../../store';

function TabIcon({
  name,
  focused,
}: {
  name: any;
  focused: boolean;
}) {
  return (
    <View
      className={`w-11 h-11 items-center justify-center rounded-2xl ${
        focused ? 'bg-emerald-50' : ''
      }`}
    >
      <Feather
        name={name}
        size={20}
        color={focused ? C.emerald600 : C.slate400}
      />
    </View>
  );
}

export default function TabLayout() {
  const loggedIn = useStore((s: any) => s.loggedIn);

  if (!loggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,

            height: 72,

            paddingTop: 8,
            paddingBottom: 8,

            backgroundColor: C.white,

            borderTopWidth: 1,
            borderTopColor: C.slate100,

            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 10,
          },

          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -2,
          },

          tabBarIconStyle: {
            marginBottom: 0,
          },

          tabBarActiveTintColor: C.emerald600,
          tabBarInactiveTintColor: C.slate400,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="home" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="ledger"
          options={{
            title: 'Ledger',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="pie-chart" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="bar-chart-2" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="user" focused={focused} />
            ),
          }}
        />
      </Tabs>

      <MicFAB />
    </View>
  );
}