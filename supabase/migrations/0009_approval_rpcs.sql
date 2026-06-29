-- =====================================================================
-- KapitPondo — Migration 0009
-- Adds three SECURITY DEFINER RPCs for membership approval so the
-- mobile client can call Supabase directly without going through the
-- Node backend, while still enforcing officer-only access at the DB level.
-- =====================================================================

-- ── get_pending_members ───────────────────────────────────────────────
-- Returns all pending membership rows for a group.
-- Caller must be an active owner / treasurer / auditor of that group.

drop function if exists get_pending_members(uuid);

create or replace function get_pending_members(p_group_id uuid)
returns table (
  id                  uuid,
  member_id           uuid,
  role                text,
  created_at          timestamptz,
  full_name           text,
  email               text,
  verification_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
begin
  select id into v_caller_id from members where auth_id = auth.uid();
  if not found then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from memberships
    where member_id = v_caller_id
      and group_id  = p_group_id
      and status    = 'active'
      and role      in ('owner', 'treasurer', 'auditor')
  ) then
    raise exception 'Forbidden: you are not an officer of this group';
  end if;

  return query
  select
    m.id,
    m.member_id,
    m.role,
    m.created_at,
    mem.full_name,
    mem.email,
    mem.verification_status
  from memberships m
  join members mem on mem.id = m.member_id
  where m.group_id = p_group_id
    and m.status   = 'pending'
  order by m.created_at asc;
end;
$$;


-- ── approve_member ────────────────────────────────────────────────────
-- Sets a pending membership to active.
-- Caller must be owner or treasurer of the group.

drop function if exists approve_member(uuid, uuid);

create or replace function approve_member(p_group_id uuid, p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
begin
  select id into v_caller_id from members where auth_id = auth.uid();
  if not found then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from memberships
    where member_id = v_caller_id
      and group_id  = p_group_id
      and status    = 'active'
      and role      in ('owner', 'treasurer')
  ) then
    raise exception 'Forbidden: owner or treasurer role required';
  end if;

  update memberships
  set status    = 'active',
      joined_at = now()
  where group_id  = p_group_id
    and member_id = p_member_id
    and status    = 'pending';
end;
$$;


-- ── reject_member ─────────────────────────────────────────────────────
-- Deletes a pending membership (hard reject).
-- Caller must be owner or treasurer of the group.

drop function if exists reject_member(uuid, uuid);

create or replace function reject_member(p_group_id uuid, p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
begin
  select id into v_caller_id from members where auth_id = auth.uid();
  if not found then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from memberships
    where member_id = v_caller_id
      and group_id  = p_group_id
      and status    = 'active'
      and role      in ('owner', 'treasurer')
  ) then
    raise exception 'Forbidden: owner or treasurer role required';
  end if;

  delete from memberships
  where group_id  = p_group_id
    and member_id = p_member_id
    and status    = 'pending';
end;
$$;
