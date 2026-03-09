/**
 * Client-side data access layer.
 *
 * Games/box scores: balldontlie.io API  →  src/lib/nba.ts
 * Reviews/users:   still mock — wire to your DB via an API route when ready
 * Play-by-play:    still mock — SportRadar or nba.com CDN for real data
 */

import {
  MOCK_GAMES,
  MOCK_USERS,
  getGame,
  getPlaysForGame,
  getReviewsForGame,
  getReviewsForUser,
  getUserByUsername,
  buildActivityFeed,
} from './mock-data'
import { fetchGamesFromBDL, bdlFetchGame, bdlGameToGame, CURRENT_SEASON } from './nba'
import type { Game } from './types'

const HAS_BDL_KEY = Boolean(import.meta.env.VITE_BALLDONTLIE_API_KEY)

// ─── Games ──────────────────────────────────────────────────────────────────

export async function listGames(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
  search?: string
  sort?: 'date' | 'rating' | 'reviews'
}): Promise<Game[]> {
  let games: Game[]

  if (HAS_BDL_KEY) {
    try {
      games = await fetchGamesFromBDL({ type: params.type, team: params.team, per_page: 50 })
    } catch (err) {
      console.warn('[listGames] BDL fetch failed, falling back to mock data:', err)
      games = [...MOCK_GAMES]
    }
  } else {
    games = [...MOCK_GAMES]
  }

  // OT filter — BDL doesn't support this server-side, apply client-side
  if (params.type === 'ot') games = games.filter((g) => g.overtime)

  if (params.search) {
    const q = params.search.toLowerCase()
    games = games.filter(
      (g) =>
        g.homeTeam.toLowerCase().includes(q) ||
        g.awayTeam.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        (g.gameLabel ?? '').toLowerCase().includes(q),
    )
  }

  const sort = params.sort ?? 'date'
  if (sort === 'rating') games.sort((a, b) => b.avgRating - a.avgRating)
  else if (sort === 'reviews') games.sort((a, b) => b.reviewCount - a.reviewCount)
  else games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return games
}

export async function getFeaturedGames() {
  if (!HAS_BDL_KEY) {
    const byRating = [...MOCK_GAMES].sort((a, b) => b.avgRating - a.avgRating)
    return {
      featured: byRating.slice(0, 3),
      trending: byRating.slice(0, 5),
      recent: [...MOCK_GAMES]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4),
    }
  }

  try {
    // Fetch recent completed games — postseason first for "featured", then regular season
    const [playoff, regular] = await Promise.all([
      fetchGamesFromBDL({ type: 'playoffs', per_page: 10 }),
      fetchGamesFromBDL({ type: 'regular', per_page: 40 }),
    ])

    const byDate = (arr: Game[]) =>
      [...arr].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Featured: latest playoff games if any exist this season, else recent regular season
    const featured = playoff.length > 0 ? byDate(playoff).slice(0, 3) : byDate(regular).slice(0, 3)
    // Trending: a mix — most recent 5 from either bucket
    const trending = byDate([...playoff, ...regular]).slice(0, 5)
    const recent = byDate(regular).slice(0, 4)

    return { featured, trending, recent }
  } catch (err) {
    console.warn('[getFeaturedGames] BDL fetch failed, falling back to mock data:', err)
    const byRating = [...MOCK_GAMES].sort((a, b) => b.avgRating - a.avgRating)
    return {
      featured: byRating.slice(0, 3),
      trending: byRating.slice(0, 5),
      recent: [...MOCK_GAMES]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4),
    }
  }
}

export async function getGameDetail(id: number) {
  let game: Game | undefined

  if (HAS_BDL_KEY) {
    try {
      const bdlGame = await bdlFetchGame(id)
      game = bdlGameToGame(bdlGame)
    } catch (err) {
      console.warn(`[getGameDetail] BDL fetch failed for game ${id}, trying mock:`, err)
    }
  }

  // Fall back to mock if BDL failed or key not set
  if (!game) {
    game = getGame(id)
    if (!game) throw new Error(`Game ${id} not found`)
  }

  return { game, plays: getPlaysForGame(id) }
}

// ─── Season helper ────────────────────────────────────────────────────────────

export { CURRENT_SEASON }

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function fetchGameReviews(gameId: number) {
  // TODO: GET /api/reviews?gameId=X  →  db.review.findMany({ where: { gameId } })
  return getReviewsForGame(gameId)
}

export async function submitReview(data: { gameId: number; rating: number; text?: string }) {
  // TODO: POST /api/reviews  →  db.review.upsert(...)
  console.log('[submitReview] stub — wire to your API:', data)
  return {
    id: `r-${Date.now()}`,
    ...data,
    userId: 'u1',
    text: data.text ?? null,
    createdAt: new Date().toISOString(),
    likes: 0,
    playHighlight: null,
    user: MOCK_USERS[0]!,
  }
}

export async function submitPlayRating(data: {
  gameId: number
  playId: string
  rating: number
  note?: string
}) {
  // TODO: POST /api/play-ratings  →  db.playRating.upsert(...)
  console.log('[submitPlayRating] stub — wire to your API:', data)
  return { id: `pr-${Date.now()}`, ...data, userId: 'u1', note: data.note ?? null }
}

export async function toggleLike(reviewId: string) {
  // TODO: POST /api/reviews/:id/like
  console.log('[toggleLike] stub:', reviewId)
  return { liked: true }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function fetchProfile(username: string) {
  // TODO: GET /api/users/:username  →  db.user.findUnique({ where: { username } })
  const user = getUserByUsername(username)
  if (!user) throw new Error(`User @${username} not found`)
  return { user, reviews: getReviewsForUser(user.id) }
}

export async function fetchFeed(userId: string) {
  // TODO: GET /api/feed  →  db query on reviews + play_ratings joined to users
  const me = MOCK_USERS.find((u) => u.id === userId)
  if (!me) return []
  return buildActivityFeed(me.following)
}

export async function followUser(_targetId: string, _follow: boolean) {
  // TODO: POST /api/follow
  console.log('[followUser] stub')
}
