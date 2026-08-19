/**
 * DulaHQ — Vite entry
 * White-label + sync status + hero
 */
import { BRANDING } from './config/branding.js'
import { sync } from './lib/sync.js'
import { isSupabaseConfigured } from './lib/supabase.js'
import { generateOfficialsPacket } from './lib/officialsPacket.js'
import { Hero, applyBrandingToDocument } from './components/Hero.js'

// Apply branding to document (title, favicon, CSS vars)
try { applyBrandingToDocument() } catch {}

console.log('[DulaHQ]', BRANDING.appName, '| backend:', sync.backendName(), '| supabase:', isSupabaseConfigured, '| deploy:', import.meta.env.VITE_DEPLOY_TARGET || 'local')

// Expose for debugging
window.Dula = { sync, BRANDING, Hero, generateOfficialsPacket }
window.BRANDING = BRANDING
window.Hero = Hero
window.generateOfficialsPacket = () => {
  try { generateOfficialsPacket(window.S || window.S, window.getTeamById, window.getRefereeById) } catch(e) { console.error(e); alert('Packet failed: ' + e.message) }
}

// Sync status badge — inject into header if not present
function ensureSyncBadge() {
  const header = document.getElementById('app-header')
  if (!header) return
  let badge = document.getElementById('sync-status-badge')
  if (!badge) {
    badge = document.createElement('div')
    badge.id = 'sync-status-badge'
    badge.style.cssText = 'margin-left:8px;display:flex;align-items:center'
    badge.innerHTML = '<span class="badge bgr" style="font-size:11px"><i class="ti ti-cloud-check"></i> Synced</span>'
    const userWrap = header.querySelector('.app-header-user')
    if (userWrap) userWrap.prepend(badge)
    else header.appendChild(badge)
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    ensureSyncBadge()
    sync.onStatusChange(() => ensureSyncBadge())
    // also update on sync status
    sync.onStatusChange((s) => {
      const el = document.getElementById('sync-status-badge')
      if (el) console.log('[sync] status', s)
    })
  })
  // Handle ?view=live or ?view=tv public hero without auth
  const params = new URLSearchParams(location.search)
  const view = params.get('view')
  if (view === 'live' || view === 'tv') {
    document.documentElement.setAttribute('data-public-view', view)
  }
}

// Realtime
if (isSupabaseConfigured && sync.isSupabase()) {
  sync.subscribe((newData) => {
    console.log('[DulaHQ] realtime update', newData ? Object.keys(newData).length : 0)
  })
}
