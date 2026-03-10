import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from '@tanstack/react-router';
import { Home, Search, Radio, User } from 'lucide-react';
import { useAuth } from '~/lib/auth-context';
import { getUserInitials, getUserColor } from '~/lib/supabase';
const NAV_ITEMS = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/browse', label: 'Browse', icon: Search },
    { to: '/feed', label: 'Feed', icon: Radio },
    { to: '/profile/fadeaway_frank', label: 'Profile', icon: User },
];
export function Nav() {
    const { user, signOut } = useAuth();
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 flex items-center h-13 gap-6", children: [_jsx(Link, { to: "/", className: "flex items-center gap-2 flex-shrink-0", children: _jsx("span", { className: "font-display text-[1.4rem] tracking-wider gradient-text", children: "FIXTURE" }) }), _jsx("div", { className: "hidden sm:flex items-center gap-5 flex-1", children: NAV_ITEMS.map((item) => (_jsx(Link, { to: item.to, activeOptions: item.to === '/' ? { exact: true } : {}, className: "nav-link", activeProps: { className: 'nav-link nav-link-active' }, children: item.label }, item.to))) }), _jsx("div", { className: "ml-auto flex items-center gap-2", children: user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/profile/$username", params: { username: user.email?.split('@')[0] ?? 'me' }, children: _jsx("div", { className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-condensed font-bold flex-shrink-0", style: { background: getUserColor(user.id) }, children: getUserInitials(user.email ?? 'U') }) }), _jsx("button", { onClick: () => signOut(), className: "btn btn-ghost btn-sm hidden sm:block", children: "Sign out" })] })) : (_jsx(Link, { to: "/login", className: "btn btn-primary btn-sm", children: "Sign in" })) })] }) }), _jsx("nav", { className: "sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border flex pb-safe", children: NAV_ITEMS.map((item) => (_jsxs(Link, { to: item.to, activeOptions: item.to === '/' ? { exact: true } : {}, className: "flex-1 flex flex-col items-center gap-1 py-2 text-gray-600 transition-colors duration-200", activeProps: { className: 'flex-1 flex flex-col items-center gap-1 py-2 text-accent transition-colors duration-200' }, children: [_jsx(item.icon, { size: 18 }), _jsx("span", { className: "font-condensed font-bold tracking-wider uppercase text-[0.58rem]", children: item.label })] }, item.to))) })] }));
}
