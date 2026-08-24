# Deploy Guide — Both Hosts + Supabase ($0)

## Flow

```
git push origin main
   ├─→ GitHub Pages (Actions → /DulaHQ/)
   └─→ Cloudflare Pages (auto-deploy → dulahq.pages.dev)
         └─→ Supabase (single DB, realtime)
```

Both hosts point to the SAME Supabase project — data syncs instantly.

## Step-by-Step

### A. Supabase (5 min, once)

1. supabase.com → New Project → name `dulahq`, region `Singapore` (closest to PH)
2. SQL Editor → New query → paste `supabase/schema.sql` → Run
3. Storage → New bucket → `dulahq-docs` → Public ON
4. Project Settings → API → copy `URL` and `anon public` key
5. Authentication → URL Configuration:
   - Site URL: `https://pharveylg.github.io`
   - Redirect URLs: add
     ```
     https://pharveylg.github.io/DulaHQ/
     https://pharveylg.github.io/DulaHQ/*
     https://*.pages.dev/*
     http://localhost:5173/*
     ```
6. Authentication → Providers → enable Google + Email (add your GOOGLE_CLIENT_ID)

### B. GitHub Pages (3 min)

1. GitHub → your repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Settings → Secrets and variables → Actions → New repository secret:
   - `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
   - `VITE_SHEETS_SCRIPT_URL` = (optional, leave blank to disable Sheets)
3. Push to main → Actions tab → workflow `Deploy DulaHQ` → green check → visit `https://pharveylg.github.io/DulaHQ/`

**Test:** Open console → should log `[DulaHQ] backend: supabase`

### C. Cloudflare Pages (3 min)

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Select `pharveylg/DulaHQ`
3. Set:
   - Production branch: `main`
   - Build command: `npm run build:cloudflare`
   - Output: `dist`
   - Root dir: `/`
4. Env vars → Add variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BACKEND` = `supabase`
5. Save and Deploy → `https://dulahq-xxx.pages.dev`

Add custom domain: Pages → Custom domains → `dulahq.yourdomain.com` → free SSL.

## Verifying Both Hosts Share Data

1. Open GitHub Pages URL → create a team in General category
2. Open Cloudflare Pages URL → same team appears (realtime via Supabase)
3. Check Supabase → Table Editor → `tournaments` → row `primary` → `data` JSONB contains your team

## Rollback

- Both hosts are static: revert via `git revert` → auto-redeploys
- Supabase keeps history: Dashboard → Database → Backups (free tier = no daily backups, but you can `pg_dump` via SQL Editor)

## Costs

- GitHub Pages: $0 (100GB/mo, OK for 5k users)
- Cloudflare Pages: $0 (unlimited bandwidth)
- Supabase Free: $0 (500MB DB = ~3,300 tournaments, pauses after 1 week idle — wake via visiting site or cron ping)

Upgrade only if you exceed 500MB: Supabase Pro $25/mo flat.

## Local Dev

```bash
cp .env.example .env.local
# edit .env.local with Supabase keys
npm install
npm run dev
```

## Troubleshooting

- **Blank page on GitHub Pages?** Check `vite.config.js` base is `/DulaHQ/` for github build — workflow uses `build:github`.
- **Supabase CORS error?** Add your Pages domains to Supabase Auth → URL Configuration.
- **Project paused?** Supabase free pauses after 1 week idle → visit Supabase dashboard → Resume project (30s).
