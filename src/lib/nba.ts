/**
 * balldontlie.io API v1 client
 * Docs: https://www.balldontlie.io/api.html
 *
 * Free tier: authenticated requests, up to 60 req/min, 100 results/page.
 * The API key is exposed in the client bundle — acceptable for a prototype.
 * For production, proxy requests through your own API route.
 */

import type { BDLGame, Game } from './types'
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

export function bdlGameToGame(g: BDLGame): Game {
  const homeAbbr = normalizeBDLAbbr(g.home_team.abbreviation)
  const awayAbbr = normalizeBDLAbbr(g.visitor_team.abbreviation)

  // BDL marks postseason games with postseason=true; Finals games don't get
  // a separate flag — we infer from status string when available.
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
    status: g.status,
    // Community stats — these come from our DB once wired up.
    // For now, default to 0 so real games still render.
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
const FALLBACK_SEASON = 2024

// ─── Simple in-memory cache (survives filter changes in the same session) ─────

const cache = new Map<string, Game[]>()

export async function fetchGamesFromBDL(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
  per_page?: number
}): Promise<Game[]> {
  const cacheKey = JSON.stringify(params)
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  // BDL paginates in ascending date order, so fetching by season gives us the
  // oldest games first. Instead, anchor to a recent date window so we always
  // get the last ~60 days of games at the top.
  const today = new Date()
  const since = new Date(today)
  since.setDate(today.getDate() - 60)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const bdlParams: BDLGamesParams = {
    start_date: fmt(since),
    end_date: fmt(today),
    per_page: params.per_page ?? 100,
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
  console.debug(`[BDL] fetched ${data.length} raw games (${fmt(since)} – ${fmt(today)})`)

  // Only show completed games; BDL also returns future/in-progress games
  const completed = data
    .filter((g) => g.status === 'Final' && (g.home_team_score > 0 || g.visitor_team_score > 0))
    .map(bdlGameToGame)

  console.debug(`[BDL] ${completed.length} completed games after filter`)
  cache.set(cacheKey, completed)
  return completed
}
