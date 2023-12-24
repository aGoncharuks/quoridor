import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type Player = 'Player1' | 'Player2';
type Axis = 'x' | 'y';

interface BoardPosition {
  x: number;
  y: number;
}

interface WallPosition extends BoardPosition  {
  axis: Axis;
}

interface BoardCell {
  walls: {
    x: boolean;
    y: boolean;
  }
}

interface PlayerPositions {
  Player1: BoardPosition;
  Player2: BoardPosition;
}

interface GameState {
  players: Player[];
  board: BoardCell[][];
  playerPositions: PlayerPositions;
  currentPlayer: Player;
}

const initializeBoard = (): BoardCell[][] => {
  const board: BoardCell[][] = [];
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      board[i][j] = { walls: { x: false, y: false } };
    }
  }
  return board;
}

export const GameStore = signalStore(
  withState<GameState>({
    players: ['Player1', 'Player2'],
    board: initializeBoard(),
    playerPositions: { Player1: { x: 4, y: 0 }, Player2: { x: 4, y: 8 } },
    currentPlayer: 'Player1',
  }),
  withMethods(({ playerPositions, board, currentPlayer, ...store }) => ({
    movePlayer(player: string, position: BoardPosition) {
      const updatedPositions = {
        ...playerPositions(),
        [player]: position
      };
      patchState(store, { playerPositions: updatedPositions, currentPlayer: currentPlayer() === 'Player1' ? 'Player2' : 'Player1' });
    },
    placeWall(cell: BoardCell, axis: Axis) {
      console.log(cell, axis);
      cell.walls = { ...cell.walls, [axis]: true }
      patchState(store, { board: [...board()] });
    },
    getPlayerPosition(player: Player) {
      return playerPositions()[player];
    }
  }
)));
