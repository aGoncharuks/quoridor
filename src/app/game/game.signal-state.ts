import { Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { bufferCount, pipe, tap } from 'rxjs';
import { initializeBoard, initStartingPlayer, initStartingPlayersState } from './game.fn';
import { BoardPosition, Player } from './game.types';

@Injectable()
export class GameStore {
  public state = signalState(
    {
      players: ['Player1', 'Player2'] satisfies Player[],
      board: initializeBoard(),
      playersState: initStartingPlayersState(),
      currentPlayer: initStartingPlayer(),
    }
  );

  public placeWall({ x, y, axis }: {x: number, y: number, axis: 'x' | 'y' }) {
    const cell = this.state.board()[y][x];
    const newCell = {
      ...cell,
      walls: {
        ...cell.walls,
        [axis]: true
      }
    }
    const newRow = this.state.board()[y].map((cell, index) => index === x ? newCell : cell);
    const newBoard = this.state.board().map((row, index) => index === y ? newRow : row);

    patchState(this.state, { board: newBoard });
    this.trackPlacedWalls(true);
  };

  public movePlayer(player: Player, position: BoardPosition) {
    const playerState = this.state.playersState()[player];
    const updatedPositions = {
      ...this.state.playersState(),
      [player]: {
        ...playerState,
        ...position
      }
    };
    patchState(this.state, { playersState: updatedPositions });
    this.changePlayer();
  };

  public getPlayerPosition(player: Player) {
    return this.state.playersState()[player];
  };

  private changePlayer() {
    patchState(this.state, { currentPlayer: this.state.currentPlayer() === 'Player1' ? 'Player2' : 'Player1' });
  };


  private onWallUsedByPlayer(player: Player) {
    const playerState = this.state.playersState()[player];
    const updatedPlayerState = {
      ...playerState,
      wallsRemaining: playerState.wallsRemaining === 0 ? playerState.wallsRemaining : playerState.wallsRemaining - 1
    }
    patchState(this.state, { playersState: { ...this.state.playersState(), [player]: updatedPlayerState } });
  };

  private trackPlacedWalls = rxMethod(pipe(
    bufferCount(2),
    tap(() => {
      this.onWallUsedByPlayer(this.state.currentPlayer());
      this.changePlayer();
    })
  ));
}
