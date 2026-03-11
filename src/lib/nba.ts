/**
 * balldontlie.io API v1 client
 * Docs: https://www.balldontlie.io/api.html
 *
 * Free tier: authenticated requests, up to 60 req/min, 100 results/page.
 * The API key is exposed in the client bundle — acceptable for a prototype.
 * For production, proxy requests through your own API route.
 */

import type { BDLGame, BDLStat, Game } from './types'
import { normalizeBDLAbbr, getTeam } from './teams'

const BASE = 'https://api.balldontlie.io/v1'
const API_KEY = import.meta.env.VITE_BALLDONTLIE_API_KEY as string | undefined

// ─── BDL team ID map (stable; matches GET /v1/teams) ─────────────────────────
// Used to translate our team abbreviations into the numeric IDs BDL expects.
export const BDL_TEAM_IDS: Record<string, number> = {
  ATL: 1,  BOS: 2,  BKN: 3,  CHA: 4,  CHI: 5,
  CLE: 6,  DAL: 7,  DEN: 8,  DET: 9,  GSW: 10,
  HOU: 11, IND: 12, LAC: 13, LAL: 14, MEM: 15,
  MIA: 16, MIL: 17, MIN: 18, NOP: 19, NYK: 20,
  OKC: 21, ORL: 22, PHI: 23, PHX: 24, POR: 25,
  SAC: 26, SAS: 27, TOR: 28, UTA: 29, WAS: 30,
}

// ─── Type conversion ──────────────────────────────────────────────────────────

// BDL status values:
//   "Final"                    → completed game
//   "2026-03-09T23:00:00.000Z" → upcoming (ISO datetime string)
//   "Halftime", "3rd Qtr 5:23" → in-progress
export function normalizeStatus(raw: string): string {
  if (raw === 'Final') return 'Final'
  // ISO datetime = upcoming; convert to local time string
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const d = new Date(raw)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
  }
  return raw // in-progress quarter/time string
}

