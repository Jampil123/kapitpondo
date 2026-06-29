-- =====================================================================
-- KapitPondo — Migration 0005
-- Removes p_owner_member_id from create_group_with_owner.
-- The function now resolves the member row from auth.uid() internally,
-- so the client never has to query the members table directly (which
-- would fail for users who do not yet have an RLS SELECT policy).
-- =====================================================================

-- Drop old signatures (4-param and any prior variants)
drop function if exists create_group_with_owner(text, text, uuid, text);
drop function if exists create_group_with_owner(text, text, text, uuid);
drop function if exists create_group_with_owner(text, text, text);

create or replace function create_group_with_owner(
  p_name        text,
  p_fund_code   text,
  p_description text default null
)
returns groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_group     groups;
begin
  -- Resolve the calling user's member row via their JWT uid
  select id into v_member_id
  from members
  where auth_id = auth.uid();

  if not found then
    raise exception 'Member profile not found for auth user %', auth.uid();
  end if;

  insert into groups (name, fund_code, description, owner_id)
  values (p_name, p_fund_code, p_description, v_member_id)
  returning * into v_group;

  insert into memberships (member_id, group_id, role, status, joined_at)
  values (v_member_id, v_group.id, 'owner', 'active', now());

  return v_group;
end;
$$;
