/**
 * app/(app)/[groupId]/_layout.tsx — stack for a single group's screens.
 */
import { Stack } from 'expo-router';
import { semantic } from '@/theme/colors';

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.background },
      }}
    />
  );
}
