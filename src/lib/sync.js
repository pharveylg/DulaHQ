/**
 * DulaHQ — Unified Sync Layer
 * Abstracts Sheets vs Supabase so rest of app calls sync.save(state) / sync.load()
 * Deploy target = env VITE_BACKEND = 'sheets' | 'supabase' | 'auto'
 */
import { getSupabase, isSupabaseConfigured } from './supabase.js'

const BACKEND = (import.meta.env.VITE_BACKEND || 'auto').toLowerCase()
const SHEETS_URL = import.meta.env.VITE_SHEETS_SCRIPT_URL || ''

function useSupabase() {
  if (BACKEND === 'supabase') return isSupabaseConfigured
  if (BACKEND === 'sheets') return false
  // auto: prefer supabase if configured, else sheets
  return isSupabaseConfigured
}

// --- Sheets helpers (keep your existing Apps Script API) ---
function apiFetchSheets(action, extra, cb) {
  if (!SHEETS_URL) { cb(null, 'SHEETS_URL not configured'); return }
  const url = SHEETS_URL + '?action=' + action + (extra ? '&' + extra : '')
  fetch(url).then(r => r.json()).then(d => cb(d, null)).catch(e => cb(null, e.message))
}
function apiPostSheets(action, payload, cb) {
  if (!SHEETS_URL) { cb(null, 'SHEETS_URL not configured'); return }
  const email = (typeof AUTH !== 'undefined' && AUTH.email) ? AUTH.email : ''
  const url = SHEETS_URL + '?action=' + action + '&email=' + encodeURIComponent(email)
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).then(r => r.json()).then(d => cb(d, null)).catch(e => cb(null, e.message))
}

// --- Supabase helpers ---
const TOURNAMENT_ID = 'primary' // single tournament row; extend to multi-tournament later

async function saveToSupabase(state) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  // Strip non-serializable
  const payload = JSON.parse(JSON.stringify(state))
  payload.timerInterval = null
  const { error } = await sb
    .from('tournaments')
    .upsert({ id: TOURNAMENT_ID, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw error
  return { ok: true }
}

async function loadFromSupabase() {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await sb.from('tournaments').select('data').eq('id', TOURNAMENT_ID).single()
  if (error) throw error
  return data?.data || null
}

// --- Public API used by your existing S ---
export const sync = {
  isSupabase: () => useSupabase(),
  backendName: () => useSupabase() ? 'supabase' : (SHEETS_URL ? 'sheets' : 'local'),

  // Called by your existing pushToSheets / autoSave — now backend-agnostic
  async save(state, { silent = false } = {}) {
    const target = useSupabase() ? 'supabase' : 'sheets'
    if (target === 'supabase') {
      return saveToSupabase(state)
    } else {
      return new Promise((resolve, reject) => {
        if (!SHEETS_URL) {
          if (!silent) console.warn('[sync] No backend configured, saving locally only')
          resolve({ ok: true, localOnly: true })
          return
        }
        const stripped = JSON.parse(JSON.stringify(state))
        stripped.timerInterval = null
        apiPostSheets('saveState', stripped, (res, err) => {
          if (err || !res || !res.ok) reject(err || res?.error || 'save failed')
          else resolve(res)
        })
      })
    }
  },

  async load() {
    const target = useSupabase() ? 'supabase' : 'sheets'
    if (target === 'supabase') {
      return loadFromSupabase()
    } else {
      return new Promise((resolve, reject) => {
        apiFetchSheets('getState', '', (res, err) => {
          if (err || !res || !res.ok) reject(err || res?.error || 'load failed')
          else resolve(res.state)
        })
      })
    }
  },

  // Realtime subscription for multi-referee live scores (Supabase only)
  subscribe(callback) {
    if (!useSupabase()) return () => {}
    const sb = getSupabase()
    const ch = sb.channel('tournament-' + TOURNAMENT_ID)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${TOURNAMENT_ID}` },
        (payload) => callback(payload.new?.data))
      .subscribe()
    return () => sb.removeChannel(ch)
  }
}

// Expose for legacy global calls: window.sync = sync
if (typeof window !== 'undefined') window.DulaSync = sync
