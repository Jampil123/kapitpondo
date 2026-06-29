/**
 * context/GroupContext.tsx
 * ============================================================================
 * Holds the caller's groups (fetched once after sign-in) and answers "what is
 * my role in group X?" — the core of the per-group permission model.
 *
 * Two ways screens consume it:
 *
 *   // The groups list / switcher
 *   const { groups, loading, refresh } = useGroups();
 *
 *   // Inside a [groupId] route — the active group + MY role in it
 *   const { group, role, isMyOfficerRole } = useActiveGroup();
 *   if (can(role, 'approveContribution')) { ...show approve button... }
 *
 * `useActiveGroup()` reads the `groupId` route param automatically, so any
 * screen under app/(app)/[groupId]/** gets the right group with no prop drilling.
 * ============================================================================
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from './AuthContext';
import { listMyGroups, type MyGroup } from '../api/groups';
import { isOfficer, type GroupRole } from '../constants/roles';

interface GroupContextValue {
  groups: MyGroup[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  /** Look up one group (and your role in it) by id. */
  getById: (groupId: string | undefined) => MyGroup | null;
}

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (status !== 'signedIn') {
      setGroups([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setGroups(await listMyGroups());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Load groups when the user signs in; clear them on sign-out.
  useEffect(() => {
    if (status === 'signedIn') refresh();
    else setGroups([]);
  }, [status, refresh]);

  const getById = useCallback(
    (groupId: string | undefined) => groups.find((g) => g.id === groupId) ?? null,
    [groups],
  );

  return (
    <GroupContext.Provider value={{ groups, loading, error, refresh, getById }}>
      {children}
    </GroupContext.Provider>
  );
}

/** The groups list / switcher hook. */
export function useGroups(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroups must be used within <GroupProvider>');
  return ctx;
}

interface ActiveGroup {
  groupId: string | undefined;
  group: MyGroup | null;
  role: GroupRole | null;
  isMyOfficerRole: boolean;
}

/**
 * The active group, derived from the `groupId` route param. Use inside any
 * screen under app/(app)/[groupId]/**. Returns nulls if there's no groupId in
 * the route or the user isn't a member of it.
 */
export function useActiveGroup(): ActiveGroup {
  const { getById } = useGroups();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const group = getById(groupId);
  const role = group?.role ?? null;
  return { groupId, group, role, isMyOfficerRole: isOfficer(role) };
}
