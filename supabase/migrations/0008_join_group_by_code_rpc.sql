-- =====================================================================
-- KapitPondo — Migration 0008
-- Adds join_group_by_code(p_fund_code) RPC.
-- Resolves the group from the fund code, resolves the member from
-- auth.uid(), and inserts a pending membership — all in one call.
-- Runs security definer so it bypasses RLS on memberships/groups/members.
-- =====================================================================

drop function if exists join_group_by_code(text);

create or replace function join_group_by_code(p_fund_code text)
returns memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member     members;
  v_group      groups;
  v_membership memberships;
begin
  -- Resolve the calling user's member row
  select * into v_member
  from members
  where auth_id = auth.uid();

  if not found then
    raise exception 'Member profile not found. Please log out and log in again.';
  end if;

  -- Look up the group by fund code
  select * into v_group
  from groups
  where upper(fund_code) = upper(p_fund_code)
    and status = 'active';

  if not found then
    raise exception 'No active group found with code "%". Check the code and try again.', p_fund_code;
  end if;

  -- Guard against duplicate membership
  if exists (
    select 1 from memberships
    where member_id = v_member.id
      and group_id  = v_group.id
  ) then
    raise exception 'You are already a member of this group.';
  end if;

  -- Insert pending membership
  insert into memberships (member_id, group_id, role, status)
  values (v_member.id, v_group.id, 'member', 'pending')
  returning * into v_membership;

  return v_membership;
end;
$$;
