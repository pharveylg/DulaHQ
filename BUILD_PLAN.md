# DulaHQ — Build Plan: P0 + P1 + P2 + White-Label
**Approved:** 2026-08-19 | **Status:** In Progress (Phase 1 started)
**Principle:** Keep `Dula HQ` in files as default, make generic via `src/config/branding.js` + env. Never delete logos.

---

## 0. White-Label Generic Layer (foundation for P2, done first)

**Goal:** Any customer (e.g. Cebu City Cup) clones repo, changes 10 lines, gets their brand everywhere. Dula stays default.

**Files:**
- `src/config/branding.js` ← single source (appName, logo, colors, hero copy, sponsors[])
- `public/branding/dulahq/logo.png` (96KB decoded from APP_LOGO_URI — kept forever)
- `public/branding/placeholder/logo.png` + `README.md` (generic trophy)
- `public/branding/sponsors/` (empty, for customer logos)
- CSS vars `--gold/--navacc` injected from branding.js at boot

**Migration:** Replace 30 hardcodes (`Dula`, `APP_LOGO_URI`, `--gold`) with `BRANDING.*`. Env `VITE_BRAND_NAME/LOGO/GOLD/ACCENT` overrides per deployment (Vercel/GitHub env).

**Hero Component:** `src/components/Hero.js` — `Hero('signin'|'dashboard'|'live'|'tv'|'empty', opts)` returns HTML string. Used in:
- Sign-in: logo + `signinTitle`/`signinSubtitle` + 3 stats pills + sponsor strip
- Dashboard: `tournament.name` + `dashboardHero` + Share Live + sponsor strip
- Live/TV: `liveHero` + ticker + sponsor marquee
- Empty draw: trophy + `emptyDrawTitle` + CTA to Setup/Import

**Accept:** Change `BRANDING.appName='Cebu City Cup'` → header, title, sign-in, PDFs all show Cebu. No code edit.

---

## Phase 1 — P0: Bulletproof (must before paid tournament)

### 1. Offline Queue + Badge
- **File:** `src/lib/sync.js` (replaced, 309 lines)
- **Behavior:** Every `sync.save(S)` → `localStorage['dulahq:local']` instantly. If `navigator.onLine===false` or Supabase `throw`, push to `localStorage['dulahq:queue']` (max 20), setStatus('offline'|'queued'). Retry on `online` event + 15s interval, flush latest queued. Load falls back to local if remote fails.
- **UI:** `sync-status-badge` in topbar: `Synced (green)` / `Syncing…` / `Offline · saved locally` / `Queued`. Exposed via `sync.onStatusChange`.
- **Accept:** Airplane mode → log goal → shows Offline badge → close tab → reopen → goal still there → go online → auto syncs → Synced.

### 2. Supabase Split (kill single-row race)
- **File:** `src/lib/sync.js` + `supabase/schema.sql` (new table `tournament_states` optional)
- **Behavior:** Keep `tournaments(id='primary')` for backward compat, but when `VITE_SPLIT_CATEGORIES=true`, save per-category rows `id='primary:catId'` + `id='primary:meta'` for shared fields. Two refs on different pitches write different rows → no last-write-wins. Load reassembles `categories[]`. Disabled by default (env) to avoid migration risk mid-tournament.
- **Accept:** 2 tablets: Ref A scores on General Pitch 1, Ref B scores on U14 Pitch 2 simultaneously → both scores persist (no overwrite).

### 3. Time-Overlap Hard Block (pitch/ref/team)
- **File:** `index.html` → `findMatchConflicts` patched
- **Today:** `kickoff !== kickoff` exact string match only.
- **After:** Parse `kickoff HH:MM` → minutes, duration=`S.tournament.duration` (default 60), check `[start, start+duration)` overlap. Pitch clash = same pitch + overlap. Ref clash = same ref + overlap. Team clash = same teamId + overlap. Hard block with red toast, `renderOfficials` prevents save. Also handles trailing space `"Pitch 1 "` vs `"Pitch 1"`.
- **Accept:** Assign Pitch 1 08:00 to Match A (60min) and Pitch 1 08:30 to Match B → blocked. Assign ref at 08:00 to two overlapping matches → blocked.

### 4. Officials Packet PDF
- **File:** `src/lib/officialsPacket.js` (new) + button in `Officials table`
- **Behavior:** 1 PDF per pitch: cover `Tournament · Date · Venue`, per-pitch schedule table (Time | Grp | Home vs Away | Ref), 8× blank Match Report templates (team lines + score boxes + cards + ref/commissioner signature lines). Uses `jspdf` + `BRANDING.header`.
- **Accept:** Admin clicks `Print Officials Packet` → downloads PDF that refs can carry when tablet dies.

---

## Phase 2 — P1: Fair (3-day cup)

