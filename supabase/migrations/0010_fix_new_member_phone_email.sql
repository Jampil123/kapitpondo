-- =====================================================================
-- KapitPondo — Migration 0010
-- Fixes handle_new_auth_user(): the sign-up flow authenticates with
-- phone + password, so new.phone is populated but new.email is not.
-- The original trigger never copied phone at all, and only read email
-- from new.email — leaving both null on every new member row.
-- =====================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.members (auth_id, email, phone, full_name, verification_status)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, new.phone, ''), '@', 1)),
    'unverified'
  )
  on conflict (auth_id) do nothing;
  return new;
end;
$$;

-- =====================================================================
-- End of 0010_fix_new_member_phone_email.sql
-- =====================================================================
