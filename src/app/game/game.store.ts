import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type Player = 'Player1' | 'Player2';

interface BoardPosition {
  x: number;
  y: number;
}

interface PlayerPositions {
  Player1: BoardPosition;
  Player2: BoardPosition;
}

interface GameState {
  players: Player[];
  board: number[][];
  playerPositions: PlayerPositions;
  walls: BoardPosition[];
  currentPlayer: Player;
}

const initializeBoard = (): number[][] => {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export const GameStore = signalStore(
  withState<GameState>({
    players: ['Player1', 'Player2'],
    board: initializeBoard(),
    playerPositions: { Player1: { x: 4, y: 0 }, Player2: { x: 4, y: 8 } },
    walls: [],
    currentPlayer: 'Player1',
  }),
  withMethods(({ playerPositions, walls, currentPlayer, ...store }) => ({
    movePlayer(player: string, position: BoardPosition) {
      const updatedPositions = {
        ...playerPositions(),
        [player]: position
      };
      patchState(store, { playerPositions: updatedPositions, currentPlayer: currentPlayer() === 'Player1' ? 'Player2' : 'Player1' });
    },
    placeWall(position: BoardPosition) {
      const updatedWalls = [...walls(), position];
      patchState(store, { walls: updatedWalls });
    },
    getPlayerPosition(player: Player) {
      return playerPositions()[player];
    }
  }
)));
