import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Nav } from '~/components/Nav'
import { AuthProvider } from '~/lib/auth-context'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <div className="min-h-screen bg-bg">
        <Nav />
        <main className="pb-16 sm:pb-0">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  ),
})
