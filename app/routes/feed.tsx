import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { getFeed } from '~/server/users'
import { UserAvatar } from '~/components/UserAvatar'
import { StarRating } from '~/components/StarRating'
import { TeamLogo } from '~/components/TeamLogo'
import { getTeam } from '~/lib/teams'
import { formatRelativeTime, formatNumber } from '~/lib/utils'
import { MOCK_USERS } from '~/lib/mock-data'
import type { ActivityItem, AppUser } from '~/lib/types'

// Current user — TODO: real auth session
const ME = MOCK_USERS[0]!

export const Route = createFileRoute('/feed')({
  loader: async () => {
    const feed = await getFeed({ data: { userId: ME.id } })
    // Suggested: users not yet followed
    const suggested = MOCK_USERS.filter(
      (u) => u.id !== ME.id && !ME.following.includes(u.id),
    )
    return { feed, suggested }
  },
  component: FeedPage,
})

type FeedFilter = 'following' | 'all'

function FeedPage() {
  const { feed, suggested } = Route.useLoaderData()
  const [filter, setFilter] = useState<FeedFilter>('following')

  // "All" shows a superset of the following feed (in a real app this is a separate query)
  const allActivity: ActivityItem[] = feed // already filtered to following in server fn

  const displayed = filter === 'following' ? allActivity : allActivity

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      <div className="py-8">
        <h1 className="font-display text-[2.5rem] leading-none mb-1">Activity</h1>
        <p className="text-gray-600 text-sm">
          What the people you follow are watching and rating.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-border mb-5">
        <div className="flex gap-6">
          {(['following', 'all'] as FeedFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab ${filter === f ? 'tab-active' : ''} capitalize`}
              style={{ background: 'none', border: 'none' }}
            >
              {f === 'following' ? 'Following' : 'All Activity'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Feed */}
        <div className="flex-1 min-w-0">
          {displayed.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div className="flex flex-col gap-3">
              {displayed.map((item) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Suggested sidebar */}
        {suggested.length > 0 && (
          <aside className="lg:w-64 flex-shrink-0">
            <h3 className="font-condensed font-bold tracking-widest uppercase text-gray-500 text-[0.8rem] mb-3">
              Suggested
            </h3>
            <div className="flex flex-col gap-2">
              {suggested.map((u) => (
                <SuggestedUser key={u.id} user={u} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function FeedItem({ item }: { item: ActivityItem }) {
  const home = getTeam(item.game.homeTeam)
  const away = getTeam(item.game.awayTeam)

  const typeLabel =
    item.type === 'review'
      ? 'reviewed'
      : item.type === 'logged'
        ? 'logged'
        : 'rated a play in'

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Link to="/profile/$username" params={{ username: item.user.username }}>
          <UserAvatar user={item.user} size={38} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Action line */}
          <div className="text-[0.85rem] mb-1.5">
            <Link
              to="/profile/$username"
              params={{ username: item.user.username }}
              className="font-semibold hover:text-accent transition-colors"
            >
              {item.user.displayName}
            </Link>
            <span className="text-gray-600"> {typeLabel} </span>
            <Link
              to="/games/$gameId"
              params={{ gameId: String(item.game.id) }}
              className="text-accent font-medium hover:brightness-125 transition-all"
            >
              {away.name} @ {home.name}
            </Link>
          </div>

          {/* Rating */}
          {item.rating != null && (
            <div className="mb-1.5">
              <StarRating value={item.rating} readOnly size="sm" />
            </div>
          )}

          {/* Excerpt */}
          {item.excerpt && (
            <p className="text-[0.82rem] text-gray-500 leading-relaxed line-clamp-2 mb-2">
              "{item.excerpt}"
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3">
            <span className="text-[0.7rem] text-gray-700">
              {formatRelativeTime(item.time)}
            </span>

            {/* Inline score pill */}
            <div className="flex items-center gap-1.5 bg-bg-card3 rounded-full px-2 py-0.5">
              <TeamLogo abbr={item.game.homeTeam} size={14} />
              <span className="font-condensed font-bold text-[0.68rem] text-gray-500">
                {item.game.homeScore}–{item.game.awayScore}
              </span>
              <TeamLogo abbr={item.game.awayTeam} size={14} />
            </div>

            {/* Game type badge */}
            {item.game.type !== 'Regular Season' && (
              <span className="badge badge-green text-[0.55rem]">{item.game.type}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuggestedUser({ user }: { user: AppUser }) {
  const [following, setFollowing] = useState(false)

  return (
    <div className="card p-3 flex items-center gap-3">
      <Link to="/profile/$username" params={{ username: user.username }}>
        <UserAvatar user={user} size={36} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to="/profile/$username"
          params={{ username: user.username }}
          className="block font-semibold text-[0.85rem] hover:text-accent transition-colors truncate"
        >
          {user.displayName}
        </Link>
        <div className="text-[0.72rem] text-gray-600">
          {formatNumber(user.gamesLogged)} games · {formatNumber(user.reviewCount)} reviews
        </div>
      </div>
      <button
        className={`btn btn-sm flex-shrink-0 ${following ? 'btn-ghost' : 'btn-primary'}`}
        onClick={() => setFollowing((f) => !f)}
      >
        {following ? '✓' : '+'}
      </button>
    </div>
  )
}

function EmptyFeed() {
  return (
    <div className="text-center py-20 text-gray-600">
      <div className="text-4xl mb-4">👀</div>
      <p className="text-sm mb-4">
        No activity yet. Follow other users to see what they're logging.
      </p>
      <Link to="/browse" className="btn btn-primary btn-sm">
        Browse Games
      </Link>
    </div>
  )
}
