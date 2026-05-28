import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useStore } from '../store';
import { getToken } from '../services/auth';
import { endpoints } from '../services/api';
import { C } from '../constants/colors';

export default function AppEntry() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const setUser = useStore((s) => s.setUser);
  const setToken = useStore((s) => s.setToken);
  const setLoggedIn = useStore((s) => s.setLoggedIn);
  const setOnboarded = useStore((s) => s.setOnboarded);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          setStatus('unauthenticated');
          return;
        }

        // Token exists — validate it with the backend
        const response = await endpoints.getMe();
        const user = response.data?.data;

        if (!user) {
          setStatus('unauthenticated');
          return;
        }

        // Token is valid — restore session state
        setToken(storedToken);
        setUser(user);
        setLoggedIn(true);
        setOnboarded(true);

        // Also restore the name/mobile into store fields used by Profile screen
        useStore.setState({
          fullName: user.name ?? '',
          mobileNumber: user.phone ?? '',
          isRegistered: true,
          onboarded: true,
          isLoggedIn: true,
        });

        setStatus('authenticated');
      } catch {
        // Token is expired or invalid — clear it and go to onboarding
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={C.emerald500} />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/onboarding" />;
}