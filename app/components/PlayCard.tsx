import { useState } from 'react'
import type { Play } from '~/lib/types'
import { StarRating } from './StarRating'
import { upsertPlayRating } from '~/server/plays'

const PLAY_ICONS: Record<string, string> = {
  '3-Pointer': '🎯',
  Dunk: '🏀',
  Block: '🛡️',
  Layup: '🏃',
  Assist: '🤝',
  'Mid-Range': '🎯',
  Heave: '🌋',
  'Free Throw': '🎳',
  'Post-Up': '💪',
  Steal: '⚡',
  Other: '⚡',
}

interface PlayCardProps {
  play: Play
  initialRating?: number
}

export function PlayCard({ play, initialRating = 0 }: PlayCardProps) {
  const [rating, setRating] = useState(initialRating)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleRate(r: number) {
    setRating(r)
    setSaving(true)
    try {
      await upsertPlayRating({
        data: { gameId: play.id.split('-')[0] ? Number(play.id.split('-')[0].replace('p', '')) : 0, playId: play.id, rating: r },
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNote() {
    setSaving(true)
    try {
      await upsertPlayRating({
        data: {
          gameId: 0,
          playId: play.id,
          rating: rating || 3,
          note: note || undefined,
        },
      })
      setShowNote(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-4 border-l-[3px] border-l-transparent hover:border-l-accent transition-all duration-200">
      <div className="flex gap-3 items-start">
        {/* Play type icon */}
        <div className="w-11 h-11 rounded-lg bg-bg-card3 flex items-center justify-center text-xl flex-shrink-0">
          {PLAY_ICONS[play.type] ?? '⚡'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[0.88rem]">{play.player}</span>
              <span className="badge badge-gray">{play.team}</span>
            </div>
            <span className="font-condensed text-[0.72rem] text-accent font-bold tracking-wider flex-shrink-0 ml-2">
              {play.time}
            </span>
          </div>

          {/* Description */}
          <p className="text-[0.83rem] text-gray-500 leading-relaxed mb-3">
            {play.description}
          </p>

          {/* Community rating + type */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="font-bold text-[0.88rem] font-condensed">{play.avgRating.toFixed(1)}</span>
            <span className="text-gray-700 text-[0.72rem]">({play.ratingCount.toLocaleString()})</span>
            <span className="badge badge-gray text-[0.6rem]">{play.type}</span>
          </div>

          {/* Your rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[0.7rem] font-condensed font-bold tracking-widest uppercase text-gray-700">
                Your rating:
              </span>
              <StarRating
                value={rating}
                onChange={handleRate}
                size="sm"
                accent
              />
              {saving && <span className="text-[0.68rem] text-gray-700">saving…</span>}
              {rating > 0 && !saving && (
                <span className="text-[0.68rem] text-accent">✓ {rating}/5</span>
              )}
            </div>

            <button
              className="btn btn-ghost btn-sm text-[0.68rem] flex items-center gap-1"
              onClick={() => setShowNote((s) => !s)}
            >
              💬 Note
            </button>
          </div>

          {/* Note input */}
          {showNote && (
            <div className="mt-3 fade-in">
              <textarea
                className="input resize-none text-[0.82rem]"
                rows={2}
                placeholder="What made this play stand out?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowNote(false); setNote('') }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                  onClick={handleSaveNote}
                >
                  {saving ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
