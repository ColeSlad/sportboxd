import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Display helpers ──────────────────────────────────────────────────────────

/** First two characters of the email, uppercased — used as avatar fallback */
export function getUserInitials(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

/** Stable accent color derived from the user's ID */
const AVATAR_COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#c026d3']
export function getUserColor(id: string): string {
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]!
}
