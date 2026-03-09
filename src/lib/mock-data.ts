/**
 * Mock data — used when DATABASE_URL / BALLDONTLIE_API_KEY are not set,
 * or when running the app without a backend (prototype mode).
 *
 * Replace:
 *   - MOCK_GAMES    → server/games.ts → fetchGames() from balldontlie.io
 *   - MOCK_REVIEWS  → server/reviews.ts → db.review.findMany()
 *   - MOCK_PLAYS    → server/plays.ts   → fetchPlayByPlay() or SportRadar
 *   - MOCK_USERS    → server/users.ts   → db.user.findUnique()
 *   - MOCK_ACTIVITY → server/feed.ts    → db query on reviews + play_ratings
 */

import type { Game, Review, Play, AppUser, ActivityItem } from './types'

export const MOCK_USERS: AppUser[] = [
  {
    id: 'u1', username: 'fadeaway_frank', displayName: 'Frank O.',
    avatarUrl: null, avatarColor: '#7c3aed',
    bio: 'Watched every Finals since 2010. 3× fantasy champion. Stats nerd.',
    favoriteTeams: ['BOS', 'GSW'],
    following: ['u2', 'u3', 'u5'], followers: ['u2', 'u4', 'u5'],
    gamesLogged: 234, reviewCount: 89, joinedDate: '2023-01-15',
  },
  {
    id: 'u2', username: 'hoophead_maya', displayName: 'Maya R.',
    avatarUrl: null, avatarColor: '#0891b2',
    bio: 'Former D3 player. Now I just yell at refs from my couch.',
    favoriteTeams: ['NYK', 'MIA'],
    following: ['u1', 'u3', 'u4'], followers: ['u1', 'u3', 'u5'],
    gamesLogged: 178, reviewCount: 62, joinedDate: '2023-03-22',
  },
  {
    id: 'u3', username: 'triple_double_tc', displayName: 'TC Williams',
    avatarUrl: null, avatarColor: '#059669',
    bio: 'Covering the NBA since 2015. Everything is pace and efficiency.',
    favoriteTeams: ['DEN', 'OKC'],
    following: ['u1', 'u2'], followers: ['u1', 'u2', 'u4', 'u5'],
    gamesLogged: 501, reviewCount: 215, joinedDate: '2022-11-01',
  },
  {
    id: 'u4', username: 'buckets_bri', displayName: 'Brianna S.',
    avatarUrl: null, avatarColor: '#b45309',
    bio: 'Lakers fan since Kobe. Yes, I survived The Rebuild™.',
    favoriteTeams: ['LAL', 'MIL'],
    following: ['u3', 'u5'], followers: ['u2', 'u3'],
    gamesLogged: 89, reviewCount: 31, joinedDate: '2024-01-08',
  },
  {
    id: 'u5', username: 'thepostup', displayName: 'Derek T.',
    avatarUrl: null, avatarColor: '#dc2626',
    bio: 'Podcast host. Watch every game twice — once live, once with annotations.',
    favoriteTeams: ['BOS', 'CHI'],
    following: ['u1', 'u2', 'u3', 'u4'], followers: ['u1', 'u2', 'u3', 'u4'],
    gamesLogged: 412, reviewCount: 147, joinedDate: '2023-07-19',
  },
]

