/**
 * DulaHQ — Supabase client
 * Works with both GitHub Pages and Cloudflare Pages via same env vars.
 * Falls back to Sheets/local if env not configured — zero breaking change.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let _client = null

export function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return _client
}

// Convenience: get current authenticated user id/email
export async function getCurrentUser() {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  return data?.user || null
}
