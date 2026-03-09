import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Nav } from '~/components/Nav'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main className="pb-16 sm:pb-0">
        <Outlet />
      </main>
    </div>
  ),
})
