/**
 * app/(app)/groups/index.tsx — the Groups page (Home). Your working screen,
 * now with the BottomNav pinned at the bottom (Home | Profile).
 */
import { useState } from 'react';
import { View, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, X, Users, UserPlus, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BottomNav } from '@/components/shared/BottomNav';
import { semantic, shadowToken } from '@/theme/colors';
import { useGroups } from '@/context/GroupContext';
import type { MyGroup } from '@/api/groups';

export default function GroupsHome() {
  const router = useRouter();
  const { groups, loading, refresh } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function openGroup(item: MyGroup) {
    router.push({ pathname: '/(app)/[groupId]', params: { groupId: item.groups.id } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: semantic.surface }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: semantic.border }}>
        <Text variant="h2" style={{ flex: 1, fontSize: 20 }}>KapitPondo</Text>
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={semantic.brand} />
          </View>
        ) : groups.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
            <Pressable onPress={() => router.push('/(app)/groups/create')} style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 130, height: 100, borderWidth: 2, borderColor: semantic.borderStrong, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: semantic.background }}>
                <Users size={56} color={semantic.textMuted} />
              </View>
            </Pressable>
            <Text variant="h1" style={{ fontSize: 20, marginBottom: 10, textAlign: 'center' }}>No groups yet</Text>
            <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
              Create or join a savings group to start managing your finances together.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <Text variant="overline" color="secondary" style={{ marginBottom: 12 }}>My Groups</Text>
            <View style={{ gap: 12 }}>
              {groups.map((item) => (
                <Pressable
                  key={item.groups.id}
                  onPress={() => openGroup(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: semantic.background, borderWidth: 1, borderColor: semantic.borderStrong, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16 }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: semantic.textPrimary, alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="label" style={{ fontSize: 16 }} numberOfLines={1}>{item.groups.name}</Text>
                    <Text variant="caption" color="secondary" style={{ marginTop: 2, letterSpacing: 1 }}>{item.groups.fund_code}</Text>
                  </View>
                  {item.status === 'pending' ? (
                    <StatusBadge entity="membership" value="pending" />
                  ) : (
                    <StatusBadge entity="role" value={item.role} />
                  )}
                  <ChevronRight size={18} color={semantic.textMuted} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {/* FAB mini-menu */}
        {fabOpen && (
          <View style={{ position: 'absolute', right: 20, bottom: 90, gap: 10, alignItems: 'flex-end' }}>
            {[
              { icon: Plus, label: 'Create Group', path: '/(app)/groups/create' as const },
              { icon: UserPlus, label: 'Join Group', path: '/(app)/groups/join' as const },
            ].map((it) => (
              <Pressable
                key={it.label}
                onPress={() => { setFabOpen(false); router.push(it.path); }}
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: semantic.surface, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 28 }, shadowToken.card]}
              >
                <Text variant="label">{it.label}</Text>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: semantic.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <it.icon size={20} color={semantic.textPrimary} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* FAB */}
        <Pressable
          onPress={() => setFabOpen((o) => !o)}
          style={[{ position: 'absolute', right: 24, bottom: 16, width: 60, height: 60, borderRadius: 30, backgroundColor: semantic.textPrimary, alignItems: 'center', justifyContent: 'center' }, shadowToken.button]}
        >
          {fabOpen ? <X size={30} color="#fff" /> : <Plus size={30} color="#fff" />}
        </Pressable>
      </View>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}
