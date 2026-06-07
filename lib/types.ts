export type PairingSystem = 'swiss' | 'roundrobin' | 'elimination';
export type TournamentStatus = 'setup' | 'active' | 'finished';
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | 'bye' | '*';
export type Color = 'white' | 'black';

export interface Player {
  id: string;
  name: string;
  rating: number;
  score: number;
  colorHistory: Color[];
  opponents: string[];
  hasBye: boolean;
  active: boolean;
}

export interface Pairing {
  id: string;
  board: number;
  whiteId: string;
  blackId: string | null; // null = bye
  result: GameResult;
}

export interface Round {
  id: string;
  number: number;
  pairings: Pairing[];
  status: 'pending' | 'active' | 'finished';
  publishedAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  date: string;
  timeControl: string;
  system: PairingSystem;
  totalRounds: number;
  players: Player[];
  rounds: Round[];
  status: TournamentStatus;
  shareCode: string;
  createdAt: string;
}
