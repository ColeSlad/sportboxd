import { Link, useLocation } from '@tanstack/react-router'
import { Home, Search, Radio, User } from 'lucide-react'
import { useAuth } from '~/lib/auth-context'
import { getUserInitials, getUserColor } from '~/lib/supabase'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Search },
  { to: '/feed', label: 'Feed', icon: Radio },
  { to: '/profile/fadeaway_frank', label: 'Profile', icon: User },
] as const

export function Nav() {
  const { user, signOut } = useAuth()

  return (
    <>
      {/* Desktop top nav */}
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 flex items-center h-13 gap-6">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display text-[1.4rem] tracking-wider gradient-text">
              FIXTURE
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-5 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.to === '/' ? { exact: true } : {}}
                className="nav-link"
                activeProps={{ className: 'nav-link nav-link-active' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile/$username" params={{ username: user.email?.split('@')[0] ?? 'me' }}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-condensed font-bold flex-shrink-0"
                    style={{ background: getUserColor(user.id) }}
                  >
                    {getUserInitials(user.email ?? 'U')}
                  </div>
                </Link>
                <button onClick={() => signOut()} className="btn btn-ghost btn-sm hidden sm:block">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border flex pb-safe">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.to === '/' ? { exact: true } : {}}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-gray-600 transition-colors duration-200"
            activeProps={{ className: 'flex-1 flex flex-col items-center gap-1 py-2 text-accent transition-colors duration-200' }}
          >
            <item.icon size={18} />
            <span className="font-condensed font-bold tracking-wider uppercase text-[0.58rem]">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  )
}
