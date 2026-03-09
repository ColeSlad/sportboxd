import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { MOCK_GAMES, getGame, getPlaysForGame } from '~/lib/mock-data'
import type { Game } from '~/lib/types'

// ─── List games ─────────────────────────────────────────────────────────────
// TODO: Replace mock with:
//   const { data } = await fetchGames({ seasons: [2023], postseason: params.postseason })
//   Then enrich with community stats from db.review.groupBy({ by: ['gameId'] })

export const listGames = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      type: z.enum(['all', 'playoffs', 'finals', 'regular', 'ot']).default('all'),
      team: z.string().optional(),
      search: z.string().optional(),
      sort: z.enum(['date', 'rating', 'reviews']).default('date'),
    }),
  )
  .handler(async ({ data }) => {
    let games: Game[] = MOCK_GAMES

    if (data.type === 'playoffs') games = games.filter((g) => g.type === 'Playoffs')
    else if (data.type === 'finals') games = games.filter((g) => g.type === 'Finals')
    else if (data.type === 'regular') games = games.filter((g) => g.type === 'Regular Season')
    else if (data.type === 'ot') games = games.filter((g) => g.overtime)

    if (data.team) {
      games = games.filter(
        (g) => g.homeTeam === data.team || g.awayTeam === data.team,
      )
    }

    if (data.search) {
      const q = data.search.toLowerCase()
      games = games.filter(
        (g) =>
          g.homeTeam.toLowerCase().includes(q) ||
          g.awayTeam.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.gameLabel ?? '').toLowerCase().includes(q),
      )
    }

    if (data.sort === 'rating') games = [...games].sort((a, b) => b.avgRating - a.avgRating)
    else if (data.sort === 'reviews') games = [...games].sort((a, b) => b.reviewCount - a.reviewCount)
    else games = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return games
  })

// ─── Single game + plays ─────────────────────────────────────────────────────
// TODO: Replace mock with:
//   const game = await fetchGame(id)      ← balldontlie.io
//   const plays = await fetchPlayByPlay(nbaGameId)  ← nba.com CDN or SportRadar

export const getGameDetail = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const game = getGame(data.id)
    if (!game) throw new Error(`Game ${data.id} not found`)
    const plays = getPlaysForGame(data.id)
    return { game, plays }
  })

// ─── Featured / trending ────────────────────────────────────────────────────
export const getFeaturedGames = createServerFn({ method: 'GET' }).handler(async () => {
  // TODO: Query db for games with highest review counts / avg ratings this week
  const byRating = [...MOCK_GAMES].sort((a, b) => b.avgRating - a.avgRating)
  return {
    featured: byRating.slice(0, 3),
    trending: byRating.slice(0, 5),
    recent: [...MOCK_GAMES]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
  }
})
