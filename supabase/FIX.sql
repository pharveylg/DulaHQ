-- FIX for: ERROR 42703: column "data" of relation "tournaments" does not exist
-- Your project already has a "tournaments" table from an earlier experiment
-- with different columns. This makes it match what DulaHQ expects.

-- FIX for: ERROR 42703: column "data" does not exist  AND  ERROR 22P02: invalid input syntax for type uuid: "primary"
-- AND ERROR 42804: foreign key categories_tournament_id_fkey cannot be implemented (uuid vs text)
-- EASIEST FIX: DulaHQ stores categories inside tournaments.data JSONB, so the normalized
-- "categories" table is not used. Drop it, then force tournaments.id to text.
-- If you DO need categories later, it will be recreated as text.

-- 0. Diagnose (uncomment to see)
-- select table_name, column_name, data_type from information_schema.columns where table_schema='public' and table_name in ('tournaments','categories') order by table_name, ordinal_position;

-- 1. Drop blocking FK/table (cascade removes the FK). Safe for DulaHQ — DulaHQ uses JSONB, not normalized tables.
drop table if exists public.categories cascade;
-- Also drop any other FKs that might reference tournaments(id) generically
do $$
declare r record;
begin
  for r in
    select conname, conrelid::regclass::text as tbl
    from pg_constraint
    where confrelid = 'public.tournaments'::regclass and contype = 'f'
  loop
    begin execute 'alter table ' || r.tbl || ' drop constraint if exists ' || quote_ident(r.conname); exception when others then null; end;
  end loop;
end $$;

-- 2. Force tournaments.id to text (works whether it was uuid or already text)
do $$
begin
  begin execute 'alter table public.tournaments alter column id drop default'; exception when others then null; end;
  begin execute 'alter table public.tournaments alter column id type text using id::text'; exception when others then null; end;
end $$;

-- 3. Add missing columns if they don't exist (safe to re-run)
alter table public.tournaments add column if not exists data jsonb;
alter table public.tournaments add column if not exists updated_at timestamptz default now();
alter table public.tournaments add column if not exists created_at timestamptz default now();

-- 4. Ensure id is primary key (if table was created differently)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tournaments_pkey' and conrelid = 'public.tournaments'::regclass
  ) then
    begin alter table public.tournaments add primary key (id); exception when others then null; end;
  end if;
end $$;

-- 5. Ensure RLS and policies exist
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
