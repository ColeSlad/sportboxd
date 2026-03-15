// ─── balldontlie.io API types ────────────────────────────────────────────────
// Docs: https://www.balldontlie.io/api.html

export interface BDLTeam {
  id: number
  abbreviation: string
  city: string
  conference: string
  division: string
  full_name: string
  name: string
}

export interface BDLGame {
  id: number
  date: string // ISO 8601
  home_team: BDLTeam
  home_team_score: number
  period: number
  postseason: boolean
  season: number
  status: string // "Final" | "1st Qtr" | etc.
  time: string
  visitor_team: BDLTeam
  visitor_team_score: number
}

export interface BDLPlayer {
  id: number
  first_name: string
  last_name: string
  position: string
  team: BDLTeam
}

export interface BDLStat {
  id: number
  ast: number
  blk: number
  dreb: number
  fg3_pct: number
  fg3a: number
  fg3m: number
  fg_pct: number
  fga: number
  fgm: number
  ft_pct: number
  fta: number
  ftm: number
  game: { id: number }
  min: string
  oreb: number
  pf: number
  player: BDLPlayer
  pts: number
  reb: number
  stl: number
  team: BDLTeam
  turnover: number
}

// ─── App-level types ─────────────────────────────────────────────────────────

export interface Team {
  abbr: string
  name: string
  city: string
  color: string
  textColor: string
}

/** Enriched game — BDLGame + our community data */
export interface Game {
  id: number
  date: string
  homeTeam: string // abbreviation
  awayTeam: string
  homeScore: number
  awayScore: number
  season: string
  type: 'Regular Season' | 'Playoffs' | 'Finals' | 'Play-In'
  gameLabel: string | null // "Game 5", "Christmas", etc.
  overtime: boolean
  status: string
  // Community stats (our DB)
  avgRating: number
  reviewCount: number
  viewCount: number
  description: string
}

/** A play from play-by-play — mocked until real API */
export interface Play {
  id: string
  time: string
  description: string
  player: string
  team: string // team abbreviation
  type: PlayType
  avgRating: number
  ratingCount: number
}

export type PlayType =
  | '3-Pointer'
  | 'Dunk'
  | 'Block'
  | 'Layup'
  | 'Assist'
  | 'Mid-Range'
  | 'Heave'
  | 'Free Throw'
  | 'Post-Up'
  | 'Steal'
  | 'Other'

export interface Review {
  id: string
  gameId: number
  userId: string
  rating: number
  text: string | null
  createdAt: string
  likes: number
  likedByMe: boolean
  playHighlight: string | null // playId
  user: AppUser
}

export interface PlayRating {
  id: string
  gameId: number
  playId: string
  userId: string
  rating: number
  note: string | null
}

export interface AppUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  avatarColor: string
  bio: string | null
  favoriteTeams: string[]
  following: string[]
  followers: string[]
  gamesLogged: number
  reviewCount: number
  joinedDate: string
}

export interface ActivityItem {
  id: string
  userId: string
  type: 'review' | 'logged' | 'play_rating'
  gameId: number
  playId?: string
  rating?: number
  excerpt?: string
  time: string
  user: AppUser
  game: Game
}
