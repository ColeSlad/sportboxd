/**
 * Client-side data access layer.
 *
 * Games/box scores: balldontlie.io API  →  src/lib/nba.ts
 * Reviews/users:   still mock — wire to your DB via an API route when ready
 * Play-by-play:    still mock — SportRadar or nba.com CDN for real data
 */

import {
  MOCK_USERS,
  getPlaysForGame,
  getReviewsForGame,
  getReviewsForUser,
  getUserByUsername,
  buildActivityFeed,
} from './mock-data'
import { fetchGamesFromBDL, bdlFetchGame, bdlGameToGame } from './nba'
import type { Game } from './types'

// ─── Games ──────────────────────────────────────────────────────────────────

export async function listGames(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
  search?: string
  sort?: 'date' | 'rating' | 'reviews'
}): Promise<Game[]> {
  let games = await fetchGamesFromBDL({ type: params.type, team: params.team })

  // OT filter — BDL doesn't expose this server-side, apply client-side
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
  const [playoff, regular] = await Promise.all([
    fetchGamesFromBDL({ type: 'playoffs' }),
    fetchGamesFromBDL({ type: 'regular' }),
  ])

  const byDate = (arr: Game[]) =>
    [...arr].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const featured = playoff.length > 0 ? byDate(playoff).slice(0, 3) : byDate(regular).slice(0, 3)
  const trending = byDate([...playoff, ...regular]).slice(0, 5)
  const recent = byDate(regular).slice(0, 4)

  return { featured, trending, recent }
}

export async function getGameDetail(id: number) {
  const bdlGame = await bdlFetchGame(id)
  const game = bdlGameToGame(bdlGame)
  return { game, plays: getPlaysForGame(id) }
}

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
