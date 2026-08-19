/**
 * DulaHQ — Vite entry
 * For now this just imports the Supabase sync layer so that
 * `index.html` (which is still the main app) can use `window.DulaSync`.
 * As we modularize, we will move components here.
 */
import { sync } from './lib/sync.js'
import { isSupabaseConfigured } from './lib/supabase.js'

console.log('[DulaHQ] backend:', sync.backendName(), '| supabase configured:', isSupabaseConfigured, '| deployTarget:', import.meta.env.VITE_DEPLOY_TARGET || 'local')

// Expose for debugging in console
window.Dula = { sync }

// If Supabase is configured, auto-subscribe to realtime updates
if (isSupabaseConfigured && sync.isSupabase()) {
  sync.subscribe((newData) => {
    console.log('[DulaHQ] realtime update received', newData ? Object.keys(newData) : null)
    // For MVP we just log; later we will merge into S and re-render
    // if (newData && typeof S !== 'undefined') { Object.assign(S, newData); render?.() }
  })
}
