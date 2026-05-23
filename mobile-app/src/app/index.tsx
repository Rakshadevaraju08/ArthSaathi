import { Redirect } from 'expo-router';

import { useStore } from '../store';

export default function AppEntry() {
  const isLoggedIn = useStore(
    (s) => s.isLoggedIn
  );

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/onboarding" />;
}