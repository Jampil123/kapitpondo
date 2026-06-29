/**
 * api/groups.ts
 * ----------------------------------------------------------------------------
 * Calls the groups module of the API (M2/M3). Screens import these helpers.
 *
 * Replace the local Group/MyGroup shapes with imports from packages/shared once
 * that package is wired (see note in api/members.ts).
 */
import { api } from './client';
import type { GroupRole } from '../constants/roles';

export type GroupStatus = 'active' | 'archived';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'exited';

export interface Group {
  id: string;
  name: string;
  fund_code: string;
  description: string | null;
  owner_id: string;
  status: GroupStatus;
  created_at: string;
}

/** A group from the caller's perspective: includes their role + membership status. */
export interface MyGroup extends Group {
  role: GroupRole;
  membership_status: MembershipStatus;
}

/** GET /api/groups — every group the caller belongs to (active or pending). */
export async function listMyGroups() {
  const res = await api.get<{ groups: MyGroup[] }>('/api/groups');
  return res.groups;
}

/** GET /api/groups/:groupId — single group details. */
export function getGroup(groupId: string) {
  return api.get<{ group: Group }>(`/api/groups/${groupId}`);
}

/** POST /api/groups — create a group; caller becomes owner. (Verified only.) */
export function createGroup(input: { name: string; fund_code: string; description?: string }) {
  return api.post<{ group: Group }>('/api/groups', input);
}

/** POST /api/groups/join-by-code — request to join; creates a pending membership. */
export function joinByCode(fund_code: string) {
  return api.post<{ membership: unknown; group: Group }>('/api/groups/join-by-code', { fund_code });
}

// --- Member management (officer) -------------------------------------------

export function listPendingMembers(groupId: string) {
  return api.get(`/api/groups/${groupId}/members/pending`);
}

export function listMembers(groupId: string) {
  return api.get(`/api/groups/${groupId}/members`);
}

export function approveMember(groupId: string, memberId: string) {
  return api.patch(`/api/groups/${groupId}/members/${memberId}/approve`);
}

export function rejectMember(groupId: string, memberId: string) {
  return api.patch(`/api/groups/${groupId}/members/${memberId}/reject`);
}

export function setMemberRole(groupId: string, memberId: string, role: GroupRole) {
  return api.patch(`/api/groups/${groupId}/members/${memberId}/role`, { role });
}

export function removeMember(groupId: string, memberId: string) {
  return api.del(`/api/groups/${groupId}/members/${memberId}`);
}