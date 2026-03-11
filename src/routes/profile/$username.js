import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { fetchProfile, followUser, updateProfile } from '~/lib/api';
import { getTeam, TEAMS } from '~/lib/teams';
import { formatDate, formatNumber } from '~/lib/utils';
import { TeamLogo } from '~/components/TeamLogo';
import { UserAvatar } from '~/components/UserAvatar';
import { StarRating } from '~/components/StarRating';
import { supabase, getUserColor } from '~/lib/supabase';
import { X } from 'lucide-react';
export const Route = createFileRoute('/profile/$username')({
    loader: async ({ params }) => {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUsername = session?.user.email?.split('@')[0] ?? null;
        const sessionUserId = session?.user.id ?? null;
        try {
            const data = await fetchProfile(params.username);
            return { ...data, sessionUsername, sessionUserId };
        }
        catch {
            if (session && params.username === sessionUsername) {
                const minimalUser = {
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
                };
                return { user: minimalUser, reviews: [], sessionUsername, sessionUserId };
            }
            throw notFound();
        }
    },
    component: ProfilePage,
    notFoundComponent: () => _jsx("div", { className: "text-center py-24 text-gray-500", children: "User not found." }),
});
function ProfilePage() {
    const { user: initialUser, reviews, sessionUsername, sessionUserId } = Route.useLoaderData();
    const router = useRouter();
    const isMe = !!sessionUsername && initialUser.username === sessionUsername;
    const isFollowing = !!sessionUserId && initialUser.followers.includes(sessionUserId);
    const [user, setUser] = useState(initialUser);
    const [following, setFollowing] = useState(isFollowing);
    const [tab, setTab] = useState('games');
    const [showEditModal, setShowEditModal] = useState(false);
    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';
    async function handleFollow() {
        const next = !following;
        setFollowing(next);
        await followUser(user.id, next);
    }
    async function handleSaveProfile(data) {
        await updateProfile(data);
        setUser((u) => ({
            ...u,
            displayName: data.displayName.trim() || u.username,
            bio: data.bio.trim() || null,
            favoriteTeams: data.favoriteTeams,
        }));
        setShowEditModal(false);
        router.invalidate();
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 pb-24", children: [_jsxs("div", { className: "pt-8 pb-6 flex gap-5 items-start flex-wrap", children: [_jsx(UserAvatar, { user: user, size: 76 }), _jsxs("div", { className: "flex-1 min-w-[200px]", children: [_jsxs("div", { className: "flex items-start justify-between flex-wrap gap-3 mb-2", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-[1.5rem] font-bold", children: user.displayName }), _jsxs("p", { className: "text-gray-500 text-[0.85rem]", children: ["@", user.username] })] }), !isMe
                                        ? _jsx("button", { className: `btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`, onClick: handleFollow, children: following ? 'Following' : '+ Follow' })
                                        : _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowEditModal(true), children: "Edit Profile" })] }), user.bio && _jsx("p", { className: "text-gray-500 text-[0.85rem] leading-relaxed mb-3 max-w-sm", children: user.bio }), _jsx("div", { className: "flex gap-2 flex-wrap", children: user.favoriteTeams.map((abbr) => (_jsxs(Link, { to: "/browse", search: { team: abbr, type: 'all', sort: 'date' }, className: "flex items-center gap-1.5 hover:opacity-80 transition-opacity", children: [_jsx(TeamLogo, { abbr: abbr, size: 22 }), _jsx("span", { className: "text-[0.75rem] text-gray-500 font-condensed font-semibold", children: getTeam(abbr).name })] }, abbr))) })] })] }), _jsx("div", { className: "grid grid-cols-4 gap-2.5 mb-6", children: [
                    { label: 'Games', value: formatNumber(user.gamesLogged) },
                    { label: 'Reviews', value: formatNumber(user.reviewCount) },
                    { label: 'Avg Rating', value: avgRating },
                    { label: 'Following', value: user.following.length },
                ].map((s) => (_jsxs("div", { className: "card p-3 text-center", children: [_jsx("div", { className: "font-condensed font-bold text-accent text-[1.3rem]", children: s.value }), _jsx("div", { className: "font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-0.5", children: s.label })] }, s.label))) }), _jsx("div", { className: "border-b border-border mb-5", children: _jsx("div", { className: "flex gap-6", children: [
                        { id: 'games', label: `Games (${reviews.length})` },
                        { id: 'reviews', label: `Reviews (${reviews.length})` },
                    ].map((t) => (_jsx("button", { onClick: () => setTab(t.id), className: `tab ${tab === t.id ? 'tab-active' : ''}`, style: { background: 'none', border: 'none' }, children: t.label }, t.id))) }) }), tab === 'games' && (_jsx("div", { className: "fade-in flex flex-col gap-3", children: reviews.length === 0
                    ? _jsx(EmptyState, { text: "No logged games yet." })
                    : reviews.map((r) => _jsx(ProfileReviewRow, { review: r }, r.id)) })), tab === 'reviews' && (_jsx("div", { className: "fade-in flex flex-col gap-3", children: reviews.length === 0
                    ? _jsx(EmptyState, { text: "No reviews yet." })
                    : reviews.map((r) => _jsx(ProfileReviewRow, { review: r }, r.id)) })), showEditModal && (_jsx(EditProfileModal, { user: user, onClose: () => setShowEditModal(false), onSave: handleSaveProfile }))] }));
}
function EditProfileModal({ user, onClose, onSave }) {
    const [displayName, setDisplayName] = useState(user.displayName);
    const [bio, setBio] = useState(user.bio ?? '');
    const [favoriteTeams, setFavoriteTeams] = useState(user.favoriteTeams);
    const [saving, setSaving] = useState(false);
    function toggleTeam(abbr) {
        setFavoriteTeams((prev) => prev.includes(abbr) ? prev.filter((t) => t !== abbr) : prev.length < 5 ? [...prev, abbr] : prev);
    }
    async function handleSave() {
        setSaving(true);
        try {
            await onSave({ displayName, bio, favoriteTeams });
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: _jsx("div", { className: "bg-bg-card border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-5", children: [_jsx("h2", { className: "font-condensed font-bold tracking-wider uppercase text-lg", children: "Edit Profile" }), _jsx("button", { onClick: onClose, className: "text-gray-600 hover:text-white transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2", children: "Display Name" }), _jsx("input", { className: "input w-full", value: displayName, onChange: (e) => setDisplayName(e.target.value), placeholder: user.username, maxLength: 40 })] }), _jsxs("div", { className: "mb-5", children: [_jsxs("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2", children: ["Bio ", _jsx("span", { className: "text-gray-700 normal-case tracking-normal font-normal", children: "(optional)" })] }), _jsx("textarea", { className: "input resize-none leading-relaxed w-full", rows: 3, value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Tell people about your basketball taste\u2026", maxLength: 200 })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1", children: ["Favorite Teams ", _jsx("span", { className: "text-gray-700 normal-case tracking-normal font-normal", children: "(up to 5)" })] }), _jsx("div", { className: "grid grid-cols-5 gap-1.5 mt-3", children: Object.values(TEAMS).map((team) => {
                                    const selected = favoriteTeams.includes(team.abbr);
                                    const maxed = !selected && favoriteTeams.length >= 5;
                                    return (_jsxs("button", { onClick: () => toggleTeam(team.abbr), title: `${team.city} ${team.name}`, disabled: maxed, className: `flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${selected
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border hover:border-white/20 bg-bg-card2'} ${maxed ? 'opacity-40 cursor-not-allowed' : ''}`, children: [_jsx(TeamLogo, { abbr: team.abbr, size: 28 }), _jsx("span", { className: "text-[0.55rem] font-condensed font-bold text-gray-600 leading-none", children: team.abbr })] }, team.abbr));
                                }) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "btn btn-ghost flex-1", onClick: onClose, children: "Cancel" }), _jsx("button", { className: "btn btn-primary flex-[2]", onClick: handleSave, disabled: saving, children: saving ? 'Saving…' : 'Save Changes' })] })] }) }) }));
}
function ProfileReviewRow({ review }) {
    return (_jsxs("div", { className: "card p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2 gap-3 flex-wrap", children: [_jsxs(Link, { to: "/games/$gameId", params: { gameId: String(review.gameId) }, className: "text-accent font-semibold text-[0.9rem] hover:brightness-125 transition-all", children: ["Game #", review.gameId] }), _jsx(StarRating, { value: review.rating, readOnly: true, size: "sm" })] }), _jsx("div", { className: "text-[0.72rem] text-gray-600 mb-2", children: formatDate(review.createdAt) }), review.text && _jsx("p", { className: "text-[0.83rem] text-gray-500 leading-relaxed", children: review.text })] }));
}
function EmptyState({ text }) {
    return (_jsxs("div", { className: "text-center py-16 text-gray-600", children: [_jsx("div", { className: "text-3xl mb-3", children: "\uD83C\uDFC0" }), _jsx("p", { className: "text-sm", children: text })] }));
}
