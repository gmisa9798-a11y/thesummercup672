export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  lineup?: Record<string, string>; // Maps position key (e.g., 'GK', 'MID1') to player ID
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  photoUrl: string;
}

export interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  teamId: string;
  minute: number;
  playerId: string;
  assistPlayerId?: string; // For goals
  subOutPlayerId?: string; // For substitutions
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number | null;
  awayGoals: number | null;
  date: string; // ISO string
  status: 'upcoming' | 'finished' | 'live';
  events?: MatchEvent[];
}

export interface TournamentInfo {
  id: string;
  name: string;
  logoUrl: string;
  sponsorName: string;
  sponsorLogoUrl: string;
  description: string;
  location: string;
  startDate: string;
  regulations?: string;
}

export type TabType = 'table' | 'teams' | 'players' | 'matches' | 'stats' | 'info' | 'admin' | 'regulations';
