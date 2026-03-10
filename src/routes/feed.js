import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { fetchFeed, fetchSuggestedUsers, followUser } from '~/lib/api';
import { UserAvatar } from '~/components/UserAvatar';
import { StarRating } from '~/components/StarRating';
import { TeamLogo } from '~/components/TeamLogo';
import { getTeam } from '~/lib/teams';
import { formatRelativeTime, formatNumber } from '~/lib/utils';
import { supabase } from '~/lib/supabase';
export const Route = createFileRoute('/feed')({
    loader: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session)
            throw redirect({ to: '/login' });
        const [feed, suggested] = await Promise.all([
            fetchFeed(session.user.id),
            fetchSuggestedUsers(session.user.id),
        ]);
        return { feed, suggested };
    },
    component: FeedPage,
});
function FeedPage() {
    const { feed, suggested } = Route.useLoaderData();
    const [filter, setFilter] = useState('following');
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 pb-24", children: [_jsxs("div", { className: "py-8", children: [_jsx("h1", { className: "font-display text-[2.5rem] leading-none mb-1", children: "Activity" }), _jsx("p", { className: "text-gray-600 text-sm", children: "What the people you follow are watching and rating." })] }), _jsx("div", { className: "border-b border-border mb-5", children: _jsx("div", { className: "flex gap-6", children: ['following', 'all'].map((f) => (_jsx("button", { onClick: () => setFilter(f), className: `tab ${filter === f ? 'tab-active' : ''} capitalize`, style: { background: 'none', border: 'none' }, children: f === 'following' ? 'Following' : 'All Activity' }, f))) }) }), _jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [_jsx("div", { className: "flex-1 min-w-0", children: feed.length === 0
                            ? _jsx(EmptyFeed, {})
                            : _jsx("div", { className: "flex flex-col gap-3", children: feed.map((item) => _jsx(FeedItem, { item: item }, item.id)) }) }), suggested.length > 0 && (_jsxs("aside", { className: "lg:w-64 flex-shrink-0", children: [_jsx("h3", { className: "font-condensed font-bold tracking-widest uppercase text-gray-500 text-[0.8rem] mb-3", children: "Suggested" }), _jsx("div", { className: "flex flex-col gap-2", children: suggested.map((u) => _jsx(SuggestedUser, { user: u }, u.id)) })] }))] })] }));
}
function FeedItem({ item }) {
    const home = getTeam(item.game.homeTeam);
    const away = getTeam(item.game.awayTeam);
    const typeLabel = item.type === 'review' ? 'reviewed' : item.type === 'logged' ? 'logged' : 'rated a play in';
    return (_jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: "/profile/$username", params: { username: item.user.username }, children: _jsx(UserAvatar, { user: item.user, size: 38 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "text-[0.85rem] mb-1.5", children: [_jsx(Link, { to: "/profile/$username", params: { username: item.user.username }, className: "font-semibold hover:text-accent transition-colors", children: item.user.displayName }), _jsxs("span", { className: "text-gray-600", children: [" ", typeLabel, " "] }), _jsxs(Link, { to: "/games/$gameId", params: { gameId: String(item.game.id) }, className: "text-accent font-medium hover:brightness-125 transition-all", children: [away.name, " @ ", home.name] })] }), item.rating != null && _jsx("div", { className: "mb-1.5", children: _jsx(StarRating, { value: item.rating, readOnly: true, size: "sm" }) }), item.excerpt && (_jsxs("p", { className: "text-[0.82rem] text-gray-500 leading-relaxed line-clamp-2 mb-2", children: ["\"", item.excerpt, "\""] })), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-[0.7rem] text-gray-700", children: formatRelativeTime(item.time) }), _jsxs("div", { className: "flex items-center gap-1.5 bg-bg-card3 rounded-full px-2 py-0.5", children: [_jsx(TeamLogo, { abbr: item.game.homeTeam, size: 14 }), _jsxs("span", { className: "font-condensed font-bold text-[0.68rem] text-gray-500", children: [item.game.homeScore, "\u2013", item.game.awayScore] }), _jsx(TeamLogo, { abbr: item.game.awayTeam, size: 14 })] }), item.game.type !== 'Regular Season' && (_jsx("span", { className: "badge badge-green text-[0.55rem]", children: item.game.type }))] })] })] }) }));
}
function SuggestedUser({ user }) {
    const [following, setFollowing] = useState(false);
    return (_jsxs("div", { className: "card p-3 flex items-center gap-3", children: [_jsx(Link, { to: "/profile/$username", params: { username: user.username }, children: _jsx(UserAvatar, { user: user, size: 36 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(Link, { to: "/profile/$username", params: { username: user.username }, className: "block font-semibold text-[0.85rem] hover:text-accent transition-colors truncate", children: user.displayName }), _jsxs("div", { className: "text-[0.72rem] text-gray-600", children: [formatNumber(user.gamesLogged), " games \u00B7 ", formatNumber(user.reviewCount), " reviews"] })] }), _jsx("button", { className: `btn btn-sm flex-shrink-0 ${following ? 'btn-ghost' : 'btn-primary'}`, onClick: () => { setFollowing(f => !f); followUser(user.id, !following); }, children: following ? '✓' : '+' })] }));
}
function EmptyFeed() {
    return (_jsxs("div", { className: "text-center py-20 text-gray-600", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDC40" }), _jsx("p", { className: "text-sm mb-4", children: "No activity yet. Follow other users to see what they're logging." }), _jsx(Link, { to: "/browse", className: "btn btn-primary btn-sm", children: "Browse Games" })] }));
}
