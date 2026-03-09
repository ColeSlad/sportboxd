import { createServerFn } from '@tanstack/start'
import { z } from 'zod'

// ─── Rate a play ─────────────────────────────────────────────────────────────
// TODO: Replace with:
//   return db.playRating.upsert({
//     where: { playId_userId: { playId: data.playId, userId: session.user.id } },
//     create: { ...data, userId: session.user.id },
//     update: { rating: data.rating, note: data.note },
//   })

export const upsertPlayRating = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      gameId: z.number(),
      playId: z.string(),
      rating: z.number().min(1).max(5),
      note: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    console.log('[upsertPlayRating] stub — connect DB to persist:', data)
    return {
      id: `pr-${Date.now()}`,
      playId: data.playId,
      gameId: data.gameId,
      userId: 'u1', // TODO: real session user
      rating: data.rating,
      note: data.note ?? null,
    }
  })

// ─── Get my play ratings for a game ─────────────────────────────────────────
// TODO: Replace with:
//   return db.playRating.findMany({
//     where: { gameId: data.gameId, userId: session.user.id },
//   })

export const getMyPlayRatings = createServerFn({ method: 'GET' })
  .validator(z.object({ gameId: z.number() }))
  .handler(async ({ data }) => {
    // Stub: no persisted ratings yet
    console.log('[getMyPlayRatings] stub for game:', data.gameId)
    return [] as Array<{ playId: string; rating: number; note: string | null }>
  })
