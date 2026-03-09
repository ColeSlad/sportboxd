import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import {
  getUserByUsername,
  getReviewsForUser,
  MOCK_USERS,
  buildActivityFeed,
} from '~/lib/mock-data'

// ─── Get profile ─────────────────────────────────────────────────────────────
// TODO: Replace with:
//   return db.user.findUnique({
//     where: { username: data.username },
//     include: { _count: { select: { reviews: true } } },
//   })

export const getProfile = createServerFn({ method: 'GET' })
  .validator(z.object({ username: z.string() }))
  .handler(async ({ data }) => {
    const user = getUserByUsername(data.username)
    if (!user) throw new Error(`User @${data.username} not found`)
    const reviews = getReviewsForUser(user.id)
    return { user, reviews }
  })

// ─── Activity feed ───────────────────────────────────────────────────────────
// TODO: Replace with:
//   const follows = await db.follow.findMany({ where: { followerId: session.user.id } })
//   const followingIds = follows.map(f => f.followingId)
//   return db.review.findMany({
//     where: { userId: { in: followingIds } },
//     include: { user: true },
//     orderBy: { createdAt: 'desc' },
//     take: 20,
//   })

export const getFeed = createServerFn({ method: 'GET' })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const me = MOCK_USERS.find((u) => u.id === data.userId)
    if (!me) return []
    return buildActivityFeed(me.following)
  })

// ─── Follow / unfollow ───────────────────────────────────────────────────────
// TODO: Replace with:
//   await db.follow.upsert / delete

export const toggleFollow = createServerFn({ method: 'POST' })
  .validator(z.object({ targetUserId: z.string(), follow: z.boolean() }))
  .handler(async ({ data }) => {
    console.log('[toggleFollow] stub:', data)
    return { following: data.follow }
  })
