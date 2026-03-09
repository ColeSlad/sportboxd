import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '~/lib/supabase'

export const Route = createFileRoute('/login')({
  loader: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) throw redirect({ to: '/feed' })
    return null
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setConfirmed(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      navigate({ to: '/feed' })
    }

    setLoading(false)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="text-3xl mb-4">📬</div>
          <h2 className="font-display text-2xl mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account, then come back and sign in.
          </p>
          <button className="btn btn-ghost btn-sm mt-6" onClick={() => { setConfirmed(false); setMode('signin') }}>
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display gradient-text text-[2.5rem] tracking-wider">FIXTURE</span>
          <p className="text-gray-600 text-sm mt-1">Rate every game. Log every play.</p>
        </div>

        <div className="card p-6">
          {/* Mode toggle */}
          <div className="flex border-b border-border mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                className={`tab flex-1 ${mode === m ? 'tab-active' : ''}`}
                style={{ background: 'none', border: 'none' }}>
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1.5">
                Email
              </label>
              <input
                type="email" required autoComplete="email"
                className="input w-full"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[0.72rem] font-condensed font-bold tracking-widest uppercase text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password" required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="input w-full"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-[0.8rem] text-red-400 bg-red-400/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
              {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