export function bdlGameToGame(g: BDLGame): Game {
  const homeAbbr = normalizeBDLAbbr(g.home_team.abbreviation)
  const awayAbbr = normalizeBDLAbbr(g.visitor_team.abbreviation)
  const type: Game['type'] = g.postseason ? 'Playoffs' : 'Regular Season'
  const homeTeam = getTeam(homeAbbr)
  const awayTeam = getTeam(awayAbbr)

  return {
    id: g.id,
    date: g.date,
    homeTeam: homeAbbr,
    awayTeam: awayAbbr,
    homeScore: g.home_team_score,
    awayScore: g.visitor_team_score,
    season: `${g.season}–${String(g.season + 1).slice(2)}`,
    type,
    gameLabel: null,
    overtime: g.period > 4,
    status: normalizeStatus(g.status),
    avgRating: 0,
    reviewCount: 0,
    viewCount: 0,
    description: `${awayTeam.city} ${awayTeam.name} at ${homeTeam.city} ${homeTeam.name}`,
  }
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

interface BDLGamesParams {
  seasons?: number[]
  team_ids?: number[]
  postseason?: boolean
  per_page?: number
  cursor?: number
  start_date?: string
  end_date?: string
}

interface BDLGamesResponse {
  data: BDLGame[]
  meta: { next_cursor: number | null; per_page: number }
}

function bdlHeaders(): HeadersInit {
  if (!API_KEY) throw new Error('VITE_BALLDONTLIE_API_KEY is not set')
  return { Authorization: API_KEY }
}

export async function bdlFetchGames(params: BDLGamesParams): Promise<BDLGamesResponse> {
  const url = new URL(`${BASE}/games`)
  params.seasons?.forEach((s) => url.searchParams.append('seasons[]', String(s)))
  params.team_ids?.forEach((id) => url.searchParams.append('team_ids[]', String(id)))
  if (params.postseason !== undefined) url.searchParams.set('postseason', String(params.postseason))
  if (params.per_page) url.searchParams.set('per_page', String(params.per_page))
  if (params.cursor) url.searchParams.set('cursor', String(params.cursor))
  if (params.start_date) url.searchParams.set('start_date', params.start_date)
  if (params.end_date) url.searchParams.set('end_date', params.end_date)

  const res = await fetch(url.toString(), { headers: bdlHeaders() })
  if (!res.ok) throw new Error(`BDL API ${res.status}: ${await res.text()}`)
  return res.json() as Promise<BDLGamesResponse>
}

export async function bdlFetchGame(id: number): Promise<BDLGame> {
  const res = await fetch(`${BASE}/games/${id}`, { headers: bdlHeaders() })
  if (!res.ok) throw new Error(`BDL API ${res.status}: ${await res.text()}`)
  const json = await res.json() as { data: BDLGame }
  return json.data
}

// ─── Current season ───────────────────────────────────────────────────────────
// BDL uses the year a season *starts*: 2025 = the 2025-26 season.
// We fetch the two most recent seasons so there's always something to show
// even if BDL hasn't indexed the current season yet.

export const CURRENT_SEASON = 2025

// ─── Box Score ────────────────────────────────────────────────────────────────

export interface BoxScoreRow {
  player: string
  team: string // abbr
  min: string
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  fgPct: string
  fg3Pct: string
  to: number
}

const statsCache = new Map<number, BoxScoreRow[]>()

export async function fetchBoxScore(gameId: number): Promise<BoxScoreRow[]> {
  if (statsCache.has(gameId)) return statsCache.get(gameId)!

  const url = new URL(`${BASE}/stats`)
  url.searchParams.append('game_ids[]', String(gameId))
  url.searchParams.set('per_page', '100')

  const res = await fetch(url.toString(), { headers: bdlHeaders() })
  if (res.status === 401 || res.status === 403) throw new Error('BDL_UPGRADE_REQUIRED')
  if (!res.ok) throw new Error(`BDL stats ${res.status}`)
  const { data } = await res.json() as { data: BDLStat[] }

  const rows: BoxScoreRow[] = data
    .filter((s) => s.min && s.min !== '00' && s.min !== '0:00')
    .map((s) => ({
      player: `${s.player.first_name[0]}. ${s.player.last_name}`,
      team: normalizeBDLAbbr(s.team.abbreviation),
      min: s.min.includes(':') ? s.min.split(':')[0]! : s.min,
      pts: s.pts,
      reb: s.reb,
      ast: s.ast,
      stl: s.stl,
      blk: s.blk,
      fgPct: s.fga > 0 ? ((s.fg_pct ?? 0) * 100).toFixed(1) : '—',
      fg3Pct: s.fg3a > 0 ? ((s.fg3_pct ?? 0) * 100).toFixed(1) : '—',
      to: s.turnover,
    }))
    .sort((a, b) => b.pts - a.pts)

  statsCache.set(gameId, rows)
  return rows
}

// ─── Cache (in-memory + localStorage, 5-min TTL) ─────────────────────────────
// In-memory: survives filter changes within a session without re-fetching.
// localStorage: survives page refreshes — critical for staying under the
// BDL free-tier rate limit of 5 req/min.

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const memCache = new Map<string, Game[]>()

function lsGet(key: string): Game[] | null {
  try {
    const raw = localStorage.getItem(`bdl:${key}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: Game[]; ts: number }
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(`bdl:${key}`); return null }
    return data
  } catch { return null }
}

function lsSet(key: string, data: Game[]) {
  try { localStorage.setItem(`bdl:${key}`, JSON.stringify({ data, ts: Date.now() })) }
  catch { /* quota exceeded — ignore */ }
}

// In-flight deduplication: if the same key is already being fetched, reuse the promise
const inFlight = new Map<string, Promise<Game[]>>()

export function fetchGamesFromBDL(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
}): Promise<Game[]> {
  const todayStr = new Date().toISOString().slice(0, 10)
  const cacheKey = JSON.stringify({ type: params.type, team: params.team, _date: todayStr })

  if (memCache.has(cacheKey)) return Promise.resolve(memCache.get(cacheKey)!)
  const lsCached = lsGet(cacheKey)
  if (lsCached) { memCache.set(cacheKey, lsCached); return Promise.resolve(lsCached) }
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey)!

  const doFetch = async (): Promise<Game[]> => {
    const today = new Date()
    const fmt = (d: Date) => d.toISOString().slice(0, 10)

    // BDL paginates ascending by date with no reverse-sort option.
    // 3-day window = ~45 games max, all fit in per_page=100.
    // Team-filtered views widen to 14 days (a team plays every 2-3 days).
    const since = new Date(today)
    since.setDate(today.getDate() - (params.team ? 14 : 3))

    const bdlParams: BDLGamesParams = {
      start_date: fmt(since),
      end_date: fmt(today),
      per_page: 100,
    }

    if (params.type === 'playoffs' || params.type === 'finals') {
      bdlParams.postseason = true
    } else if (params.type === 'regular') {
      bdlParams.postseason = false
    }

    if (params.team) {
      const teamId = BDL_TEAM_IDS[params.team]
      if (teamId) bdlParams.team_ids = [teamId]
    }

    const { data } = await bdlFetchGames(bdlParams)
    console.debug(`[BDL] ${data.length} games (${fmt(since)} – ${fmt(today)})`)
    const games = data.map(bdlGameToGame)
    memCache.set(cacheKey, games)
    lsSet(cacheKey, games)
    return games
  }

  const promise = doFetch().finally(() => inFlight.delete(cacheKey))
  inFlight.set(cacheKey, promise)
  return promise
}
