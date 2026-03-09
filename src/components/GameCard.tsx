import { Link } from '@tanstack/react-router'
import { getTeam } from '~/lib/teams'
import { formatDate, formatNumber } from '~/lib/utils'
import type { Game } from '~/lib/types'
import { TeamLogo } from './TeamLogo'

interface GameCardProps {
  game: Game
  size?: 'sm' | 'md'
}

export function GameCard({ game, size = 'md' }: GameCardProps) {
  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)

  if (size === 'sm') {
    return (
      <Link
        to="/games/$gameId"
        params={{ gameId: String(game.id) }}
        className="card card-interactive block p-4 min-w-[190px]"
      >
        <div className="flex gap-2 items-center mb-3">
          <TeamLogo abbr={game.awayTeam} size={26} />
          <span className="text-gray-600 text-[0.65rem] font-condensed font-semibold">@</span>
          <TeamLogo abbr={game.homeTeam} size={26} />
        </div>
        <div className="score-num text-lg">
          {game.status === 'Final' || game.homeScore > 0 || game.awayScore > 0
            ? `${game.awayScore}–${game.homeScore}`
            : 'vs'}
        </div>
        <div className="mt-1.5 flex gap-1 flex-wrap">
          {game.type !== 'Regular Season' && (
            <span className="badge badge-green">{game.type}</span>
          )}
          {game.overtime && <span className="badge badge-red">OT</span>}
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-sm font-bold font-condensed">{game.avgRating.toFixed(1)}</span>
          <span className="text-gray-600 text-xs">({formatNumber(game.reviewCount)})</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/games/$gameId"
      params={{ gameId: String(game.id) }}
      className="card card-interactive block p-5 relative overflow-hidden"
    >
      {/* Team color stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${away.color} 0%, ${away.color} 50%, ${home.color} 50%, ${home.color} 100%)`,
        }}
      />

      {/* Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {game.type !== 'Regular Season' && (
            <span className="badge badge-green">{game.type}</span>
          )}
          {game.gameLabel && (
            <span className="badge badge-gray">{game.gameLabel}</span>
          )}
          {game.overtime && <span className="badge badge-red">OT</span>}
        </div>
        <span className="text-[0.7rem] text-gray-500 font-condensed font-medium">
          {formatDate(game.date)}
        </span>
      </div>

      {/* Matchup + score */}
      <div className="flex items-center gap-4 mb-4">
        {/* Away */}
        <div className="flex items-center gap-2.5 flex-1">
          <TeamLogo abbr={game.awayTeam} size={38} />
          <div>
            <div className="font-condensed font-bold text-[0.85rem] tracking-wider text-gray-400">
              {away.city}
            </div>
            <div className="font-display text-[1.15rem] leading-tight">{away.name}</div>
          </div>
        </div>

        {/* Score / Status */}
        <div className="text-center flex-shrink-0">
          {game.status === 'Final' ? (
            <>
              <div className="score-num text-[2rem]">
                <span className={game.awayScore > game.homeScore ? 'text-white' : 'text-gray-600'}>
                  {game.awayScore}
                </span>
                <span className="text-gray-700 mx-1">–</span>
                <span className={game.homeScore > game.awayScore ? 'text-white' : 'text-gray-600'}>
                  {game.homeScore}
                </span>
              </div>
              <div className="text-[0.6rem] tracking-widest text-gray-600 font-condensed font-bold uppercase">
                FINAL{game.overtime ? '/OT' : ''}
              </div>
            </>
          ) : game.homeScore > 0 || game.awayScore > 0 ? (
            <>
              <div className="score-num text-[2rem]">
                <span className="text-white">{game.awayScore}</span>
                <span className="text-gray-700 mx-1">–</span>
                <span className="text-white">{game.homeScore}</span>
              </div>
              <div className="text-[0.6rem] tracking-widest text-accent font-condensed font-bold uppercase animate-pulse">
                {game.status}
              </div>
            </>
          ) : (
            <>
              <div className="font-condensed font-bold text-[1rem] text-gray-300">VS</div>
              <div className="text-[0.65rem] text-gray-500 font-condensed mt-0.5">{game.status}</div>
            </>
          )}
        </div>

        {/* Home */}
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          <div className="text-right">
            <div className="font-condensed font-bold text-[0.85rem] tracking-wider text-gray-400">
              {home.city}
            </div>
            <div className="font-display text-[1.15rem] leading-tight">{home.name}</div>
          </div>
          <TeamLogo abbr={game.homeTeam} size={38} />
        </div>
      </div>

      {/* Description */}
      <p className="text-[0.82rem] text-gray-500 leading-relaxed mb-4 line-clamp-2">
        {game.description}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="font-bold text-[0.95rem] font-condensed">{game.avgRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600 text-[0.72rem]">
            {formatNumber(game.reviewCount)} reviews
          </span>
        </div>
        <span className="text-[0.7rem] text-gray-700">
          {formatNumber(game.viewCount)} logged
        </span>
      </div>
    </Link>
  )
}
