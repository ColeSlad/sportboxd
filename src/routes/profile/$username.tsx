import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchProfile, followUser, updateProfile } from '~/lib/api'
import { getTeam, TEAMS } from '~/lib/teams'
import { formatDate, formatNumber } from '~/lib/utils'
import { TeamLogo } from '~/components/TeamLogo'
import { UserAvatar } from '~/components/UserAvatar'
import { StarRating } from '~/components/StarRating'
import { supabase, getUserColor } from '~/lib/supabase'
import { X } from 'lucide-react'
import type { AppUser, Review } from '~/lib/types'

export const Route = createFileRoute('/profile/$username')({
  loader: async ({ params }) => {
    const { data: { session } } = await supabase.auth.getSession()
    const sessionUsername = session?.user.email?.split('@')[0] ?? null
    const sessionUserId = session?.user.id ?? null
    try {
      const data = await fetchProfile(params.username)
      return { ...data, sessionUsername, sessionUserId }
    } catch {
      if (session && params.username === sessionUsername) {
        const minimalUser: AppUser = {
          id: session.user.id,
          username: sessionUsername,
          displayName: session.user.user_metadata?.display_name ?? sessionUsername,
          avatarUrl: null,
          avatarColor: getUserColor(session.user.id),
          bio: null,
          favoriteTeams: [],
          following: [],
          followers: [],
          gamesLogged: 0,
          reviewCount: 0,
          joinedDate: session.user.created_at,
        }
        return { user: minimalUser, reviews: [], sessionUsername, sessionUserId }
      }
      throw notFound()
    }
  },
  component: ProfilePage,
  notFoundComponent: () => <div className="text-center py-24 text-gray-500">User not found.</div>,
})

type ProfileTab = 'games' | 'reviews'

function ProfilePage() {
  const { user: initialUser, reviews, sessionUsername, sessionUserId } = Route.useLoaderData()
  const router = useRouter()
  const isMe = !!sessionUsername && initialUser.username === sessionUsername
  const isFollowing = !!sessionUserId && initialUser.followers.includes(sessionUserId)

  const [user, setUser] = useState(initialUser)
  const [following, setFollowing] = useState(isFollowing)
  const [tab, setTab] = useState<ProfileTab>('games')
  const [showEditModal, setShowEditModal] = useState(false)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  async function handleFollow() {
    const next = !following
    setFollowing(next)
    await followUser(user.id, next)
  }

  async function handleSaveProfile(data: { displayName: string; bio: string; favoriteTeams: string[] }) {
    await updateProfile(data)
    setUser((u) => ({
      ...u,
      displayName: data.displayName.trim() || u.username,
      bio: data.bio.trim() || null,
      favoriteTeams: data.favoriteTeams,
    }))
    setShowEditModal(false)
    router.invalidate()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-8 pb-6 flex gap-5 items-start flex-wrap">
        <UserAvatar user={user} size={76} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
            <div>
              <h1 className="text-[1.5rem] font-bold">{user.displayName}</h1>
              <p className="text-gray-500 text-[0.85rem]">@{user.username}</p>
            </div>
            {!isMe
              ? <button className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`} onClick={handleFollow}>
                  {following ? 'Following' : '+ Follow'}
                </button>
              : <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(true)}>Edit Profile</button>}
          </div>
          {user.bio && <p className="text-gray-500 text-[0.85rem] leading-relaxed mb-3 max-w-sm">{user.bio}</p>}
          <div className="flex gap-2 flex-wrap">
            {user.favoriteTeams.map((abbr) => (
              <Link key={abbr} to="/browse" search={{ team: abbr, type: 'all', sort: 'date' }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <TeamLogo abbr={abbr} size={22} />
                <span className="text-[0.75rem] text-gray-500 font-condensed font-semibold">{getTeam(abbr).name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {[
          { label: 'Games', value: formatNumber(user.gamesLogged) },
          { label: 'Reviews', value: formatNumber(user.reviewCount) },
          { label: 'Avg Rating', value: avgRating },
          { label: 'Following', value: user.following.length },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <div className="font-condensed font-bold text-accent text-[1.3rem]">{s.value}</div>
            <div className="font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-5">
        <div className="flex gap-6">
          {([
            { id: 'games', label: `Games (${reviews.length})` },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ] as { id: ProfileTab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
              style={{ background: 'none', border: 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'games' && (
        <div className="fade-in flex flex-col gap-3">
          {reviews.length === 0
            ? <EmptyState text="No logged games yet." />
            : reviews.map((r) => <ProfileReviewRow key={r.id} review={r} />)}
        </div>
      )}
      {tab === 'reviews' && (
        <div className="fade-in flex flex-col gap-3">
          {reviews.length === 0
            ? <EmptyState text="No reviews yet." />
            : reviews.map((r) => <ProfileReviewRow key={r.id} review={r} />)}
        </div>
      )}

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}

function EditProfileModal({ user, onClose, onSave }: {
  user: AppUser
  onClose: () => void
  onSave: (data: { displayName: string; bio: string; favoriteTeams: string[] }) => Promise<void>
}) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio ?? '')
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(user.favoriteTeams)
  const [saving, setSaving] = useState(false)

  function toggleTeam(abbr: string) {
    setFavoriteTeams((prev) =>
      prev.includes(abbr) ? prev.filter((t) => t !== abbr) : prev.length < 5 ? [...prev, abbr] : prev,
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ displayName, bio, favoriteTeams })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg-card border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-condensed font-bold tracking-wider uppercase text-lg">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <div className="mb-4">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">
              Display Name
            </label>
            <input
              className="input w-full"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user.username}
              maxLength={40}
            />
          </div>

          <div className="mb-5">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2">
              Bio <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              className="input resize-none leading-relaxed w-full"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about your basketball taste…"
              maxLength={200}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1">
              Favorite Teams <span className="text-gray-700 normal-case tracking-normal font-normal">(up to 5)</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 mt-3">
              {Object.values(TEAMS).map((team) => {
                const selected = favoriteTeams.includes(team.abbr)
                const maxed = !selected && favoriteTeams.length >= 5
                return (
                  <button
                    key={team.abbr}
                    onClick={() => toggleTeam(team.abbr)}
                    title={`${team.city} ${team.name}`}
                    disabled={maxed}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                      selected
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-white/20 bg-bg-card2'
                    } ${maxed ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <TeamLogo abbr={team.abbr} size={28} />
                    <span className="text-[0.55rem] font-condensed font-bold text-gray-600 leading-none">{team.abbr}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary flex-[2]" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileReviewRow({ review }: { review: Review }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
        <Link to="/games/$gameId" params={{ gameId: String(review.gameId) }}
          className="text-accent font-semibold text-[0.9rem] hover:brightness-125 transition-all">
          Game #{review.gameId}
        </Link>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>
      <div className="text-[0.72rem] text-gray-600 mb-2">{formatDate(review.createdAt)}</div>
      {review.text && <p className="text-[0.83rem] text-gray-500 leading-relaxed">{review.text}</p>}
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