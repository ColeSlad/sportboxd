import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { fetchProfile, followUser } from '~/lib/api';
import { getTeam } from '~/lib/teams';
import { formatDate, formatNumber } from '~/lib/utils';
import { TeamLogo } from '~/components/TeamLogo';
import { UserAvatar } from '~/components/UserAvatar';
import { StarRating } from '~/components/StarRating';
import { GameCard } from '~/components/GameCard';
import { MOCK_GAMES, MOCK_USERS } from '~/lib/mock-data';
import { supabase, getUserColor } from '~/lib/supabase';
export const Route = createFileRoute('/profile/$username')({
    loader: async ({ params }) => {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUsername = session?.user.email?.split('@')[0] ?? null;
        try {
            const data = await fetchProfile(params.username);
            return { ...data, sessionUsername };
        }
        catch {
            // If this is the logged-in user's own profile, build it from session data
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
                return { user: minimalUser, reviews: [], sessionUsername };
            }
            throw notFound();
        }
    },
    component: ProfilePage,
    notFoundComponent: () => _jsx("div", { className: "text-center py-24 text-gray-500", children: "User not found." }),
});
function ProfilePage() {
    const { user, reviews, sessionUsername } = Route.useLoaderData();
    const isMe = !!sessionUsername && user.username === sessionUsername;
    const [following, setFollowing] = useState(MOCK_USERS[0].following.includes(user.id));
    const [tab, setTab] = useState('games');
    const loggedGames = reviews.map((r) => MOCK_GAMES.find((g) => g.id === r.gameId)).filter(Boolean);
    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';
    async function handleFollow() {
        const next = !following;
        setFollowing(next);
        await followUser(user.id, next);
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 pb-24", children: [_jsxs("div", { className: "pt-8 pb-6 flex gap-5 items-start flex-wrap", children: [_jsx(UserAvatar, { user: user, size: 76 }), _jsxs("div", { className: "flex-1 min-w-[200px]", children: [_jsxs("div", { className: "flex items-start justify-between flex-wrap gap-3 mb-2", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-[1.5rem] font-bold", children: user.displayName }), _jsxs("p", { className: "text-gray-500 text-[0.85rem]", children: ["@", user.username] })] }), !isMe
                                        ? _jsx("button", { className: `btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`, onClick: handleFollow, children: following ? 'Following' : '+ Follow' })
                                        : _jsx("button", { className: "btn btn-ghost btn-sm", children: "Edit Profile" })] }), user.bio && _jsx("p", { className: "text-gray-500 text-[0.85rem] leading-relaxed mb-3 max-w-sm", children: user.bio }), _jsx("div", { className: "flex gap-2 flex-wrap", children: user.favoriteTeams.map((abbr) => (_jsxs(Link, { to: "/browse", search: { team: abbr, type: 'all', sort: 'date' }, className: "flex items-center gap-1.5 hover:opacity-80 transition-opacity", children: [_jsx(TeamLogo, { abbr: abbr, size: 22 }), _jsx("span", { className: "text-[0.75rem] text-gray-500 font-condensed font-semibold", children: getTeam(abbr).name })] }, abbr))) })] })] }), _jsx("div", { className: "grid grid-cols-4 gap-2.5 mb-6", children: [
                    { label: 'Games', value: formatNumber(user.gamesLogged) },
                    { label: 'Reviews', value: formatNumber(user.reviewCount) },
                    { label: 'Avg Rating', value: avgRating },
                    { label: 'Following', value: user.following.length },
                ].map((s) => (_jsxs("div", { className: "card p-3 text-center", children: [_jsx("div", { className: "font-condensed font-bold text-accent text-[1.3rem]", children: s.value }), _jsx("div", { className: "font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-0.5", children: s.label })] }, s.label))) }), _jsx("div", { className: "border-b border-border mb-5", children: _jsx("div", { className: "flex gap-6", children: [
                        { id: 'games', label: `Games (${loggedGames.length})` },
                        { id: 'reviews', label: `Reviews (${reviews.length})` },
                    ].map((t) => (_jsx("button", { onClick: () => setTab(t.id), className: `tab ${tab === t.id ? 'tab-active' : ''}`, style: { background: 'none', border: 'none' }, children: t.label }, t.id))) }) }), tab === 'games' && (_jsx("div", { className: "fade-in flex flex-col gap-3", children: loggedGames.length === 0
                    ? _jsx(EmptyState, { text: "No logged games yet." })
                    : loggedGames.map((g) => g && _jsx(GameCard, { game: g }, g.id)) })), tab === 'reviews' && (_jsx("div", { className: "fade-in flex flex-col gap-3", children: reviews.length === 0
                    ? _jsx(EmptyState, { text: "No reviews yet." })
                    : reviews.map((r) => _jsx(ProfileReviewRow, { review: r }, r.id)) }))] }));
}
function ProfileReviewRow({ review }) {
    const game = MOCK_GAMES.find((g) => g.id === review.gameId);
    if (!game)
        return null;
    return (_jsxs("div", { className: "card p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2 gap-3 flex-wrap", children: [_jsxs(Link, { to: "/games/$gameId", params: { gameId: String(game.id) }, className: "text-accent font-semibold text-[0.9rem] hover:brightness-125 transition-all", children: [game.awayTeam, " @ ", game.homeTeam] }), _jsx(StarRating, { value: review.rating, readOnly: true, size: "sm" })] }), _jsxs("div", { className: "score-num text-[1.05rem] text-gray-600 mb-2", children: [game.awayScore, "\u2013", game.homeScore, _jsx("span", { className: "font-body font-normal text-[0.72rem] ml-2", children: formatDate(game.date) })] }), review.text && _jsx("p", { className: "text-[0.83rem] text-gray-500 leading-relaxed", children: review.text })] }));
}
function EmptyState({ text }) {
    return (_jsxs("div", { className: "text-center py-16 text-gray-600", children: [_jsx("div", { className: "text-3xl mb-3", children: "\uD83C\uDFC0" }), _jsx("p", { className: "text-sm", children: text })] }));
}
