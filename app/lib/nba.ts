/**
 * balldontlie.io API client
 * Docs: https://www.balldontlie.io/api.html
 * Free tier: 60 req/min · All seasons + postseason · Box scores included
 *
 * NOTE: Play-by-play is NOT available on balldontlie.io.
 * Options for real play-by-play:
 *   A) nba.com CDN (unofficial, free, fragile):
 *      https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_<nbaGameId>.json
 *   B) SportRadar NBA API (licensed, $$$): https://sportradar.com
 *   C) Keep mock plays in mock-data.ts
 */

import type { BDLGame, BDLStat, BDLTeam } from './types'

const BASE = 'https://api.balldontlie.io/v1'

function headers() {
  const key = process.env['BALLDONTLIE_API_KEY']
  if (!key) throw new Error('Missing BALLDONTLIE_API_KEY')
  return { Authorization: key }
}

interface GamesParams {
  dates?: string[]          // ['2024-06-17']
  seasons?: number[]        // [2023]
  teamIds?: number[]
  postseason?: boolean
  perPage?: number
  cursor?: number
}

export async function fetchGames(params: GamesParams = {}): Promise<{
  data: BDLGame[]
  meta: { next_cursor?: number; per_page: number }
}> {
  const qs = new URLSearchParams()
  params.dates?.forEach((d) => qs.append('dates[]', d))
  params.seasons?.forEach((s) => qs.append('seasons[]', String(s)))
  params.teamIds?.forEach((id) => qs.append('team_ids[]', String(id)))
  if (params.postseason != null) qs.set('postseason', String(params.postseason))
  qs.set('per_page', String(params.perPage ?? 25))
  if (params.cursor) qs.set('cursor', String(params.cursor))

  const res = await fetch(`${BASE}/games?${qs}`, {
    headers: headers(),
    // TanStack Start / Vinxi respects Next-style fetch options:
    // next: { revalidate: 300 }  ← cache 5 min on Vercel edge
  })
  if (!res.ok) throw new Error(`BDL /games failed: ${res.status}`)
  return res.json() as Promise<{ data: BDLGame[]; meta: { next_cursor?: number; per_page: number } }>
}

export async function fetchGame(id: number): Promise<BDLGame> {
  const res = await fetch(`${BASE}/games/${id}`, { headers: headers() })
  if (!res.ok) throw new Error(`BDL /games/${id} failed: ${res.status}`)
  const json = await res.json() as { data: BDLGame }
  return json.data
}

export async function fetchBoxScore(gameId: number): Promise<BDLStat[]> {
  // balldontlie.io returns stats per player per game
  const res = await fetch(`${BASE}/stats?game_ids[]=${gameId}&per_page=50`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`BDL /stats failed: ${res.status}`)
  const json = await res.json() as { data: BDLStat[] }
  return json.data
}

export async function fetchTeams(): Promise<BDLTeam[]> {
  const res = await fetch(`${BASE}/teams?per_page=30`, { headers: headers() })
  if (!res.ok) throw new Error(`BDL /teams failed: ${res.status}`)
  const json = await res.json() as { data: BDLTeam[] }
  return json.data
}

export async function fetchPlayByPlay(nbaGameId: string) {
  // Unofficial nba.com CDN — available during live games and shortly after.
  // For historical games use mock data or a licensed provider.
  const res = await fetch(
    `https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_${nbaGameId}.json`,
  )
  if (!res.ok) return null
  return res.json()
}
