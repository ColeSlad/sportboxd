import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '~/lib/utils';
const SIZE_MAP = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
export function StarRating({ value, onChange, size = 'md', accent = false, readOnly = false, }) {
    const [hovered, setHovered] = useState(0);
    const interactive = !!onChange && !readOnly;
    const display = hovered || value;
    return (_jsx("div", { className: "flex gap-0.5", role: interactive ? 'radiogroup' : undefined, children: [1, 2, 3, 4, 5].map((n) => (_jsx("button", { type: "button", role: interactive ? 'radio' : undefined, "aria-checked": interactive ? n === value : undefined, disabled: !interactive, className: cn(SIZE_MAP[size], 'leading-none transition-colors duration-100', interactive ? 'cursor-pointer' : 'cursor-default', display >= n
                ? accent
                    ? 'text-accent'
                    : 'text-yellow-400'
                : 'text-gray-700'), onMouseEnter: () => interactive && setHovered(n), onMouseLeave: () => interactive && setHovered(0), onClick: () => interactive && onChange?.(n), children: "\u2605" }, n))) }));
}
