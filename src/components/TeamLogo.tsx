import { getTeam } from '~/lib/teams'

interface TeamLogoProps {
  abbr: string
  size?: number
}

export function TeamLogo({ abbr, size = 40 }: TeamLogoProps) {
  const team = getTeam(abbr)
  return (
    <div
      className="rounded-full flex items-center justify-center font-display flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: team.color,
        color: team.textColor,
        fontSize: size * 0.22,
        letterSpacing: '0.03em',
      }}
    >
      {abbr}
    </div>
  )
}
