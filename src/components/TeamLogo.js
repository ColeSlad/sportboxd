import { jsx as _jsx } from "react/jsx-runtime";
import { getTeam } from '~/lib/teams';
export function TeamLogo({ abbr, size = 40 }) {
    const team = getTeam(abbr);
    return (_jsx("div", { className: "rounded-full flex items-center justify-center font-display flex-shrink-0", style: {
            width: size,
            height: size,
            background: team.color,
            color: team.textColor,
            fontSize: size * 0.22,
            letterSpacing: '0.03em',
        }, children: abbr }));
}
