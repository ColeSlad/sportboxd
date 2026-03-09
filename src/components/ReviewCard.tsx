import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Review, Play } from '~/lib/types'
import { StarRating } from './StarRating'
import { UserAvatar } from './UserAvatar'
import { toggleLike } from '~/lib/api'
import { formatRelativeTime } from '~/lib/utils'

interface ReviewCardProps {
  review: Review
  highlightedPlay?: Play
}

export function ReviewCard({ review, highlightedPlay }: ReviewCardProps) {
  const [likes, setLikes] = useState(review.likes)
  const [liked, setLiked] = useState(false)

  async function handleLike() {
    if (liked) return
    setLiked(true)
    setLikes((n) => n + 1)
    await toggleLike(review.id)
  }

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Link to="/profile/$username" params={{ username: review.user.username }}>
          <UserAvatar user={review.user} size={40} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div>
              <Link
                to="/profile/$username"
                params={{ username: review.user.username }}
                className="font-semibold hover:text-accent transition-colors"
              >
                {review.user.displayName}
              </Link>
              <span className="text-gray-600 text-[0.75rem] ml-2">
                @{review.user.username}
              </span>
            </div>
            <StarRating value={review.rating} readOnly size="sm" />
          </div>

          {/* Review text */}
          {review.text && (
            <p className="text-[0.85rem] text-gray-400 leading-relaxed mb-3">
              {review.text}
            </p>
          )}

          {/* Highlighted play */}
          {highlightedPlay && (
            <div className="bg-bg-card3 border-l-[3px] border-l-accent rounded-r-md px-3 py-2 mb-3">
              <div className="text-[0.65rem] font-condensed font-bold tracking-widest uppercase text-accent mb-1">
                Highlighted Play · {highlightedPlay.time}
              </div>
              <div className="text-[0.8rem] text-gray-500">
                {highlightedPlay.description}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`text-[0.78rem] flex items-center gap-1.5 transition-colors ${
                liked ? 'text-red-400' : 'text-gray-700 hover:text-gray-400'
              }`}
            >
              {liked ? '♥' : '♡'} {likes}
            </button>
            <span className="text-[0.7rem] text-gray-700">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
