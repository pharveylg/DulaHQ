-- FIX for: ERROR 42703: column "data" of relation "tournaments" does not exist
-- Your project already has a "tournaments" table from an earlier experiment
-- with different columns. This makes it match what DulaHQ expects.

-- 1. See what you currently have (run this first to confirm)
-- select column_name, data_type from information_schema.columns where table_schema='public' and table_name='tournaments';

-- 2. Add missing columns if they don't exist (safe to re-run)
alter table public.tournaments add column if not exists data jsonb;
alter table public.tournaments add column if not exists updated_at timestamptz default now();
alter table public.tournaments add column if not exists created_at timestamptz default now();

-- 3. Make "data" not-null and ensure id is primary key (if table was created differently)
-- If this fails with "already has primary key", it's fine — ignore.
do $$
begin
  -- Ensure id is primary key
  if not exists (
    select 1 from pg_constraint where conname = 'tournaments_pkey' and conrelid = 'public.tournaments'::regclass
  ) then
    begin
      alter table public.tournaments add primary key (id);
    exception when others then null;
    end;
  end if;
end $$;

-- 4. Ensure RLS and policies exist
alter table public.tournaments enable row level security;

drop policy if exists "public can read tournaments" on public.tournaments;
create policy "public can read tournaments" on public.tournaments for select using (true);

drop policy if exists "authenticated can upsert tournaments" on public.tournaments;
create policy "authenticated can upsert tournaments" on public.tournaments for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated can update tournaments" on public.tournaments;
create policy "authenticated can update tournaments" on public.tournaments for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 5. Realtime (ignore if already added)
do $$
begin
  alter publication supabase_realtime add table public.tournaments;
exception when duplicate_object then null;
end $$;

-- 6. Storage bucket (safe)
insert into storage.buckets (id, name, public) values ('dulahq-docs','dulahq-docs', true) on conflict (id) do nothing;

drop policy if exists "public can read docs" on storage.objects;
create policy "public can read docs" on storage.objects for select using (bucket_id='dulahq-docs');
drop policy if exists "authenticated can upload docs" on storage.objects;
create policy "authenticated can upload docs" on storage.objects for insert with check (bucket_id='dulahq-docs' and auth.role()='authenticated');
drop policy if exists "authenticated can update docs" on storage.objects;
create policy "authenticated can update docs" on storage.objects for update using (bucket_id='dulahq-docs' and auth.role()='authenticated');
drop policy if exists "authenticated can delete docs" on storage.objects;
create policy "authenticated can delete docs" on storage.objects for delete using (bucket_id='dulahq-docs' and auth.role()='authenticated');

-- 7. Seed row
insert into public.tournaments (id, data) values ('primary','{}'::jsonb) on conflict (id) do nothing;
create index if not exists idx_tournaments_updated_at on public.tournaments (updated_at desc);

-- Done. Now this should return 1 row:
-- select id, data, updated_at from public.tournaments;
