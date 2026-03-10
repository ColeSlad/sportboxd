import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { listGames } from '~/lib/api';
import { GameCard } from '~/components/GameCard';
import { TEAMS } from '~/lib/teams';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
const searchSchema = z.object({
    q: z.string().optional(),
    type: z.enum(['all', 'playoffs', 'finals', 'regular', 'ot']).default('all'),
    team: z.string().optional(),
    sort: z.enum(['date', 'rating', 'reviews']).default('date'),
});
export const Route = createFileRoute('/browse')({
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => search,
    loader: ({ deps }) => listGames({ type: deps.type, team: deps.team, search: deps.q, sort: deps.sort }),
    component: BrowsePage,
});
const TYPE_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'playoffs', label: 'Playoffs' },
    { value: 'finals', label: 'Finals' },
    { value: 'regular', label: 'Regular Season' },
    { value: 'ot', label: 'Overtime' },
];
const SORT_OPTIONS = [
    { value: 'date', label: 'Date' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
];
function BrowsePage() {
    const games = Route.useLoaderData();
    const search = Route.useSearch();
    const navigate = useNavigate({ from: '/browse' });
    const [showFilters, setShowFilters] = useState(false);
    function set(updates) {
        navigate({ search: (prev) => ({ ...prev, ...updates }) });
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 pb-24", children: [_jsxs("div", { className: "py-8", children: [_jsx("h1", { className: "font-display text-[2.5rem] leading-none mb-1", children: "Browse Games" }), _jsxs("p", { className: "text-gray-600 text-sm", children: [games.length, " game", games.length !== 1 ? 's' : '', " found"] })] }), _jsxs("div", { className: "relative mb-3", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" }), _jsx("input", { className: "input pl-9", placeholder: "Search teams, matchups, descriptions\u2026", defaultValue: search.q ?? '', onChange: (e) => set({ q: e.target.value || undefined }) })] }), _jsxs("div", { className: "flex items-center gap-2 mb-4 flex-wrap", children: [_jsxs("button", { className: "btn btn-ghost btn-sm flex items-center gap-1.5", onClick: () => setShowFilters(f => !f), children: [_jsx(SlidersHorizontal, { size: 13 }), " Filters"] }), TYPE_FILTERS.map((f) => (_jsx("button", { onClick: () => set({ type: f.value }), className: `badge cursor-pointer transition-all ${(search.type ?? 'all') === f.value ? 'badge-green' : 'badge-gray hover:border-white/20 hover:text-white'}`, children: f.label }, f.value)))] }), showFilters && (_jsxs("div", { className: "card p-4 mb-4 fade-in grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2", children: "Team" }), _jsxs("select", { className: "input text-[0.85rem]", value: search.team ?? '', onChange: (e) => set({ team: e.target.value || undefined }), children: [_jsx("option", { value: "", children: "All Teams" }), Object.values(TEAMS).map((t) => (_jsxs("option", { value: t.abbr, children: [t.city, " ", t.name] }, t.abbr)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-2", children: "Sort By" }), _jsx("select", { className: "input text-[0.85rem]", value: search.sort ?? 'date', onChange: (e) => set({ sort: e.target.value }), children: SORT_OPTIONS.map((o) => _jsx("option", { value: o.value, children: o.label }, o.value)) })] }), search.team && (_jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [_jsx("span", { className: "text-[0.75rem] text-gray-500", children: "Showing:" }), _jsxs("button", { className: "badge badge-green", onClick: () => set({ team: undefined }), children: [TEAMS[search.team]?.city, " ", TEAMS[search.team]?.name, " \u00D7"] })] }))] })), !showFilters && (_jsxs("div", { className: "flex items-center gap-3 mb-5", children: [_jsx("span", { className: "text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-700", children: "Sort:" }), _jsx("div", { className: "flex gap-2", children: SORT_OPTIONS.map((o) => (_jsx("button", { onClick: () => set({ sort: o.value }), className: `text-[0.75rem] font-condensed font-semibold tracking-wider uppercase transition-colors ${(search.sort ?? 'date') === o.value ? 'text-accent' : 'text-gray-600 hover:text-white'}`, children: o.label }, o.value))) })] })), games.length === 0 ? (_jsxs("div", { className: "text-center py-20 text-gray-600", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83C\uDFC0" }), _jsx("p", { className: "text-sm", children: "No games match your filters." }), _jsx("button", { className: "btn btn-ghost btn-sm mt-4", onClick: () => navigate({ search: {} }), children: "Clear filters" })] })) : (_jsx("div", { className: "flex flex-col gap-3 fade-in", children: games.map((g) => _jsx(GameCard, { game: g }, g.id)) }))] }));
}
