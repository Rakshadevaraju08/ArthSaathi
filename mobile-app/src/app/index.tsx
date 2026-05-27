import { Redirect } from 'expo-router';

import { useStore } from '../store';

export default function AppEntry() {
  const onboarded = useStore((s) => s.onboarded);
  const isRegistered = useStore((s) => s.isRegistered);

  if (isRegistered) {
    return <Redirect href="/(tabs)/home" />;
  }
  if (onboarded) {
    return <Redirect href="/login" />;
  }
  return <Redirect href="/onboarding" />;
}
