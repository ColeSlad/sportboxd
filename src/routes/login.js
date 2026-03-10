import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '~/lib/supabase';
export const Route = createFileRoute('/login')({
    loader: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session)
            throw redirect({ to: '/feed' });
        return null;
    },
    component: LoginPage,
});
function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            setConfirmed(true);
        }
        else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            navigate({ to: '/feed' });
        }
        setLoading(false);
    }
    if (confirmed) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4", children: _jsxs("div", { className: "card p-8 max-w-sm w-full text-center", children: [_jsx("div", { className: "text-3xl mb-4", children: "\uD83D\uDCEC" }), _jsx("h2", { className: "font-display text-2xl mb-2", children: "Check your email" }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["We sent a confirmation link to ", _jsx("strong", { className: "text-white", children: email }), ". Click it to activate your account, then come back and sign in."] }), _jsx("button", { className: "btn btn-ghost btn-sm mt-6", onClick: () => { setConfirmed(false); setMode('signin'); }, children: "Back to sign in" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "font-display gradient-text text-[2.5rem] tracking-wider", children: "FIXTURE" }), _jsx("p", { className: "text-gray-600 text-sm mt-1", children: "Rate every game. Log every play." })] }), _jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "flex border-b border-border mb-6", children: ['signin', 'signup'].map((m) => (_jsx("button", { onClick: () => { setMode(m); setError(null); }, className: `tab flex-1 ${mode === m ? 'tab-active' : ''}`, style: { background: 'none', border: 'none' }, children: m === 'signin' ? 'Sign in' : 'Create account' }, m))) }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1.5", children: "Email" }), _jsx("input", { type: "email", required: true, autoComplete: "email", className: "input w-full", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1.5", children: "Password" }), _jsx("input", { type: "password", required: true, autoComplete: mode === 'signup' ? 'new-password' : 'current-password', className: "input w-full", value: password, onChange: (e) => setPassword(e.target.value), placeholder: mode === 'signup' ? 'At least 6 characters' : '••••••••', minLength: 6 })] }), error && (_jsx("p", { className: "text-[0.8rem] text-red-400 bg-red-400/10 px-3 py-2 rounded-md", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "btn btn-primary w-full mt-1", children: loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account' })] })] })] }) }));
}
