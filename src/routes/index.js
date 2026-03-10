import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link } from '@tanstack/react-router';
import { getFeaturedGames, fetchGameReviews } from '~/lib/api';
import { GameCard } from '~/components/GameCard';
import { StarRating } from '~/components/StarRating';
import { UserAvatar } from '~/components/UserAvatar';
import { MOCK_GAMES } from '~/lib/mock-data';
import { formatRelativeTime } from '~/lib/utils';
export const Route = createFileRoute('/')({
    loader: async () => {
        const featured = await getFeaturedGames();
        const allReviews = await Promise.all(MOCK_GAMES.slice(0, 4).map((g) => fetchGameReviews(g.id)));
        const topReviews = allReviews.flat().sort((a, b) => b.likes - a.likes).slice(0, 3);
        return { featured, topReviews };
    },
    component: HomePage,
});
const COMMUNITY_STATS = [
    { label: 'Games Logged', value: '24,812' },
    { label: 'Reviews Written', value: '8,341' },
    { label: 'Play Ratings', value: '51,209' },
];
function HomePage() {
    const { featured, topReviews } = Route.useLoaderData();
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 pb-24", children: [_jsxs("div", { className: "py-14 text-center", children: [_jsx("span", { className: "badge badge-green mb-4 inline-flex", children: "2023\u201324 Season" }), _jsx("h1", { className: "font-display gradient-text text-[clamp(3rem,10vw,5.5rem)] leading-none mb-3", children: "FIXTURE" }), _jsx("p", { className: "text-gray-500 text-base font-light tracking-wide", children: "Rate every game. Log every play. Find your community." })] }), _jsx("div", { className: "grid grid-cols-3 gap-3 mb-12", children: COMMUNITY_STATS.map((s) => (_jsxs("div", { className: "card p-4 text-center", children: [_jsx("div", { className: "font-display text-accent text-[1.8rem] leading-none", children: s.value }), _jsx("div", { className: "font-condensed font-bold tracking-widest uppercase text-gray-600 text-[0.62rem] mt-1", children: s.label })] }, s.label))) }), _jsx(Section, { title: "Featured Games", href: "/browse", children: _jsx("div", { className: "flex flex-col gap-3", children: featured.featured.map((g) => _jsx(GameCard, { game: g }, g.id)) }) }), _jsx(Section, { title: "Trending This Week", children: _jsx("div", { className: "flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]", children: featured.trending.map((g) => _jsx(GameCard, { game: g, size: "sm" }, g.id)) }) }), _jsx(Section, { title: "Top Reviews", children: _jsx("div", { className: "flex flex-col gap-3", children: topReviews.map((r) => _jsx(ReviewSnippet, { review: r }, r.id)) }) }), _jsx(Section, { title: "Recently Played", href: "/browse", children: _jsx("div", { className: "flex flex-col gap-3", children: featured.recent.map((g) => _jsx(GameCard, { game: g }, g.id)) }) })] }));
}
function Section({ title, href, children }) {
    return (_jsxs("section", { className: "mb-10", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-4", children: [_jsx("h2", { className: "font-condensed font-bold tracking-widest uppercase text-gray-500 text-[0.85rem]", children: title }), href && _jsx(Link, { to: href, className: "btn btn-ghost btn-sm", children: "See All" })] }), children] }));
}
function ReviewSnippet({ review }) {
    return (_jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: "/profile/$username", params: { username: review.user.username }, children: _jsx(UserAvatar, { user: review.user, size: 36 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-start mb-1.5 gap-2 flex-wrap", children: [_jsxs("div", { className: "text-sm", children: [_jsx(Link, { to: "/profile/$username", params: { username: review.user.username }, className: "font-semibold hover:text-accent transition-colors", children: review.user.displayName }), _jsx("span", { className: "text-gray-600", children: " on " }), _jsxs(Link, { to: "/games/$gameId", params: { gameId: String(review.gameId) }, className: "text-accent font-medium hover:brightness-125 transition-all", children: ["Game #", review.gameId] })] }), _jsx(StarRating, { value: review.rating, readOnly: true, size: "sm" })] }), review.text && (_jsxs("p", { className: "text-[0.83rem] text-gray-500 leading-relaxed line-clamp-2", children: ["\"", review.text, "\""] })), _jsxs("div", { className: "flex items-center gap-3 mt-2", children: [_jsxs("span", { className: "text-[0.72rem] text-gray-700", children: ["\u2665 ", review.likes] }), _jsx("span", { className: "text-[0.7rem] text-gray-700", children: formatRelativeTime(review.createdAt) })] })] })] }) }));
}
