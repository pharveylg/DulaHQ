/**
 * DulaHQ — Unified Sync Layer + Offline Queue (P0)
 * - Saves to localStorage immediately (instant, survives refresh/offline)
 * - Queues remote saves when offline/failed, retries on 'online' and every 15s
 * - Exposes sync.status and sync.onStatusChange for badge UI
 * - Keeps existing Sheets/Supabase API, adds per-category split option (phase 1b)
 */
import { getSupabase, isSupabaseConfigured } from './supabase.js'

const BACKEND = (import.meta.env.VITE_BACKEND || 'auto').toLowerCase()
const SHEETS_URL = import.meta.env.VITE_SHEETS_SCRIPT_URL || ''
const LS_KEY = 'dulahq:local'
const QUEUE_KEY = 'dulahq:queue'
const META_KEY = 'dulahq:meta'

function useSupabase() {
  if (BACKEND === 'supabase') return isSupabaseConfigured
  if (BACKEND === 'sheets') return false
  return isSupabaseConfigured
}

// --- localStorage helpers ---
function saveLocal(state) {
  try {
    const payload = JSON.parse(JSON.stringify(state))
    payload.timerInterval = null
    localStorage.setItem(LS_KEY, JSON.stringify({ v: 2, ts: Date.now(), data: payload }))
  } catch {}
}
function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.data || parsed
  } catch { return null }
}
function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
function setQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-20))) } catch {}
}

// --- status ---
let _status = 'synced' // synced | syncing | offline | error | queued
let _lastError = null
const _listeners = new Set()
function setStatus(s, err = null) {
  _status = s; _lastError = err
  _listeners.forEach(fn => { try { fn(s, err) } catch {} })
  // also update legacy badge if exists
  try {
    const el = document.getElementById('sync-status-badge')
    if (el) {
      const map = {
        synced: '<span class="badge bgr" style="font-size:11px"><i class="ti ti-cloud-check"></i> Synced</span>',
        syncing: '<span class="badge bgy" style="font-size:11px"><i class="ti ti-cloud-upload"></i> Syncing…</span>',
        offline: '<span class="badge brd" style="font-size:11px"><i class="ti ti-wifi-off"></i> Offline · saved locally</span>',
        queued: '<span class="badge bamb" style="font-size:11px"><i class="ti ti-clock"></i> Queued · will sync</span>',
        error: '<span class="badge brd" style="font-size:11px"><i class="ti ti-alert-triangle"></i> Sync error</span>',
      }
      el.innerHTML = map[s] || map.synced
      el.title = err || ''
    }
  } catch {}
}

// --- Sheets helpers ---
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
const TOURNAMENT_ID = 'primary'
async function saveToSupabase(state) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const payload = JSON.parse(JSON.stringify(state))
  payload.timerInterval = null
  // P0 split option: if enabled, save per-category rows to avoid race
  const useSplit = (import.meta.env.VITE_SPLIT_CATEGORIES || 'false') === 'true' && payload.categories
  if (useSplit) {
    // save meta row
    const meta = {
      _tournamentMeta: payload._tournamentMeta,
      auditLog: payload.auditLog,
      users: payload.users,
      referees: payload.referees,
      officiatingTeam: payload.officiatingTeam,
      accessRequests: payload.accessRequests,
      registrations: payload.registrations,
      liveEmbeds: payload.liveEmbeds,
      viewAllCategories: payload.viewAllCategories,
      activeCategoryId: payload.activeCategoryId,
    }
    const rows = [
      { id: TOURNAMENT_ID + ':meta', data: meta, updated_at: new Date().toISOString() },
      ...payload.categories.map(cat => ({
        id: TOURNAMENT_ID + ':' + cat.id,
        data: cat,
        updated_at: new Date().toISOString(),
      }))
    ]
    const { error } = await sb.from('tournaments').upsert(rows, { onConflict: 'id' })
    if (error) throw error
    return { ok: true, split: true }
  } else {
    const { error } = await sb
      .from('tournaments')
      .upsert({ id: TOURNAMENT_ID, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (error) throw error
    return { ok: true }
  }
}
async function loadFromSupabase() {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const useSplit = (import.meta.env.VITE_SPLIT_CATEGORIES || 'false') === 'true'
  if (useSplit) {
    const { data, error } = await sb.from('tournaments').select('id, data').like('id', TOURNAMENT_ID + ':%')
    if (error) throw error
    // Reassemble
    let metaRow = data.find(r => r.id === TOURNAMENT_ID + ':meta')
    let catRows = data.filter(r => r.id !== TOURNAMENT_ID + ':meta' && r.id.startsWith(TOURNAMENT_ID + ':'))
    // fallback to single row if split not yet populated
    if (!metaRow && !catRows.length) {
      const { data: single, error: e2 } = await sb.from('tournaments').select('data').eq('id', TOURNAMENT_ID).single()
      if (e2) throw e2
      return single?.data || null
    }
    const meta = metaRow?.data || {}
    const categories = catRows.map(r => r.data)
    return { ...meta, categories }
  } else {
    const { data, error } = await sb.from('tournaments').select('data').eq('id', TOURNAMENT_ID).single()
    if (error) throw error
    return data?.data || null
  }
}

// --- queue processor ---
let _processing = false
async function processQueue() {
  if (_processing) return
  const q = getQueue()
  if (!q.length) return
  if (!navigator.onLine) { setStatus('offline'); return }
  _processing = true
  setStatus('syncing')
  try {
    // Take the latest queued state (last-write-wins for now; P1 will add per-match merge)
    const latest = q[q.length - 1]
    await saveToSupabase(latest.data)
    setQueue([])
    setStatus('synced')
    try { localStorage.setItem(META_KEY, JSON.stringify({ lastSync: Date.now() })) } catch {}
  } catch (e) {
    setStatus('error', e.message || String(e))
    // keep queue, will retry
  } finally {
    _processing = false
  }
}

// auto-retry
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { setStatus('queued'); processQueue() })
  window.addEventListener('offline', () => setStatus('offline'))
  setInterval(() => { if (getQueue().length) processQueue() }, 15000)
  // expose for debugging
  window.addEventListener('load', () => { setTimeout(() => {
    const loc = loadLocal()
    if (loc) console.log('[DulaSync] local cache found', Object.keys(loc))
  }, 500)})
}

