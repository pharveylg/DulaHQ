/**
 * DulaHQ — White-Label Branding Config
 * Single place to rebrand for any customer.
 * Keep Dula HQ as default, override via env or edit here.
 *
 * How to use for a new cup:
 * 1. Copy public/branding/dulahq/ → public/branding/my-cup/
 * 2. Replace logo.png / logo-white.png / favicon.ico
 * 3. Set VITE_BRAND_NAME, VITE_BRAND_LOGO, VITE_BRAND_GOLD, VITE_BRAND_ACCENT in Vercel/GitHub env
 *    or just edit the defaults below.
 */
export const BRANDING = {
  appName: import.meta.env.VITE_BRAND_NAME || 'Dula HQ',
  appShortName: import.meta.env.VITE_BRAND_SHORT || 'Dula',
  appShortAccent: 'HQ', // second part colored with gold
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Tournament Manager',

  // Logos — env can be /branding/my-cup/logo.png or https://cdn...
  logo: import.meta.env.VITE_BRAND_LOGO || '/branding/dulahq/logo.png',
  logoWhite: import.meta.env.VITE_BRAND_LOGO_WHITE || '/branding/dulahq/logo.png',
  favicon: import.meta.env.VITE_BRAND_FAVICON || '/branding/dulahq/logo.png',

  colors: {
    gold: import.meta.env.VITE_BRAND_GOLD || '#c8960a',
    accent: import.meta.env.VITE_BRAND_ACCENT || '#15803d',
    navy: '#faf9f5',
  },

  tournament: {
    name: import.meta.env.VITE_TOURNAMENT_NAME || 'Tournament',
    venue: import.meta.env.VITE_TOURNAMENT_VENUE || '',
    date: import.meta.env.VITE_TOURNAMENT_DATE || '',
  },

  // Sponsor strip for PDFs + TV marquee (empty = hidden)
  // Example: { name: 'LGU CDO', logo: '/branding/sponsors/lgu.png', url: '#' }
  sponsors: [],

  hero: {
    style: import.meta.env.VITE_HERO_STYLE || 'neon-block', // queue-black | dula-gold | neon-block | cream-punch
    signinTitle: import.meta.env.VITE_HERO_TITLE || 'Categories.\nDraws.\nLive.',
    signinSubtitle: import.meta.env.VITE_HERO_SUBTITLE || 'Book the pitch. Run the bracket.',
    dashboardHero: 'Host the cup. Own the day.',
    liveHero: 'Live Now',
    tvTicker: 'Powered by DulaHQ',
    emptyDrawTitle: 'No draw yet',
    emptyDrawSubtitle: 'Generate groups and kick-off times in Setup',
  },

  footer: `© ${new Date().getFullYear()} Tournament. Powered by DulaHQ platform.`,

  // Helper: split appName into short + accent for header (Dula | HQ)
  get headerParts() {
    const parts = (this.appName || 'Dula HQ').split(' ');
    if (parts.length >= 2) return { a: parts[0], b: parts.slice(1).join(' ') };
    return { a: this.appName, b: '' };
  },
};

// Inject CSS vars at boot so --gold / --navacc follow branding
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  if (root && BRANDING.colors.gold) root.style.setProperty('--gold', BRANDING.colors.gold);
  if (root && BRANDING.colors.accent) {
    root.style.setProperty('--navacc', BRANDING.colors.accent);
    // derived with opacity for --navaccl/b — keep original alpha
    root.style.setProperty('--navaccl', BRANDING.colors.accent + '1A'); // 10%
    root.style.setProperty('--navaccb', BRANDING.colors.accent + '59'); // 35%
  }
}
