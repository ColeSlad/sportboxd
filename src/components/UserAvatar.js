import { jsx as _jsx } from "react/jsx-runtime";
export function UserAvatar({ user, size = 36 }) {
    const initials = user.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    if (user.avatarUrl) {
        return (_jsx("img", { src: user.avatarUrl, alt: user.displayName, className: "rounded-full flex-shrink-0 object-cover", style: { width: size, height: size } }));
    }
    return (_jsx("div", { className: "rounded-full flex items-center justify-center font-condensed font-bold flex-shrink-0 text-white", style: {
            width: size,
            height: size,
            background: user.avatarColor,
            fontSize: size * 0.35,
        }, children: initials }));
}
