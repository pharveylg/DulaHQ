-- DulaHQ — Supabase Schema (Free Tier Optimized)
-- Run this in Supabase Dashboard > SQL Editor
-- Idempotent: safe to re-run

-- 1. Main tournaments table: stores entire S as JSONB (fastest migration from Sheets)
-- Later you can normalize to categories/teams/matches tables, but JSONB keeps 100% compat today.
create table if not exists public.tournaments (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2. Optional normalized tables for future queries/analytics (not required for MVP)
-- Keep commented until you want to query "all matches where homeId = X"
-- create table if not exists public.categories (
--   id text primary key,
--   tournament_id text references public.tournaments(id) on delete cascade,
--   name text not null,
--   data jsonb not null
-- );

-- 3. Enable Row Level Security (RLS) — matches your role model
alter table public.tournaments enable row level security;

-- Policy: Anyone can read (tournament is public to audience)
drop policy if exists "public can read tournaments" on public.tournaments;
create policy "public can read tournaments"
  on public.tournaments for select
  using (true);

-- Policy: Authenticated users can upsert (we gate admin vs referee in app + optional server check)
-- For tight security, replace with: using (auth.jwt() ->> 'email' in (select email from allowed_admins))
drop policy if exists "authenticated can upsert tournaments" on public.tournaments;
create policy "authenticated can upsert tournaments"
  on public.tournaments for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated can update tournaments" on public.tournaments;
create policy "authenticated can update tournaments"
  on public.tournaments for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Realtime
alter publication supabase_realtime add table public.tournaments;

-- 5. Storage for tickler photos / documents (1GB free)
-- Create bucket via Dashboard > Storage > New bucket: name = 'dulahq-docs', public = true
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('dulahq-docs', 'dulahq-docs', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "public can read docs" on storage.objects;
create policy "public can read docs"
  on storage.objects for select
  using (bucket_id = 'dulahq-docs');

drop policy if exists "authenticated can upload docs" on storage.objects;
create policy "authenticated can upload docs"
  on storage.objects for insert
  with check (bucket_id = 'dulahq-docs' and auth.role() = 'authenticated');

drop policy if exists "authenticated can update docs" on storage.objects;
create policy "authenticated can update docs"
  on storage.objects for update
  using (bucket_id = 'dulahq-docs' and auth.role() = 'authenticated');

drop policy if exists "authenticated can delete docs" on storage.objects;
create policy "authenticated can delete docs"
  on storage.objects for delete
  using (bucket_id = 'dulahq-docs' and auth.role() = 'authenticated');

-- 6. Seed primary tournament row (empty)
insert into public.tournaments (id, data)
values ('primary', '{}'::jsonb)
on conflict (id) do nothing;

-- Index for updated_at
create index if not exists idx_tournaments_updated_at on public.tournaments (updated_at desc);
