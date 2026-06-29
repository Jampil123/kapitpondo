/**
 * components/shared/RoleGate.tsx
 * ----------------------------------------------------------------------------
 * Declaratively show/hide UI based on the caller's role in the ACTIVE group.
 * Gate by a capability (preferred — stays correct if role lists change) or by
 * an explicit role list.
 *
 *   <RoleGate capability="approveContribution">
 *     <Button title="Approve" onPress={approve} />
 *   </RoleGate>
 *
 *   <RoleGate roles={['owner']} fallback={<Text>Owner only</Text>}>
 *     <FinalizeButton />
 *   </RoleGate>
 *
 * This is UI convenience only — the API still enforces the real check. Never
 * rely on RoleGate for security.
 */
import { type ReactNode } from 'react';
import { useActiveGroup } from '../../context/GroupContext';
import { can, type Capability, type GroupRole } from '../../constants/roles';

type RoleGateProps = {
  children: ReactNode;
  /** Show children only if the caller's role has this capability. */
  capability?: Capability;
  /** Or: show children only if the caller's role is in this list. */
  roles?: GroupRole[];
  /** Rendered when the gate is closed. Defaults to nothing. */
  fallback?: ReactNode;
};

export function RoleGate({ children, capability, roles, fallback = null }: RoleGateProps) {
  const { role } = useActiveGroup();

  const allowed =
    (capability ? can(role, capability) : false) ||
    (roles ? !!role && roles.includes(role) : false);

  return <>{allowed ? children : fallback}</>;
}
