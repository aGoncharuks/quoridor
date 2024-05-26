import { BoardCell, Player, PlayersState } from './game.types';

const WALLS_PER_PLAYER = 10;
export const initializeBoard = (): BoardCell[][] => {
  const board: BoardCell[][] = [];
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      board[i][j] = { walls: { x: false, y: false } };
    }
  }
  return board;
}
export const initStartingPlayer = (): Player => {
  return Math.random() > 0.5 ? 'Player1' : 'Player2';
}
export const initStartingPlayersState = (): PlayersState => {
  return {
    Player1: {
      x: 4,
      y: 0,
      wallsRemaining: WALLS_PER_PLAYER
    },
    Player2: {
      x: 4,
      y: 8,
      wallsRemaining: WALLS_PER_PLAYER
    }
  };
}
