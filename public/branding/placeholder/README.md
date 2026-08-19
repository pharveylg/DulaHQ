# Branding Placeholder

This folder is the **generic** brand used when a new customer hasn't supplied their own.

**To add your own cup:**

1. Copy `public/branding/dulahq/` → `public/branding/my-cup/`
   ```
   cp -r public/branding/dulahq public/branding/my-cup
   ```
2. Replace:
   - `logo.png` (512×512, transparent PNG)
   - `logo-white.png` (for dark headers, optional — falls back to logo.png)
   - `favicon.ico`

3. Point the app at it — **no code change**, just env:

   **Vercel / GitHub Secrets / .env.local**
   ```
   VITE_BRAND_NAME=Cebu City Cup
   VITE_BRAND_TAGLINE=Inter-Barangay 7s
   VITE_BRAND_LOGO=/branding/my-cup/logo.png
   VITE_BRAND_GOLD=#0e4a7a
   VITE_BRAND_ACCENT=#c0392b
   VITE_TOURNAMENT_NAME=Cebu City Cup 2026
   ```

4. Optional sponsors (appear in PDF header + TV marquee):
   ```js
   // src/config/branding.js -> sponsors: [
   //   { name: 'LGU Cebu', logo: '/branding/my-cup/sponsors/lgu.png' },
   //   { name: 'Milo', logo: '/branding/my-cup/sponsors/milo.png' }
   // ]
   ```

**Files kept:**
- `public/branding/dulahq/logo.png` — original Dula HQ shield (96KB base64 decoded — never deleted, stays as default)
- This placeholder `logo.png` — copy of Dula HQ for now, replace with your trophy silhouette if you want a truly neutral default.

No code needs to touch `index.html` after this — just this config.
