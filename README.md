# DulaHQ — Tournament Manager

Tournament OS for 7-a-side / 11-a-side football: categories → draw generation → live officiating → standings/bracket → officials & live streams.

**Live:** GitHub Pages + **Vercel** (both $0, same Supabase backend) — Cloudflare disabled

[![Deploy to GitHub Pages](https://github.com/pharveylg/DulaHQ/actions/workflows/deploy.yml/badge.svg)](https://github.com/pharveylg/DulaHQ/actions/workflows/deploy.yml)

## Quick Start

```bash
npm install
cp .env.example .env.local  # add Supabase keys
npm run dev                 # http://localhost:5173
```

## Deploy — Both Hosts (Free Tier)

This repo is configured for **dual $0 hosting** from a single `main` branch:

| Host | URL | Bandwidth | How it deploys |
|------|-----|-----------|----------------|
| **GitHub Pages** | `https://pharveylg.github.io/DulaHQ/` | 100GB/mo soft cap | Auto via `.github/workflows/deploy.yml` on `push to main` |
| **Vercel** | `https://dulahq-xxx.vercel.app` | 100GB/mo Hobby | Import repo in Vercel → Build: `npm run build:vercel` → Output: `dist` |
| <!-- Cloudflare Pages — DISABLED (using Vercel) — see CLOUDFLARE_PAGES_GUIDE.md.disabled | `https://dulahq.pages.dev` | **Unlimited** | Connect repo in Cloudflare → Build: `npm run build:cloudflare` | -->

Both read the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — set once in each dashboard.

### 1. GitHub Pages (already wired)

- Workflow: `.github/workflows/deploy.yml` builds with `VITE_DEPLOY_TARGET=github` → base `/DulaHQ/`
- Enable: GitHub → Settings → Pages → **Source: GitHub Actions**
- Secrets: Settings → Secrets → Actions → add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`, `VITE_SHEETS_SCRIPT_URL` (optional fallback)

Push to `main` → live in ~1 min.

### 2. Vercel (2 min) — *Cloudflare disabled*

1. https://vercel.com → Add New → Project → Import `pharveylg/DulaHQ`
2. Build settings (auto-detected from `vercel.json`):
   - Framework: `Vite`
   - Build command: `npm run build:vercel`
   - Output directory: `dist`
   - Env vars: Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production + Preview)
3. Deploy → `https://dulahq-xxx.vercel.app`
<!-- Cloudflare disabled — to re-enable: `mv CLOUDFLARE_PAGES_GUIDE.md.disabled CLOUDFLARE_PAGES_GUIDE.md` and uncomment `build:cloudflare` in package.json -->

## Backend — Supabase (Free Tier)

**Recommended over Sheets:** 500MB DB, 1GB storage, 50K MAUs, realtime — $0 until you outgrow (see `supabase/`).

Setup: `supabase/README.md` → 5 min:
1. New project at supabase.com
2. SQL Editor → paste `supabase/schema.sql`
3. Storage → create bucket `dulahq-docs` (public)
4. Copy `URL` + `anon` key to `.env.local` and to GitHub/Cloudflare secrets

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
| `npm run build:github` | GitHub Pages (base `/DulaHQ/`) |
| `npm run build:vercel` | Vercel (base `/`) |
| `npm run build:cloudflare` | Cloudflare Pages (base `/`) — *disabled* |
| `npm run preview` | Preview `dist/` |

## Architecture

- **Single-file legacy:** `index.html` (636KB, 429 functions) — now wrapped by Vite for dual deploy
- **New layer:** `src/lib/supabase.js` + `src/lib/sync.js` — backend-agnostic `sync.save/load/subscribe` (sheets ↔ supabase)
- **Next refactor:** Split `index.html` CSS/JS → `src/views/` + `src/components/` (see `DulaHQ-CRITIQUE.md`)

See `DulaHQ-CRITIQUE.md` for full technical audit and `DulaHQ-FREE-TIER-OPTIONS.md` for hosting comparison.

## License

MIT — tournament data remains yours (Supabase Postgres is portable via `pg_dump`).
