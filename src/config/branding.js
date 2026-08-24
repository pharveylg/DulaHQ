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

  // Logos — Dula HQ text is prevalent, logos are empty by default (admin uploads per spec)
  // To restore Dula shield: set VITE_BRAND_LOGO=/branding/dulahq/logo.png
  logo: import.meta.env.VITE_BRAND_LOGO || '',
  logoWhite: import.meta.env.VITE_BRAND_LOGO_WHITE || '',
  favicon: import.meta.env.VITE_BRAND_FAVICON || '',

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

/**
 * Multi-tenant accent system (phase 2)
 * Vetted swatches only — each pair is contrast-checked:
 *   fill  = solid fills (CTAs, badges) — always paired with #09090B text
 *   tx    = text/outline variant on DARK surfaces (zinc-950)
 *   txLight = text/outline variant on LIGHT surfaces (zinc-50)
 * The red live-dot is never themeable. Platform default = lime.
 */
export const TENANT_SWATCHES = [
  { id: 'lime',   label: 'Platform Lime', fill: '#CCFF00', hover: '#BEF264', tx: '#CCFF00', txLight: '#4D7C0F' },
  { id: 'sky',    label: 'Sky',           fill: '#7DD3FC', hover: '#BAE6FD', tx: '#7DD3FC', txLight: '#0369A1' },
  { id: 'orange', label: 'Orange',        fill: '#FB923C', hover: '#FDBA74', tx: '#FB923C', txLight: '#C2410C' },
  { id: 'violet', label: 'Violet',        fill: '#C4B5FD', hover: '#DDD6FE', tx: '#C4B5FD', txLight: '#6D28D9' },
  { id: 'mint',   label: 'Mint',          fill: '#6EE7B7', hover: '#A7F3D0', tx: '#6EE7B7', txLight: '#047857' },
]
