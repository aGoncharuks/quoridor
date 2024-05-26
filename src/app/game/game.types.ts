export type Player = 'Player1' | 'Player2';

export interface BoardPosition {
  x: number;
  y: number;
}

export interface BoardCell {
  walls: {
    x: boolean;
    y: boolean;
  }
}

export interface GameState {
  players: Player[];
  board: BoardCell[][];
  playersState: PlayersState;
  currentPlayer: Player;
  previousState: Omit<GameState, 'previousState'> | null;
}

export interface PlayersState {
  Player1: PlayerState;
  Player2: PlayerState;
}

interface PlayerState extends BoardPosition {
  wallsRemaining: number;
}
