-- RUN THIS NOW — brute-force fix for 22P02/42804 (uuid vs text)
-- DulaHQ stores everything in tournaments.data JSONB, so the normalized
-- "categories" table is not needed. Dropping it removes the FK that blocks the alter.

-- 1. See current types (optional diagnostic)
-- select table_name, column_name, data_type, column_default from information_schema.columns where table_schema='public' and table_name in ('tournaments','categories') order by table_name, ordinal_position;

-- 2. Drop the normalized table that is blocking the alter (safe for DulaHQ — data is in JSONB)
drop table if exists public.categories cascade;
-- If you have other tables referencing tournaments, add them here:
-- drop table if exists public.teams cascade;
-- drop table if exists public.matches cascade;

-- 3. Force tournaments.id to text (works whether it was uuid or already text)
alter table public.tournaments alter column id drop default;
alter table public.tournaments alter column id type text using id::text;

-- 4. Add missing columns
alter table public.tournaments add column if not exists data jsonb;
alter table public.tournaments add column if not exists updated_at timestamptz default now();
alter table public.tournaments add column if not exists created_at timestamptz default now();

-- 5. Ensure RLS/policies/realtime
alter table public.tournaments enable row level security;
drop policy if exists "public can read tournaments" on public.tournaments;
create policy "public can read tournaments" on public.tournaments for select using (true);
drop policy if exists "authenticated can upsert tournaments" on public.tournaments;
create policy "authenticated can upsert tournaments" on public.tournaments for insert with check (auth.role()='authenticated');
drop policy if exists "authenticated can update tournaments" on public.tournaments;
create policy "authenticated can update tournaments" on public.tournaments for update using (auth.role()='authenticated') with check (auth.role()='authenticated');
do $$ begin alter publication supabase_realtime add table public.tournaments; exception when duplicate_object then null; end $$;

-- 6. Seed
insert into public.tournaments (id, data) values ('primary','{}'::jsonb) on conflict (id) do nothing;
create index if not exists idx_tournaments_updated_at on public.tournaments (updated_at desc);

-- 7. Verify — should return 1 row
select id, pg_typeof(id), data is not null as has_data from public.tournaments;