export const MOCK_GAMES: Game[] = [
  {
    id: 1,
    date: '2024-06-17',
    homeTeam: 'BOS', awayTeam: 'DAL',
    homeScore: 106, awayScore: 88,
    season: '2023-24', type: 'Finals', gameLabel: 'Game 5',
    overtime: false, status: 'Final',
    avgRating: 4.1, reviewCount: 847, viewCount: 124500,
    description: 'Celtics clinch their 18th championship with a dominant Game 5. Jaylen Brown puts up 21-8-4 to secure Finals MVP honors.',
  },
  {
    id: 2,
    date: '2024-05-07',
    homeTeam: 'NYK', awayTeam: 'PHX',
    homeScore: 121, awayScore: 119,
    season: '2023-24', type: 'Playoffs', gameLabel: 'R1 Game 6',
    overtime: true, status: 'Final',
    avgRating: 4.8, reviewCount: 1203, viewCount: 221000,
    description: 'Knicks survive a 54-point KD performance in double-OT to advance. Brunson answers with 44 of his own in an all-time Garden classic.',
  },
  {
    id: 3,
    date: '2024-01-31',
    homeTeam: 'GSW', awayTeam: 'LAL',
    homeScore: 134, awayScore: 127,
    season: '2023-24', type: 'Regular Season', gameLabel: null,
    overtime: true, status: 'Final',
    avgRating: 4.3, reviewCount: 631, viewCount: 95400,
    description: 'Curry drills 9 threes and drops 46 in an OT thriller. LeBron keeps the Lakers alive until the very end.',
  },
  {
    id: 4,
    date: '2024-05-22',
    homeTeam: 'DEN', awayTeam: 'OKC',
    homeScore: 108, awayScore: 104,
    season: '2023-24', type: 'Playoffs', gameLabel: 'WCF Game 3',
    overtime: false, status: 'Final',
    avgRating: 4.2, reviewCount: 356, viewCount: 61800,
    description: 'Jokić posts 30-20-12. SGA answers with 34. A slow-burn classic between the two best players on the floor.',
  },
  {
    id: 5,
    date: '2023-12-25',
    homeTeam: 'LAL', awayTeam: 'BOS',
    homeScore: 126, awayScore: 115,
    season: '2023-24', type: 'Regular Season', gameLabel: 'Christmas',
    overtime: false, status: 'Final',
    avgRating: 4.0, reviewCount: 788, viewCount: 183000,
    description: 'LeBron steals Christmas with 36 points against the Celtics in the most-watched regular season game of the year.',
  },
  {
    id: 6,
    date: '2024-05-16',
    homeTeam: 'BOS', awayTeam: 'CLE',
    homeScore: 113, awayScore: 98,
    season: '2023-24', type: 'Playoffs', gameLabel: 'ECF Game 1',
    overtime: false, status: 'Final',
    avgRating: 3.8, reviewCount: 412, viewCount: 68200,
    description: 'Boston goes 22-of-46 from three to take ECF Game 1. Cleveland had no answer from downtown.',
  },
  {
    id: 7,
    date: '2024-02-29',
    homeTeam: 'CHI', awayTeam: 'NYK',
    homeScore: 143, awayScore: 141,
    season: '2023-24', type: 'Regular Season', gameLabel: null,
    overtime: true, status: 'Final',
    avgRating: 4.6, reviewCount: 449, viewCount: 72300,
    description: '4-OT Leap Day barnburner. Coby White explodes for 42 including the dagger triple in OT4.',
  },
  {
    id: 8,
    date: '2024-04-14',
    homeTeam: 'MIL', awayTeam: 'MIA',
    homeScore: 118, awayScore: 115,
    season: '2023-24', type: 'Playoffs', gameLabel: 'R1 Game 1',
    overtime: false, status: 'Final',
    avgRating: 3.5, reviewCount: 284, viewCount: 42100,
    description: 'Giannis goes for 35-16-9. Butler matches with 27 but falls short as the Bucks hold on in a gritty Game 1.',
  },
]