export const sync = {
  isSupabase: () => useSupabase(),
  backendName: () => useSupabase() ? 'supabase' : (SHEETS_URL ? 'sheets' : 'local'),
  get status() { return _status },
  get lastError() { return _lastError },
  onStatusChange(fn) {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  },

  // Called by existing pushToSheets / autoSave — now backend-agnostic + offline-safe
  async save(state, { silent = false } = {}) {
    // Always save locally first (instant, survives refresh)
    saveLocal(state)
    const target = useSupabase() ? 'supabase' : 'sheets'
    if (target === 'supabase') {
      // if offline, queue and return
      if (!navigator.onLine) {
        const q = getQueue(); q.push({ ts: Date.now(), data: JSON.parse(JSON.stringify(state)) }); setQueue(q)
        setStatus('offline')
        if (!silent) console.warn('[sync] offline — queued, will sync when online')
        return { ok: true, queued: true, offline: true }
      }
      try {
        setStatus('syncing')
        const res = await saveToSupabase(state)
        setQueue([]) // clear queue on success
        setStatus('synced')
        try { localStorage.setItem(META_KEY, JSON.stringify({ lastSync: Date.now() })) } catch {}
        return res
      } catch (e) {
        // queue for retry
        const q = getQueue(); q.push({ ts: Date.now(), data: JSON.parse(JSON.stringify(state)) }); setQueue(q)
        setStatus('queued', e.message)
        if (!silent) console.warn('[sync] save failed, queued', e.message)
        throw e
      }
    } else {
      return new Promise((resolve, reject) => {
        if (!SHEETS_URL) {
          setStatus('synced')
          if (!silent) console.warn('[sync] No backend configured, saving locally only')
          resolve({ ok: true, localOnly: true })
          return
        }
        setStatus('syncing')
        const stripped = JSON.parse(JSON.stringify(state))
        stripped.timerInterval = null
        apiPostSheets('saveState', stripped, (res, err) => {
          if (err || !res || !res.ok) {
            const q = getQueue(); q.push({ ts: Date.now(), data: JSON.parse(JSON.stringify(state)) }); setQueue(q)
            setStatus('error', err || res?.error || 'save failed')
            reject(err || res?.error || 'save failed')
          } else {
            setQueue([])
            setStatus('synced')
            resolve(res)
          }
        })
      })
    }
  },

  async load() {
    const target = useSupabase() ? 'supabase' : 'sheets'
    try {
      if (target === 'supabase') {
        const remote = await loadFromSupabase()
        if (remote) saveLocal(remote)
        setStatus('synced')
        return remote || loadLocal()
      } else {
        return await new Promise((resolve, reject) => {
          apiFetchSheets('getState', '', (res, err) => {
            if (err || !res || !res.ok) {
              const loc = loadLocal()
              if (loc) { setStatus('offline'); resolve(loc) } else reject(err || res?.error || 'load failed')
            } else {
              saveLocal(res.state)
              setStatus('synced')
              resolve(res.state)
            }
          })
        })
      }
    } catch (e) {
      const loc = loadLocal()
      if (loc) { setStatus('offline', e.message); return loc }
      throw e
    }
  },

  // Try to flush queue manually (e.g., button)
  async flushQueue() { return processQueue() },
  getQueue() { return getQueue() },
  clearQueue() { setQueue([]); setStatus('synced') },

  // For UI: last local save time
  lastLocalTs() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}').ts || null } catch { return null }
  },

  subscribe(callback) {
    if (!useSupabase()) return () => {}
    const sb = getSupabase()
    const ch = sb.channel('tournament-' + TOURNAMENT_ID)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${TOURNAMENT_ID}` },
        (payload) => {
          const newData = payload.new?.data
          if (newData) saveLocal(newData)
          callback(newData)
        })
      .subscribe()
    return () => sb.removeChannel(ch)
  }
}

if (typeof window !== 'undefined') window.DulaSync = sync
// expose status globally for index.html legacy
if (typeof window !== 'undefined') window.DulaSyncStatus = { get: () => _status, onChange: (fn) => sync.onStatusChange(fn) }
