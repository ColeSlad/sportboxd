import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState, useOptimistic } from 'react'
import { getGameDetail } from '~/server/games'
import { getGameReviews, upsertReview } from '~/server/reviews'
import { getTeam } from '~/lib/teams'
import { formatDate, formatNumber } from '~/lib/utils'
import { TeamLogo } from '~/components/TeamLogo'
import { StarRating } from '~/components/StarRating'
import { ReviewCard } from '~/components/ReviewCard'
import { PlayCard } from '~/components/PlayCard'
import { UserAvatar } from '~/components/UserAvatar'
import { MOCK_USERS } from '~/lib/mock-data'
import { ArrowLeft, X } from 'lucide-react'
import type { Review } from '~/lib/types'

export const Route = createFileRoute('/games/$gameId')({
  loader: async ({ params }) => {
    const id = Number(params.gameId)
    if (isNaN(id)) throw notFound()
    const [detail, reviews] = await Promise.all([
      getGameDetail({ data: { id } }),
      getGameReviews({ data: { gameId: id } }),
    ])
    return { ...detail, reviews }
  },
  component: GameDetailPage,
  notFoundComponent: () => (
    <div className="text-center py-24 text-gray-500">Game not found.</div>
  ),
})

type Tab = 'reviews' | 'plays' | 'boxscore'

