import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StarRating } from './StarRating';
import { submitPlayRating } from '~/lib/api';
const PLAY_ICONS = {
    '3-Pointer': '🎯',
    Dunk: '🏀',
    Block: '🛡️',
    Layup: '🏃',
    Assist: '🤝',
    'Mid-Range': '🎯',
    Heave: '🌋',
    'Free Throw': '🎳',
    'Post-Up': '💪',
    Steal: '⚡',
    Other: '⚡',
};
export function PlayCard({ play, gameId, initialRating = 0 }) {
    const [rating, setRating] = useState(initialRating);
    const [showNote, setShowNote] = useState(false);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    async function handleRate(r) {
        setRating(r);
        setSaving(true);
        try {
            await submitPlayRating({ gameId, playId: play.id, rating: r });
        }
        finally {
            setSaving(false);
        }
    }
    async function handleSaveNote() {
        setSaving(true);
        try {
            await submitPlayRating({ gameId, playId: play.id, rating: rating || 3, note: note || undefined });
            setShowNote(false);
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx("div", { className: "card p-4 border-l-[3px] border-l-transparent hover:border-l-accent transition-all duration-200", children: _jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("div", { className: "w-11 h-11 rounded-lg bg-bg-card3 flex items-center justify-center text-xl flex-shrink-0", children: PLAY_ICONS[play.type] ?? '⚡' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-semibold text-[0.88rem]", children: play.player }), _jsx("span", { className: "badge badge-gray", children: play.team })] }), _jsx("span", { className: "font-condensed text-[0.72rem] text-accent font-bold tracking-wider flex-shrink-0 ml-2", children: play.time })] }), _jsx("p", { className: "text-[0.83rem] text-gray-500 leading-relaxed mb-3", children: play.description }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: "text-yellow-400 text-sm", children: "\u2605" }), _jsx("span", { className: "font-bold text-[0.88rem] font-condensed", children: play.avgRating.toFixed(1) }), _jsxs("span", { className: "text-gray-700 text-[0.72rem]", children: ["(", play.ratingCount.toLocaleString(), ")"] }), _jsx("span", { className: "badge badge-gray text-[0.6rem]", children: play.type })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-[0.7rem] font-condensed font-bold tracking-widest uppercase text-gray-700", children: "Your rating:" }), _jsx(StarRating, { value: rating, onChange: handleRate, size: "sm", accent: true }), saving && _jsx("span", { className: "text-[0.68rem] text-gray-700", children: "saving\u2026" }), rating > 0 && !saving && (_jsxs("span", { className: "text-[0.68rem] text-accent", children: ["\u2713 ", rating, "/5"] }))] }), _jsx("button", { className: "btn btn-ghost btn-sm text-[0.68rem] flex items-center gap-1", onClick: () => setShowNote((s) => !s), children: "\uD83D\uDCAC Note" })] }), showNote && (_jsxs("div", { className: "mt-3 fade-in", children: [_jsx("textarea", { className: "input resize-none text-[0.82rem]", rows: 2, placeholder: "What made this play stand out?", value: note, onChange: (e) => setNote(e.target.value) }), _jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => { setShowNote(false); setNote(''); }, children: "Cancel" }), _jsx("button", { className: "btn btn-primary btn-sm", disabled: saving, onClick: handleSaveNote, children: saving ? 'Saving…' : 'Save Note' })] })] }))] })] }) }));
}
