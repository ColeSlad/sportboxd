import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { fetchBoxScore } from '~/lib/nba'
import type { BoxScoreRow } from '~/lib/nba'
import { getGameDetail, fetchGameReviews, submitReview } from '~/lib/api'
import { supabase } from '~/lib/supabase'
import { getTeam } from '~/lib/teams'
import { formatDate, formatNumber } from '~/lib/utils'
import { TeamLogo } from '~/components/TeamLogo'
import { StarRating } from '~/components/StarRating'
import { ReviewCard } from '~/components/ReviewCard'
import { PlayCard } from '~/components/PlayCard'
import { RouteError } from '~/components/RouteError'
import { GameDetailPending } from '~/components/Skeletons'
import { useAuth } from '~/lib/auth-context'
import { ArrowLeft, X } from 'lucide-react'
import type { Review } from '~/lib/types'

export const Route = createFileRoute('/games/$gameId')({
  loader: async ({ params }) => {
    const id = Number(params.gameId)
    if (isNaN(id)) throw notFound()
    const [detail, reviews, { data: { session } }] = await Promise.all([
      getGameDetail(id),
      fetchGameReviews(id),
      supabase.auth.getSession(),
    ])
    const myReview = session
      ? reviews.find((r) => r.userId === session.user.id) ?? null
      : null
    return { ...detail, reviews, myReview }
  },
  component: GameDetailPage,
  pendingComponent: GameDetailPending,
  pendingMs: 300,
  errorComponent: ({ error, reset }) => <RouteError error={error as Error} reset={reset} />,
  notFoundComponent: () => <div className="text-center py-24 text-gray-500">Game not found.</div>,
})

type Tab = 'reviews' | 'plays' | 'boxscore'