### 5. CSV Roster Import
- **Files:** `src/lib/csvImport.js` + `Teams → Import` modal (reuses existing `readSpreadsheetFile` which already uses `XLSX`)
- **Behavior:** Columns: `Team | Coach | Player | Jersey | Pos | Age | Phone`. Parser trims, checks jersey dup within team, squad size `min 7 max 12` (editable per category in Setup: `category.minPlayers/maxPlayers`), age vs `category.ageGroup` warning. Shows preview table + `Import 28 players (2 errors)` before commit. Audit: `Roster imported — Team X 11 players`.
- **Accept:** Upload `cdo-cup-rosters.xlsx` (28 teams) → preview shows 2 jersey dups highlighted → fix → import 200 players in 5 sec, no hand-type.

### 6. Discipline → Suspension
- **Files:** `src/lib/discipline.js` + `index.html` `playerOpts` + `renderOfficials`
- **Behavior:** Count `yellow` per player across all `groupMatches`. On 2nd yellow → `yellow+red` auto? Actually 2 yellows in tournament = 1-match ban. Track `yellowCount` map, if `>=2` then `suspended=true`. `playerOpts` adds ` (SUSPENDED)` disabled option + `Discipline` table shows `Y=2 → Banned next match` red badge. Resets after serving 1 match (needs `suspendedMatches` tracking). Direct `red_direct` = 1-match ban, `red_yellow` = also.
- **Accept:** Player Reyes gets yellow at 23' and 67' → next match dropdown shows Reyes disabled + Badge `Suspended`. Ref cannot pick him.

### 7. Standings + Bracket Polish
- **Files:** `index.html` `buildStandingsExportData` / standings sort, `renderBracket`
- **Standings sort:** `pts → GD → GF → headToHead → fairPlay (yellows*1 + reds*3)`. `headToHead` computed from `groupMatches` where both teams played. Add `Setup → Allow knockout before groups done` toggle (`S.tournament.allowEarlyKnockout` bool). When true, Bracket `Chart` renders even if `played < total`.
- **Accept:** Tie 6 pts GD +5 GF 7 both → head-to-head 1-0 decides. Admin can start knockout at 14:00 even if one 08:00 group game postponed.

### 8. Guest Wall (no login)
- **Files:** `src/main.js` + `index.html` `renderLiveView` + `renderBracket` + route `?view=live` / `?view=tv`
- **Behavior:** New public routes: `/?view=live` and `/?view=tv` bypass `AUTH.signedIn` check, show `Hero('live'|'tv')` + bracket/standings/live streams filtered to `verified` only (unless `?showPending=1`). No `Nav` sidebar, just `Hero + Bracket`. Share button copies this link.
- **Accept:** Parent scans QR on printed PDF → opens `/live` on phone → sees bracket without signing in. No empty `Not signed in` wall.

---

## Phase 3 — P2: Sponsorship Polish (yes, + white-label already)

### 9. Branded PDFs (P2-A)
- **File:** `src/lib/export.js` wrapper over `exportToPDF/Excel`
- **Header per page:** `BRANDING.logo (12mm) + BRANDING.appName + tournament.name · venue · date · category · Verified/Draft watermark` using `jsPDF`. Uses `BRANDING.colors.gold/accent` for header bar. Sponsor strip bottom if `sponsors[]`.
- **Footer:** `QR → https://dulahq.vercel.app/live` (via `qrcode` npm) + `Generated 17 Aug 09:14 by Admin · Page 1/1`
- **New templates:** `Match Report (1 match/page)` + `Standings + Schedule` already branded. Sponsor logos from `public/branding/sponsors/`.
- **Accept:** Export `Match Report` for Butuan vs Iligan → PDF header shows shield + Mindanao Cup 2026 · CDO · QR, footer shows signatures, ready for LGU file.

### 10. TV Mode (P2-B)
- **File:** `src/components/Hero.js` `tv` variant + `?view=tv` route
- **Behavior:** Full-screen, 200% font, `Hero('tv')` + bracket chart centered, auto-rotate every 15s: `General → U14 → Women → Live Now (Pitch 1 1-0 32')`, sponsor marquee every 3rd rotation (5s full-screen logos). `kiosk=1` hides header. Realtime or 30s poll. Uses `BRANDING.tvTicker`.
- **Accept:** Plug laptop into LED at grandstand → `dulahq.vercel.app/?view=tv` → auto loops, sponsors visible all day, no login.

**Dependencies:** P2 needs branding.js (done first). P0 needs no dependencies. P1 needs P0's overlap + queue.

**Build verification each phase:** `npm run build:vercel` + `build:github` must stay green. Commits are atomic per phase.

---

## Files Touched (summary)

- New: `src/config/branding.js`, `src/components/Hero.js`, `src/lib/officialsPacket.js`, `src/lib/csvImport.js`, `src/lib/discipline.js`, `src/lib/export.js` (wrapper), `public/branding/**`
- Modified: `src/lib/sync.js` (offline + split), `src/lib/supabase.js` (split), `index.html` (findMatchConflicts, Hero injection, packet button, import, discipline, standings, guest routes), `src/main.js` (branding apply, sync badge), `vite.config.js`/`package.json` (already done), `supabase/schema.sql` (optional split table)

Next step: Continue P0-1 (overlap) and P0-4 (packet) after white-label foundation commit.