// NOTE: Replace with db.review.findMany({ where: { gameId } })
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1', gameId: 1, userId: 'u3', rating: 4,
    text: 'Historic night. The Celtics were clinical — this wasn\'t the most dramatic game but it felt inevitable. Brown deserved every bit of that FMVP. Championship basketball at its most efficient.',
    createdAt: '2024-06-17T23:45:00Z', likes: 142, playHighlight: 'p1-1',
    user: MOCK_USERS[2]!,
  },
  {
    id: 'r2', gameId: 1, userId: 'u5', rating: 3,
    text: 'Final games rarely live up to the hype. Luka disappeared in the fourth again. Defense wins championships and Boston proved that in spades.',
    createdAt: '2024-06-18T01:12:00Z', likes: 87, playHighlight: null,
    user: MOCK_USERS[4]!,
  },
  {
    id: 'r3', gameId: 2, userId: 'u1', rating: 5,
    text: 'I don\'t think I\'ve screamed at a playoff game like that in ten years. Brunson vs Durant for 54 minutes of pure basketball heaven. That buzzer-beater to force OT2 is going in a museum.',
    createdAt: '2024-05-07T22:30:00Z', likes: 318, playHighlight: 'p2-1',
    user: MOCK_USERS[0]!,
  },
  {
    id: 'r4', gameId: 2, userId: 'u2', rating: 5,
    text: 'First game I\'ve ever given a 5. The sheer volume of clutch plays from both sides was unlike anything in the first round. KD going for 54 and LOSING is poetic. This will be a 30 for 30.',
    createdAt: '2024-05-07T23:01:00Z', likes: 251, playHighlight: 'p2-2',
    user: MOCK_USERS[1]!,
  },
  {
    id: 'r5', gameId: 3, userId: 'u1', rating: 4,
    text: 'Curry was from another planet. You forget how unguardable he is until a game like this. LeBron kept them in it but the Warriors figured out the defense in OT.',
    createdAt: '2024-01-31T23:55:00Z', likes: 196, playHighlight: 'p3-1',
    user: MOCK_USERS[0]!,
  },
  {
    id: 'r6', gameId: 3, userId: 'u4', rating: 5,
    text: 'AD vs Looney, LeBron vs Draymond, Curry vs everyone. The poster dunk in the 4th had me running laps. I might be biased as a Lakers fan but this was must-watch from tip to buzzer.',
    createdAt: '2024-02-01T00:20:00Z', likes: 134, playHighlight: 'p3-2',
    user: MOCK_USERS[3]!,
  },
  {
    id: 'r7', gameId: 5, userId: 'u2', rating: 4,
    text: 'Christmas games hit different. LeBron just does not age. The third quarter run where they went on a 14-2 was everything.',
    createdAt: '2023-12-26T00:10:00Z', likes: 89, playHighlight: null,
    user: MOCK_USERS[1]!,
  },
  {
    id: 'r8', gameId: 4, userId: 'u3', rating: 4,
    text: 'Jokić in the playoffs is the most reliable must-watch in basketball. His passing in the fourth quarter was at a different level than anyone else on the floor.',
    createdAt: '2024-05-22T23:40:00Z', likes: 167, playHighlight: null,
    user: MOCK_USERS[2]!,
  },
  {
    id: 'r9', gameId: 7, userId: 'u5', rating: 5,
    text: 'Four overtimes on Leap Day. FOUR. Coby White just took the ball and decided it was his night. The dagger three in OT4 is in my personal hall of fame. The NBA is perfect.',
    createdAt: '2024-03-01T01:34:00Z', likes: 203, playHighlight: 'p7-1',
    user: MOCK_USERS[4]!,
  },
  {
    id: 'r10', gameId: 6, userId: 'u1', rating: 4,
    text: 'Boston hitting 22 threes in an ECF game is video game stuff. Jaylen and Tatum finally looking synchronized. Cleveland had no answers.',
    createdAt: '2024-05-16T22:55:00Z', likes: 78, playHighlight: null,
    user: MOCK_USERS[0]!,
  },
]

