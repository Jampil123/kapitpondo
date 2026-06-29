-- =====================================================================
-- KapitPondo — Migration 0007
-- Adds Row Level Security policies for the mobile client (anon key).
-- The backend uses the service_role key and bypasses RLS entirely.
-- =====================================================================

-- ── members ──────────────────────────────────────────────────────────
alter table members enable row level security;

-- Authenticated user can read their own row
create policy "members: read own"
  on members for select
  to authenticated
  using (auth_id = auth.uid());

-- Authenticated user can insert their own row (initial creation if
-- the signup trigger didn't fire)
create policy "members: insert own"
  on members for insert
  to authenticated
  with check (auth_id = auth.uid());

-- Authenticated user can update their own row
create policy "members: update own"
  on members for update
  to authenticated
  using (auth_id = auth.uid());

-- ── memberships ──────────────────────────────────────────────────────
alter table memberships enable row level security;

-- Member can read their own memberships
create policy "memberships: read own"
  on memberships for select
  to authenticated
  using (
    member_id = (select id from members where auth_id = auth.uid())
  );

-- ── groups ───────────────────────────────────────────────────────────
alter table groups enable row level security;

-- Member can read groups they actively belong to
create policy "groups: read as member"
  on groups for select
  to authenticated
  using (
    id in (
      select group_id
      from memberships
      where member_id = (select id from members where auth_id = auth.uid())
        and status = 'active'
    )
  );

-- =====================================================================
-- End of 0007_rls_policies.sql
-- =====================================================================
