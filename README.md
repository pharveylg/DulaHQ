# DulaHQ — Tournament Manager

Tournament OS for 7-a-side / 11-a-side football: categories → draw generation → live officiating → standings/bracket → officials & live streams.

**Live:** https://dula-hq.vercel.app (Vercel, free Hobby tier — Supabase backend)

## Quick Start

```bash
npm install
cp .env.example .env.local  # add Supabase keys
npm run dev                 # http://localhost:5173
```

## Deploy — Vercel (Free Hobby Tier)

Auto-deploys on every push to `main` via Vercel's Git integration.

| Host | URL | Bandwidth | How it deploys |
|------|-----|-----------|----------------|
| **Vercel** | `https://dula-hq.vercel.app` | 100GB/mo Hobby | Auto on `push to main` (Vercel Git integration) |

Vercel reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — set once in the Vercel dashboard (Production + Preview).

Setup (already done for this repo):

1. https://vercel.com → Add New → Project → Import `pharveylg/DulaHQ`
2. Build settings (auto-detected from `vercel.json`):
   - Framework: `Vite`
   - Build command: `npm run build:vercel`
   - Output directory: `dist`
   - Env vars: Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production + Preview)
3. Deploy → `https://dula-hq.vercel.app`

## Backend — Supabase (Free Tier)

**Recommended over Sheets:** 500MB DB, 1GB storage, 50K MAUs, realtime — $0 until you outgrow (see `supabase/`).

Setup: `supabase/README.md` → 5 min:
1. New project at supabase.com
2. SQL Editor → paste `supabase/schema.sql`
3. Storage → create bucket `dulahq-docs` (public)
4. Copy `URL` + `anon` key to `.env.local` and to Vercel env vars

**Fallback:** If Supabase not configured, app runs locally + Sheets (set `VITE_BACKEND=sheets`).

### Env Vars

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com  # optional
VITE_SHEETS_SCRIPT_URL=https://script.google.com/...   # optional Sheets fallback
VITE_BACKEND=auto  # auto | supabase | sheets
```

## Scripts

| Command | What |
|---------|------|
| `npm run dev` | Local dev, base `/` |
| `npm run build` | Production (Vercel) |
| `npm run build:vercel` | Vercel (base `/`) |
| `npm run preview` | Preview `dist/` |

## Architecture

- **Single-file legacy:** `index.html` (636KB, 429 functions) — wrapped by Vite for deploy
- **New layer:** `src/lib/supabase.js` + `src/lib/sync.js` — backend-agnostic `sync.save/load/subscribe` (sheets ↔ supabase)
- **Next refactor:** Split `index.html` CSS/JS → `src/views/` + `src/components/`

## License

MIT — see [LICENSE](LICENSE). Tournament data remains yours (Supabase Postgres is portable via `pg_dump`).