// NOTE: Replace with fetchPlayByPlay(nbaGameId) from nba.com or SportRadar
export const MOCK_PLAYS: Record<number, Play[]> = {
  1: [
    { id: 'p1-1', time: '4Q 0:04', description: 'Jaylen Brown reverse layup — Finals-clinching basket', player: 'Jaylen Brown', team: 'BOS', type: 'Layup', avgRating: 4.9, ratingCount: 612 },
    { id: 'p1-2', time: '4Q 2:15', description: 'Al Horford blocks Doncic fadeaway — seals the momentum swing', player: 'Al Horford', team: 'BOS', type: 'Block', avgRating: 4.7, ratingCount: 341 },
    { id: 'p1-3', time: '3Q 8:22', description: 'Tatum corner 3 off Mavs double-team — stretches lead to 15', player: 'Jayson Tatum', team: 'BOS', type: '3-Pointer', avgRating: 4.4, ratingCount: 287 },
    { id: 'p1-4', time: '2Q 1:33', description: 'Doncic no-look lob to Lively — Dallas\' best play of the night', player: 'Luka Doncic', team: 'DAL', type: 'Assist', avgRating: 4.6, ratingCount: 423 },
    { id: 'p1-5', time: '1Q 4:01', description: 'Kyrie crossover step-back mid-range — vintage', player: 'Kyrie Irving', team: 'DAL', type: 'Mid-Range', avgRating: 4.1, ratingCount: 198 },
  ],
  2: [
    { id: 'p2-1', time: '2OT 0:02', description: 'Brunson step-back 3 at the buzzer to force OT2 — MSG erupts', player: 'Jalen Brunson', team: 'NYK', type: '3-Pointer', avgRating: 5.0, ratingCount: 987 },
    { id: 'p2-2', time: '4Q 3:14', description: 'Kevin Durant 40-footer at Q3 buzzer — counts somehow', player: 'Kevin Durant', team: 'PHX', type: 'Heave', avgRating: 4.8, ratingCount: 811 },
    { id: 'p2-3', time: '1OT 0:08', description: 'Booker pull-up three with hand in face ties it at 109', player: 'Devin Booker', team: 'PHX', type: '3-Pointer', avgRating: 4.6, ratingCount: 643 },
    { id: 'p2-4', time: '4Q 0:24', description: 'OG transition dunk off Brunson turnover — gives Knicks the lead', player: 'OG Anunoby', team: 'NYK', type: 'Dunk', avgRating: 4.3, ratingCount: 402 },
    { id: 'p2-5', time: '2Q 7:41', description: 'Durant Euro step finish over 3 Knicks defenders', player: 'Kevin Durant', team: 'PHX', type: 'Layup', avgRating: 4.2, ratingCount: 356 },
  ],
  3: [
    { id: 'p3-1', time: 'OT 1:22', description: 'Curry trail 3 off LeBron kick — his 9th of the night', player: 'Stephen Curry', team: 'GSW', type: '3-Pointer', avgRating: 4.9, ratingCount: 524 },
    { id: 'p3-2', time: '4Q 0:18', description: 'LeBron poster dunk over Draymond Green — the reversal', player: 'LeBron James', team: 'LAL', type: 'Dunk', avgRating: 4.7, ratingCount: 471 },
    { id: 'p3-3', time: '3Q 5:50', description: 'Curry between-the-legs into 28-foot pull-up — banked in', player: 'Stephen Curry', team: 'GSW', type: '3-Pointer', avgRating: 4.5, ratingCount: 388 },
  ],
  7: [
    { id: 'p7-1', time: '4OT 0:03', description: 'Coby White step-back 3 — Leap Day dagger. Cold. Calculated.', player: 'Coby White', team: 'CHI', type: '3-Pointer', avgRating: 5.0, ratingCount: 378 },
    { id: 'p7-2', time: '3OT 0:01', description: 'Brunson ties it with two free throws everyone disputed', player: 'Jalen Brunson', team: 'NYK', type: 'Free Throw', avgRating: 3.9, ratingCount: 198 },
    { id: 'p7-3', time: '2OT 5:12', description: 'White full-court outlet to himself off the glass — layup', player: 'Coby White', team: 'CHI', type: 'Layup', avgRating: 4.6, ratingCount: 267 },
  ],
}

const DEFAULT_PLAYS: Play[] = [
  { id: 'def-1', time: '4Q 2:30', description: 'Clutch mid-range extends the lead', player: 'Star Player', team: 'HOME', type: 'Mid-Range', avgRating: 4.0, ratingCount: 120 },
  { id: 'def-2', time: '3Q 7:15', description: 'And-one drive through traffic', player: 'Star Player', team: 'HOME', type: 'Layup', avgRating: 3.8, ratingCount: 88 },
]

export function getPlaysForGame(gameId: number): Play[] {
  return MOCK_PLAYS[gameId] ?? DEFAULT_PLAYS
}

export function getUser(id: string): AppUser | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

export function getUserByUsername(username: string): AppUser | undefined {
  return MOCK_USERS.find((u) => u.username === username)
}

export function getGame(id: number): Game | undefined {
  return MOCK_GAMES.find((g) => g.id === id)
}

export function getReviewsForGame(gameId: number): Review[] {
  return MOCK_REVIEWS.filter((r) => r.gameId === gameId)
}

export function getReviewsForUser(userId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.userId === userId)
}

// NOTE: Replace with Supabase Realtime subscription on 'reviews' table
export function buildActivityFeed(followingIds: string[]): ActivityItem[] {
  return MOCK_REVIEWS
    .filter((r) => followingIds.includes(r.userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      userId: r.userId,
      type: 'review' as const,
      gameId: r.gameId,
      rating: r.rating,
      excerpt: r.text?.slice(0, 120) ?? undefined,
      time: r.createdAt,
      user: r.user,
      game: getGame(r.gameId)!,
    }))
    .filter((a) => a.game != null)
}
