import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { bufferCount, pipe, tap } from 'rxjs';
import { initializeBoard, initStartingPlayer, initStartingPlayersState } from './game.fn';
import { BoardPosition, GameState, Player } from './game.types';

export const GameStore = signalStore(
  withState<GameState>({
    players: ['Player1', 'Player2'],
    board: initializeBoard(),
    playersState: initStartingPlayersState(),
    currentPlayer: initStartingPlayer(),
  }),
  withMethods(({ currentPlayer, playersState, ...store }) => ({
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
  }))
);
