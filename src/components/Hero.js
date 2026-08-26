/**
 * Hero callouts — white-label, style-aware
 * style: queue-black | dula-gold | neon-block | cream-punch (from BRANDING.hero.style)
 * Variants: signin | dashboard | live | tv | empty
 */
import { BRANDING } from '../config/branding.js'

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function isNeon() {
  try { return (BRANDING.hero && BRANDING.hero.style) === 'neon-block' } catch { return false }
}

export function Hero(variant, opts = {}) {
  const b = BRANDING
  const style = (b.hero && b.hero.style) || 'neon-block'
  const logo = opts.logo || b.logo
  const tournamentName = opts.tournamentName || b.tournament.name || b.appName
  const neon = style === 'neon-block'

  // ---- NEON BLOCK (03) — brutalist, white+lime on black ----
  if (neon) {
    if (variant === 'signin') {
      // Hero card for sign-in — dark punch, matches your attached reference but tournament copy
      const titleLines = (b.hero.signinTitle || 'Categories.\nDraws.\nLive.').split('\n')
      const titleHtml = titleLines.map((line,i) => {
        const isLive = line.toLowerCase().includes('live')
        if (isLive) return `<span style="background:#c8ff32;color:#0a0a0a;padding:0 10px;border-radius:8px;display:inline-block;transform:rotate(-1deg)">${esc(line)}</span>`
        return esc(line)
      }).join('<br>')
      return `
      <div style="background:#0a0a0a;border-radius:20px;padding:22px;position:relative;overflow:hidden;text-align:left;color:#fff;min-height:320px;display:flex;flex-direction:column">
        <div style="position:absolute;right:-70px;top:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle at center, #ff3b30 0%, #8b1a12 60%, transparent 70%);opacity:.9;pointer-events:none"></div>
        <div style="position:absolute;right:-10px;bottom:36px;font-size:72px;font-weight:900;letter-spacing:-4px;color:rgba(255,255,255,.06);transform:rotate(-4deg);pointer-events:none;white-space:nowrap">BRACKET</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;position:relative">
          <img src="${esc(logo)}" alt="" style="width:22px;height:22px;object-fit:contain;background:#fff;border-radius:6px;padding:3px" onerror="this.style.display='none'">
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.7)">Dula HQ • Tournament Manager</span>
          <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:20px;background:#fff;color:#0a0a0a;display:inline-flex">LIVE NOW</span>
        </div>
        <div style="font-size:40px;font-weight:900;letter-spacing:-1.5px;line-height:.92;margin-top:14px;position:relative">${titleHtml}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:8px;position:relative">${esc(b.hero.signinSubtitle || 'Book the pitch. Run the bracket.')}</div>
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;position:relative">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;padding:7px 12px;border-radius:20px;background:#fff;color:#0a0a0a">${esc(opts.statsCategories ?? '3 Categories')}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;padding:7px 12px;border-radius:20px;background:#c8ff32;color:#0a0a0a">${esc(opts.statsTeams ?? '16 Teams')}</span>
        </div>
        <div style="margin-top:14px;background:#fff;border-radius:16px;padding:12px;position:relative;color:#0a0a0a">
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Up Next</div>
          <div style="font-size:13px;font-weight:600;line-height:1.4">General SF — Butuan vs Iligan, Pitch 1 15:30. Winner to final at 17:00.</div>
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;background:#0a0a0a;color:#fff">SF 15:30</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;background:#c8ff32;color:#0a0a0a">PITCH 1</span>
          </div>
        </div>
        ${b.sponsors.length ? `<div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;opacity:.9;position:relative"><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,.6)">Presented by</span>${b.sponsors.map(s=>`<span style="font-size:11px;font-weight:700;color:#fff;background:rgba(255,255,255,.12);padding:4px 8px;border-radius:20px">${esc(s.name)}</span>`).join('')}</div>` : ''}
      </div>`
    }
    if (variant === 'dashboard') {
      return `
      <div style="background:#0a0a0a;border-radius:16px;padding:16px;margin-bottom:14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;color:#fff;position:relative;overflow:hidden;border:1px solid #1a1a1a">
        <div style="position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle, #c8ff32 0%, transparent 70%);opacity:.15;pointer-events:none"></div>
        <div style="width:44px;height:44px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden"><img src="${esc(logo)}" alt="" style="width:36px;height:36px;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="flex:1;min-width:200px;position:relative">
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:2px">Dula HQ • Tournament Manager</div>
          <div style="font-size:16px;font-weight:800;letter-spacing:-.5px">${esc(tournamentName)} <span style="font-weight:400;color:rgba(255,255,255,.6);font-size:12px">· ${esc(opts.venue || b.tournament.venue || '')}</span></div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:2px">${esc(b.hero.dashboardHero)}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;position:relative">
          <button class="btn sm" style="background:#fff!important;color:#0a0a0a!important;border-color:#fff!important;font-weight:800" onclick="navigator.clipboard && navigator.clipboard.writeText(location.origin + location.pathname + '?view=live'); showToast && showToast('Live link copied')"><i class="ti ti-share"></i> Share Live</button>
          <button class="btn primary sm" style="background:#c8ff32;color:#0a0a0a;border-color:#c8ff32;font-weight:800" onclick="navTo && navTo('live')"><i class="ti ti-player-play"></i> View Live</button>
        </div>
      </div>`
    }
    if (variant === 'live' || variant === 'tv') {
      const isTV = variant === 'tv'
      return `
      <div style="${isTV ? 'text-align:center;padding:8px 0' : 'margin-bottom:12px'}">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tm,#A1A1AA);margin-bottom:6px;text-align:center">Dula HQ • Tournament Manager</div>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:20px;background:${isTV ? '#c8ff32' : '#0a0a0a'};border:1px solid ${isTV ? '#c8ff32' : '#0a0a0a'};font-family:'JetBrains Mono',monospace;font-size:${isTV ? '13px' : '12px'};font-weight:800;letter-spacing:.04em;color:${isTV ? '#0a0a0a' : '#fff'};text-transform:uppercase">
          <span style="width:8px;height:8px;background:${isTV ? '#0a0a0a' : '#c8ff32'};border-radius:50%;display:inline-block;animation:pulse 1.2s infinite"></span>
          ${esc(b.hero.liveHero)}${opts.liveCount ? ` · ${opts.liveCount}` : ''}
        </div>
        ${opts.subtitle ? `<div style="font-size:${isTV ? '15px' : '13px'};color:var(--ts,#F4F4F5);margin-top:8px;font-weight:600">${esc(opts.subtitle)}</div>` : ''}
      </div>`
    }
    if (variant === 'empty') {
      return `
      <div style="text-align:center;padding:32px 20px;background:#0a0a0a;border-radius:20px;color:#fff;position:relative;overflow:hidden">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Dula HQ</div>
        <div style="width:64px;height:64px;margin:0 auto 12px;background:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center"><i class="ti ti-trophy" style="font-size:32px;color:#0a0a0a"></i></div>
        <div style="font-size:18px;font-weight:800;margin-bottom:6px">${esc(opts.title || b.hero.emptyDrawTitle)}</div>
        <p style="font-size:13px;color:rgba(255,255,255,.7);max-width:420px;margin:0 auto 14px">${esc(opts.subtitle || b.hero.emptyDrawSubtitle)}</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${opts.primaryAction ? `<button class="btn primary" style="background:#c8ff32;color:#0a0a0a;border-color:#c8ff32;font-weight:800" onclick="${esc(opts.primaryAction)}">Go to Setup</button>` : ''}
          ${opts.secondaryAction ? `<button class="btn" style="background:#fff!important;color:#0a0a0a!important;border-color:#fff!important" onclick="${esc(opts.secondaryAction)}">Import teams</button>` : ''}
        </div>
      </div>`
    }
  }

  if (variant === 'page') {
    // Generic page hero — used for every view (Setup, Categories, Teams, etc.)
    return `
    <div style="background:#0a0a0a;border-radius:16px;padding:16px;margin-bottom:14px;color:#fff;position:relative;overflow:hidden;border:1px solid #1a1a1a">
      <div style="position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle, #c8ff32 0%, transparent 70%);opacity:.12;pointer-events:none"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:6px;position:relative">Dula HQ • ${esc(opts.section || 'Tournament')}</div>
      <div style="font-size:18px;font-weight:800;letter-spacing:-.5px;position:relative">${esc(opts.title || 'Setup')}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:4px;position:relative">${esc(opts.subtitle || '')}</div>
      ${opts.stats ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;position:relative">${opts.stats.map(function(s){return '<span style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;padding:5px 10px;border-radius:20px;background:#fff;color:#0a0a0a">'+esc(s)+'</span>';}).join('')}</div>` : ''}
    </div>`;
  }

  // Fallback — other styles (queue-black / dula-gold / cream-punch) keep original cream/gold look
  // (reuses logo/tournamentName from top)
  if (variant === 'signin') {
    return `
    <div style="text-align:center; padding:8px 0 18px">
      <img src="${esc(logo)}" alt="" style="width:72px;height:72px;object-fit:contain;margin:0 auto 10px;display:block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.12))" onerror="this.style.display='none'">
      <div style="font-size:42px;font-weight:800;font-style:italic;letter-spacing:-1.2px;line-height:1">${esc(b.appShortName)} <span style="color:var(--gold)">${esc(b.appShortAccent)}</span></div>
      <div style="width:64px;height:4px;background:linear-gradient(90deg,var(--gold),var(--navacc));margin:10px auto 10px;border-radius:2px"></div>
      <div style="font-size:13px;color:var(--tm);text-transform:uppercase;letter-spacing:2.5px;font-weight:700;margin-bottom:14px">${esc(b.tagline)}</div>
      <div style="font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px;white-space:pre-line">${esc(b.hero.signinTitle)}</div>
      <div style="font-size:14px;color:var(--ts);margin-bottom:14px">${esc(b.hero.signinSubtitle)}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">
        <span class="badge bgy" style="font-size:12px"><i class="ti ti-layout-grid"></i> ${esc(opts.statsCategories ?? '3 Categories')}</span>
        <span class="badge bgy" style="font-size:12px"><i class="ti ti-users-group"></i> ${esc(opts.statsTeams ?? '16 Teams')}</span>
        <span class="badge brd" style="font-size:12px"><i class="ti ti-player-play"></i> ${esc(opts.statsLive ?? 'Live')}</span>
      </div>
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
        <button class="btn sm" onclick="navigator.clipboard && navigator.clipboard.writeText(location.origin + location.pathname + '?view=live'); showToast && showToast('Live link copied')"><i class="ti ti-share"></i> Share Live</button>
        <button class="btn primary sm" onclick="navTo && navTo('live')"><i class="ti ti-player-play"></i> View Live</button>
      </div>
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
    </div>`
  }
  if (variant === 'empty') {
    return `
    <div class="empty" style="padding:36px 20px">
      <div style="width:72px;height:72px;margin:0 auto 14px;background:var(--n3);border:1px solid var(--nb);border-radius:16px;display:flex;align-items:center;justify-content:center"><i class="ti ti-trophy" style="font-size:36px;color:var(--gold)"></i></div>
      <div style="font-size:18px;font-weight:700;margin-bottom:6px">${esc(opts.title || b.hero.emptyDrawTitle)}</div>
      <p style="font-size:14px;max-width:420px;margin:0 auto 14px">${esc(opts.subtitle || b.hero.emptyDrawSubtitle)}</p>
    </div>`
  }
  return ''
}

export function applyBrandingToDocument() {
  try {
    if (BRANDING.appName) document.title = `${BRANDING.appName} — ${BRANDING.tagline}`
    // No-op when no custom favicon is configured — index.html already ships a
    // default <link rel="icon">, and setting href to '' here would overwrite
    // it with the empty string, which resolves to the current page URL.
    if (!BRANDING.favicon) return
    let link = document.querySelector("link[rel*='icon']")
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
    link.href = BRANDING.favicon
    link.type = 'image/x-icon'
  } catch {}
}
