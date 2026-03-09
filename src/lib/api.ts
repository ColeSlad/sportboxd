/**
 * Client-side data access layer (replaces TanStack Start server functions).
 *
 * Currently backed by mock data. To connect real backends:
 *   - Games/box scores: balldontlie.io API  →  src/lib/nba.ts
 *   - Reviews/users: your DB via an API route (Next.js, Hono, Express, etc.)
 *   - Play-by-play: nba.com CDN or SportRadar
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
import type { Game } from './types'

// ─── Games ──────────────────────────────────────────────────────────────────

export async function listGames(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
  search?: string
  sort?: 'date' | 'rating' | 'reviews'
}): Promise<Game[]> {
  let games = [...MOCK_GAMES]

  const type = params.type ?? 'all'
  if (type === 'playoffs') games = games.filter((g) => g.type === 'Playoffs')
  else if (type === 'finals') games = games.filter((g) => g.type === 'Finals')
  else if (type === 'regular') games = games.filter((g) => g.type === 'Regular Season')
  else if (type === 'ot') games = games.filter((g) => g.overtime)

  if (params.team) {
    games = games.filter((g) => g.homeTeam === params.team || g.awayTeam === params.team)
  }

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
  const byRating = [...MOCK_GAMES].sort((a, b) => b.avgRating - a.avgRating)
  return {
    featured: byRating.slice(0, 3),
    trending: byRating.slice(0, 5),
    recent: [...MOCK_GAMES]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
  }
}

export async function getGameDetail(id: number) {
  const game = getGame(id)
  if (!game) throw new Error(`Game ${id} not found`)
  return { game, plays: getPlaysForGame(id) }
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function fetchGameReviews(gameId: number) {
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
  const user = getUserByUsername(username)
  if (!user) throw new Error(`User @${username} not found`)
  return { user, reviews: getReviewsForUser(user.id) }
}

export async function fetchFeed(userId: string) {
  const me = MOCK_USERS.find((u) => u.id === userId)
  if (!me) return []
  return buildActivityFeed(me.following)
}

export async function followUser(_targetId: string, _follow: boolean) {
  // TODO: POST /api/follow
  console.log('[followUser] stub')
}
