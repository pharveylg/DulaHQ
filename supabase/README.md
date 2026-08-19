# Supabase Setup (5 minutes, free)

1. **Create project** at https://supabase.com → New Project (free tier)
2. **Run schema:** Dashboard → SQL Editor → paste `supabase/schema.sql` → Run
3. **Create storage bucket:** Dashboard → Storage → New bucket → `dulahq-docs` → Public = true
   - Policies are already in `schema.sql`, but you can verify in Storage → Policies
4. **Get keys:** Dashboard → Project Settings → API → copy `URL` and `anon` key
5. **Add env:**
   - Locally: copy `.env.example` → `.env.local` and paste keys
   - GitHub: Repo → Settings → Secrets → Actions → New secret `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Cloudflare: Dashboard → Pages → your project → Settings → Environment variables → add same two vars for Production + Preview
6. **Auth:** Dashboard → Authentication → Providers → enable Google (add your Google Client ID) + Email
   - Add to Site URL: `https://pharveylg.github.io` and `https://your-cloudflare-pages.dev`
   - Add to Redirect URLs: same + `http://localhost:5173`

**Test locally:**
```bash
npm install
npm run dev
# Open http://localhost:5173 — check console: [sync] backend = supabase
```
