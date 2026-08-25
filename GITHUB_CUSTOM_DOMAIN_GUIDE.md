# GitHub Pages — Custom Domain Setup (keep Cloudflare as backup)

You keep **dual deploy** (GitHub + Cloudflare same Supabase), but only GitHub gets the pretty domain. Cloudflare stays on its hidden `pages.dev` URL as backup — never share it.

## Which domain?

Tell me what you own/want, e.g.:

- **Apex:** `dulahq.com` (shows `https://dulahq.com`)
- **Subdomain:** `tournament.dulahq.com` or `www.dulahq.com` (recommended — no apex DNS hassle)

If you don't own one yet: Namecheap/Cloudflare Registrar → buy `dulahq.com` (~$10/yr) → come back here.

---

## Steps (5 min)

### 1. DNS — point your domain to GitHub

**For subdomain (e.g. `www.dulahq.com` or `tournament.dulahq.com`):**
- Go to your DNS provider (Cloudflare, Namecheap, GoDaddy → DNS)
- Add **CNAME**: 
  - Host: `www` (or `tournament`)
  - Value: `pharveylg.github.io` 
  - Proxy: OFF / DNS only (if Cloudflare, turn grey cloud off for this record initially)
  - TTL: Auto

**For apex (e.g. `dulahq.com`):**
- Add **4× A records** (Host: `@`):
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- Also add **AAAA** (optional but recommended):
  ```
  2606:50c0:8000::153
  2606:50c0:8001::153
  2606:50c0:8002::153
  2606:50c0:8003::153
  ```
- Add **CNAME** for `www` → `pharveylg.github.io` so both work.

Wait 2-10 min for DNS to propagate. Test: `dig www.dulahq.com +short` should show `pharveylg.github.io`.

### 2. Tell GitHub to use it

1. GitHub → `pharveylg/DulaHQ` → **Settings** → **Pages** (left)
2. Under **Custom domain** → type your domain exactly: `www.dulahq.com` (or `dulahq.com`) → **Save**
3. Wait 30s → GitHub verifies DNS → check **Enforce HTTPS** (wait 5-15 min for cert) → enable it

GitHub will auto-create a `CNAME` file in the repo (contains `www.dulahq.com`). Don't delete it.

### 3. Fix build base (critical)

Your Pages now serves from **root** (`/`), not `/DulaHQ/`. The workflow must build with base `/`.

**Do ONE of these:**

**Option A — Edit workflow (recommended):**
- Open `.github/workflows/deploy.yml` in repo
- Change `run: npm run build:github` → `run: npm run build:github:custom`
- Uncomment the line `# VITE_CUSTOM_DOMAIN: 'true'` → `VITE_CUSTOM_DOMAIN: 'true'`
- Commit + push

**Option B — I do it for you:** tell me the exact domain (`www.dulahq.com` or `dulahq.com`) and I’ll push the fix.

Re-build takes ~1 min. After that, `https://www.dulahq.com` should load DulaHQ (not 404 for assets).

### 4. Supabase & Google Auth allow-list

Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://www.dulahq.com` (your custom domain)
- **Additional Redirect URLs** add:
  ```
  https://www.dulahq.com/*
  https://pharveylg.github.io/DulaHQ/*  (keep for fallback)
  https://*.pages.dev/*  (keep cloudflare backup)
  http://localhost:5173/*
  ```

Same for Google Cloud Console → Credentials → OAuth Client → **Authorized JavaScript origins**: add `https://www.dulahq.com`

### 5. Verify

- `https://www.dulahq.com` → loads, console shows `[DulaHQ] backend: supabase | deployTarget: github`
- `https://dulahq-xxx.pages.dev` (Cloudflare) → still loads same data (backup) — don't share this link
- `https://pharveylg.github.io/DulaHQ/` → will now **redirect** to your custom domain (GitHub does this automatically after custom domain is set)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **404 for `/assets/...` after custom domain** | You forgot step 3 — rebuild with `build:github:custom` (base `/`) |
| **GitHub says "DNS check unsuccessful"** | Wait 10 min, ensure CNAME is `pharveylg.github.io.` (with dot) and not proxied (Cloudflare DNS = grey cloud) |
| **HTTPS not available** | Wait 15 min, ensure DNS propagated, then click Enforce HTTPS again |
| **www works but apex doesn't (or vice versa)** | Add both: apex needs A records, www needs CNAME — GitHub → Settings → Pages will offer to add redirect |
| **Want to revert to pages.dev only** | Remove custom domain in GitHub Settings → Pages → save, and revert workflow to `build:github` |

---

## Costs

- Domain: ~$10/yr (if buying)
- GitHub Pages + Cloudflare Pages + Supabase: stays **$0** — custom domain doesn't change billing
- SSL: free on both hosts (GitHub via Let's Encrypt, Cloudflare via Universal SSL)

Tell me your exact domain and I’ll patch the workflow + `CNAME` file now.