function GameDetailPage() {
  const { game, plays, reviews: initialReviews, myReview } = Route.useLoaderData()
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('reviews')
  const [showLogModal, setShowLogModal] = useState(false)
  const [isLogged, setIsLogged] = useState(!!myReview)
  const [myRating, setMyRating] = useState(myReview?.rating ?? 0)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)

  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 }
  })

  function openLogModal() {
    if (!authUser) { navigate({ to: '/login' }); return }
    setShowLogModal(true)
  }

  async function handleSubmitReview(rating: number, text: string) {
    const newReview = await submitReview({ gameId: game.id, rating, text: text || undefined })
    setReviews((prev) =>
      prev.some((r) => r.userId === newReview.userId)
        ? prev.map((r) => (r.userId === newReview.userId ? newReview : r))
        : [newReview, ...prev],
    )
    setIsLogged(true)
    setMyRating(rating)
    setShowLogModal(false)
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="px-4 pt-4">
        <Link to="/browse" className="btn btn-ghost btn-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={13} /> Browse
        </Link>
      </div>

      {/* Hero */}
      <div className="relative px-4 pt-6 pb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${away.color}18 0%, transparent 50%, ${home.color}18 100%)` }}>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-bg" />
        <div className="relative">
          <div className="flex gap-2 mb-5 flex-wrap">
            {game.type !== 'Regular Season' && <span className="badge badge-green">{game.type}</span>}
            {game.gameLabel && <span className="badge badge-gray">{game.gameLabel}</span>}
            {game.overtime && <span className="badge badge-red">Overtime</span>}
            <span className="badge badge-gray">{game.season}</span>
          </div>

          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <TeamLogo abbr={game.awayTeam} size={52} />
              <div>
                <div className="font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500">{away.city}</div>
                <div className="font-display text-[2rem] leading-none">{away.name}</div>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="score-num text-[clamp(2.2rem,6vw,3.5rem)]">
                <span className={game.awayScore > game.homeScore ? 'text-white' : 'text-gray-600'}>{game.awayScore}</span>
                <span className="text-gray-700 mx-2">–</span>
                <span className={game.homeScore > game.awayScore ? 'text-white' : 'text-gray-600'}>{game.homeScore}</span>
              </div>
              <div className="text-[0.6rem] tracking-widest font-condensed font-bold uppercase text-gray-700 mt-0.5">
                FINAL{game.overtime ? '/OT' : ''} · {formatDate(game.date)}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-right">
                <div className="font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500">{home.city}</div>
                <div className="font-display text-[2rem] leading-none">{home.name}</div>
              </div>
              <TeamLogo abbr={game.homeTeam} size={52} />
            </div>
          </div>
          <p className="text-[0.88rem] text-gray-500 leading-relaxed max-w-lg">{game.description}</p>
        </div>
      </div>

      {/* Rating summary */}
      <div className="px-4 mb-6">
        <div className="card p-4">
          <div className="flex gap-5 items-center flex-wrap">
            <div className="text-center flex-shrink-0">
              <div className="font-display text-accent text-[2.8rem] leading-none">{game.avgRating.toFixed(1)}</div>
              <StarRating value={Math.round(game.avgRating)} readOnly size="sm" />
              <div className="text-[0.7rem] text-gray-600 mt-1">{formatNumber(game.reviewCount)} ratings</div>
            </div>
            <div className="flex-1 min-w-[140px]">
              {ratingDist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-[0.7rem] text-gray-600 w-2 text-right">{star}</span>
                  <span className="text-yellow-400 text-[0.65rem]">★</span>
                  <div className="flex-1 h-1 bg-bg-card3 rounded-full">
                    <div className="h-1 bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[0.65rem] text-gray-700 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[120px]">
              {isLogged ? (
                <button onClick={openLogModal} className="flex flex-col items-center gap-1 group">
                  <div className="text-[0.75rem] font-condensed font-bold text-accent tracking-wider group-hover:brightness-125 transition-all">✓ Logged</div>
                  <StarRating value={myRating} readOnly size="sm" accent />
                  <span className="text-[0.62rem] text-gray-700 group-hover:text-gray-500 transition-colors">Edit review</span>
                </button>
              ) : (
                <button className="btn btn-primary w-full" onClick={openLogModal}>+ Log Game</button>
              )}
              <span className="text-[0.68rem] text-gray-700 text-center">{formatNumber(game.viewCount)} watched</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4 mb-5">
        <div className="flex gap-6 overflow-x-auto [scrollbar-width:none]">
          {([
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'plays', label: `Key Plays (${plays.length})` },
            { id: 'boxscore', label: 'Box Score' },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
              style={{ background: 'none', border: 'none' }}>
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
                <button className="btn btn-primary btn-sm" onClick={openLogModal}>Write a Review</button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {reviews.length === 0
                ? <div className="text-center py-12 text-gray-600">No reviews yet — be the first.</div>
                : reviews.map((r) => {
                    const highlight = r.playHighlight ? plays.find((p) => p.id === r.playHighlight) : undefined
                    return <ReviewCard key={r.id} review={r} highlightedPlay={highlight} />
                  })}
            </div>
          </div>
        )}

        {tab === 'plays' && (
          <div className="fade-in">
            <p className="text-[0.82rem] text-gray-600 mb-4">Rate individual plays — the key differentiator on Fixture.</p>
            <div className="flex flex-col gap-3">
              {plays.map((p) => <PlayCard key={p.id} play={p} gameId={game.id} />)}
            </div>
            <div className="mt-4 px-3 py-3 bg-bg-card2 rounded-lg text-[0.72rem] text-gray-700 border-l-[3px] border-border">
              <strong className="text-gray-500">Dev note:</strong> Play-by-play is currently mocked.
              Connect <code className="text-accent">src/lib/nba.ts → fetchPlayByPlay()</code> or SportRadar.
            </div>
          </div>
        )}

        {tab === 'boxscore' && (
          <div className="fade-in overflow-x-auto">
            <BoxScoreTable gameId={game.id} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />
          </div>
        )}
      </div>

      {showLogModal && (
        <LogModal
          game={game}
          initialRating={myRating}
          initialText={myReview?.text ?? ''}
          onClose={() => setShowLogModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  )
}

function LogModal({ game, initialRating = 0, initialText = '', onClose, onSubmit }: {
  game: ReturnType<typeof Route.useLoaderData>['game']
  initialRating?: number
  initialText?: string
  onClose: () => void
  onSubmit: (rating: number, text: string) => Promise<void>
}) {
  const [rating, setRating] = useState(initialRating)
  const [text, setText] = useState(initialText)
  const [saving, setSaving] = useState(false)
  const LABELS = ['', 'Boring — skip it', 'Below average', 'Worth watching', 'Really good', 'All-time classic']

  async function handleSubmit() {
    if (!rating) return
    setSaving(true)
    await onSubmit(rating, text)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg-card border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-condensed font-bold tracking-wider uppercase text-lg">Log & Review</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
          </div>
          <div className="card p-3 mb-5 flex items-center gap-3">
            <TeamLogo abbr={game.awayTeam} size={30} />
            <div className="flex-1">
              <div className="font-condensed font-bold text-[0.88rem]">
                {getTeam(game.awayTeam).name} @ {getTeam(game.homeTeam).name}
              </div>
              <div className="text-[0.72rem] text-gray-600">{formatDate(game.date)}</div>
            </div>
            <div className="score-num text-xl">{game.awayScore}–{game.homeScore}</div>
            <TeamLogo abbr={game.homeTeam} size={30} />
          </div>
          <div className="mb-5">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-3">Your Rating</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && <p className="text-[0.82rem] text-gray-500 mt-2">{LABELS[rating]}</p>}
          </div>
          <div className="mb-5">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">
              Review <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea className="input resize-none leading-relaxed" rows={4}
              placeholder="What made this game special? Who showed up?"
              value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary flex-[2]" style={{ opacity: rating === 0 ? 0.5 : 1 }}
              disabled={rating === 0 || saving} onClick={handleSubmit}>
              {saving ? 'Saving…' : rating === 0 ? 'Select a rating' : 'Log Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BoxScoreTable({ gameId, homeTeam, awayTeam }: { gameId: number; homeTeam: string; awayTeam: string }) {
  const [rows, setRows] = useState<BoxScoreRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoxScore(gameId).then(setRows).catch((e: Error) => setError(e.message))
  }, [gameId])

  if (error === 'BDL_UPGRADE_REQUIRED') return (
    <div className="py-12 text-center text-gray-600">
      <p className="text-sm mb-1">Box scores require a paid balldontlie.io plan.</p>
      <p className="text-[0.75rem] text-gray-700">Upgrade at balldontlie.io to unlock player stats.</p>
    </div>
  )
  if (error) return <div className="py-12 text-center text-gray-600">Stats not available for this game.</div>
  if (!rows) return <div className="py-12 text-center text-gray-600 animate-pulse">Loading stats…</div>
  if (rows.length === 0) return <div className="py-12 text-center text-gray-600">No stats available — game may not have started yet.</div>

  const awayRows = rows.filter((r) => r.team === awayTeam)
  const homeRows = rows.filter((r) => r.team === homeTeam)

  return (
    <div className="flex flex-col gap-6">
      {[{ abbr: awayTeam, rows: awayRows }, { abbr: homeTeam, rows: homeRows }].map(({ abbr, rows: teamRows }) => (
        <div key={abbr}>
          <div className="flex items-center gap-2 mb-2">
            <TeamLogo abbr={abbr} size={18} />
            <span className="font-condensed font-bold tracking-widest uppercase text-[0.72rem] text-gray-500">
              {getTeam(abbr).city} {getTeam(abbr).name}
            </span>
          </div>
          <table className="w-full border-collapse text-[0.82rem]">
            <thead>
              <tr className="border-b border-border">
                {['Player', 'MIN', 'PTS', 'REB', 'AST', 'FG%', '3P%', 'STL', 'BLK'].map((col) => (
                  <th key={col}
                    className="pb-2 pt-1 text-[0.68rem] font-condensed font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap"
                    style={{ textAlign: col === 'Player' ? 'left' : 'right', padding: '6px 8px' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamRows.map((row) => (
                <tr key={row.player} className="border-b border-border/50 hover:bg-bg-card2 transition-colors">
                  <td className="py-2 px-2">
                    <span className="font-medium">{row.player}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">{row.min}</td>
                  <td className="py-2 px-2 text-right font-bold">{row.pts}</td>
                  <td className="py-2 px-2 text-right">{row.reb}</td>
                  <td className="py-2 px-2 text-right">{row.ast}</td>
                  <td className="py-2 px-2 text-right">{row.fgPct}</td>
                  <td className="py-2 px-2 text-right">{row.fg3Pct}</td>
                  <td className="py-2 px-2 text-right">{row.stl}</td>
                  <td className="py-2 px-2 text-right">{row.blk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
