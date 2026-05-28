import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';
import { useStore } from '../../store';
import { C } from '../../constants/colors';

export default function LogoutScreen() {
  const router = useRouter();
  const resetGlobalDataState = useStore((s) => s.resetGlobalDataState);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Notify the backend
        await endpoints.logout();
      } catch (error) {
        console.log('Backend logout failed or missing, proceeding with local cleanup.', error);
      } finally {
        // 2. Clear local auth token
        await setToken('');

        // 3. Reset Zustand global store
        resetGlobalDataState();

        // 4. Redirect to onboarding
        router.replace('/onboarding');
      }
    };

    performLogout();
  }, [router, resetGlobalDataState]);

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center">
      <ActivityIndicator size="large" color={C.emerald600} />
      <Text className="mt-4 text-slate-500 font-medium text-sm">Logging out securely...</Text>
    </View>
  );
}