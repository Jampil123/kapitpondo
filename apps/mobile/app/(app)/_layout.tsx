/**
 * app/(app)/_layout.tsx — stack for the authenticated flow.
 */
import { Stack } from 'expo-router';
import { GroupProvider } from '@/context/GroupContext';
import { semantic } from '@/theme/colors';

export default function AppLayout() {
  return (
    <GroupProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: semantic.background },
        }}
      />
    </GroupProvider>
  );
}
