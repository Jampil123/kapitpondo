-- =====================================================================
-- KapitPondo — Migration 0006
-- Adds get_or_create_member() RPC.
-- Runs as security definer so it can read/write the members table
-- regardless of RLS — needed for users who existed before the
-- on_auth_user_created trigger was installed.
-- =====================================================================

drop function if exists get_or_create_member();

create or replace function get_or_create_member()
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member members;
  v_email  text;
  v_name   text;
begin
  -- Fast path: row already exists
  select * into v_member
  from members
  where auth_id = auth.uid();

  if found then
    return v_member;
  end if;

  -- Pull email + name from auth.users (readable inside security definer)
  select
    u.email,
    coalesce(
      u.raw_user_meta_data->>'full_name',
      nullif(trim(
        coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' ||
        coalesce(u.raw_user_meta_data->>'last_name',  '')
      ), ''),
      split_part(u.email, '@', 1)
    )
  into v_email, v_name
  from auth.users u
  where u.id = auth.uid();

  -- Insert, ignoring a race-condition duplicate
  insert into members (auth_id, email, full_name, verification_status)
  values (auth.uid(), v_email, v_name, 'unverified')
  on conflict (auth_id) do nothing;

  -- Return the (possibly just-inserted) row
  select * into v_member
  from members
  where auth_id = auth.uid();

  return v_member;
end;
$$;
