import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { getReviewsForGame } from '~/lib/mock-data'

// ─── Get reviews for a game ──────────────────────────────────────────────────
// TODO: Replace with:
//   return db.review.findMany({
//     where: { gameId: data.gameId },
//     include: { user: true, likes: true },
//     orderBy: { createdAt: 'desc' },
//   })

export const getGameReviews = createServerFn({ method: 'GET' })
  .validator(z.object({ gameId: z.number() }))
  .handler(async ({ data }) => {
    return getReviewsForGame(data.gameId)
  })

// ─── Create / update a review ────────────────────────────────────────────────
// TODO: Replace mock with:
//   const session = await getSession()  ← Supabase / Better Auth
//   return db.review.upsert({
//     where: { gameId_userId: { gameId: data.gameId, userId: session.user.id } },
//     create: { ...data, userId: session.user.id },
//     update: { rating: data.rating, text: data.text },
//   })

export const upsertReview = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      gameId: z.number(),
      rating: z.number().min(1).max(5),
      text: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    // Stub: returns the submitted data as if it were saved
    console.log('[upsertReview] stub — connect DB to persist:', data)
    return {
      id: `r-${Date.now()}`,
      gameId: data.gameId,
      userId: 'u1', // TODO: real session user
      rating: data.rating,
      text: data.text ?? null,
      createdAt: new Date().toISOString(),
      likes: 0,
      playHighlight: null,
    }
  })

// ─── Like a review ───────────────────────────────────────────────────────────
// TODO: Replace with:
//   await db.reviewLike.upsert({
//     where: { reviewId_userId: { reviewId: data.reviewId, userId: session.user.id } },
//     create: { reviewId: data.reviewId, userId: session.user.id },
//     update: {},
//   })

export const toggleReviewLike = createServerFn({ method: 'POST' })
  .validator(z.object({ reviewId: z.string() }))
  .handler(async ({ data }) => {
    console.log('[toggleReviewLike] stub:', data.reviewId)
    return { liked: true }
  })
