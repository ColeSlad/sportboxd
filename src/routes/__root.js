import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Nav } from '~/components/Nav';
import { AuthProvider } from '~/lib/auth-context';
export const Route = createRootRoute({
    component: () => (_jsx(AuthProvider, { children: _jsxs("div", { className: "min-h-screen bg-bg", children: [_jsx(Nav, {}), _jsx("main", { className: "pb-16 sm:pb-0", children: _jsx(Outlet, {}) })] }) })),
});
