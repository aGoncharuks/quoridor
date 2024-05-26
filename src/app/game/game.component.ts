import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pairwise, pipe, tap } from 'rxjs';
import { GameStore } from './game.signal-state';
// import { GameStore } from './game.signal-store';
import { GameState } from './game.types';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameStore]
})
export class GameComponent implements OnInit {
  public store = inject(GameStore);
  public cellSize = 80;
  public previousState = signal<GameState | null>(null);

  public ngOnInit () {
    this.savePreviousStateEffect(this.store.state);
  }

  public wallsArray(wallsCount: number): Array<boolean> {
    return Array(wallsCount).fill(true);
  }

  public undo() {
    patchState(this.store.state, { ...this.previousState() });
  }

  private savePreviousStateEffect = rxMethod<GameState>(
    pipe(
      pairwise(),
      map(([previousState]) => previousState),
      tap((state) => this.previousState.set(state)),
    )
  );
}
