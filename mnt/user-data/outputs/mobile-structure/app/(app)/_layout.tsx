/**
 * app/(app)/_layout.tsx — stack for the authenticated area. Holds the tab
 * navigator plus the full-screen routes that push OVER the tabs (create, join,
 * and each group's own screens under [groupId]).
 */
import { Stack } from 'expo-router';
import { semantic } from '@/theme/colors';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="groups/create" options={{ presentation: 'card' }} />
      <Stack.Screen name="groups/join" options={{ presentation: 'card' }} />
      <Stack.Screen name="[groupId]" />
    </Stack>
  );
}
