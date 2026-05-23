import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  useEffect(() => {
    async function hideNavBar() {
      try {
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('visible');
        }
      } catch (error) {
      }
    }
    hideNavBar();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens/voice" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/loan"  options={{ presentation: 'card' }} />
        <Stack.Screen name="screens/scam"  options={{ presentation: 'card' }} />
        <Stack.Screen name="screens/rtc"   options={{ presentation: 'card' }} />
      </Stack>
    </SafeAreaProvider>
  );
}