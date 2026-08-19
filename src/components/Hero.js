/**
 * Hero callouts — white-label, no framework, returns HTML string (fits existing innerHTML pattern)
 * Variant: 'signin' | 'dashboard' | 'live' | 'tv' | 'empty'
 */
import { BRANDING } from '../config/branding.js'

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function Hero(variant, opts = {}) {
  const b = BRANDING
  const logo = opts.logo || b.logo
  const tournamentName = opts.tournamentName || b.tournament.name || b.appName

  if (variant === 'signin') {
    return `
    <div style="text-align:center; padding:8px 0 18px">
      <img src="${esc(logo)}" alt="" style="width:72px;height:72px;object-fit:contain;margin:0 auto 10px;display:block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.12))" onerror="this.style.display='none'">
      <div style="font-size:42px;font-weight:800;font-style:italic;letter-spacing:-1.2px;line-height:1">${esc(b.appShortName)} <span style="color:var(--gold)">${esc(b.appShortAccent)}</span></div>
      <div style="width:64px;height:4px;background:linear-gradient(90deg,var(--gold),var(--navacc));margin:10px auto 10px;border-radius:2px"></div>
      <div style="font-size:13px;color:var(--tm);text-transform:uppercase;letter-spacing:2.5px;font-weight:700;margin-bottom:14px">${esc(b.tagline)}</div>
      <div style="font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px">${esc(b.hero.signinTitle)}</div>
      <div style="font-size:14px;color:var(--ts);margin-bottom:14px">${esc(b.hero.signinSubtitle)}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">
        <span class="badge bgy" style="font-size:12px"><i class="ti ti-layout-grid"></i> ${esc(opts.statsCategories ?? '3 Categories')}</span>
        <span class="badge bgy" style="font-size:12px"><i class="ti ti-users-group"></i> ${esc(opts.statsTeams ?? '16 Teams')}</span>
        <span class="badge brd" style="font-size:12px"><i class="ti ti-player-play"></i> ${esc(opts.statsLive ?? 'Live')}</span>
      </div>
      ${b.sponsors.length ? `<div style="display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;margin:10px 0;opacity:.85">${b.sponsors.map(s=>`<img src="${esc(s.logo)}" alt="${esc(s.name)}" style="height:22px;object-fit:contain" onerror="this.style.display='none'">`).join('')}</div>` : ''}
    </div>`
  }

  if (variant === 'dashboard') {
    return `
    <div style="background:var(--n2);border:1px solid var(--nb);border-radius:12px;padding:16px;margin-bottom:14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <img src="${esc(logo)}" alt="" style="width:42px;height:42px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'">
      <div style="flex:1;min-width:200px">
        <div style="font-size:18px;font-weight:700;line-height:1.1">${esc(tournamentName)} <span style="font-weight:400;color:var(--tm);font-size:13px">· ${esc(opts.venue || b.tournament.venue || '')} ${opts.date ? '· ' + esc(opts.date) : ''}</span></div>
        <div style="font-size:13px;color:var(--tm);margin-top:4px">${esc(b.hero.dashboardHero)}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" onclick="navigator.clipboard && navigator.clipboard.writeText(location.origin + location.pathname + '#live'); showToast && showToast('Live link copied')"><i class="ti ti-share"></i> Share Live</button>
        <button class="btn primary sm" onclick="navTo && navTo('live')"><i class="ti ti-player-play"></i> View Live</button>
      </div>
      ${b.sponsors.length ? `<div style="width:100%;border-top:1px solid var(--nbl);margin-top:10px;padding-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:11px;color:var(--tm);text-transform:uppercase;letter-spacing:.06em">Presented by</span>${b.sponsors.map(s=>`<img src="${esc(s.logo)}" alt="${esc(s.name)}" style="height:20px;object-fit:contain" onerror="this.style.display='none'">`).join('')}</div>` : ''}
    </div>`
  }

  if (variant === 'live' || variant === 'tv') {
    const isTV = variant === 'tv'
    return `
    <div style="${isTV ? 'text-align:center;padding:12px 0 6px' : 'margin-bottom:12px'}">
      <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:20px;background:${isTV ? 'var(--rdbg)' : 'var(--n3)'};border:1px solid ${isTV ? 'var(--rdb)' : 'var(--nb)'};font-size:${isTV ? '22px' : '13px'};font-weight:700;color:${isTV ? 'var(--red)' : 'var(--ts)'}">
        <span style="width:8px;height:8px;background:var(--red);border-radius:50%;display:inline-block;animation:pulse 1.2s infinite"></span>
        ${esc(b.hero.liveHero)}${opts.liveCount ? ` · ${opts.liveCount} live` : ''}
      </div>
      ${opts.subtitle ? `<div style="font-size:${isTV ? '16px' : '13px'};color:var(--tm);margin-top:8px">${esc(opts.subtitle)}</div>` : ''}
      ${isTV && b.sponsors.length ? `<div style="display:flex;gap:14px;justify-content:center;align-items:center;margin-top:12px;flex-wrap:wrap">${b.sponsors.map(s=>`<img src="${esc(s.logo)}" alt="${esc(s.name)}" style="height:26px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.12))" onerror="this.style.display='none'">`).join('')}</div>` : ''}
    </div>`
  }

  if (variant === 'empty') {
    return `
    <div class="empty" style="padding:36px 20px">
      <div style="width:72px;height:72px;margin:0 auto 14px;background:var(--n3);border:1px solid var(--nb);border-radius:16px;display:flex;align-items:center;justify-content:center"><i class="ti ti-trophy" style="font-size:36px;color:var(--gold)"></i></div>
      <div style="font-size:18px;font-weight:700;margin-bottom:6px">${esc(opts.title || b.hero.emptyDrawTitle)}</div>
      <p style="font-size:14px;max-width:420px;margin:0 auto 14px">${esc(opts.subtitle || b.hero.emptyDrawSubtitle)}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${opts.primaryAction ? `<button class="btn primary" onclick="${esc(opts.primaryAction)}"><i class="ti ti-settings"></i> ${esc(opts.primaryLabel || 'Go to Setup')}</button>` : ''}
        ${opts.secondaryAction ? `<button class="btn" onclick="${esc(opts.secondaryAction)}"><i class="ti ti-upload"></i> ${esc(opts.secondaryLabel || 'Import teams')}</button>` : ''}
      </div>
    </div>`
  }

  return ''
}

// Also export a tiny helper to inject favicon/title from branding
export function applyBrandingToDocument() {
  try {
    if (BRANDING.appName) document.title = `${BRANDING.appName} — ${BRANDING.tagline}`
    let link = document.querySelector("link[rel*='icon']")
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
    link.href = BRANDING.favicon
    link.type = 'image/x-icon'
  } catch {}
}
