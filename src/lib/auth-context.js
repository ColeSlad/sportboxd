import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
const AuthContext = createContext({
    user: null,
    loading: true,
    signOut: async () => { },
});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Hydrate from the existing session on mount
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        // Keep in sync with Supabase auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, loading, signOut: async () => { await supabase.auth.signOut(); } }, children: children }));
}
export function useAuth() {
    return useContext(AuthContext);
}
