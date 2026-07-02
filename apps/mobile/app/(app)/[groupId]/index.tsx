/**
 * app/(app)/[groupId]/index.tsx — placeholder group dashboard.
 * Stops the crash from navigating into a [groupId] route with no screen.
 * The real dashboard (contributions, cycles, loans, expenses, distributions,
 * members, reports) still needs to be built out per role.
 */
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme/colors';
import { useActiveGroup, useGroups } from '@/context/GroupContext';

export default function GroupDashboard() {
  const { loading } = useGroups();
  const { group, role, membership } = useActiveGroup();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: semantic.background }}>
      <ScreenHeader back />
      {loading && !group ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={semantic.brand} />
        </View>
      ) : !group ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
          <Text variant="h2" style={{ textAlign: 'center' }}>Group not found</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 22, gap: 6 }}>
          <Text variant="h1" style={{ fontSize: 22 }}>{group.name}</Text>
          <Text variant="body" color="secondary" style={{ letterSpacing: 1 }}>{group.fund_code}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            {role ? <StatusBadge entity="role" value={role} /> : null}
            {membership ? <StatusBadge entity="membership" value={membership.status} /> : null}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
