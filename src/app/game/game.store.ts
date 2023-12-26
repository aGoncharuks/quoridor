import { computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { bufferCount, map, pairwise, pipe, tap } from 'rxjs';

type Player = 'Player1' | 'Player2';

interface BoardPosition {
  x: number;
  y: number;
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
  previousState: Omit<GameState, 'previousState'> | null;
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

const initStartingPlayer = (): Player => {
  return Math.random() > 0.5 ? 'Player1' : 'Player2';
}

const initStartingPlayerPositions = (): PlayerPositions => {
  return { Player1: { x: 4, y: 0 }, Player2: { x: 4, y: 8 } };
}

export const GameStore = signalStore(
  withState<GameState>({
    players: ['Player1', 'Player2'],
    board: initializeBoard(),
    playerPositions: initStartingPlayerPositions(),
    currentPlayer: initStartingPlayer(),
    previousState: null,
  }),
  withMethods(({ currentPlayer, previousState, ...store }) => ({
    changePlayer() {
      patchState(store, { currentPlayer: currentPlayer() === 'Player1' ? 'Player2' : 'Player1' });
    },
    undo() {
      patchState(store, { ...previousState() });
    }
  })),
  withMethods(({ changePlayer }) => ({
    trackPlacedWalls: rxMethod(pipe(
      bufferCount(2),
      tap(() => changePlayer())
    )),
  })),
  withMethods(({ playerPositions, board, currentPlayer, trackPlacedWalls, changePlayer, ...store }) => ({
    placeWall({ x, y, axis }) {
      const cell = board()[y][x];
      const newCell = {
        ...cell,
        walls: {
          ...cell.walls,
          [axis]: true
        }
      }
      const newRow = board()[y].map((cell, index) => index === x ? newCell : cell);
      const newBoard = board().map((row, index) => index === y ? newRow : row);

      patchState(store, { board: newBoard });
      trackPlacedWalls(true);
    },
    movePlayer(player: string, position: BoardPosition) {
      const updatedPositions = {
        ...playerPositions(),
        [player]: position
      };
      patchState(store, { playerPositions: updatedPositions });
      changePlayer();
    },
    getPlayerPosition(player: Player) {
      return playerPositions()[player];
    }
  })),
  withHooks({
    onInit({ players, board, playerPositions, currentPlayer, previousState, ...store }) {
      toObservable(computed(() => {
        return {
          players: players(),
          board: board(),
          playerPositions: playerPositions(),
          currentPlayer: currentPlayer(),
        }
      })).pipe(
        pairwise(),
        map(([previousState]) => previousState),
        tap((state) => patchState(store, { previousState: state })),
        takeUntilDestroyed(),
      ).subscribe();
    }
  }),
);
