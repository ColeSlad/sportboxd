import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { StarRating } from './StarRating';
import { UserAvatar } from './UserAvatar';
import { toggleLike } from '~/lib/api';
import { formatRelativeTime } from '~/lib/utils';
export function ReviewCard({ review, highlightedPlay }) {
    const [likes, setLikes] = useState(review.likes);
    const [liked, setLiked] = useState(false);
    async function handleLike() {
        if (liked)
            return;
        setLiked(true);
        setLikes((n) => n + 1);
        await toggleLike(review.id);
    }
    return (_jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: "/profile/$username", params: { username: review.user.username }, children: _jsx(UserAvatar, { user: review.user, size: 40 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-center mb-2 flex-wrap gap-2", children: [_jsxs("div", { children: [_jsx(Link, { to: "/profile/$username", params: { username: review.user.username }, className: "font-semibold hover:text-accent transition-colors", children: review.user.displayName }), _jsxs("span", { className: "text-gray-600 text-[0.75rem] ml-2", children: ["@", review.user.username] })] }), _jsx(StarRating, { value: review.rating, readOnly: true, size: "sm" })] }), review.text && (_jsx("p", { className: "text-[0.85rem] text-gray-400 leading-relaxed mb-3", children: review.text })), highlightedPlay && (_jsxs("div", { className: "bg-bg-card3 border-l-[3px] border-l-accent rounded-r-md px-3 py-2 mb-3", children: [_jsxs("div", { className: "text-[0.65rem] font-condensed font-bold tracking-widest uppercase text-accent mb-1", children: ["Highlighted Play \u00B7 ", highlightedPlay.time] }), _jsx("div", { className: "text-[0.8rem] text-gray-500", children: highlightedPlay.description })] })), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: handleLike, className: `text-[0.78rem] flex items-center gap-1.5 transition-colors ${liked ? 'text-red-400' : 'text-gray-700 hover:text-gray-400'}`, children: [liked ? '♥' : '♡', " ", likes] }), _jsx("span", { className: "text-[0.7rem] text-gray-700", children: formatRelativeTime(review.createdAt) })] })] })] }) }));
}
