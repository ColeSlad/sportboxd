import { createFileRoute, Link } from '@tanstack/react-router'
import { getFeaturedGames, fetchGameReviews } from '~/lib/api'
import { RouteError } from '~/components/RouteError'
import { HomePending } from '~/components/Skeletons'
import { GameCard } from '~/components/GameCard'
import { StarRating } from '~/components/StarRating'
import { UserAvatar } from '~/components/UserAvatar'
import { getTeam } from '~/lib/teams'
import { formatRelativeTime } from '~/lib/utils'
import type { Game, Review } from '~/lib/types'

export const Route = createFileRoute('/')({
  loader: async () => {
    const featured = await getFeaturedGames()
    // Build a map of all real games we already have from BDL
    const allGames = [...featured.featured, ...featured.trending, ...featured.recent]
    const gamesMap: Record<number, Game> = {}
    for (const g of allGames) gamesMap[g.id] = g
    // Fetch reviews for the trending games (already cached from BDL call above)
    const sampleIds = featured.trending.slice(0, 5).map((g) => g.id)
    const allReviews = await Promise.all(sampleIds.map((id) => fetchGameReviews(id)))
    const topReviews = allReviews
      .flat()
      .filter((r) => r.text) // only reviews with written text
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
    return { featured, topReviews, gamesMap }
  },
  component: HomePage,
  pendingComponent: HomePending,
  pendingMs: 300,
  errorComponent: ({ error, reset }) => <RouteError error={error as Error} reset={reset} />,
})

const COMMUNITY_STATS = [
  { label: 'Games Logged', value: '24,812' },
  { label: 'Reviews Written', value: '8,341' },
  { label: 'Play Ratings', value: '51,209' },
]

function HomePage() {
  const { featured, topReviews, gamesMap } = Route.useLoaderData()
  const season = featured.trending[0]?.season ?? ''
  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* Hero */}
      <div className="py-14 text-center">
        {season && <span className="badge badge-green mb-4 inline-flex">{season}</span>}
        <h1 className="font-display gradient-text text-[clamp(3rem,10vw,5.5rem)] leading-none mb-3">
          FIXTURE
        </h1>
        <p className="text-gray-500 text-base font-light tracking-wide">
          Rate every game. Log every play. Find your community.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-12">
        {COMMUNITY_STATS.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="font-display text-accent text-[1.8rem] leading-none">{s.value}</div>
            <div className="font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <Section title="Featured Games" href="/browse">
        <div className="flex flex-col gap-3">
          {featured.featured.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </Section>

      <Section title="Trending This Week">
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
          {featured.trending.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
        </div>
      </Section>

      <Section title="Top Reviews">
        <div className="flex flex-col gap-3">
          {topReviews.map((r) => <ReviewSnippet key={r.id} review={r} game={gamesMap[r.gameId]} />)}
        </div>
      </Section>

      <Section title="Recently Played" href="/browse">
        <div className="flex flex-col gap-3">
          {featured.recent.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="font-condensed font-bold tracking-widest uppercase text-gray-500 text-[0.85rem]">
          {title}
        </h2>
        {href && <Link to={href as '/browse'} className="btn btn-ghost btn-sm">See All</Link>}
      </div>
      {children}
    </section>
  )
}

function ReviewSnippet({ review, game }: { review: Review; game?: Game }) {
  const away = game ? getTeam(game.awayTeam) : null
  const home = game ? getTeam(game.homeTeam) : null
  const gameLabel = away && home ? `${away.name} @ ${home.name}` : `Game #${review.gameId}`
  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Link to="/profile/$username" params={{ username: review.user.username }}>
          <UserAvatar user={review.user} size={36} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1.5 gap-2 flex-wrap">
            <div className="text-sm">
              <Link to="/profile/$username" params={{ username: review.user.username }}
                className="font-semibold hover:text-accent transition-colors">
                {review.user.displayName}
              </Link>
              <span className="text-gray-600"> on </span>
              <Link to="/games/$gameId" params={{ gameId: String(review.gameId) }}
                className="text-accent font-medium hover:brightness-125 transition-all">
                {gameLabel}
              </Link>
            </div>
            <StarRating value={review.rating} readOnly size="sm" />
          </div>
          {review.text && (
            <p className="text-[0.83rem] text-gray-500 leading-relaxed line-clamp-2">
              "{review.text}"
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[0.72rem] text-gray-700">♥ {review.likes}</span>
            <span className="text-[0.7rem] text-gray-700">{formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
