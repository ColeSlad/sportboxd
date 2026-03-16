import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { listGames } from '~/lib/api'
import { GameCard } from '~/components/GameCard'
import { RouteError } from '~/components/RouteError'
import { BrowsePending } from '~/components/Skeletons'
import { TEAMS } from '~/lib/teams'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['all', 'playoffs', 'finals', 'regular', 'ot']).default('all'),
  team: z.string().optional(),
  sort: z.enum(['date', 'rating', 'reviews']).default('date'),
})

export const Route = createFileRoute('/browse')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listGames({ type: deps.type, team: deps.team, search: deps.q, sort: deps.sort }),
  component: BrowsePage,
  pendingComponent: BrowsePending,
  pendingMs: 300,
  errorComponent: ({ error, reset }) => <RouteError error={error as Error} reset={reset} />,
})

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'playoffs', label: 'Playoffs' },
  { value: 'finals', label: 'Finals' },
  { value: 'regular', label: 'Regular Season' },
  { value: 'ot', label: 'Overtime' },
] as const

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
] as const

function BrowsePage() {
  const games = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/browse' })
  const [showFilters, setShowFilters] = useState(false)

  function set(updates: Partial<z.infer<typeof searchSchema>>) {
    navigate({ search: (prev) => ({ ...prev, ...updates }) })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      <div className="py-8">
        <h1 className="font-display text-[2.5rem] leading-none mb-1">Browse Games</h1>
        <p className="text-gray-600 text-sm">{games.length} game{games.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          className="input pl-9"
          placeholder="Search teams, matchups, descriptions…"
          defaultValue={search.q ?? ''}
          onChange={(e) => set({ q: e.target.value || undefined })}
        />
      </div>

      {/* Type pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button className="btn btn-ghost btn-sm flex items-center gap-1.5" onClick={() => setShowFilters(f => !f)}>
          <SlidersHorizontal size={13} /> Filters
        </button>
        {TYPE_FILTERS.map((f) => (
          <button key={f.value} onClick={() => set({ type: f.value })}
            className={`badge cursor-pointer transition-all ${
              (search.type ?? 'all') === f.value ? 'badge-green' : 'badge-gray hover:border-white/20 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card p-4 mb-4 fade-in grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">Team</label>
            <select className="input text-[0.85rem]" value={search.team ?? ''} onChange={(e) => set({ team: e.target.value || undefined })}>
              <option value="">All Teams</option>
              {Object.values(TEAMS).map((t) => (
                <option key={t.abbr} value={t.abbr}>{t.city} {t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">Sort By</label>
            <select className="input text-[0.85rem]" value={search.sort ?? 'date'}
              onChange={(e) => set({ sort: e.target.value as z.infer<typeof searchSchema>['sort'] })}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {search.team && (
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[0.75rem] text-gray-500">Showing:</span>
              <button className="badge badge-green" onClick={() => set({ team: undefined })}>
                {TEAMS[search.team]?.city} {TEAMS[search.team]?.name} ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sort strip */}
      {!showFilters && (
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-700">Sort:</span>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((o) => (
              <button key={o.value} onClick={() => set({ sort: o.value })}
                className={`text-[0.75rem] font-condensed font-semibold tracking-wider uppercase transition-colors ${
                  (search.sort ?? 'date') === o.value ? 'text-accent' : 'text-gray-600 hover:text-white'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-4">🏀</div>
          <p className="text-sm">No games match your filters.</p>
          <button className="btn btn-ghost btn-sm mt-4" onClick={() => navigate({ search: {} })}>Clear filters</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 fade-in">
          {games.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}
