import { RefreshCw, WifiOff } from 'lucide-react'

interface RouteErrorProps {
  error: Error
  reset: () => void
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const isRateLimit = error.message.includes('429') || error.message.toLowerCase().includes('rate')
  const msg = isRateLimit
    ? 'Rate limit hit — wait a moment and try again.'
    : 'Failed to load game data. Check your connection and try again.'

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
      <WifiOff size={36} className="text-gray-700" />
      <p className="text-gray-500 text-sm max-w-xs">{msg}</p>
      <button className="btn btn-ghost btn-sm flex items-center gap-2" onClick={reset}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  )
}