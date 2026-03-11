import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { fetchBoxScore } from '~/lib/nba';
import { getGameDetail, fetchGameReviews, submitReview } from '~/lib/api';
import { supabase } from '~/lib/supabase';
import { getTeam } from '~/lib/teams';
import { formatDate, formatNumber } from '~/lib/utils';
import { TeamLogo } from '~/components/TeamLogo';
import { StarRating } from '~/components/StarRating';
import { ReviewCard } from '~/components/ReviewCard';
import { PlayCard } from '~/components/PlayCard';
import { useAuth } from '~/lib/auth-context';
import { ArrowLeft, X } from 'lucide-react';
export const Route = createFileRoute('/games/$gameId')({
    loader: async ({ params }) => {
        const id = Number(params.gameId);
        if (isNaN(id))
            throw notFound();
        const [detail, reviews, { data: { session } }] = await Promise.all([
            getGameDetail(id),
            fetchGameReviews(id),
            supabase.auth.getSession(),
        ]);
        const myReview = session
            ? reviews.find((r) => r.userId === session.user.id) ?? null
            : null;
        return { ...detail, reviews, myReview };
    },
    component: GameDetailPage,
    notFoundComponent: () => _jsx("div", { className: "text-center py-24 text-gray-500", children: "Game not found." }),
});
function GameDetailPage() {
    const { game, plays, reviews: initialReviews, myReview } = Route.useLoaderData();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('reviews');
    const [showLogModal, setShowLogModal] = useState(false);
    const [isLogged, setIsLogged] = useState(!!myReview);
    const [myRating, setMyRating] = useState(myReview?.rating ?? 0);
    const [reviews, setReviews] = useState(initialReviews);
    const home = getTeam(game.homeTeam);
    const away = getTeam(game.awayTeam);
    const ratingDist = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
    });
    function openLogModal() {
        if (!authUser) {
            navigate({ to: '/login' });
            return;
        }
        setShowLogModal(true);
    }
    async function handleSubmitReview(rating, text) {
        const newReview = await submitReview({ gameId: game.id, rating, text: text || undefined });
        setReviews((prev) => prev.some((r) => r.userId === newReview.userId)
            ? prev.map((r) => (r.userId === newReview.userId ? newReview : r))
            : [newReview, ...prev]);
        setIsLogged(true);
        setMyRating(rating);
        setShowLogModal(false);
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto pb-24", children: [_jsx("div", { className: "px-4 pt-4", children: _jsxs(Link, { to: "/browse", className: "btn btn-ghost btn-sm inline-flex items-center gap-1.5", children: [_jsx(ArrowLeft, { size: 13 }), " Browse"] }) }), _jsxs("div", { className: "relative px-4 pt-6 pb-8 overflow-hidden", style: { background: `linear-gradient(135deg, ${away.color}18 0%, transparent 50%, ${home.color}18 100%)` }, children: [_jsx("div", { className: "absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-bg" }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex gap-2 mb-5 flex-wrap", children: [game.type !== 'Regular Season' && _jsx("span", { className: "badge badge-green", children: game.type }), game.gameLabel && _jsx("span", { className: "badge badge-gray", children: game.gameLabel }), game.overtime && _jsx("span", { className: "badge badge-red", children: "Overtime" }), _jsx("span", { className: "badge badge-gray", children: game.season })] }), _jsxs("div", { className: "flex items-center gap-4 mb-5 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx(TeamLogo, { abbr: game.awayTeam, size: 52 }), _jsxs("div", { children: [_jsx("div", { className: "font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500", children: away.city }), _jsx("div", { className: "font-display text-[2rem] leading-none", children: away.name })] })] }), _jsxs("div", { className: "text-center flex-shrink-0", children: [_jsxs("div", { className: "score-num text-[clamp(2.2rem,6vw,3.5rem)]", children: [_jsx("span", { className: game.awayScore > game.homeScore ? 'text-white' : 'text-gray-600', children: game.awayScore }), _jsx("span", { className: "text-gray-700 mx-2", children: "\u2013" }), _jsx("span", { className: game.homeScore > game.awayScore ? 'text-white' : 'text-gray-600', children: game.homeScore })] }), _jsxs("div", { className: "text-[0.6rem] tracking-widest font-condensed font-bold uppercase text-gray-700 mt-0.5", children: ["FINAL", game.overtime ? '/OT' : '', " \u00B7 ", formatDate(game.date)] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-1 justify-end", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-condensed font-bold text-[0.75rem] tracking-widest uppercase text-gray-500", children: home.city }), _jsx("div", { className: "font-display text-[2rem] leading-none", children: home.name })] }), _jsx(TeamLogo, { abbr: game.homeTeam, size: 52 })] })] }), _jsx("p", { className: "text-[0.88rem] text-gray-500 leading-relaxed max-w-lg", children: game.description })] })] }), _jsx("div", { className: "px-4 mb-6", children: _jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex gap-5 items-center flex-wrap", children: [_jsxs("div", { className: "text-center flex-shrink-0", children: [_jsx("div", { className: "font-display text-accent text-[2.8rem] leading-none", children: game.avgRating.toFixed(1) }), _jsx(StarRating, { value: Math.round(game.avgRating), readOnly: true, size: "sm" }), _jsxs("div", { className: "text-[0.7rem] text-gray-600 mt-1", children: [formatNumber(game.reviewCount), " ratings"] })] }), _jsx("div", { className: "flex-1 min-w-[140px]", children: ratingDist.map(({ star, count, pct }) => (_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-[0.7rem] text-gray-600 w-2 text-right", children: star }), _jsx("span", { className: "text-yellow-400 text-[0.65rem]", children: "\u2605" }), _jsx("div", { className: "flex-1 h-1 bg-bg-card3 rounded-full", children: _jsx("div", { className: "h-1 bg-accent rounded-full transition-all", style: { width: `${pct}%` } }) }), _jsx("span", { className: "text-[0.65rem] text-gray-700 w-4 text-right", children: count })] }, star))) }), _jsxs("div", { className: "flex flex-col items-center gap-2 flex-shrink-0 min-w-[120px]", children: [isLogged ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-[0.75rem] font-condensed font-bold text-accent tracking-wider", children: "\u2713 Logged" }), _jsx(StarRating, { value: myRating, readOnly: true, size: "sm", accent: true })] })) : (_jsx("button", { className: "btn btn-primary w-full", onClick: openLogModal, children: "+ Log Game" })), _jsxs("span", { className: "text-[0.68rem] text-gray-700 text-center", children: [formatNumber(game.viewCount), " watched"] })] })] }) }) }), _jsx("div", { className: "border-b border-border px-4 mb-5", children: _jsx("div", { className: "flex gap-6 overflow-x-auto [scrollbar-width:none]", children: [
                        { id: 'reviews', label: `Reviews (${reviews.length})` },
                        { id: 'plays', label: `Key Plays (${plays.length})` },
                        { id: 'boxscore', label: 'Box Score' },
                    ].map((t) => (_jsx("button", { onClick: () => setTab(t.id), className: `tab ${tab === t.id ? 'tab-active' : ''}`, style: { background: 'none', border: 'none' }, children: t.label }, t.id))) }) }), _jsxs("div", { className: "px-4", children: [tab === 'reviews' && (_jsxs("div", { className: "fade-in", children: [!isLogged && (_jsxs("div", { className: "card border-dashed p-4 mb-4 text-center", children: [_jsx("p", { className: "text-gray-600 text-sm mb-3", children: "Watched this game? Share your take." }), _jsx("button", { className: "btn btn-primary btn-sm", onClick: openLogModal, children: "Write a Review" })] })), _jsx("div", { className: "flex flex-col gap-3", children: reviews.length === 0
                                    ? _jsx("div", { className: "text-center py-12 text-gray-600", children: "No reviews yet \u2014 be the first." })
                                    : reviews.map((r) => {
                                        const highlight = r.playHighlight ? plays.find((p) => p.id === r.playHighlight) : undefined;
                                        return _jsx(ReviewCard, { review: r, highlightedPlay: highlight }, r.id);
                                    }) })] })), tab === 'plays' && (_jsxs("div", { className: "fade-in", children: [_jsx("p", { className: "text-[0.82rem] text-gray-600 mb-4", children: "Rate individual plays \u2014 the key differentiator on Fixture." }), _jsx("div", { className: "flex flex-col gap-3", children: plays.map((p) => _jsx(PlayCard, { play: p, gameId: game.id }, p.id)) }), _jsxs("div", { className: "mt-4 px-3 py-3 bg-bg-card2 rounded-lg text-[0.72rem] text-gray-700 border-l-[3px] border-border", children: [_jsx("strong", { className: "text-gray-500", children: "Dev note:" }), " Play-by-play is currently mocked. Connect ", _jsx("code", { className: "text-accent", children: "src/lib/nba.ts \u2192 fetchPlayByPlay()" }), " or SportRadar."] })] })), tab === 'boxscore' && (_jsx("div", { className: "fade-in overflow-x-auto", children: _jsx(BoxScoreTable, { gameId: game.id, homeTeam: game.homeTeam, awayTeam: game.awayTeam }) }))] }), showLogModal && (_jsx(LogModal, { game: game, initialRating: myRating, initialText: myReview?.text ?? '', onClose: () => setShowLogModal(false), onSubmit: handleSubmitReview }))] }));
}
function LogModal({ game, initialRating = 0, initialText = '', onClose, onSubmit }) {
    const [rating, setRating] = useState(initialRating);
    const [text, setText] = useState(initialText);
    const [saving, setSaving] = useState(false);
    const LABELS = ['', 'Boring — skip it', 'Below average', 'Worth watching', 'Really good', 'All-time classic'];
    async function handleSubmit() {
        if (!rating)
            return;
        setSaving(true);
        await onSubmit(rating, text);
        setSaving(false);
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: _jsx("div", { className: "bg-bg-card border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-5", children: [_jsx("h2", { className: "font-condensed font-bold tracking-wider uppercase text-lg", children: "Log & Review" }), _jsx("button", { onClick: onClose, className: "text-gray-600 hover:text-white transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "card p-3 mb-5 flex items-center gap-3", children: [_jsx(TeamLogo, { abbr: game.awayTeam, size: 30 }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-condensed font-bold text-[0.88rem]", children: [getTeam(game.awayTeam).name, " @ ", getTeam(game.homeTeam).name] }), _jsx("div", { className: "text-[0.72rem] text-gray-600", children: formatDate(game.date) })] }), _jsxs("div", { className: "score-num text-xl", children: [game.awayScore, "\u2013", game.homeScore] }), _jsx(TeamLogo, { abbr: game.homeTeam, size: 30 })] }), _jsxs("div", { className: "mb-5", children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-3", children: "Your Rating" }), _jsx(StarRating, { value: rating, onChange: setRating, size: "lg" }), rating > 0 && _jsx("p", { className: "text-[0.82rem] text-gray-500 mt-2", children: LABELS[rating] })] }), _jsxs("div", { className: "mb-5", children: [_jsxs("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2", children: ["Review ", _jsx("span", { className: "text-gray-700 normal-case tracking-normal font-normal", children: "(optional)" })] }), _jsx("textarea", { className: "input resize-none leading-relaxed", rows: 4, placeholder: "What made this game special? Who showed up?", value: text, onChange: (e) => setText(e.target.value) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "btn btn-ghost flex-1", onClick: onClose, children: "Cancel" }), _jsx("button", { className: "btn btn-primary flex-[2]", style: { opacity: rating === 0 ? 0.5 : 1 }, disabled: rating === 0 || saving, onClick: handleSubmit, children: saving ? 'Saving…' : rating === 0 ? 'Select a rating' : 'Log Game' })] })] }) }) }));
}
function BoxScoreTable({ gameId, homeTeam, awayTeam }) {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        fetchBoxScore(gameId).then(setRows).catch(() => setError(true));
    }, [gameId]);
    if (error)
        return _jsx("div", { className: "py-12 text-center text-gray-600", children: "Stats not available for this game." });
    if (!rows)
        return _jsx("div", { className: "py-12 text-center text-gray-600 animate-pulse", children: "Loading stats\u2026" });
    if (rows.length === 0)
        return _jsx("div", { className: "py-12 text-center text-gray-600", children: "No stats available \u2014 game may not have started yet." });
    const awayRows = rows.filter((r) => r.team === awayTeam);
    const homeRows = rows.filter((r) => r.team === homeTeam);
    return (_jsx("div", { className: "flex flex-col gap-6", children: [{ abbr: awayTeam, rows: awayRows }, { abbr: homeTeam, rows: homeRows }].map(({ abbr, rows: teamRows }) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TeamLogo, { abbr: abbr, size: 18 }), _jsxs("span", { className: "font-condensed font-bold tracking-widest uppercase text-[0.72rem] text-gray-500", children: [getTeam(abbr).city, " ", getTeam(abbr).name] })] }), _jsxs("table", { className: "w-full border-collapse text-[0.82rem]", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-border", children: ['Player', 'MIN', 'PTS', 'REB', 'AST', 'FG%', '3P%', 'STL', 'BLK'].map((col) => (_jsx("th", { className: "pb-2 pt-1 text-[0.68rem] font-condensed font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap", style: { textAlign: col === 'Player' ? 'left' : 'right', padding: '6px 8px' }, children: col }, col))) }) }), _jsx("tbody", { children: teamRows.map((row) => (_jsxs("tr", { className: "border-b border-border/50 hover:bg-bg-card2 transition-colors", children: [_jsx("td", { className: "py-2 px-2", children: _jsx("span", { className: "font-medium", children: row.player }) }), _jsx("td", { className: "py-2 px-2 text-right text-gray-600", children: row.min }), _jsx("td", { className: "py-2 px-2 text-right font-bold", children: row.pts }), _jsx("td", { className: "py-2 px-2 text-right", children: row.reb }), _jsx("td", { className: "py-2 px-2 text-right", children: row.ast }), _jsx("td", { className: "py-2 px-2 text-right", children: row.fgPct }), _jsx("td", { className: "py-2 px-2 text-right", children: row.fg3Pct }), _jsx("td", { className: "py-2 px-2 text-right", children: row.stl }), _jsx("td", { className: "py-2 px-2 text-right", children: row.blk })] }, row.player))) })] })] }, abbr))) }));
}
