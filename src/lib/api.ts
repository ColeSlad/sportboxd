/**
 * Client-side data access layer.
 *
 * Games/box scores: balldontlie.io API  →  src/lib/nba.ts
 * Reviews/users:   Supabase (profiles + reviews + follows tables)
 * Play-by-play:    still mock — SportRadar or nba.com CDN for real data
 */

import { getPlaysForGame } from './mock-data'
import { fetchGamesFromBDL, bdlFetchGame, bdlGameToGame } from './nba'
import { supabase, getUserColor } from './supabase'
import type { ActivityItem, AppUser, Game, Review } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function profileToAppUser(profile: Record<string, unknown>): AppUser {
  const p = Array.isArray(profile) ? profile[0] : profile
  return {
    id: p.id as string,
    username: p.username as string,
    displayName: p.display_name as string,
    avatarUrl: (p.avatar_url as string | null) ?? null,
    avatarColor: getUserColor(p.id as string),
    bio: (p.bio as string | null) ?? null,
    favoriteTeams: (p.favorite_teams as string[]) ?? [],
    following: [],
    followers: [],
    gamesLogged: 0,
    reviewCount: 0,
    joinedDate: p.created_at as string,
  }
}

function dbRowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    gameId: row.game_id as number,
    userId: row.user_id as string,
    rating: row.rating as number,
    text: (row.text as string | null) ?? null,
    createdAt: row.created_at as string,
    likes: 0,
    playHighlight: null,
    user: profileToAppUser(row.profiles as Record<string, unknown>),
  }
}

// ─── Games ──────────────────────────────────────────────────────────────────

export async function listGames(params: {
  type?: 'all' | 'playoffs' | 'finals' | 'regular' | 'ot'
  team?: string
  search?: string
  sort?: 'date' | 'rating' | 'reviews'
}): Promise<Game[]> {
  let games = await fetchGamesFromBDL({ type: params.type, team: params.team })

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
  const all = await fetchGamesFromBDL({})
  const byDate = (arr: Game[]) =>
    [...arr].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const playoff = all.filter((g) => g.type !== 'Regular Season')
  const regular = all.filter((g) => g.type === 'Regular Season')

  const featured = playoff.length > 0 ? byDate(playoff).slice(0, 3) : byDate(regular).slice(0, 3)
  const trending = byDate(all).slice(0, 5)
  const recent = byDate(regular).slice(0, 4)

  return { featured, trending, recent }
}

export async function getGameDetail(id: number) {
  const bdlGame = await bdlFetchGame(id)
  const game = bdlGameToGame(bdlGame)
  return { game, plays: getPlaysForGame(id) }
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function fetchGameReviews(gameId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(*)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchGameReviews]', error.message)
    return []
  }
  return (data ?? []).map(dbRowToReview)
}

export async function submitReview(data: {
  gameId: number
  rating: number
  text?: string
}): Promise<Review> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data: row, error } = await supabase
    .from('reviews')
    .upsert(
      {
        game_id: data.gameId,
        user_id: session.user.id,
        rating: data.rating,
        text: data.text ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'game_id,user_id' },
    )
    .select('*, profiles(*)')
    .single()

  if (error) throw error
  return dbRowToReview(row as Record<string, unknown>)
}

export async function submitPlayRating(data: {
  gameId: number
  playId: string
  rating: number
  note?: string
}) {
  // TODO: upsert into play_ratings table
  console.log('[submitPlayRating] stub — wire to Supabase:', data)
  return { id: `pr-${Date.now()}`, ...data, userId: 'anon', note: data.note ?? null }
}

export async function toggleLike(reviewId: string) {
  // TODO: upsert/delete from review_likes table
  console.log('[toggleLike] stub:', reviewId)
  return { liked: true }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function fetchProfile(username: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) throw new Error(`User @${username} not found`)

  const [{ data: reviewRows }, { data: followingRows }, { data: followerRows }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase.from('follows').select('following_id').eq('follower_id', profile.id),
    supabase.from('follows').select('follower_id').eq('following_id', profile.id),
  ])

  const user: AppUser = {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url ?? null,
    avatarColor: getUserColor(profile.id),
    bio: profile.bio ?? null,
    favoriteTeams: profile.favorite_teams ?? [],
    following: (followingRows ?? []).map((r: { following_id: string }) => r.following_id),
    followers: (followerRows ?? []).map((r: { follower_id: string }) => r.follower_id),
    gamesLogged: reviewRows?.length ?? 0,
    reviewCount: reviewRows?.length ?? 0,
    joinedDate: profile.created_at,
  }

  const reviews: Review[] = (reviewRows ?? []).map(dbRowToReview)
  return { user, reviews }
}

export async function updateProfile(data: {
  displayName: string
  bio: string
  favoriteTeams: string[]
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.displayName.trim() || session.user.email?.split('@')[0],
      bio: data.bio.trim() || null,
      favorite_teams: data.favoriteTeams,
    })
    .eq('id', session.user.id)

  if (error) throw error
}

export async function fetchSuggestedUsers(excludeId: string): Promise<AppUser[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', excludeId)
    .limit(5)

  return (data ?? []).map(profileToAppUser)
}

export async function fetchFeed(userId: string): Promise<ActivityItem[]> {
  const { data: followingRows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (!followingRows?.length) return []

  const followingIds = followingRows.map((r: { following_id: string }) => r.following_id)

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('*, profiles(*)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!reviewRows?.length) return []

  // Fetch unique games from BDL (uses localStorage cache — free after first load)
  const gameIds = [...new Set(reviewRows.map((r: { game_id: number }) => r.game_id))]
  const gameMap = new Map<number, Game>()
  await Promise.all(
    gameIds.map(async (id) => {
      try {
        gameMap.set(id, bdlGameToGame(await bdlFetchGame(id)))
      } catch {
        // Game not available — skip
      }
    }),
  )

  return reviewRows
    .filter((r: { game_id: number }) => gameMap.has(r.game_id))
    .map((r: Record<string, unknown>): ActivityItem => ({
      id: r.id as string,
      userId: r.user_id as string,
      type: 'review',
      gameId: r.game_id as number,
      rating: r.rating as number,
      excerpt: (r.text as string | undefined) ?? undefined,
      time: r.created_at as string,
      user: profileToAppUser(r.profiles as Record<string, unknown>),
      game: gameMap.get(r.game_id as number)!,
    }))
}

export async function followUser(targetId: string, follow: boolean) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  if (follow) {
    await supabase
      .from('follows')
      .upsert({ follower_id: session.user.id, following_id: targetId })
  } else {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', targetId)
  }
}