function GameDetailPage() {
  const { game, plays, reviews: initialReviews } = Route.useLoaderData()
  const [tab, setTab] = useState<Tab>('reviews')
  const [showLogModal, setShowLogModal] = useState(false)
  const [isLogged, setIsLogged] = useState(false)
  const [myRating, setMyRating] = useState(0)

  // Optimistic reviews list
  const [reviews, addReview] = useOptimistic(
    initialReviews,
    (state: Review[], newReview: Review) => [newReview, ...state],
  )

  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 }
  })

  async function handleSubmitReview(rating: number, text: string) {
    const currentUser = MOCK_USERS[0]! // TODO: real auth session
    const optimistic: Review = {
      id: `optimistic-${Date.now()}`,
      gameId: game.id,
      userId: currentUser.id,
      rating,
      text: text || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      playHighlight: null,
      user: currentUser,
    }
    addReview(optimistic)
    await upsertReview({ data: { gameId: game.id, rating, text: text || undefined } })
    setIsLogged(true)
    setMyRating(rating)
    setShowLogModal(false)
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link to="/browse" className="btn btn-ghost btn-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={13} /> Browse
        </Link>
      </div>

      {/* Hero banner */}
      <div
        className="relative px-4 pt-6 pb-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${away.color}18 0%, transparent 50%, ${home.color}18 100%)`,
        }}
      >
        {/* Fade to bg */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-bg" />

        <div className="relative">
          {/* Badges */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {game.type !== 'Regular Season' && (
              <span className="badge badge-green">{game.type}</span>
            )}
            {game.gameLabel && <span className="badge badge-gray">{game.gameLabel}</span>}
            {game.overtime && <span className="badge badge-red">Overtime</span>}
            <span className="badge badge-gray">{game.season}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            {/* Away */}
            <div className="flex items-center gap-3 flex-1">
              <TeamLogo abbr={game.awayTeam} size={52} />
              <div>
                <div className="font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500">
                  {away.city}
                </div>
                <div className="font-display text-[2rem] leading-none">{away.name}</div>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="text-center flex-shrink-0">
              <div className="score-num text-[clamp(2.2rem,6vw,3.5rem)]">
                <span className={game.awayScore > game.homeScore ? 'text-white' : 'text-gray-600'}>
                  {game.awayScore}
                </span>
                <span className="text-gray-700 mx-2">–</span>
                <span className={game.homeScore > game.awayScore ? 'text-white' : 'text-gray-600'}>
                  {game.homeScore}
                </span>
              </div>
              <div className="text-[0.6rem] tracking-widest font-condensed font-bold uppercase text-gray-700 mt-0.5">
                FINAL{game.overtime ? '/OT' : ''} · {formatDate(game.date)}
              </div>
            </div>

            {/* Home */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-right">
                <div className="font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500">
                  {home.city}
                </div>
                <div className="font-display text-[2rem] leading-none">{home.name}</div>
              </div>
              <TeamLogo abbr={game.homeTeam} size={52} />
            </div>
          </div>

          {/* Description */}
          <p className="text-[0.88rem] text-gray-500 leading-relaxed max-w-lg">
            {game.description}
          </p>
        </div>
      </div>

      {/* Rating summary + log CTA */}
      <div className="px-4 mb-6">
        <div className="card p-4">
          <div className="flex gap-5 items-center flex-wrap">
            {/* Avg rating */}
            <div className="text-center flex-shrink-0">
              <div className="font-display text-accent text-[2.8rem] leading-none">
                {game.avgRating.toFixed(1)}
              </div>
              <StarRating value={Math.round(game.avgRating)} readOnly size="sm" />
              <div className="text-[0.7rem] text-gray-600 mt-1">
                {formatNumber(game.reviewCount)} ratings
              </div>
            </div>

            {/* Distribution */}
            <div className="flex-1 min-w-[140px]">
              {ratingDist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-[0.7rem] text-gray-600 w-2 text-right">{star}</span>
                  <span className="text-yellow-400 text-[0.65rem]">★</span>
                  <div className="flex-1 h-1 bg-bg-card3 rounded-full">
                    <div
                      className="h-1 bg-accent rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[0.65rem] text-gray-700 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>

            {/* Log CTA */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[120px]">
              {isLogged ? (
                <>
                  <div className="text-[0.75rem] font-condensed font-bold text-accent tracking-wider">
                    ✓ Logged
                  </div>
                  <StarRating value={myRating} readOnly size="sm" accent />
                </>
              ) : (
                <button
                  className="btn btn-primary w-full"
                  onClick={() => setShowLogModal(true)}
                >
                  + Log Game
                </button>
              )}
              <span className="text-[0.68rem] text-gray-700 text-center">
                {formatNumber(game.viewCount)} watched
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4 mb-5">
        <div className="flex gap-6 overflow-x-auto [scrollbar-width:none]">
          {(
            [
              { id: 'reviews', label: `Reviews (${reviews.length})` },
              { id: 'plays', label: `Key Plays (${plays.length})` },
              { id: 'boxscore', label: 'Box Score' },
            ] as { id: Tab; label: string }[]
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

      <div className="px-4">
        {tab === 'reviews' && (
          <div className="fade-in">
            {!isLogged && (
              <div className="card border-dashed p-4 mb-4 text-center">
                <p className="text-gray-600 text-sm mb-3">Watched this game? Share your take.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowLogModal(true)}
                >
                  Write a Review
                </button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No reviews yet — be the first.
                </div>
              ) : (
                reviews.map((r) => {
                  const highlight = r.playHighlight
                    ? plays.find((p) => p.id === r.playHighlight)
                    : undefined
                  return (
                    <ReviewCard key={r.id} review={r} highlightedPlay={highlight} />
                  )
                })
              )}
            </div>
          </div>
        )}

        {tab === 'plays' && (
          <div className="fade-in">
            <p className="text-[0.82rem] text-gray-600 mb-4">
              Rate individual plays — the key differentiator on Sportsboxd.
            </p>
            <div className="flex flex-col gap-3">
              {plays.map((p) => (
                <PlayCard key={p.id} play={p} />
              ))}
            </div>
            <div className="mt-4 px-3 py-3 bg-bg-card2 rounded-lg text-[0.72rem] text-gray-700 border-l-[3px] border-border">
              <strong className="text-gray-500">Dev note:</strong> Play-by-play data is currently
              mocked. Connect nba.com/stats CDN, SportRadar, or a licensed provider in{' '}
              <code className="text-accent">app/lib/nba.ts → fetchPlayByPlay()</code>.
            </div>
          </div>
        )}

        {tab === 'boxscore' && (
          <div className="fade-in overflow-x-auto">
            <BoxScoreTable game={game} />
            <p className="mt-3 text-[0.72rem] text-gray-700 border-l-[3px] border-border pl-3 py-2 bg-bg-card2 rounded-r-md">
              <strong className="text-gray-500">Dev note:</strong> Fetch real stats from{' '}
              <code className="text-accent">app/lib/nba.ts → fetchBoxScore(gameId)</code>.
            </p>
          </div>
        )}
      </div>

      {/* Log modal */}
      {showLogModal && (
        <LogModal
          game={game}
          onClose={() => setShowLogModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  )
}

// ─── Log Modal ───────────────────────────────────────────────────────────────
function LogModal({
  game,
  onClose,
  onSubmit,
}: {
  game: ReturnType<typeof Route.useLoaderData>['game']
  onClose: () => void
  onSubmit: (rating: number, text: string) => Promise<void>
}) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const LABELS = ['', 'Boring — skip it', 'Below average', 'Worth watching', 'Really good', 'All-time classic']

  async function handleSubmit() {
    if (!rating) return
    setSaving(true)
    await onSubmit(rating, text)
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-card border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-condensed font-bold tracking-wider uppercase text-lg">
              Log & Review
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Game mini card */}
          <div className="card p-3 mb-5 flex items-center gap-3">
            <TeamLogo abbr={game.awayTeam} size={30} />
            <div className="flex-1">
              <div className="font-condensed font-bold text-[0.88rem]">
                {getTeam(game.awayTeam).name} @ {getTeam(game.homeTeam).name}
              </div>
              <div className="text-[0.72rem] text-gray-600">{formatDate(game.date)}</div>
            </div>
            <div className="score-num text-xl">
              {game.awayScore}–{game.homeScore}
            </div>
            <TeamLogo abbr={game.homeTeam} size={30} />
          </div>

          {/* Rating */}
          <div className="mb-5">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-3">
              Your Rating
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <p className="text-[0.82rem] text-gray-500 mt-2">{LABELS[rating]}</p>
            )}
          </div>

          {/* Review */}
          <div className="mb-5">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">
              Review{' '}
              <span className="text-gray-700 normal-case tracking-normal font-normal">
                (optional)
              </span>
            </label>
            <textarea
              className="input resize-none leading-relaxed"
              rows={4}
              placeholder="What made this game special? Who showed up?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary flex-[2]"
              style={{ opacity: rating === 0 ? 0.5 : 1 }}
              disabled={rating === 0 || saving}
              onClick={handleSubmit}
            >
              {saving ? 'Saving…' : rating === 0 ? 'Select a rating' : 'Log Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Box Score ───────────────────────────────────────────────────────────────
// NOTE: Replace MOCK_STATS with real data from fetchBoxScore(game.id) in nba.ts
const MOCK_STATS = [
  { player: 'J. Brown', team: 'BOS', min: '38', pts: 21, reb: 8, ast: 4, fgPct: '51.2', fg3Pct: '40.0', stl: 1, blk: 0 },
  { player: 'J. Tatum', team: 'BOS', min: '40', pts: 17, reb: 9, ast: 6, fgPct: '44.8', fg3Pct: '33.3', stl: 2, blk: 1 },
  { player: 'J. Holiday', team: 'BOS', min: '36', pts: 9, reb: 5, ast: 7, fgPct: '47.6', fg3Pct: '28.6', stl: 3, blk: 1 },
  { player: 'L. Doncic', team: 'DAL', min: '42', pts: 29, reb: 10, ast: 8, fgPct: '43.2', fg3Pct: '30.8', stl: 1, blk: 0 },
  { player: 'K. Irving', team: 'DAL', min: '38', pts: 23, reb: 3, ast: 5, fgPct: '52.0', fg3Pct: '44.4', stl: 0, blk: 1 },
]

const COLS = ['Player', 'MIN', 'PTS', 'REB', 'AST', 'FG%', '3P%', 'STL', 'BLK'] as const

function BoxScoreTable({ game }: { game: { homeTeam: string; awayTeam: string } }) {
  return (
    <table className="w-full border-collapse text-[0.82rem]">
      <thead>
        <tr className="border-b border-border">
          {COLS.map((col) => (
            <th
              key={col}
              className="pb-2 pt-1 text-[0.68rem] font-condensed font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap"
              style={{ textAlign: col === 'Player' ? 'left' : 'right', padding: '6px 10px' }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MOCK_STATS.map((row) => (
          <tr
            key={row.player}
            className="border-b border-border/50 hover:bg-bg-card2 transition-colors"
          >
            <td className="py-2.5 px-2.5">
              <div className="flex items-center gap-2">
                <TeamLogo abbr={row.team} size={18} />
                <span className="font-medium">{row.player}</span>
              </div>
            </td>
            <td className="py-2.5 px-2.5 text-right text-gray-600">{row.min}</td>
            <td className="py-2.5 px-2.5 text-right font-bold">{row.pts}</td>
            <td className="py-2.5 px-2.5 text-right">{row.reb}</td>
            <td className="py-2.5 px-2.5 text-right">{row.ast}</td>
            <td className="py-2.5 px-2.5 text-right">{row.fgPct}</td>
            <td className="py-2.5 px-2.5 text-right">{row.fg3Pct}</td>
            <td className="py-2.5 px-2.5 text-right">{row.stl}</td>
            <td className="py-2.5 px-2.5 text-right">{row.blk}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
