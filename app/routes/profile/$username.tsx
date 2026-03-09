import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { getProfile } from '~/server/users'
import { toggleFollow } from '~/server/users'
import { getTeam } from '~/lib/teams'
import { formatDate, formatNumber } from '~/lib/utils'
import { TeamLogo } from '~/components/TeamLogo'
import { UserAvatar } from '~/components/UserAvatar'
import { StarRating } from '~/components/StarRating'
import { GameCard } from '~/components/GameCard'
import { MOCK_GAMES } from '~/lib/mock-data'
import { MOCK_USERS } from '~/lib/mock-data'
import type { Review } from '~/lib/types'

// Current logged-in user — TODO: replace with real auth session
const ME = MOCK_USERS[0]!

export const Route = createFileRoute('/profile/$username')({
  loader: async ({ params }) => {
    const data = await getProfile({ data: { username: params.username } })
    if (!data) throw notFound()
    return data
  },
  component: ProfilePage,
  notFoundComponent: () => (
    <div className="text-center py-24 text-gray-500">User not found.</div>
  ),
})

type ProfileTab = 'games' | 'reviews'

function ProfilePage() {
  const { user, reviews } = Route.useLoaderData()
  const isMe = user.id === ME.id
  const [following, setFollowing] = useState(ME.following.includes(user.id))
  const [tab, setTab] = useState<ProfileTab>('games')

  // Games the user has reviewed
  const loggedGames = reviews
    .map((r) => MOCK_GAMES.find((g) => g.id === r.gameId))
    .filter(Boolean)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  async function handleFollow() {
    const next = !following
    setFollowing(next)
    await toggleFollow({ data: { targetUserId: user.id, follow: next } })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* Profile header */}
      <div className="pt-8 pb-6 flex gap-5 items-start flex-wrap">
        <UserAvatar user={user} size={76} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
            <div>
              <h1 className="text-[1.5rem] font-bold">{user.displayName}</h1>
              <p className="text-gray-500 text-[0.85rem]">@{user.username}</p>
            </div>
            {!isMe && (
              <button
                className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`}
                onClick={handleFollow}
              >
                {following ? 'Following' : '+ Follow'}
              </button>
            )}
            {isMe && (
              <button className="btn btn-ghost btn-sm">Edit Profile</button>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-500 text-[0.85rem] leading-relaxed mb-3 max-w-sm">
              {user.bio}
            </p>
          )}

          {/* Favorite teams */}
          <div className="flex gap-2 flex-wrap">
            {user.favoriteTeams.map((abbr) => {
              const team = getTeam(abbr)
              return (
                <Link
                  key={abbr}
                  to="/browse"
                  search={{ team: abbr, type: 'all', sort: 'date' }}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <TeamLogo abbr={abbr} size={22} />
                  <span className="text-[0.75rem] text-gray-500 font-condensed font-semibold">
                    {team.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {[
          { label: 'Games', value: formatNumber(user.gamesLogged) },
          { label: 'Reviews', value: formatNumber(user.reviewCount) },
          { label: 'Avg Rating', value: avgRating },
          { label: 'Following', value: user.following.length },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <div className="font-condensed font-bold text-accent text-[1.3rem]">{s.value}</div>
            <div className="font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-5">
        <div className="flex gap-6">
          {(
            [
              { id: 'games', label: `Games (${loggedGames.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ] as { id: ProfileTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
              style={{ background: 'none', border: 'none' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'games' && (
        <div className="fade-in flex flex-col gap-3">
          {loggedGames.length === 0 ? (
            <EmptyState text="No logged games yet." />
          ) : (
            loggedGames.map(
              (g) => g && <GameCard key={g.id} game={g} />,
            )
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="fade-in flex flex-col gap-3">
          {reviews.length === 0 ? (
            <EmptyState text="No reviews yet." />
          ) : (
            reviews.map((r) => <ProfileReviewRow key={r.id} review={r} />)
          )}
        </div>
      )}
    </div>
  )
}

function ProfileReviewRow({ review }: { review: Review }) {
  const game = MOCK_GAMES.find((g) => g.id === review.gameId)
  if (!game) return null
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
        <Link
          to="/games/$gameId"
          params={{ gameId: String(game.id) }}
          className="text-accent font-semibold text-[0.9rem] hover:brightness-125 transition-all"
        >
          {game.awayTeam} @ {game.homeTeam}
        </Link>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>
      <div className="score-num text-[1.05rem] text-gray-600 mb-2">
        {game.awayScore}–{game.homeScore}
        <span className="font-body font-normal text-[0.72rem] ml-2">{formatDate(game.date)}</span>
      </div>
      {review.text && (
        <p className="text-[0.83rem] text-gray-500 leading-relaxed">{review.text}</p>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-gray-600">
      <div className="text-3xl mb-3">🏀</div>
      <p className="text-sm">{text}</p>
    </div>
  )
}
