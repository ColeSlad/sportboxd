import type { Team } from './types'

export const TEAMS: Record<string, Team> = {
  ATL: { abbr: 'ATL', name: 'Hawks', city: 'Atlanta', color: '#C1272D', textColor: '#fff' },
  BOS: { abbr: 'BOS', name: 'Celtics', city: 'Boston', color: '#007A33', textColor: '#fff' },
  BKN: { abbr: 'BKN', name: 'Nets', city: 'Brooklyn', color: '#000000', textColor: '#fff' },
  CHA: { abbr: 'CHA', name: 'Hornets', city: 'Charlotte', color: '#1D1160', textColor: '#00788C' },
  CHI: { abbr: 'CHI', name: 'Bulls', city: 'Chicago', color: '#CE1141', textColor: '#fff' },
  CLE: { abbr: 'CLE', name: 'Cavaliers', city: 'Cleveland', color: '#860038', textColor: '#FDBB30' },
  DAL: { abbr: 'DAL', name: 'Mavericks', city: 'Dallas', color: '#00538C', textColor: '#fff' },
  DEN: { abbr: 'DEN', name: 'Nuggets', city: 'Denver', color: '#0E2240', textColor: '#FEC524' },
  DET: { abbr: 'DET', name: 'Pistons', city: 'Detroit', color: '#C8102E', textColor: '#1D42BA' },
  GSW: { abbr: 'GSW', name: 'Warriors', city: 'Golden State', color: '#1D428A', textColor: '#FFC72C' },
  HOU: { abbr: 'HOU', name: 'Rockets', city: 'Houston', color: '#CE1141', textColor: '#fff' },
  IND: { abbr: 'IND', name: 'Pacers', city: 'Indiana', color: '#002D62', textColor: '#FDBB30' },
  LAC: { abbr: 'LAC', name: 'Clippers', city: 'LA', color: '#C8102E', textColor: '#1D428A' },
  LAL: { abbr: 'LAL', name: 'Lakers', city: 'Los Angeles', color: '#552583', textColor: '#FDB927' },
  MEM: { abbr: 'MEM', name: 'Grizzlies', city: 'Memphis', color: '#5D76A9', textColor: '#12173F' },
  MIA: { abbr: 'MIA', name: 'Heat', city: 'Miami', color: '#98002E', textColor: '#F9A01B' },
  MIL: { abbr: 'MIL', name: 'Bucks', city: 'Milwaukee', color: '#00471B', textColor: '#EEE1C6' },
  MIN: { abbr: 'MIN', name: 'Timberwolves', city: 'Minnesota', color: '#0C2340', textColor: '#236192' },
  NOP: { abbr: 'NOP', name: 'Pelicans', city: 'New Orleans', color: '#0C2340', textColor: '#C8102E' },
  NYK: { abbr: 'NYK', name: 'Knicks', city: 'New York', color: '#006BB6', textColor: '#F58426' },
  OKC: { abbr: 'OKC', name: 'Thunder', city: 'Oklahoma City', color: '#007AC1', textColor: '#EF3B24' },
  ORL: { abbr: 'ORL', name: 'Magic', city: 'Orlando', color: '#0077C0', textColor: '#C4CED4' },
  PHI: { abbr: 'PHI', name: '76ers', city: 'Philadelphia', color: '#006BB6', textColor: '#ED174C' },
  PHX: { abbr: 'PHX', name: 'Suns', city: 'Phoenix', color: '#1D1160', textColor: '#E56020' },
  POR: { abbr: 'POR', name: 'Trail Blazers', city: 'Portland', color: '#E03A3E', textColor: '#fff' },
  SAC: { abbr: 'SAC', name: 'Kings', city: 'Sacramento', color: '#5A2D81', textColor: '#63727A' },
  SAS: { abbr: 'SAS', name: 'Spurs', city: 'San Antonio', color: '#C4CED4', textColor: '#000' },
  TOR: { abbr: 'TOR', name: 'Raptors', city: 'Toronto', color: '#CE1141', textColor: '#fff' },
  UTA: { abbr: 'UTA', name: 'Jazz', city: 'Utah', color: '#002B5C', textColor: '#00471B' },
  WAS: { abbr: 'WAS', name: 'Wizards', city: 'Washington', color: '#002B5C', textColor: '#E31837' },
}

export function getTeam(abbr: string): Team {
  return (
    TEAMS[abbr] ?? {
      abbr,
      name: abbr,
      city: abbr,
      color: '#333',
      textColor: '#fff',
    }
  )
}

// Map BDL abbreviations (they differ slightly from common ones)
const BDL_ABBR_MAP: Record<string, string> = {
  GS: 'GSW',
  NY: 'NYK',
  SA: 'SAS',
  NO: 'NOP',
  OKC: 'OKC',
}

export function normalizeBDLAbbr(abbr: string): string {
  return BDL_ABBR_MAP[abbr] ?? abbr
}
