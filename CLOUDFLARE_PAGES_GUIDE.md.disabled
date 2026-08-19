# Cloudflare Pages — Connect Repo (2 min, $0, unlimited bandwidth)

This connects `pharveylg/DulaHQ` so every `git push to main` deploys to **both** GitHub Pages *and* Cloudflare Pages (same Supabase DB).

## Prerequisites

- Cloudflare account (free) at https://dash.cloudflare.com
- Repo already pushed with the dual-deploy commit (`vite.config.js`, `package.json`, `supabase/schema.sql` — FIX.sql if needed)
- Supabase project ready (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from Project Settings → API)

---

## Step-by-Step

### 1. Create Pages Project

1. Go to https://dash.cloudflare.com → **Workers & Pages** (left sidebar) → **Create application** → **Pages** → **Connect to Git**
2. If first time: **Connect GitHub** → authorize Cloudflare to read `pharveylg/DulaHQ` → select repo `DulaHQ` → **Begin setup**

### 2. Build Settings (copy exactly)

| Field | Value |
|-------|-------|
| **Project name** | `dulahq` (or `dulahq-pages`) → becomes `dulahq.pages.dev` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` (or `None` — both work) |
| **Root directory** | *(leave empty = `/`)* |
| **Build command** | `npm run build:cloudflare` |
| **Build output directory** | `dist` |
| **Node version** | `20` (Cloudflare will auto-detect from `package.json`) |

> Why `build:cloudflare` not `build`?  
> - `build:cloudflare` sets `VITE_DEPLOY_TARGET=cloudflare` → base `/` (correct for `*.pages.dev`)  
> - `build:github` would use base `/DulaHQ/` (only for GitHub Pages)

Leave **Root directory** empty.

### 3. Environment Variables (crucial)

Before first deploy, click **Add variable** and add these for **both Production and Preview**:

| Variable | Value | Where to find it |
|----------|-------|------------------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (long anon key) | Same page → `anon` `public` key |
| `VITE_BACKEND` | `supabase` | Literal text `supabase` |
| `VITE_GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | *Optional* — only if using Google Sign-In |

- Check **Production** and **Preview** boxes for each.
- Do **NOT** check Encrypt unless you want to.

> If you skip these, the site will still build but will run in **local-only mode** and log `[DulaHQ] backend: local` in console.

### 4. Deploy

1. Click **Save and Deploy**
2. Watch build log — should see:
   ```
   ✓ 48 modules transformed
   dist/index.html  636.59 kB
   dist/assets/index-BeY...js  216 kB
   ✓ built in ~1s
   ```
3. Cloudflare assigns: `https://dulahq-xxx.pages.dev` → click to open

### 5. Allow Supabase Auth (if using Google login)

1. Supabase → Authentication → URL Configuration
2. Add to **Site URL**: `https://dulahq-xxx.pages.dev`
3. Add to **Redirect URLs** (allow list):
   ```
   https://pharveylg.github.io/DulaHQ/
   https://pharveylg.github.io/DulaHQ/*
   https://dulahq-xxx.pages.dev/*
   https://*.dulahq.pages.dev/*
   http://localhost:5173/*
   ```

### 6. Test Both Hosts Share Data

1. Open **GitHub Pages** `https://pharveylg.github.io/DulaHQ/` → create a team in `General`
2. Open **Cloudflare Pages** `https://dulahq-xxx.pages.dev` → same team appears (via Supabase + realtime)
3. Supabase → Table Editor → `tournaments` → row `primary` → `data` column contains the team
4. Browser console (F12) should show: `[DulaHQ] backend: supabase | supabase configured: true | deployTarget: cloudflare`

---

## Custom Domain (optional, free SSL)

Pages project → **Custom domains** → **Set up a custom domain**
- Enter `dulahq.yourdomain.com` (or `tournament.dulahq.com`)
- Cloudflare will add DNS automatically if your domain is on Cloudflare, or give you a CNAME to add elsewhere
- SSL is auto-provisioned (free, ~1 min)

---

## Automatic Deploys

- Every `git push origin main` → Cloudflare rebuilds + deploys in ~40s (same time as GitHub Pages)
- Builds limited to **500/mo free** (you'll use ~30/mo, plenty)
- **Preview deployments**: every pull request gets a unique `https://<hash>.dulahq.pages.dev` URL automatically — great for testing bracket changes without touching prod

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **Build fails: `npm ci` error** | Delete `package-lock.json` from repo or run `npm install` locally and re-push |
| **White page, console `404 /DulaHQ/assets/...`** | You used `build:github` on Cloudflare — change to `build:cloudflare` and re-deploy |
| **`[DulaHQ] backend: local` not `supabase`** | Env vars not set for Production — re-add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and **Retry deployment** |
| **Supabase 401 / CORS error** | Add Cloudflare `*.pages.dev` domain to Supabase Auth → Redirect URLs |
| **Project paused after 1 week** | Supabase Free pauses idle projects → Supabase Dashboard → Resume (30s) or set a cron ping via `https://uptime-kuma...` |
| **Need to rollback** | Cloudflare → Deployments → previous deployment → **Rollback** (1 click) |

---

## Costs

- **Cloudflare Pages Free**: unlimited bandwidth, 500 builds/mo, unlimited requests — stays $0 even if 10K parents refresh on finals day
- **Cloudflare D1/R2**: not needed if using Supabase, but free if you add later (5GB D1 + 10GB R2 free)
- **Supabase Free**: 500MB DB + 1GB storage — your tournament is ~0.15MB → 3,000 tournaments before paid tier ($25/mo flat)
