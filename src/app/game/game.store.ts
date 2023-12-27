import { computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { bufferCount, map, pairwise, pipe, tap } from 'rxjs';

const WALLS_PER_PLAYER = 10;

type Player = 'Player1' | 'Player2';

interface BoardPosition {
  x: number;
  y: number;
}

interface PlayerState extends BoardPosition {
  wallsRemaining: number;
}

interface BoardCell {
  walls: {
    x: boolean;
    y: boolean;
  }
}

interface PlayersState {
  Player1: PlayerState;
  Player2: PlayerState;
}

interface GameState {
  players: Player[];
  board: BoardCell[][];
  playersState: PlayersState;
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

const initStartingPlayersState = (): PlayersState => {
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

export const GameStore = signalStore(
  withState<GameState>({
    players: ['Player1', 'Player2'],
    board: initializeBoard(),
    playersState: initStartingPlayersState(),
    currentPlayer: initStartingPlayer(),
    previousState: null,
  }),
  withMethods(({ currentPlayer, playersState, previousState, ...store }) => ({
    changePlayer() {
      patchState(store, { currentPlayer: currentPlayer() === 'Player1' ? 'Player2' : 'Player1' });
    },
    onWallUsedByPlayer(player: Player) {
      const playerState = playersState()[player];
      const updatedPlayerState = {
        ...playerState,
        wallsRemaining: playerState.wallsRemaining === 0 ? playerState.wallsRemaining : playerState.wallsRemaining - 1
      }
      patchState(store, { playersState: { ...playersState(), [player]: updatedPlayerState } });
    },
    undo() {
      patchState(store, { ...previousState() });
    }
  })),
  withMethods(({ currentPlayer, onWallUsedByPlayer, changePlayer }) => ({
    trackPlacedWalls: rxMethod(pipe(
      bufferCount(2),
      tap(() => {
        onWallUsedByPlayer(currentPlayer());
        changePlayer();
      })
    )),
  })),
  withMethods(({ playersState, board, currentPlayer, trackPlacedWalls, changePlayer, ...store }) => ({
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
    movePlayer(player: Player, position: BoardPosition) {
      const playerState = playersState()[player];
      const updatedPositions = {
        ...playersState(),
        [player]: {
          ...playerState,
          ...position
        }
      };
      patchState(store, { playersState: updatedPositions });
      changePlayer();
    },
    getPlayerPosition(player: Player) {
      return playersState()[player];
    }
  })),
  withHooks({
    onInit({ players, board, playersState, currentPlayer, previousState, ...store }) {
      toObservable(computed(() => {
        return {
          players: players(),
          board: board(),
          playersState: playersState(),
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
