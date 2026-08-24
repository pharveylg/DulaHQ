-- ============================================================
-- DulaHQ 002 — Multi-Tenant Layer (orgs, memberships, RLS fence)
-- Run in Supabase Dashboard > SQL Editor. Idempotent.
--
-- Model: each organization ("tenant") owns one tournament blob
-- (tournaments.id = org slug). Access is fenced by org_members:
--   (org, email) -> role. platform_admins = you (super admin).
--
-- AFTER RUNNING: existing 'primary' row is attached to a default
-- org 'dula-hq' so nothing is lost.
-- ============================================================

-- 1. Organizations (tenants)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  accent text not null default '#CCFF00',   -- vetted accent hex
  logo_url text default '',
  status text not null default 'active',     -- active | suspended
  created_at timestamptz not null default now()
);

-- 2. Platform super admins (you). Add your signed-in email(s).
create table if not exists public.platform_admins (
  email text primary key,
  created_at timestamptz not null default now()
);
insert into public.platform_admins (email)
values ('pharveylg@gmail.com') on conflict (email) do nothing;

-- 3. Org memberships — the fence.
--    Roles mirror the app: admin | team | referee | official | audience.
--    email-based so you can provision before the user ever signs up;
--    user_id backfills on first sign-in (optional trigger below).
create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  role text not null default 'team'
    check (role in ('admin','team','referee','official','audience')),
  created_at timestamptz not null default now(),
  primary key (org_id, email)
);

create index if not exists org_members_email_idx on public.org_members(email);

-- 4. Attach orgs to tournaments (nullable = legacy/platform-owned rows)
alter table public.tournaments add column if not exists org_id uuid
  references public.organizations(id) on delete set null;
create index if not exists tournaments_org_idx on public.tournaments(org_id);

-- 5. Seed the default org + attach the existing 'primary' blob
insert into public.organizations (slug, name, accent)
values ('dula-hq', 'Dula HQ', '#CCFF00')
on conflict (slug) do nothing;

update public.tournaments
set org_id = (select id from public.organizations where slug = 'dula-hq')
where org_id is null;

insert into public.org_members (org_id, email, role)
select id, 'pharveylg@gmail.com', 'admin'
from public.organizations where slug = 'dula-hq'
on conflict (org_id, email) do nothing;

-- 6. RLS ------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.platform_admins enable row level security;

-- helpers
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.platform_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.is_org_admin(org uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = org
      and lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and m.role = 'admin'
  ) or public.is_platform_admin();
$$;

-- organizations: anyone can read (needed to render tenant landing);
-- only platform admins create/update/delete
drop policy if exists "public read organizations" on public.organizations;
create policy "public read organizations" on public.organizations
  for select using (true);

drop policy if exists "platform admin writes organizations" on public.organizations;
create policy "platform admin writes organizations" on public.organizations
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- org_members: you can read your own rows; org admins can read their org's;
-- platform admin reads/writes all
drop policy if exists "self read members" on public.org_members;
create policy "self read members" on public.org_members
  for select using (
    public.is_platform_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_org_admin(org_id)
  );

drop policy if exists "platform admin writes members" on public.org_members;
create policy "platform admin writes members" on public.org_members
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- platform_admins: readable by platform admins only (writes via SQL/dashboard)
drop policy if exists "platform admin reads admins" on public.platform_admins;
create policy "platform admin reads admins" on public.platform_admins
  for select using (public.is_platform_admin());

-- 7. Tighten tournaments writes to the org fence.
--    Read stays public (audience). Writes: org admin of that row's org,
--    or platform admin, or legacy rows (org_id null) by any authenticated
--    user until they are claimed.
drop policy if exists "authenticated can upsert tournaments" on public.tournaments;
drop policy if exists "authenticated can update tournaments" on public.tournaments;

drop policy if exists "org admin can update tournaments" on public.tournaments;
create policy "org admin can update tournaments" on public.tournaments
  for update using (
    public.is_platform_admin()
    or (org_id is not null and public.is_org_admin(org_id))
    or (org_id is null and auth.role() = 'authenticated')
  ) with check (
    public.is_platform_admin()
    or (org_id is not null and public.is_org_admin(org_id))
    or (org_id is null and auth.role() = 'authenticated')
  );

drop policy if exists "org admin can insert tournaments" on public.tournaments;
create policy "org admin can insert tournaments" on public.tournaments
  for insert with check (
    public.is_platform_admin()
    or (org_id is not null and public.is_org_admin(org_id))
  );

drop policy if exists "org admin can delete tournaments" on public.tournaments;
create policy "org admin can delete tournaments" on public.tournaments
  for delete using (
    public.is_platform_admin()
    or (org_id is not null and public.is_org_admin(org_id))
  );

-- 8. Backfill user_id on member sign-in (best effort)
create or replace function public.backfill_member_user()
returns trigger language plpgsql security definer as $$
begin
  update public.org_members
  set user_id = new.id
  where lower(email) = lower(new.email) and user_id is null;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.backfill_member_user();

-- 9. Realtime for the new tables
do $$
begin
  alter publication supabase_realtime add table public.organizations;
exception when duplicate_object then null; end $$;
